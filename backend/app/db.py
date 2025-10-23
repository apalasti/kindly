import os
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends
from sqlalchemy.ext.asyncio import (AsyncSession, async_sessionmaker,
                                    create_async_engine)

from .models.base import Base

load_dotenv()
db_url = os.environ.get("DB_URL")
if db_url is None:
    raise ValueError("DB_URL environment variable is not set.")

engine = create_async_engine(
    db_url,
    echo=os.environ.get("DEBUG", "False").lower() in ("true", "1", "yes"),
    plugins=["geoalchemy2"],
)
async_session = async_sessionmaker(engine, expire_on_commit=False)


async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_session():
    async with async_session() as session:
        yield session


SessionDep = Annotated[AsyncSession, Depends(get_session)]
