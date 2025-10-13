from typing import Literal, Optional

from fastapi import HTTPException, status
from fastapi.routing import APIRouter
from geoalchemy2.functions import ST_DWithin, ST_Point
from pydantic import BaseModel, Field
from sqlalchemy import Integer
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import defer, joinedload
from sqlalchemy.sql import asc, desc, func, select

from ..db import SessionDep
from ..internal.auth import VolunteerDep
from ..internal.pagination import PaginationParams
from ..models import Application, Request, RequestType, User

router = APIRouter(
    prefix="/volunteer/requests"
)


class VolunteerRequestsInput(PaginationParams):
    status: Literal["open", "completed", "applied", "all"] = Field(default="open")
    request_type_id: Optional[int] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    radius: Optional[int] = None

    sort: Literal["start", "reward"] = Field(default="start")
    order: Literal["asc", "desc"] = Field(default="desc")


@router.get("/")
async def get_requests(
    session: SessionDep, user_data: VolunteerDep, body: VolunteerRequestsInput
):
    request_type = None
    if body.request_type_id is not None:
        request_type = await session.get(RequestType, body.request_type_id)
        if request_type is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Request type not found"
            )

    query = (
        select(Request)
        .options(defer(Request.location))
        .options(joinedload(Request.creator).load_only(User.id, User.name, User.avg_rating))
        .order_by(asc(body.sort) if body.order == "asc" else desc(body.sort))
    )
    if request_type is not None:
        query = query.join(RequestType).filter(RequestType.id == request_type.id)

    if body.status == "open":
        query = query.join(
            Application,
            (Request.id == Application.request_id) & (Application.is_accepted == True),
            isouter=True,
        ).where(Application.id == None)
    elif body.status == "applied":
        query = query.join(
            Application,
            (Request.id == Application.request_id)
            & (Application.user_id == user_data.id),
            isouter=True,
        )
    elif body.status == "completed":
        query = query.where(Request.is_completed == True)

    if body.radius and body.location_lat and body.location_lng:
        query = query.where(
            ST_DWithin(
                Request.location,
                ST_Point(body.location_lat, body.location_lng),
                body.radius * 1000,
            )
        )
    return await body.paginate(session, query)


@router.get("/{request_id}")
async def get_request(session: SessionDep, request_id: int, _: VolunteerDep):
    request = (
        await session.execute(
            select(Request)
            .options(defer(Request.location))
            .options(
                joinedload(Request.creator).load_only(
                    User.id, User.name, User.avg_rating
                )
            )
            .options(joinedload(Request.request_types))
            .where(Request.id == request_id)
        )
    ).scalar_one_or_none()
    if request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return request


@router.post("/{request_id}/application")
async def create_application(session: SessionDep, user_data: VolunteerDep, request_id: int):
    result = (
        await session.execute(
            select(
                Request.id,
                func.max(
                    func.coalesce(func.cast(Application.is_accepted, Integer), 0)
                ).label("has_accepted_volunteer"),
            )
            .join(Application, isouter=True)
            .filter(Request.id == request_id)
            .group_by(Request.id)
        )
    ).one_or_none()
    if result is None:
        raise HTTPException(
            status_code=400, detail="No request found with this id"
        )

    request_id, accepted_volunteers = result 
    if accepted_volunteers > 0:
        raise HTTPException(
            status_code=400, detail="Request already has an accepted volunteer"
        )

    try:
        application = Application(
            request_id=request_id,
            user_id=user_data.id,
            is_accepted=False
        )
        session.add(application)
        await session.commit()
    except IntegrityError as e:
        raise HTTPException(
            status_code=400,
            detail="Already applied for help request"
        )

    return {
        "success": True,
        "data": {
            "request_id": application.request_id,
            "user_id": application.user_id,
            "is_accepted": application.is_accepted,
            "applied_at": application.applied_at.isoformat()
        },
        "message": "Application submitted successfully"
    }


@router.delete("/{request_id}/application")
async def delete_application(session: SessionDep, user_data: VolunteerDep, request_id: int):
    # Find the application for this request and user
    application = (
        await session.execute(
            select(Application)
            .filter(Application.request_id == request_id)
            .filter(Application.user_id == user_data.id)
            .join(Request)
            .filter(Request.is_completed == False)
        )
    ).scalar_one_or_none()
    
    if application is None:
        raise HTTPException(
            status_code=404, 
            detail="Application not found"
        )

    # Check if the application has already been accepted
    if application.is_accepted:
        raise HTTPException(
            status_code=400,
            detail="Cannot withdraw an accepted application"
        )

    # Delete the application
    await session.delete(application)
    await session.commit()

    return {
        "success": True,
        "message": "Application withdrawn successfully"
    }


class RateSeekerBody(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating must be between 1 and 5")


@router.post("/{request_id}/rate-seeker")
async def rate_seeker(session: SessionDep, user_data: VolunteerDep, request_id: int, body: RateSeekerBody):
    application = (
        await session.execute(
            select(Application)
            .filter(Application.request_id == request_id)
            .filter(Application.user_id == user_data.id)
            .join(Request)
            .filter(Request.is_completed == True)
        )
    ).scalar_one_or_none()
    
    if application is None:
        raise HTTPException(
            status_code=404, 
            detail="Application not found"
        )

    if application.help_seeker_rating:
        raise HTTPException(
            status_code=400,
            detail="Cannot withdraw an accepted application"
        )
    
    application.help_seeker_rating = body.rating
    await session.commit()
    return {
        "success": True,
        "message": "Application withdrawn successfully"
    }
