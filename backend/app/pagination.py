import math
from typing import Any, Generic, TypeVar, List
from dataclasses import dataclass

from pydantic import BaseModel, Field
from sqlalchemy import Row, Select, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import func


T = TypeVar("T")

@dataclass(frozen=False)
class Pagination(Generic[T]):
    data: List[T]
    page: int
    limit: int
    total: int
    totalPages: int


class PaginationParams(BaseModel):
    page: int = Field(default=1, gt=0)
    limit: int = Field(default=20, gt=0, le=40)

    async def paginate(self, session: AsyncSession, query: Select, scalar: bool = True) -> Pagination[Any]:
        paginated_query = query.offset((self.page - 1) * self.limit).limit(self.limit)
        page = (await session.execute(paginated_query)).unique()
        page = page.scalars() if scalar else page.all()

        count_query = select(func.count()).select_from(query.subquery())
        total = (await session.execute(count_query)).scalar_one()

        return Pagination(
            data=[row for row in page],
            page=self.page,
            limit=self.limit,
            total=total,
            totalPages=max(1, math.ceil(total / self.limit)),
        )
