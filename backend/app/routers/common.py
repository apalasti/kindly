from fastapi.routing import APIRouter
from sqlalchemy.sql import select
from pydantic import BaseModel
from datetime import date
from fastapi import HTTPException

from ..db import SessionDep
from ..models import User, RequestType
from ..internal.auth import UserDataDep


router = APIRouter(
    prefix="/common",
)


@router.get("/profile")
async def get_profile(session: SessionDep, user_data: UserDataDep):
    user = await session.get(User, user_data.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "success": True,
        "data": user.serialize(),
    }


class UpdateProfileBody(BaseModel):
    name: str
    date_of_birth: date
    about_me: str


@router.put("/profile")
async def update_profile(session: SessionDep, user_data: UserDataDep, body: UpdateProfileBody):
    user = await session.get(User, user_data.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.name = body.name
    user.about_me = body.about_me
    user.date_of_birth = body.date_of_birth.isoformat()
    await session.commit()
    await session.refresh(user)
    
    return {
        "success": True,
        "data": user.serialize(),
    }


@router.get("/users/{user_id}")
async def get_user(session: SessionDep, user_id: int, _: UserDataDep):
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "success": True,
        "data": user.serialize(),
    }


@router.get("/request-types")
async def list_request_types(session: SessionDep, _: UserDataDep):
    request_types = await session.scalars(select(RequestType))
    return {
        "success": True,
        "data": [rt for rt in request_types],
    }
