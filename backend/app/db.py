import os

from dotenv import load_dotenv
from sqlalchemy import inspect
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from .models.base import Base

load_dotenv()
db_url = os.environ.get("DB_URL")
if db_url is None:
    raise ValueError("DB_URL environment variable is not set.")

engine = create_async_engine(
    db_url,
    echo=os.environ.get("DEV", "False").lower() in ("true", "1", "yes"),
    plugins=["geoalchemy2"],
)
async_session = async_sessionmaker(engine, expire_on_commit=False)


async def create_db_and_tables():
    async with engine.begin() as conn:
        our_table_names = set(Base.metadata.tables.keys())
        existing_tables = await conn.run_sync(
            lambda sync_conn: [
                t for t in inspect(sync_conn).get_table_names()
                if t in our_table_names
            ]
        )
        await conn.run_sync(Base.metadata.create_all)
        return len(existing_tables) != 0


async def get_session():
    async with async_session() as session:
        yield session
