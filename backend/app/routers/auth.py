import os
from datetime import timedelta

from fastapi import APIRouter, Request, Response
from pydantic import BaseModel

from ..dependencies import AuthServiceDep, SuccessResponse
from ..interfaces.auth_service import LoginData, RegistrationData, UserInfo

ACCESS_TOKEN_EXPIRY = timedelta(hours=5)
REFRESH_TOKEN_EXPIRY = timedelta(hours=2)

router = APIRouter(
    prefix="/auth",
)


class LoginOrRegisterResponse(BaseModel):
    user: UserInfo
    token: str


class RefreshResponse(BaseModel):
    success: bool
    token: str


@router.post("/login")
async def login(
    auth_service: AuthServiceDep,
    body: LoginData,
    response: Response,
) -> SuccessResponse[LoginOrRegisterResponse]:
    auth_result = await auth_service.login(body) 
    set_refresh_token(response, auth_result.tokens.refresh_token)
    return SuccessResponse(
        data=LoginOrRegisterResponse(
            user=auth_result.user,
            token=auth_result.tokens.access_token
        )
    )


@router.post("/register")
async def register(
    auth_service: AuthServiceDep, body: RegistrationData, response: Response
) -> SuccessResponse[LoginOrRegisterResponse]:
    auth_result = await auth_service.register(body)
    set_refresh_token(response, auth_result.tokens.refresh_token)
    return SuccessResponse(
        data=LoginOrRegisterResponse(
            user=auth_result.user,
            token=auth_result.tokens.access_token
        )
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
