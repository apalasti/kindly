from datetime import datetime
from typing import Optional

from sqlalchemy import TIMESTAMP, Boolean, Float, Integer, String, text
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class User(Base):
    __tablename__ = "user"
    
    id: Mapped[Optional[int]] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    password: Mapped[str] = mapped_column(String, nullable=False)
    date_of_birth: Mapped[str] = mapped_column(String, nullable=False)
    about_me: Mapped[str] = mapped_column(String, nullable=False)
    is_volunteer: Mapped[bool] = mapped_column(Boolean, nullable=False)
    avg_rating: Mapped[float] = mapped_column(Float, default=0.0)
    created_datetime: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    updated_datetime: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
    )
