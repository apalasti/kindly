from datetime import datetime
from typing import Literal
from fastapi import HTTPException
from fastapi.routing import APIRouter
from geoalchemy2.functions import ST_Point
from pydantic import BaseModel, Field
from sqlalchemy.orm import joinedload
from sqlalchemy.sql import select, func, asc, desc

from ..db import SessionDep
from ..models import Request, RequestType, Application, User
from ..internal.auth import HelpSeekerDep
from ..internal.pagination import PaginationParams


router = APIRouter(
    prefix="/help-seeker/requests"
)


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
        creator_id=user_data.id,
        is_completed=False
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
            Request,
            func.count(Application.user_id).label("applications_count"),
            func.max(Application.is_accepted).label("has_accepted_volunteer"),
        )
        .where(Request.creator_id == user_data.id)
        .where(
            (Request.is_completed == False) if body.status == "open" else
            (Request.is_completed == True) if body.status == "completed" else
            True
        )
        .group_by(Request)
        .order_by(asc(body.sort) if body.order == "asc" else desc(body.sort))
    )
    return await body.paginate(session, query)


@router.get("/{request_id}")
async def get_requests(
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
        raise HTTPException(status_code=404, detail="Request not found")

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
        raise HTTPException(status_code=404, detail="Request not found")

    await session.delete(request)
    await session.commit()

    return {
        "success": True,
        "message": "Request deleted successfully"
    }


@router.patch("/{request_id}/complete")
async def complete_request(
    session: SessionDep,
    user_data: HelpSeekerDep,
    request_id: int
):
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
            select(Application, User)
            .join(Request, Request.id == Application.request_id)
            .join(User, User.id == Application.user_id)
            .filter(Application.request_id == request_id)
            .filter(Request.creator_id == user_data.id)
        )
    ).all()

    return {
        "success": True,
        "data": [
            {
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "avg_rating": user.avg_rating,
                },
                "is_accepted": application.is_accepted,
                "applied_at": application.applied_at,
            }
            for application, user in applications
        ],
    }


@router.patch("/{request_id}/applications/{user_id}/accept")
async def accept_application(
    session: SessionDep,
    user_data: HelpSeekerDep,
    request_id: int,
    user_id: int
):
    application = (
        await session.execute(
            select(Application)
            .join(Request, Request.id == Application.request_id)
            .filter(Application.request_id == request_id)
            .filter(Request.creator_id == user_data.id)
            .filter(Application.user_id == user_id)
        )
    ).scalar_one_or_none()
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")

    application.is_accepted = True
    await session.commit()

    return {
        "success": True,
        "data": {
            "request_id": request_id,
            "user_id": user_id,
            "is_accepted": True
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
        )
    ).scalar_one_or_none()
    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Volunteer application could not be found for help request"
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
