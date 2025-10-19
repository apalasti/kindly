from datetime import datetime
from typing import Annotated, Literal

from fastapi import HTTPException, Query, status
from fastapi.routing import APIRouter
from geoalchemy2.functions import ST_Point
from pydantic import BaseModel, Field
from sqlalchemy import update
from sqlalchemy.orm import defer, joinedload
from sqlalchemy.sql import asc, desc, func, select, text

from ..db import SessionDep
from ..internal.auth import HelpSeekerDep
from ..internal.pagination import PaginationParams
from ..models import Application, Request, RequestType, User

router = APIRouter(
    prefix="/help-seeker/requests"
)


@router.get("/{request_id}")
async def get_request(
    session: SessionDep, user_data: HelpSeekerDep, request_id: int
):
    request = (
        await session.execute(
            select(Request)
            .options(defer(Request.location))
            .options(joinedload(Request.request_types))
            # .options(joinedload(Request.applicants))
            .filter(Request.id == request_id)
            .filter(Request.creator_id == user_data.id)
        )
    ).unique().scalar_one_or_none()
    if request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return {
        "success": True,
        "data": request
    }


class CreateRequestBody(BaseModel):
    name: str
    description: str
    longitude: float
    latitude: float
    address: str
    start: datetime
    end: datetime
    reward: float = Field(
        ..., ge=0, description="Reward amount must be greater than or equal to 0"
    )
    request_type_ids: list[int]


@router.post("/")
async def create_request(
    session: SessionDep, user_data: HelpSeekerDep, body: CreateRequestBody
):
    request = Request(
        name=body.name,
        description=body.description,
        address=body.address,
        longitude=body.longitude,
        latitude=body.latitude,
        location=ST_Point(body.latitude, body.longitude),
        start=body.start,
        end=body.end,
        reward=body.reward,
        creator_id=user_data.id
    )

    request_types = await session.scalars(
        select(RequestType).where(RequestType.id.in_(body.request_type_ids))
    )
    request.request_types.extend(request_types)
    session.add(request)
    await session.commit()

    await session.refresh(request, attribute_names=["request_types"])
    return {
        "success": True,
        "data": request,
        "message": "Request created successfully"
    }


@router.put("/{request_id}")
async def update_request(
    session: SessionDep, 
    user_data: HelpSeekerDep, 
    request_id: int,
    body: CreateRequestBody
):
    request = (
        await session.execute(
            select(Request)
            .options(joinedload(Request.request_types))
            .filter(Request.id == request_id)
            .filter(Request.creator_id == user_data.id)
            .join(Application, Request.id == Application.request_id, isouter=True)
            .filter(Application.id == None)
        )
    ).unique().scalar_one_or_none()
    if request is None:
        raise HTTPException(status_code=404, detail="Request not found or can't be updated")

    # Update request fields
    request.name = body.name
    request.description = body.description
    request.start = body.start
    request.end = body.end
    request.reward = body.reward
    request.address = body.address
    request.latitude = body.latitude
    request.longitude = body.longitude
    request.location = ST_Point(body.latitude, body.longitude)

    # Update request types
    if body.request_type_ids:
        request.request_types = (await session.execute(
            select(RequestType).where(RequestType.id.in_(body.request_type_ids))
        )).scalars().all()
    await session.commit()

    return {
        "success": True,
        "data": request,
        "message": "Request updated successfully"
    }


@router.delete("/{request_id}")
async def delete_request(
    session: SessionDep,
    user_data: HelpSeekerDep,
    request_id: int
):
    request = (
        await session.execute(
            select(Request)
            .filter(Request.id == request_id)
            .filter(Request.creator_id == user_data.id)
            .join(Application, Request.id == Application.request_id, isouter=True)
            .filter(Application.id == None)
        )
    ).scalar_one_or_none()
    if request is None:
        raise HTTPException(status_code=404, detail="Request not found or can't be deleted")

    await session.delete(request)
    await session.commit()

    return {
        "success": True,
        "message": "Request deleted successfully"
    }


class RequestsPagination(PaginationParams):
    status: Literal["open", "completed", "all"] = Field(default="all")
    sort: Literal["created_at", "start", "reward"] = Field(default="created_at")
    order: Literal["asc", "desc"] = Field(default="desc")


