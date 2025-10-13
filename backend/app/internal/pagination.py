import asyncio
import math
from typing import Literal

from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import Select, func, select


class PaginationParams(BaseModel):
    page: int = Field(default=1, gt=0)
    limit: Literal[10, 20, 40] = Field(default=20)

    async def paginate(self, session: AsyncSession, query: Select) -> tuple[list, dict]:
        paginated_query = query.offset((self.page - 1) * self.limit).limit(self.limit)
        page = (await session.execute(paginated_query)).all()

        count_query = select(func.count()).select_from(query.subquery())
        total = (await session.execute(count_query)).scalar_one()

        return {
            "success": True,
            "data": [row._asdict() for row in page],
            "pagination": {
                "page": self.page,
                "limit": self.limit,
                "total": total,
                "totalPages": max(1, math.ceil(total / self.limit)),
            },
        }
