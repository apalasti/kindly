from sqlalchemy import select, text, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Application, Request, RequestStatus, ApplicationStatus
from ..interfaces import AuthServiceInterface, ApplicationServiceInterface
from ..interfaces.auth_service import UserRoles, UserTokenData
from ..interfaces.application_service import (
    ApplicationInfo,
    RateSeekerData,
    RateVolunteerData,
)
from ..interfaces.exceptions import (
    ApplicationCannotBeRated,
    CanNotAcceptApplication,
    CanNotDeleteApplicationError,
    NoApplicationFoundError,
    RequestNotOpen,
    NoRequestFoundError,
    ApplicationAlreadyExists,
)


class ApplicationService(ApplicationServiceInterface):
    def __init__(self, session: AsyncSession, auth_service: AuthServiceInterface):
        self.session = session
        self.auth_service = auth_service

    async def create_application(self, user: UserTokenData, request_id: int) -> ApplicationInfo:
        self.auth_service.authorize_with_role(user, UserRoles.VOLUNTEER)

        async with self.session.begin():
            request = await self.session.get(Request, request_id)
            if request is None:
                raise NoRequestFoundError

            if request.status != RequestStatus.OPEN:
                raise RequestNotOpen

            try:
                application = Application(
                    request_id=request_id,
                    user_id=user["id"],
                )
                self.session.add(application)
                await self.session.flush()
            except IntegrityError:
                raise ApplicationAlreadyExists

        return ApplicationInfo(
            id=application.id,
            request_id=application.request_id,
            user_id=application.user_id,
            status=application.status.value,
            applied_at=application.applied_at
        )

    async def delete_application(self, user: UserTokenData, request_id: int) -> None:
        self.auth_service.authorize_with_role(user, UserRoles.VOLUNTEER)

        async with self.session.begin():
            application = (await self.session.execute(
                select(Application)
                .filter(Application.request_id == request_id)
                .filter(Application.user_id == user["id"])
            )).scalar_one_or_none()
            if application is None:
                raise NoApplicationFoundError

            if application.status != ApplicationStatus.PENDING:
                raise CanNotDeleteApplicationError

            await self.session.delete(application)

    async def accept_application(self, user: UserTokenData, request_id: int, volunteer_id: int) -> None:
        self.auth_service.authorize_with_role(user, UserRoles.HELP_SEEKER)

        async with self.session.begin():
            request = (
                await self.session.execute(
                    select(Request)
                    .join(Application)
                    .filter(Request.creator_id == user["id"])
                    .filter(
                        (Request.id == request_id)
                        & (Application.user_id == volunteer_id)
                    )
                    .with_for_update()
                )
            ).scalar_one_or_none()
            if request is None:
                raise NoRequestFoundError

            if request.status != RequestStatus.OPEN:
                raise CanNotAcceptApplication

            await self.session.execute(
                update(Application)
                .where(Application.request_id == request_id)
                .values(
                    status=text(
                        "CASE WHEN user_id = :user_id THEN 'ACCEPTED'::applicationstatus ELSE 'ACCEPTED'::applicationstatus END"
                    ).bindparams(user_id=volunteer_id)
                )
            )
            request.status = RequestStatus.CLOSED

    async def rate_volunteer(self, user: UserTokenData, request_id: int, rating_data: RateVolunteerData) -> None:
        self.auth_service.authorize_with_role(user, UserRoles.HELP_SEEKER)

        async with self.session.begin():
            application = (
                await self.session.execute(
                    select(Application)
                    .join(Request)
                    .filter(Request.id == request_id)
                    .filter(Request.creator_id == user["id"])
                    .filter(Application.status == ApplicationStatus.ACCEPTED)
                    .filter(Request.status == RequestStatus.COMPLETED)
                )
            ).scalar_one_or_none()
            if application is None:
                raise ApplicationCannotBeRated

            application.volunteer_rating = rating_data.rating

    async def rate_seeker(self, user: UserTokenData, request_id: int, rating_data: RateSeekerData) -> None:
        self.auth_service.authorize_with_role(user, UserRoles.VOLUNTEER)

        async with self.session.begin():
            application = (
                await self.session.execute(
                    select(Application)
                    .join(Request)
                    .filter(Request.id == request_id)
                    .filter(Application.user_id == user["id"])
                    .filter(Application.status == ApplicationStatus.ACCEPTED)
                    .filter(Request.status == RequestStatus.COMPLETED)
                )
            ).scalar_one_or_none()
            if application is None:
                raise ApplicationCannotBeRated

            application.volunteer_rating = rating_data.rating
