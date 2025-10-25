from abc import ABC, abstractmethod
from datetime import date, datetime, timedelta
from enum import Enum
from typing import Any, Optional, TypedDict
from dataclasses import dataclass
from typing_extensions import NotRequired

from pydantic import BaseModel, EmailStr


class RegistrationData(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    date_of_birth: date
    about_me: str
    is_volunteer: bool


class LoginData(BaseModel):
    email: EmailStr
    password: str


@dataclass
class UserInfo:
    id: int
    first_name: str
    last_name: str
    email: str
    date_of_birth: date
    about_me: str
    is_volunteer: bool
    avg_rating: float


@dataclass
class AuthTokens:
    access_token: str
    refresh_token: str

@dataclass
class AuthResult:
    user: UserInfo
    tokens: AuthTokens


class UserTokenData(TypedDict):
    id: int
    email: str
    is_volunteer: bool
    exp: NotRequired[datetime]


class UserRoles(Enum):
    VOLUNTEER = "volunteer"
    HELP_SEEKER = "help_seeker"


class AuthServiceInterface(ABC):
    @abstractmethod
    async def login(self, body: LoginData) -> AuthResult: ...

    @abstractmethod
    async def register(self, body: RegistrationData) -> AuthResult: ...

    @abstractmethod
    async def refresh(
        self, refresh_token: str, access_expires: timedelta | None = None
    ) -> AuthTokens: ...

    @abstractmethod
    async def logout(self, user_id: int, refresh_token: str) -> None: ...

    @abstractmethod
    def authenticate(self, token: str) -> UserTokenData: ...

    @abstractmethod
    def authorize_with_role(self, user: UserTokenData, role: UserRoles): ...
