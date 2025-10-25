from datetime import date, datetime
from typing import List

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(sa.Integer, primary_key=True)

    first_name: Mapped[str] = mapped_column(sa.String, nullable=False)
    last_name: Mapped[str] = mapped_column(sa.String, nullable=False)
    email: Mapped[str] = mapped_column(sa.String, nullable=False, unique=True)
    password: Mapped[str] = mapped_column(sa.String, nullable=False)
    date_of_birth: Mapped[date] = mapped_column(sa.Date, nullable=False)
    about_me: Mapped[str] = mapped_column(sa.String, nullable=False)
    is_volunteer: Mapped[bool] = mapped_column(sa.Boolean, nullable=False)
    avg_rating: Mapped[float] = mapped_column(sa.Float, default=0.0)

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

    requests: Mapped[List["Request"]] = relationship(
        "Request", back_populates="creator"
    )
