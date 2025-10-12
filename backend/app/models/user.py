from datetime import datetime
from typing import List, Optional

from sqlalchemy import TIMESTAMP, Boolean, Float, Integer, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .help_request import HelpRequest


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

    applications: Mapped[List["HelpRequest"]] = relationship(
        secondary="application", back_populates="applications"
    )

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

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "date_of_birth": self.date_of_birth,
            "about_me": self.about_me,
            "is_volunteer": self.is_volunteer,
            "avg_rating": self.avg_rating,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