@router.get("/")
async def get_requests(
    session: SessionDep, user_data: HelpSeekerDep, body: Annotated[RequestsPagination, Query()]
):
    query = (
        select(
            *(col for col in Request.__table__.columns if col.key not in {"location"}),
            func.count(Application.user_id).label("applications_count"),
        )
        .join(Application, isouter=True)
        .where(Request.creator_id == user_data.id)
        .group_by(Request)
        .order_by(asc(body.sort) if body.order == "asc" else desc(body.sort))
    )
    if body.status != "all":
        query = query.where(Request.status == body.status.upper())

    page = await body.paginate(session, query)
    page["success"] = True
    return page


@router.patch("/{request_id}/complete")
async def complete_request(
    session: SessionDep,
    user_data: HelpSeekerDep,
    request_id: int
):
    # TODO: Request can be completed without accepted application
    request = (
        await session.execute(
            select(Request)
            .filter(Request.id == request_id)
            .filter(Request.creator_id == user_data.id)
        )
    ).scalar_one_or_none()
    if request is None:
        raise HTTPException(status_code=404, detail="Request not found")

    if request.is_completed:
        raise HTTPException(status_code=400, detail="Request is already completed")

    request.is_completed = True
    await session.commit()

    return {
        "success": True,
        "message": "Request marked as completed successfully"
    }


@router.get("/{request_id}/applications")
async def get_request_applications(
    session: SessionDep,
    user_data: HelpSeekerDep,
    request_id: int
):
    applications = (
        (
            await session.execute(
                select(Application)
                .options(
                    joinedload(Application.volunteer).load_only(
                        User.id, User.first_name, User.last_name, User.avg_rating
                    ),
                    defer(Application.user_id),
                    defer(Application.request_id),
                )
                .join(Request, Request.id == Application.request_id)
                .filter(Application.request_id == request_id)
                .filter(Request.creator_id == user_data.id)
            )
        )
        .scalars()
        .all()
    )
    return {
        "success": True,
        "data": applications,
    }


@router.patch("/{request_id}/applications/{user_id}/accept")
async def accept_application(
    session: SessionDep,
    user_data: HelpSeekerDep,
    request_id: int,
    user_id: int
):
    async with session.begin():
        request = (
            await session.execute(
                select(Request)
                .filter(Request.creator_id == user_data.id)
                .filter((Application.request_id == request_id) & (Application.user_id == user_id))
                .with_for_update()
            )
        ).scalar_one_or_none()
        if request is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Request or application not found"
            )

        if request.status != "OPEN":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot accept application for request"
            )

        await session.execute(
            update(Application)
            .where(Application.request_id == request_id)
            .values(
                status=text(
                    "CASE WHEN user_id = :user_id THEN 'ACCEPTED' ELSE 'DECLINED' END"
                ).bindparams(user_id=user_id)
            )
        )
        request.status = "CLOSED"

    return {
        "success": True,
        "data": {
            "request_id": request_id,
            "user_id": user_id,
        },
        "message": "Application accepted successfully"
    }


class RateVolunteerBody(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating must be between 1 and 5")


@router.post("/{request_id}/rate-volunteer")
async def rate_volunteer(
    session: SessionDep,
    user_data: HelpSeekerDep,
    request_id: int,
    body: RateVolunteerBody
):
    # Get the request and verify ownership
    application = (
        await session.execute(
            select(Application)
            .join(Request)
            .filter(Request.id == request_id)
            .filter(Request.creator_id == user_data.id)
            .filter(Application.is_accepted)
            .filter(Request.status == "COMPLETED")
        )
    ).scalar_one_or_none()
    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Volunteer application not found or can't be updated"
        )

    if application.volunteer_rating is not None:
        raise HTTPException(
            status_code=400,
            detail="Volunteer already rated for help request"
        )

    application.volunteer_rating = body.rating
    await session.commit()

    return {
        "success": True,
        "data": {
            "request_id": request_id,
            "volunteer_rating": body.rating,
        },
        "message": "Volunteer rated successfully"
    }
