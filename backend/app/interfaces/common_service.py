from abc import ABC, abstractmethod
from datetime import date
from typing import List, TypedDict

from pydantic import BaseModel, Field

from .auth_service import UserInfo, UserTokenData


class UpdateProfileData(BaseModel):
    first_name: str = Field(min_length=1, max_length=64)
    last_name: str = Field(min_length=1, max_length=64)
    date_of_birth: date
    about_me: str = Field(min_length=0, max_length=512)


class RequestTypeInfo(TypedDict):
    id: int
    name: str


class CommonServiceInterface(ABC):
    @abstractmethod
    async def get_user(self, user_id: int) -> UserInfo: ...

    @abstractmethod
    async def update_profile(
        self, user: UserTokenData, profile_data: UpdateProfileData
    ) -> UserInfo: ...

    @abstractmethod
    async def list_request_types(self) -> List[RequestTypeInfo]: ...
