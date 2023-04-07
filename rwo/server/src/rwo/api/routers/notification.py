from typing import List, Any
from sqlalchemy.orm import Session
from fastapi import APIRouter, Path, Query, Depends

from ..decor import rollback_error500
from ..models import (
    OrderNotification,
    NotificationSubscriber,
    NotificationChannel,
    UpdateNDSRequest,
)
from ...db import crud
from ..dependencies import get_db_session

router = APIRouter(
    prefix="/v1/order/notification",
    tags=["notification"],
    responses={
        404: {"description": "Not found"},
    },
    dependencies=[],
)


@router.get(
    "/pending",
    operation_id="get_notifications_pending",
    response_model=List[OrderNotification],
)
async def get_notifications_pending(
    subscriber: str,
    channel: str = Query(default="email"),
    chunk_size: int = Query(50, gt=0, le=1000, description="Chunk size"),
    cursor: int = Query(default=None, gt=0, description="Cursor to start from"),
    db: Session = Depends(get_db_session),
) -> Any:
    rows = crud.get_order_notifications(
        NotificationChannel(channel),
        NotificationSubscriber(subscriber),
        cursor,
        chunk_size,
        db,
    )
    r = []
    for n, o, p in rows:
        r.append(
            OrderNotification(
                id=n.id,
                product_name=p.name,
                product_description=p.description,
                product_price=9999,  # TODO change
                product_quantity=o.quantity,
                order_status=n.status,
                order_email=o.email,
                order_tx_id=o.tx_id,
                order_token=(
                    o.token if subscriber == NotificationSubscriber.admin else None
                ),
                subscriber=n.subscriber,
                channel=n.channel,
                created_at=n.created_at,
                updated_at=n.updated_at,
            )
        )
    return r


@router.post(
    "/update_delivery_status/{notification_id}",
    operation_id="update_delivery_status",
)
async def update_notification_delivery_status(
    undsr: UpdateNDSRequest,
    notification_id: int = Path(..., alias="notification_id"),
    db: Session = Depends(get_db_session),
):
    crud.update_order_notification(notification_id, undsr.successful, undsr.report, db)
