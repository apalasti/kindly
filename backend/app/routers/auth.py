from datetime import date

from fastapi import APIRouter
from fastapi.exceptions import HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.db import SessionDep
from app.internal import auth

from ..models import User

router = APIRouter(
    prefix="/auth",
)


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class RegisterBody(BaseModel):
    name: str
    email: EmailStr
    password: str
    date_of_birth: date
    about_me: str
    is_volunteer: bool


@router.post("/login")
async def login(session: SessionDep, body: LoginBody):
    user = (
        await session.execute(select(User).filter(User.email == body.email))
    ).scalars().first()
    if not user or not auth.verify_password(body.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    user_data = auth.UserData.from_user(user)
    return {
        "success": True,
        "data": {
            "user": user_data,
            "token": user_data.create_token(),
        },
    }


@router.post("/register")
async def register(session: SessionDep, body: RegisterBody):
    user = User(
        name=body.name,
        email=body.email,
        password=auth.get_password_hash(body.password),
        date_of_birth=body.date_of_birth.isoformat(),
        about_me=body.about_me,
        is_volunteer=body.is_volunteer
    )
    try:
        session.add(user)
        await session.commit()
    except IntegrityError as e:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )

    await session.refresh(user)
    user_data = auth.UserData.from_user(user)
    return {
        "success": True,
        "data": {
            "user": user_data,
            "token": user_data.create_token(),
        },
        "message": "User registered successfully"
    }
