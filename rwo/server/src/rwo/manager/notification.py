from typing import Dict, Any
import json
import aioredis
from sqlalchemy.orm import Session

from ..db import crud
from ..db import models as dbmodels


async def create(
    db: Session,
    redis: aioredis.Redis,
    subscriber: str,
    channel: str,
    recipient: str,
    data: Dict[str, Any],
):
    global redis_pool
    notification = crud.add_notification(
        dbmodels.Notification(
            id=0,
            subscriber=subscriber,
            channel=channel,
            recipient=recipient,
            data=json.dumps(data, default=str),
        ),
        db,
    )
    await redis.lpush(
        f"rwo:notify:{channel}:{subscriber}",
        notification.id,
    )
