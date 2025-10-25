from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional, Literal

from pydantic import BaseModel, Field

from .auth_service import UserTokenData
from .common_service import RequestTypeInfo
from ..pagination import Pagination, PaginationParams


class CreateOrUpdateRequestData(BaseModel):
    name: str = Field(min_length=5)
    description: str = Field(min_length=20)
    longitude: float
    latitude: float
    address: str
    start: datetime
    end: datetime
    reward: float = Field(ge=0, description="Reward amount must be greater than or equal to 0")
    request_type_ids: List[int] = Field(default_factory=list)


class MyRequestsFilter(PaginationParams):
    status: Literal["OPEN", "COMPLETED", "ALL"] = "ALL"
    sort: Literal["created_at", "start", "reward"] = "created_at"
    order: Literal["asc", "desc"] = "desc"


class RequestsFilter(PaginationParams):
    status: Literal["OPEN", "COMPLETED", "APPLIED", "ALL"] = Field(default="OPEN")
    request_type_ids: List[int] = Field(default_factory=list)
    location_lat: Optional[float] = Field(default=None)
    location_lng: Optional[float] = Field(default=None)
    radius: int = Field(default=10)
    sort: Literal["start", "reward"] = Field(default="start")
    order: Literal["asc", "desc"] = Field(default="desc")


@dataclass
class RequestInfo:
    id: int
    name: str
    description: str
    reward: float
    status: str
    start: datetime
    end: datetime
    address: str
    longitude: float
    latitude: float
    created_at: datetime
    updated_at: datetime
    request_types: List[RequestTypeInfo]
    application_count: int


@dataclass
class RequestWithApplicationStatus(RequestInfo):
    application_status: str


@dataclass
class UserInfo:
    id: int
    first_name: str
    last_name: str
    avg_rating: float


@dataclass
class ApplicationInfo:
    id: int
    status: str
    volunteer: UserInfo
    applied_at: datetime
    volunteer_rating: Optional[int] = None
    help_seeker_rating: Optional[int] = None


@dataclass
class RequestDetailForHelpSeeker(RequestInfo):
    applications: List[ApplicationInfo]


@dataclass
class RequestDetailForVolunteer(RequestInfo):
    application_status: str
    creator: UserInfo


class RequestServiceInterface(ABC):
    @abstractmethod
    async def create_request(
        self, user: UserTokenData, request_data: CreateOrUpdateRequestData
    ) -> RequestInfo: ...

    @abstractmethod
    async def update_request(
        self, user: UserTokenData, request_id: int, request_data: CreateOrUpdateRequestData
    ) -> RequestInfo: ...

    @abstractmethod
    async def delete_request(self, user: UserTokenData, request_id: int) -> None: ...

    @abstractmethod
    async def complete_request(self, user: UserTokenData, request_id: int) -> None: ...

    @abstractmethod
    async def get_request_for_help_seeker(
        self, user: UserTokenData, request_id: int
    ) -> RequestDetailForHelpSeeker: ...

    @abstractmethod
    async def get_request_for_volunteer(
        self, user: UserTokenData, request_id: int
    ) -> RequestDetailForVolunteer: ...

    @abstractmethod
    async def get_my_requests(
        self, user: UserTokenData, filters: MyRequestsFilter
    ) -> Pagination[RequestInfo]: ...

    @abstractmethod
    async def get_requests(
        self, user: UserTokenData, filters: RequestsFilter
    ) -> Pagination[RequestWithApplicationStatus]: ...
