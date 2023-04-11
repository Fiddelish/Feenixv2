from ..db.database import DBSession
import aioredis
import os

REDIS_URL = os.getenv("RWO_REDIS_URL")

redis_pool = aioredis.ConnectionPool.from_url(REDIS_URL, decode_responses=True)

def get_db_session():
    print("Getting DB Session")
    db_session = None
    try:
        db_session = DBSession()
        yield db_session
    finally:
        if (db_session):
            db_session.close()

async def get_redis():
    redis = await aioredis.Redis(
        connection_pool=redis_pool, encoding="utf-8", decode_responses=True
    )
    yield redis
