from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import (TIMESTAMP, Boolean, ForeignKey, Integer, Numeric,
                        String, text)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geography

from .base import Base
from .request_type import RequestType


class Request(Base):
    __tablename__ = "request"

    id: Mapped[Optional[int]] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    longitude: Mapped[Decimal] = mapped_column(Numeric, nullable=False)
    latitude: Mapped[Decimal] = mapped_column(Numeric, nullable=False)
    start: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    end: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    reward: Mapped[int] = mapped_column(Integer, nullable=False)
    creator_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("user.id"), nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    location: Mapped[Geography] = mapped_column(
        Geography("POINT", srid=4326), nullable=False
    )

    creator: Mapped["User"] = relationship("User", back_populates="requests")  # pyright: ignore[reportUndefinedVariable]

    request_types: Mapped[List["RequestType"]] = relationship(
        secondary="type_of", back_populates="requests"
    )
    applications: Mapped[List["User"]] = relationship(  # pyright: ignore[reportUndefinedVariable]
        secondary="application", back_populates="applications"
    )

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
