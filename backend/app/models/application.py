from datetime import datetime
from typing import Optional

from sqlalchemy import TIMESTAMP, Boolean, ForeignKey, Integer, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql.schema import UniqueConstraint

from .base import Base


class Application(Base):
    __tablename__ = "application"
    __table_args__ = (
        UniqueConstraint("request_id", "user_id"),
    )
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    request_id: Mapped[int] = mapped_column(Integer, ForeignKey("request.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("user.id"), nullable=False)

    # Possible values PENDING, DECLINED, ACCEPTED
    status: Mapped[str] = mapped_column(String(length=10), nullable=False, default="PENDING")

    applied_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    volunteer_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    help_seeker_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    volunteer: Mapped["User"] = relationship("User", viewonly=True)
    request: Mapped["Request"] = relationship("Request", viewonly=True)
