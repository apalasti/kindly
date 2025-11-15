import os
from typing import Annotated

from fastapi import APIRouter, Depends, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from ..dependencies import AuthServiceDep
from ..interfaces.auth_service import LoginData, RegistrationData, UserInfo, REFRESH_TOKEN_EXPIRY


router = APIRouter(prefix="/auth", tags=["auth"])


class LoginOrRegisterResponse(BaseModel):
    success: bool
    user: UserInfo
    access_token: str


class RefreshResponse(BaseModel):
    success: bool
    token: str


@router.post("/login-form")
async def login_form(
    auth_service: AuthServiceDep,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
) -> LoginOrRegisterResponse:
    auth_result = await auth_service.login(
        LoginData(email=form_data.username, password=form_data.password)
    )
    set_refresh_token(response, auth_result.tokens.refresh_token)
    return LoginOrRegisterResponse(
        success=True,
        user=auth_result.user,
        access_token=auth_result.tokens.access_token
    )


@router.post("/login")
async def login(
    auth_service: AuthServiceDep,
    body: LoginData,
    response: Response,
) -> LoginOrRegisterResponse:
    auth_result = await auth_service.login(body)
    set_refresh_token(response, auth_result.tokens.refresh_token)
    return LoginOrRegisterResponse(
        success=True,
        user=auth_result.user,
        access_token=auth_result.tokens.access_token
    )


@router.post("/register")
async def register(
    auth_service: AuthServiceDep, body: RegistrationData, response: Response
) -> LoginOrRegisterResponse:
    auth_result = await auth_service.register(body)
    set_refresh_token(response, auth_result.tokens.refresh_token)
    return LoginOrRegisterResponse(
        success=True,
        user=auth_result.user,
        access_token=auth_result.tokens.access_token
    )


@router.post("/refresh")
async def refresh(
    auth_service: AuthServiceDep, request: Request, response: Response
) -> RefreshResponse:
    refresh_token = request.cookies.get("refresh_token", "")
    auth_tokens = await auth_service.refresh(refresh_token, None)
    set_refresh_token(response, auth_tokens.refresh_token)
    return RefreshResponse(success=True, token=auth_tokens.access_token)


@router.post("/logout")
async def logout(
    auth_service: AuthServiceDep,
    request: Request,
    response: Response,
) -> RefreshResponse:
    refresh_token = request.cookies.get("refresh_token", "")
    user_data = auth_service.authenticate(refresh_token)
    await auth_service.logout(user_data["id"], refresh_token)
    delete_refresh_token(response)
    return RefreshResponse(success=True, token="<DELETED>")

def set_refresh_token(response: Response, refresh_token):
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=not bool(os.environ.get("DEV", False)),
        samesite="lax",
        max_age=int(REFRESH_TOKEN_EXPIRY.total_seconds()),
    )


def delete_refresh_token(response: Response):
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=not bool(os.environ.get("DEV", False)),
        samesite="lax",
    )
