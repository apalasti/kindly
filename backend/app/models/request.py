from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlmodel import TIMESTAMP, Column, Field, ForeignKey, SQLModel, text


class BaseRequest(SQLModel):
    name: str = Field(nullable=False)
    description: str = Field(nullable=False)
    longitude: Decimal = Field(nullable=False)
    latitude: Decimal = Field(nullable=False)
    start: datetime = Field(nullable=False)
    end: datetime = Field(nullable=False)
    reward: int = Field(nullable=False)
    creator_id: Optional[int] = Field(default=None, foreign_key="user.id", nullable=False)
    is_completed: bool = Field(nullable=False, default=False)


class Request(BaseRequest, table=True):
    id: int | None = Field(default=None, primary_key=True)
    created_at: Optional[datetime] = Field(sa_column=Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    ))
    updated_at: Optional[datetime] = Field(sa_column=Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
        server_onupdate=text("CURRENT_TIMESTAMP"),
    ))
