from datetime import datetime
from typing import Literal

from fastapi import HTTPException
from fastapi.routing import APIRouter
from geoalchemy2.functions import ST_Point
from pydantic import BaseModel, Field
from sqlalchemy.exc import MultipleResultsFound
from sqlalchemy.orm import defer, joinedload
from sqlalchemy.sql import asc, column, desc, func, select, text
from sqlalchemy.types import Boolean, Integer

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
            .options(joinedload(Request.request_types))
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
        "data": request
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
    session: SessionDep, user_data: HelpSeekerDep, body: RequestsPagination
):
    query = (
        select(
            *(col for col in Request.__table__.columns if col.key not in {"location"}),
            func.count(Application.user_id).label("applications_count"),
            func.cast(func.max(
                func.coalesce(func.cast(Application.is_accepted, Integer), 0)
            ), Boolean).label("has_accepted_volunteer"),
        )
        .join(Application, isouter=True)
        .where(Request.creator_id == user_data.id)
        .where(
            (Request.is_completed == False)
            if body.status == "open"
            else (Request.is_completed == True) if body.status == "completed" else True
        )
        .group_by(Request)
        .order_by(asc(body.sort) if body.order == "asc" else desc(body.sort))
    )
    return await body.paginate(session, query)


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
        await session.execute(
            select(Application)
            .options(joinedload(Application.volunteer).load_only(User.id, User.name, User.avg_rating))
            .join(Request, Request.id == Application.request_id)
            .filter(Application.request_id == request_id)
            .filter(Request.creator_id == user_data.id)
        )
    ).scalars().all()
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
    # TODO: Shouldn't we accept the application id rather then the user id?
    try:
        application = (
            await session.execute(
                select(Application)
                .options(joinedload(Application.request))
                .filter(Request.creator_id == user_data.id)
                .filter(Application.request_id == request_id)
                .filter(
                    (Application.user_id == user_id) | (Application.is_accepted == True)
                )
            )
        ).scalar_one_or_none()
    except MultipleResultsFound as e:
        raise HTTPException(
            status_code=400, detail="Already accepted an application for this request"
        )

    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")

    if application.is_accepted:
        raise HTTPException(
            status_code=404,
            detail="This application is already accepted for this request.",
        )

    application.is_accepted = True
    await session.commit()

    return {
        "success": True,
        "data": {
            "request_id": request_id,
            "user_id": user_id,
            "is_accepted": True,
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
            .filter(Request.is_completed == True)
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
