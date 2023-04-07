import json
from typing import List, Any
from sqlalchemy.orm import Session
from fastapi import APIRouter, Path, Query, Depends

from ..decor import rollback_error500
from ..models import (
    Notification,
    NotificationSubscriber,
    NotificationChannel,
    UpdateNDSRequest,
)
from ...db import crud
from ..dependencies import get_db_session

router = APIRouter(
    prefix="/v1/notification",
    tags=["notification"],
    responses={
        404: {"description": "Not found"},
    },
    dependencies=[],
)


@router.get(
    "/pending",
    operation_id="get_notifications_pending",
    response_model=List[Notification],
)
async def get_notifications_pending(
    subscriber: str,
    channel: str = Query(default="email"),
    chunk_size: int = Query(50, gt=0, le=1000, description="Chunk size"),
    cursor: int = Query(default=None, gt=0, description="Cursor to start from"),
    db: Session = Depends(get_db_session),
) -> Any:
    rows = crud.get_notifications(
        NotificationChannel(channel),
        NotificationSubscriber(subscriber),
        cursor,
        chunk_size,
        db,
    )
    res = []
    for _ in rows:
        res.append(
            Notification(
                id=_.id,
                subscriber=_.subscriber,
                channel=_.channel,
                recipient=_.recipient,
                data=json.loads(_.data),
                created_at=_.created_at,
                updated_at=_.updated_at,
            )
        )
    return res


@router.put(
    "/delivery_status/{notification_id}",
    operation_id="delivery_status",
)
async def update_notification_delivery_status(
    undsr: UpdateNDSRequest,
    notification_id: int = Path(..., alias="notification_id"),
    db: Session = Depends(get_db_session),
):
    crud.update_order_notification(
        notification_id, undsr.successful, undsr.delivery_report, db
    )
