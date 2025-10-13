from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import List

from geoalchemy2 import Geography
from sqlalchemy import (TIMESTAMP, Boolean, ForeignKey, Integer, Numeric,
                        String, text)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Request(Base):
    __tablename__ = "request"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    reward: Mapped[int] = mapped_column(Integer, nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    start: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    end: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)

    longitude: Mapped[Decimal] = mapped_column(Numeric, nullable=False)
    latitude: Mapped[Decimal] = mapped_column(Numeric, nullable=False)
    location: Mapped[Geography] = mapped_column(
        Geography("POINT", srid=4326), nullable=False
    )

    creator_id: Mapped[int] = mapped_column(Integer, ForeignKey("user.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
    )

    creator: Mapped["User"] = relationship("User", back_populates="requests")
    request_types: Mapped[List["RequestType"]] = relationship(
        secondary="type_of", back_populates="requests"
    )
    applications: Mapped[List["User"]] = relationship(
        secondary="application", back_populates="applications"
    )
