from typing import Annotated, List, Literal, Optional

from fastapi import HTTPException, Query
from fastapi.routing import APIRouter
from geoalchemy2.functions import ST_DWithin, ST_Point
from pydantic import BaseModel, Field
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
    status: Literal["OPEN", "COMPLETED", "APPLIED", "ALL"] = Field(default="OPEN")
    request_type_ids: Optional[List[int]] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    radius: Optional[int] = None

    sort: Literal["start", "reward"] = Field(default="start")
    order: Literal["asc", "desc"] = Field(default="desc")


@router.get("/")
async def get_requests(
    session: SessionDep, user_data: VolunteerDep, body: Annotated[VolunteerRequestsInput, Query()]
):
    query = (
        select(
            Request,
            func.coalesce(Application.status, "NOT_APPLIED").label("application_status")
        )
        .options(defer(Request.location), defer(Request.creator_id))
        .options(
            joinedload(Request.creator).load_only(User.id, User.first_name, User.last_name, User.avg_rating)
        )
        .options(
            joinedload(Request.request_types)
        )
        .join(
            Application,
            (Request.id == Application.request_id)
            & (Application.user_id == user_data.id),
            isouter=True,
        )
        .order_by(asc(body.sort) if body.order == "asc" else desc(body.sort))
    )
    if body.request_type_ids is not None and len(body.request_type_ids) > 0:
        query = (
            query.join(Request.request_types)
            .filter(RequestType.id.in_(body.request_type_ids))
            .distinct()
        )

    if body.status == "OPEN":
        query = query.where(Request.status == "OPEN")
    elif body.status == "APPLIED":
        query = query.where(Application.status == None)
    elif body.status == "COMPLETED":
        query = query.where(Request.status == "COMPLETED")

    if body.radius and body.location_lat and body.location_lng:
        query = query.where(
            ST_DWithin(
                Request.location,
                ST_Point(body.location_lat, body.location_lng),
                body.radius * 1000,
            )
        )

    page = await body.paginate(session, query)
    for row in page["data"]:
        request_obj = row.pop("Request")
        row["application_status"] = row.get("application_status", "NOT_APPLIED")
        row.update(request_obj.__dict__)
    page["success"] = True
    return page


@router.get("/{request_id}")
async def get_request(session: SessionDep, user_data: VolunteerDep, request_id: int):
    request = (
        await session.execute(
            select(
                Request,
                func.coalesce(Application.status, "NOT_APPLIED").label("application_status"),
                func.count(Application.user_id).label("applications_count")
            )
            .options(defer(Request.location))
            .options(
                joinedload(Request.creator).load_only(
                    User.id, User.first_name, User.last_name, User.avg_rating
                )
            )
            .options(joinedload(Request.request_types))
            .join(
                Application,
                Request.id == Application.request_id,
                isouter=True,
            )
            .where(Request.id == request_id)
            .group_by(Request.id, Application.status)
        )
    ).unique().one_or_none()
    if request is None:
        raise HTTPException(status_code=404, detail="Request not found")

    # Get the current user's application status separately
    user_application_status = (
        await session.execute(
            select(func.coalesce(Application.status, "NOT_APPLIED"))
            .where(
                (Application.request_id == request_id)
                & (Application.user_id == user_data.id)
            )
        )
    ).scalar_one_or_none() or "NOT_APPLIED"

    return {
        "success": True,
        "data": {
            **request[0].__dict__,
            "application_status": user_application_status,
            "applications_count": request[2]
        }
    }


@router.post("/{request_id}/application")
async def create_application(session: SessionDep, user_data: VolunteerDep, request_id: int):
    async with session.begin():
        request = await session.get(Request, request_id)
        if request is None:
            raise HTTPException(
                status_code=400, detail="No request found with this id"
            )

        if request.status != "OPEN":
            raise HTTPException(
                status_code=400, detail="Request is not accepting applications any more"
            )

        try:
            application = Application(
                request_id=request_id,
                user_id=user_data.id,
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
            "status": application.status,
            "applied_at": application.applied_at
        },
        "message": "Application submitted successfully"
    }


@router.delete("/{request_id}/application")
async def delete_application(session: SessionDep, user_data: VolunteerDep, request_id: int):
    # Find the application for this request and user
    application = (
        await session.execute(
            select(Application, Request.status.label("request_status"))
            .filter(Application.request_id == request_id)
            .filter(Application.user_id == user_data.id)
            .join(Request)
        )
    ).scalar_one_or_none()
    
    if application is None:
        raise HTTPException(
            status_code=404, 
            detail="Application not found"
        )

    if application.request_status != "OPEN":
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
            .filter(Request.status == "COMPLETED")
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
