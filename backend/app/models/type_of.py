from typing import Optional

from sqlmodel import Field, ForeignKey, SQLModel


class TypeOf(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    request_id: int = Field(foreign_key="request.id", nullable=False)
    request_type_id: int = Field(foreign_key="request_type.id", nullable=False)
