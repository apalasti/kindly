import os
from datetime import date, timedelta

from fastapi import APIRouter, Request, Response, status
from fastapi.exceptions import HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.sql import delete

from app.db import SessionDep
from app.internal import auth

from ..models import RefreshToken, User


ACCESS_TOKEN_EXPIRY = timedelta(minutes=5)
REFRESH_TOKEN_EXPIRY = timedelta(hours=2)

router = APIRouter(
    prefix="/auth",
)


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class RegisterBody(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    date_of_birth: date
    about_me: str
    is_volunteer: bool


@router.post("/login")
async def login(session: SessionDep, body: LoginBody, response: Response):
    user = (
        await session.execute(select(User).filter(User.email == body.email))
    ).scalars().first()
    if not user or not auth.verify_password(body.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    user_data = auth.UserData.from_user(user)
    refresh_token = user_data.create_token(REFRESH_TOKEN_EXPIRY)

    session.add(RefreshToken(user_id=user_data.id, token=refresh_token))
    await session.commit()

    set_refresh_token(response, refresh_token)
    return {
        "success": True,
        "data": {
            "user": {
                **user_data.__dict__,
                "first_name": user.first_name,
                "last_name": user.last_name,
            },
            "token": user_data.create_token(ACCESS_TOKEN_EXPIRY),
        },
    }


@router.post("/register")
async def register(session: SessionDep, body: RegisterBody, response: Response):
    user = User(
        first_name=body.first_name,
        last_name=body.last_name,
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

    refresh_token = user_data.create_token(REFRESH_TOKEN_EXPIRY)
    session.add(RefreshToken(user_id=user_data.id, token=refresh_token))
    await session.commit()

    set_refresh_token(response, refresh_token)
    return {
        "success": True,
        "data": {
            "user": {
                **user_data.__dict__,
                "first_name": user.first_name,
                "last_name": user.last_name,
            },
            "token": user_data.create_token(),
        },
        "message": "User registered successfully",
    }


@router.post("/refresh")
async def refresh(session: SessionDep, request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token", "")
    user_data = await auth.get_user_data_from_token(refresh_token)

    refresh_token = (
        await session.execute(
            select(RefreshToken).where(
                (RefreshToken.user_id == user_data.id)
                & (RefreshToken.token == refresh_token)
            )
        )
    ).scalar_one_or_none()
    if refresh_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )

    refresh_token.token = user_data.create_token(REFRESH_TOKEN_EXPIRY)
    await session.commit()

    set_refresh_token(response, refresh_token.token)
    return {
        "success": True,
        "token": user_data.create_token(ACCESS_TOKEN_EXPIRY),
    }


@router.post("/logout")
async def logout(session: SessionDep, request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token", "")
    user_data = await auth.get_user_data_from_token(refresh_token)

    await session.execute(
        delete(RefreshToken).where(
            (RefreshToken.user_id == user_data.id)
            & (RefreshToken.token == refresh_token)
        )
    )
    await session.commit()

    delete_refresh_token(response)
    return {
        "success": True,
    }


def set_refresh_token(response: Response, refresh_token):
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=not bool(os.environ.get("DEBUG", False)),
        samesite="lax",
        max_age=int(REFRESH_TOKEN_EXPIRY.total_seconds()),
    )


def delete_refresh_token(response: Response):
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=not bool(os.environ.get("DEBUG", False)),
        samesite="lax",
    )
