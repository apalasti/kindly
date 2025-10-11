from datetime import datetime
from typing import Optional

from sqlmodel import TIMESTAMP, Column, Field, SQLModel, text


class BaseUser(SQLModel):
    name: str = Field(nullable=False)
    email: str = Field(nullable=False)
    password: str = Field(nullable=False)
    date_of_birth: str = Field(nullable=False)
    about_me: str = Field(nullable=False)
    is_volunteer: bool = Field(nullable=False)


class User(BaseUser, table=True):
    id: int | None = Field(default=None, primary_key=True)
    avg_rating: float = Field(default=0.0)
    created_datetime: Optional[datetime] = Field(sa_column=Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    ))
    updated_datetime: Optional[datetime] = Field(sa_column=Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
        server_onupdate=text("CURRENT_TIMESTAMP"),
    ))
