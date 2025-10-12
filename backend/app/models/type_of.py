from typing import Optional

from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class TypeOf(Base):
    __tablename__ = "type_of"
    
    id: Mapped[Optional[int]] = mapped_column(Integer, primary_key=True)
    request_id: Mapped[int] = mapped_column(Integer, ForeignKey("request.id"), nullable=False)
    request_type_id: Mapped[int] = mapped_column(Integer, ForeignKey("request_type.id"), nullable=False)
