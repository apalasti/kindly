from typing import Annotated, Generic, TypeVar

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from .db import get_session
from .interfaces.auth_service import UserTokenData
from .interfaces import (
    AuthServiceInterface,
    ApplicationServiceInterface,
    AIServiceInterface,
    CommonServiceInterface,
    RequestServiceInterface,
)
from .services import (
    AuthService,
    ApplicationService,
    AIService,
    CommonService,
    RequestService,
)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

T = TypeVar("T")

class SuccessResponse(BaseModel, Generic[T]):
    success: bool = True
    data: T
    message: str = ""


SessionDep = Annotated[AsyncSession, Depends(get_session)]


def get_auth_service(session: SessionDep):
    return AuthService(session)


AuthServiceDep = Annotated[AuthServiceInterface, Depends(get_auth_service)]


def get_user_token_data(
    auth_service: AuthServiceDep, token: Annotated[str, Depends(oauth2_scheme)]
):
    return auth_service.authenticate(token)


UserDataDep = Annotated[UserTokenData, Depends(get_user_token_data)]


def get_application_service(
    session: SessionDep,
    auth_service: AuthServiceDep,
):
    return ApplicationService(session, auth_service)


ApplicationServiceDep = Annotated[
    ApplicationServiceInterface, Depends(get_application_service)
]


def get_ai_service(
    session: SessionDep,
    auth_service: AuthServiceDep,
) -> AIService:
    return AIService(session, auth_service)


AIServiceDep = Annotated[AIServiceInterface, Depends(get_ai_service)]


def get_common_service(session: SessionDep):
    return CommonService(session)


CommonServiceDep = Annotated[CommonServiceInterface, Depends(get_common_service)]


def get_request_service(
    session: SessionDep,
    auth_service: AuthServiceDep,
) -> RequestService:
    return RequestService(session, auth_service)


RequestServiceDep = Annotated[RequestServiceInterface, Depends(get_request_service)]
