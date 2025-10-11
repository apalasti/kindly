from sqlmodel import Field, SQLModel


class RequestType(SQLModel, table=True):
    __tablename__ = "request_type"
    id: int = Field(primary_key=True)
    name: str = Field(nullable=False)
