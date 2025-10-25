from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import List

import sqlalchemy as sa
from geoalchemy2 import Geography
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class RequestStatus(Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    COMPLETED = "COMPLETED"


class Request(Base):
    __tablename__ = "request"

    id: Mapped[int] = mapped_column(sa.Integer, primary_key=True)

    name: Mapped[str] = mapped_column(sa.String, nullable=False)
    description: Mapped[str] = mapped_column(sa.String, nullable=False)
    reward: Mapped[int] = mapped_column(sa.Integer, nullable=False)

    # Possible values: OPEN, CLOSED, COMPLETED
    status: Mapped[RequestStatus] = mapped_column(
        sa.Enum(RequestStatus), nullable=False, default=RequestStatus.OPEN
    )

    start: Mapped[datetime] = mapped_column(sa.TIMESTAMP(timezone=True), nullable=False)
    end: Mapped[datetime] = mapped_column(sa.TIMESTAMP(timezone=True), nullable=False)

    address: Mapped[str] = mapped_column(sa.String, nullable=False)
    longitude: Mapped[Decimal] = mapped_column(sa.Numeric, nullable=False)
    latitude: Mapped[Decimal] = mapped_column(sa.Numeric, nullable=False)
    location: Mapped[Geography] = mapped_column(
        Geography("POINT", srid=4326), nullable=False
    )

    creator_id: Mapped[int] = mapped_column(sa.Integer, sa.ForeignKey("user.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        sa.TIMESTAMP(timezone=True),
        nullable=False,
        server_default=sa.text("CURRENT_TIMESTAMP"),
    )
    updated_at: Mapped[datetime] = mapped_column(
        sa.TIMESTAMP(timezone=True),
        nullable=False,
        server_default=sa.text("CURRENT_TIMESTAMP"),
        onupdate=sa.text("CURRENT_TIMESTAMP"),
    )

    creator: Mapped["User"] = relationship("User", back_populates="requests")
    request_types: Mapped[List["RequestType"]] = relationship(
        secondary="type_of", back_populates="requests"
    )
    applications: Mapped[List["Application"]] = relationship(
        "Application", back_populates="request"
    )
