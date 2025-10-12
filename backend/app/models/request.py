from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import Integer, String, Numeric, Boolean, TIMESTAMP, ForeignKey, text
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class BaseRequest:
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    longitude: Mapped[Decimal] = mapped_column(Numeric, nullable=False)
    latitude: Mapped[Decimal] = mapped_column(Numeric, nullable=False)
    start: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    end: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    reward: Mapped[int] = mapped_column(Integer, nullable=False)
    creator_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("user.id"), nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)


class Request(Base, BaseRequest):
    __tablename__ = "request"
    
    id: Mapped[Optional[int]] = mapped_column(Integer, primary_key=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
    )
