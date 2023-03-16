from typing import List
import uuid
import hashlib
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import (
    APIRouter,
    Path,
    Depends
)
from fastapi.exceptions import HTTPException

from ..decor import rollback_error500
from ..models import (
    Order,
    OrderStatus,
    CreateOrderRequest,
    CreateOrderResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
)
from ...common import require
from ...common.blockchain import (
    verify_hash,
)
from ...db import crud
from ..dependencies import get_db_session


def generate_random_digest(timestamp: datetime) -> str:
    dt = str(timestamp.timestamp()).replace(".", "")
    guid = str(uuid.uuid4()).replace("-", "")
    key = str(uuid.uuid4()).replace("-", "").encode()
    msg = f"{dt}{guid}".encode()
    h = hashlib.sha256()
    h.update(key)
    h.update(msg)
    return h.hexdigest()

def generate_accessor() -> str:
    return generate_random_digest(datetime.utcnow())

router = APIRouter(
    prefix="/v1/order",
    tags=["order"],
    responses={404: {"description": "Not found"}},
    dependencies=[],
)

@router.put(
    "/",
    operation_id="create_order",
    response_model=CreateOrderResponse
)
@rollback_error500()
def create_order(cor: CreateOrderRequest, db: Session = Depends(get_db_session)):
    timestamp = datetime.utcnow()
    internal_tx_id = generate_random_digest(timestamp)
    accessor = generate_accessor()
    my_order = Order(
        id = 0,
        product_id=cor.product_id,
        timestamp=timestamp,
        email=cor.email,
        wallet=cor.wallet,
        quantity=cor.quantity,
        total=cor.total,
        internal_tx_id=internal_tx_id,
        accessor=accessor,
        tx_hash=None,
        status=OrderStatus.pending
    )
    my_order = crud.add_order(my_order, db)
    return CreateOrderResponse(
        order_id=my_order.id,
        internal_tx_id=internal_tx_id
    )

@router.put(
    "/",
    operation_id="verify_payment",
    response_model=VerifyPaymentResponse
)
@rollback_error500()
def verify_payment(vpr: VerifyPaymentRequest, db: Session = Depends(get_db_session)):
    my_order = crud.get_order_by_id(vpr.order_id, db) # todo: with lock for update
    try:
        verify_hash(
            tx_id=my_order.internal_tx_id,
            tx_hash=vpr.tx_hash,
            wallet=my_order.wallet,
            amount=my_order.total
        )
        # todo: send emails to RWO admin and to user
    except Exception as e:
        return VerifyPaymentResponse(
            verified=False,
            message=str(e)
        )
    my_order.status = OrderStatus.paid
    crud.add_order(my_order, db)
    return VerifyPaymentResponse(
        verified=True,
        message=""
    )


@router.get(
    "/status/{order_status}",
    operation_id="get_orders_by_status",
    response_model=List[Order]
)
@rollback_error500()
def get_orders_by_status(
    order_status: int = Path(..., alias="order_status"),
    db: Session = Depends(get_db_session)
):
    return crud.get_orders_by_status(order_status, db)

@router.get(
    "/id/{order_id}",
    operation_id="get_order_by_id",
    response_model=Order
)
@rollback_error500()
def get_order_by_id(
    order_id: int = Path(..., alias="order_id"),
    db: Session = Depends(get_db_session)
):
    return crud.get_order_by_id(order_id, db)
