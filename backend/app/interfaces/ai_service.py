from abc import ABC, abstractmethod
from typing import List

from pydantic import BaseModel

from .auth_service import UserTokenData
from .common_service import RequestTypeInfo


class CategoryGenerationRequest(BaseModel):
    description: str


class AIServiceInterface(ABC):

    @abstractmethod
    async def generate_categories(
        self, user: UserTokenData, request: CategoryGenerationRequest
    ) -> List[RequestTypeInfo]:
        pass
