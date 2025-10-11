from datetime import datetime
from typing import Optional

from sqlmodel import TIMESTAMP, Column, Field, SQLModel, text


class Application(SQLModel, table=True):
    request_id: int = Field(foreign_key="request.id", primary_key=True)
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    is_accepted: bool = Field(nullable=False, default=False)
    volunteer_rating: Optional[int] = None
    help_seeker_rating: Optional[int] = None
    applied_at: Optional[datetime] = Field(sa_column=Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    ))
