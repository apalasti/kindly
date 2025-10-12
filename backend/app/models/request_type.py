from typing import List
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class RequestType(Base):
    __tablename__ = "request_type"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)

    requests: Mapped[List["HelpRequest"]] = relationship(  # pyright: ignore[reportUndefinedVariable]
        secondary="type_of", back_populates="request_types"
    )
