import os
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from fastapi import HTTPException, status
from geoalchemy2.functions import ST_DWithin, ST_Point
from openai import AsyncOpenAI
from sqlalchemy import update, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import defer, joinedload
from sqlalchemy.sql import asc, desc, func, select

from ..interfaces.request_service import (
    ApplicationInfo,
    CreateOrUpdateRequestData,
    MyRequestsFilter,
    Pagination,
    RequestDetailForHelpSeeker,
    RequestDetailForVolunteer,
    RequestInfo,
    RequestServiceInterface,
    RequestWithApplicationStatus,
    RequestsFilter,
    UserInfo,
)
from ..interfaces.auth_service import AuthServiceInterface, UserRoles, UserTokenData
from ..interfaces.common_service import RequestTypeInfo
from ..models import Application, Request, RequestType, User
from ..models.request import RequestStatus


class RequestNotFoundError(Exception):
    pass


class RequestCannotBeUpdatedError(Exception):
    pass


class RequestAlreadyCompletedError(Exception):
    pass


class ApplicationNotFoundError(Exception):
    pass


class ApplicationAlreadyExistsError(Exception):
    pass


class RequestNotOpenError(Exception):
    pass


class VolunteerAlreadyRatedError(Exception):
    pass


class HelpSeekerAlreadyRatedError(Exception):
    pass


