from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime

from pydantic import BaseModel, Field

from .auth_service import UserTokenData


@dataclass
class ApplicationInfo:
    id: int
    request_id: int
    user_id: int
    status: str
    applied_at: datetime


class RateVolunteerData(BaseModel):
    rating: int = Field(ge=1, le=5, description="Rating must be between 1 and 5")


class RateSeekerData(BaseModel):
    rating: int = Field(ge=1, le=5, description="Rating must be between 1 and 5")


class ApplicationServiceInterface(ABC):
    @abstractmethod
    async def create_application(
        self, user: UserTokenData, request_id: int
    ) -> ApplicationInfo: ...

    @abstractmethod
    async def delete_application(
        self, user: UserTokenData, request_id: int
    ) -> None: ...

    @abstractmethod
    async def accept_application(
        self, user: UserTokenData, request_id: int, volunteer_id: int
    ) -> None: ...

    @abstractmethod
    async def rate_volunteer(
        self, user: UserTokenData, request_id: int, rating_data: RateVolunteerData
    ) -> None: ...

    @abstractmethod
    async def rate_seeker(
        self, user: UserTokenData, request_id: int, rating_data: RateSeekerData
    ) -> None: ...
