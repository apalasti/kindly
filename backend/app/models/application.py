from datetime import datetime
from typing import Optional

from sqlalchemy import TIMESTAMP, Boolean, ForeignKey, Integer, text
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class Application(Base):
    __tablename__ = "application"
    
    request_id: Mapped[int] = mapped_column(Integer, ForeignKey("request.id"), primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("user.id"), primary_key=True)
    is_accepted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    volunteer_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    help_seeker_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    applied_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