class RequestService(RequestServiceInterface):
    def __init__(self, session: AsyncSession, auth_service: AuthServiceInterface):
        self.auth_service = auth_service
        self.session = session

    async def create_request(
        self, user: UserTokenData, request_data: CreateOrUpdateRequestData
    ) -> RequestInfo:
        self.auth_service.authorize_with_role(user, UserRoles.HELP_SEEKER)
        request = Request(
            name=request_data.name,
            description=request_data.description,
            address=request_data.address,
            longitude=request_data.longitude,
            latitude=request_data.latitude,
            location=ST_Point(request_data.latitude, request_data.longitude),
            start=request_data.start,
            end=request_data.end,
            reward=request_data.reward,
            creator_id=user["id"]
        )

        request_types = await self.session.scalars(
            select(RequestType).where(RequestType.id.in_(request_data.request_type_ids))
        )
        request.request_types.extend(request_types)
        self.session.add(request)
        await self.session.commit()

        return self._to_request_info(request)

    async def update_request(
        self, user: UserTokenData, request_id: int, request_data: CreateOrUpdateRequestData
    ) -> RequestInfo:
        self.auth_service.authorize_with_role(user, UserRoles.HELP_SEEKER)
        request = (
            await self.session.execute(
                select(Request)
                .options(joinedload(Request.request_types))
                .filter(Request.id == request_id)
                .filter(Request.creator_id == user["id"])
                .join(Application, Request.id == Application.request_id, isouter=True)
                .filter(Application.id == None)
            )
        ).unique().scalar_one_or_none()
        if request is None:
            raise RequestCannotBeUpdatedError

        # Update request fields
        request.name = request_data.name
        request.description = request_data.description
        request.start = request_data.start
        request.end = request_data.end
        request.reward = int(request_data.reward)
        request.address = request_data.address
        request.latitude = Decimal(str(request_data.latitude))
        request.longitude = Decimal(str(request_data.longitude))
        request.location = ST_Point(request_data.latitude, request_data.longitude)

        if 0 < len(request_data.request_type_ids):
            request_types = await self.session.scalars(
                select(RequestType).where(RequestType.id.in_(request_data.request_type_ids))
            )
            request.request_types.clear()
            request.request_types.extend(request_types)

        await self.session.commit()
        return self._to_request_info(request)

    async def delete_request(self, user: UserTokenData, request_id: int) -> None:
        self.auth_service.authorize_with_role(user, UserRoles.HELP_SEEKER)
        request = (
            await self.session.execute(
                select(Request)
                .filter(Request.id == request_id)
                .filter(Request.creator_id == user["id"])
                .join(Application, Request.id == Application.request_id, isouter=True)
                .filter(Application.id == None)
            )
        ).scalar_one_or_none()
        if request is None:
            raise RequestCannotBeUpdatedError

        await self.session.delete(request)
        await self.session.commit()

    async def complete_request(self, user: UserTokenData, request_id: int) -> None:
        self.auth_service.authorize_with_role(user, UserRoles.HELP_SEEKER)
        request = (
            await self.session.execute(
                select(Request)
                .filter(Request.id == request_id)
                .filter(Request.creator_id == user["id"])
            )
        ).scalar_one_or_none()
        if request is None:
            raise RequestNotFoundError

        if request.status != RequestStatus.OPEN:
            raise RequestCannotBeUpdatedError

        request.status = RequestStatus.COMPLETED
        await self.session.commit()

    async def get_my_requests(
        self, user: UserTokenData, filters: MyRequestsFilter
    ) -> Pagination[RequestInfo]:
        self.auth_service.authorize_with_role(user, UserRoles.HELP_SEEKER)
        query = (
            select(Request)
            .options(defer(Request.location))
            .options(joinedload(Request.request_types))
            .where(Request.creator_id == user["id"])
            .order_by(asc(filters.sort) if filters.order == "asc" else desc(filters.sort))
        )

        if filters.status != "ALL":
            query = query.where(Request.status == filters.status.upper())

        pagination_result = await filters.paginate(self.session, query)
        pagination_result.data = [
            self._to_request_info(row)
            for row in pagination_result.data
        ]
        return pagination_result

    async def get_requests(
        self, user: UserTokenData, filters: RequestsFilter
    ) -> Pagination[RequestWithApplicationStatus]:
        self.auth_service.authorize_with_role(user, UserRoles.VOLUNTEER)
        query = (
            select(
                Request,
                func.coalesce(Application.status, "NOT_APPLIED").label("application_status")
            )
            .options(defer(Request.location), defer(Request.creator_id))
            .options(
                joinedload(Request.creator).load_only(User.id, User.first_name, User.last_name, User.avg_rating)
            )
            .options(joinedload(Request.request_types))
            .join(
                Application,
                (Request.id == Application.request_id)
                & (Application.user_id == user["id"]),
                isouter=True,
            )
            .order_by(asc(filters.sort) if filters.order == "asc" else desc(filters.sort))
        )
        if filters.request_type_ids:
            query = (
                query.join(Request.request_types)
                .filter(RequestType.id.in_(filters.request_type_ids))
                .distinct()
            )

        if filters.status == "OPEN":
            query = query.where(Request.status == "OPEN")
        elif filters.status == "APPLIED":
            query = query.where(Application.status == None)
        elif filters.status == "COMPLETED":
            query = query.where(Request.status == "COMPLETED")

        if filters.location_lat and filters.location_lng:
            query = query.where(
                ST_DWithin(
                    Request.location,
                    ST_Point(filters.location_lat, filters.location_lng),
                    filters.radius * 1000,
                )
            )

        pagination_result = await filters.paginate(self.session, query)
        pagination_result.data = [
            RequestWithApplicationStatus(
                **self._to_request_info(request_obj).__dict__,
                application_status=application_status
            )
            for request_obj, application_status in pagination_result.data
        ]
        return pagination_result

    async def get_request_for_help_seeker(
        self, user: UserTokenData, request_id: int
    ) -> RequestDetailForHelpSeeker:
        self.auth_service.authorize_with_role(user, UserRoles.HELP_SEEKER)
        result = (
            await self.session.execute(
                select(Request)
                .options(defer(Request.location))
                .options(joinedload(Request.request_types))
                .options(joinedload(Request.applicants))
                .filter(Request.id == request_id)
                .filter(Request.creator_id == user["id"])
            )
        ).unique().scalar_one_or_none()
        if result is None:
            raise RequestNotFoundError

        request_info = self._to_request_info(result)
        applications = [self._to_application_info(app) for app in result.applicants]
        return RequestDetailForHelpSeeker(
            **request_info.__dict__,
            applications=applications
        )

    async def get_request_for_volunteer(
        self, user: UserTokenData, request_id: int
    ) -> RequestDetailForVolunteer:
        self.auth_service.authorize_with_role(user, UserRoles.VOLUNTEER)
        result = (
            (
                await self.session.execute(
                    select(Request, func.coalesce(Application.status, "NOT_APPLIED"))
                    .options(
                        joinedload(Request.creator).load_only(
                            User.id, User.first_name, User.last_name, User.avg_rating
                        )
                    )
                    .options(joinedload(Request.request_types))
                    .outerjoin(
                        Application,
                        (Application.request_id == Request.id)
                        & (Application.user_id == user["id"]),
                    )
                    .filter(Request.id == request_id)
                )
            )
            .unique()
            .first()
        )
        if result is None:
            raise RequestNotFoundError

        request, user_application_status = result
        request_info = self._to_request_info(request)
        creator_info = UserInfo(
            id=request.creator.id,
            first_name=request.creator.first_name,
            last_name=request.creator.last_name,
            avg_rating=request.creator.avg_rating
        )

        return RequestDetailForVolunteer(
            **request_info.__dict__,
            application_status=str(user_application_status),
            creator=creator_info
        )

    def _to_request_info(self, request: Request) -> RequestInfo:
        return RequestInfo(
            id=request.id,
            name=request.name,
            description=request.description,
            reward=request.reward,
            status=request.status.value,
            start=request.start,
            end=request.end,
            address=request.address,
            longitude=float(request.longitude),
            latitude=float(request.latitude),
            created_at=request.created_at,
            updated_at=request.updated_at,
            request_types=[
                RequestTypeInfo(id=rt.id, name=rt.name) 
                for rt in request.request_types
            ]
        )

    def _to_application_info(self, application: Application) -> ApplicationInfo:
        return ApplicationInfo(
            id=application.id,
            status=application.status.value,
            volunteer=UserInfo(
                id=application.volunteer.id,
                first_name=application.volunteer.first_name,
                last_name=application.volunteer.last_name,
                avg_rating=application.volunteer.avg_rating
            ),
            applied_at=application.applied_at,
            volunteer_rating=application.volunteer_rating,
            help_seeker_rating=application.help_seeker_rating
        )
