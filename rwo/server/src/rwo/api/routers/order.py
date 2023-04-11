from typing import List
from sqlalchemy.orm import Session
import aioredis
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
import os
from ..decor import (
    rollback_error500,
    async_rollback_error500,
)
from ..models import (
    Order,
    OrderStatus,
    SubmitOrderRequest,
    SubmitOrderResponse,
    VerifyOrderPaymentRequest,
    VerifyOrderPaymentResponse,
    RetrieveOrderRequest,
    RetrieveOrderResponse,
    FulfillOrderRequest,
    FulfillOrderResponse,
)
from ...db import crud
from ..dependencies import (
    get_db_session,
    get_redis,
)
from ...common import require
from ...common.blockchain import (
    generate_tx_id,
    generate_token,
    verify_hash,
)
from ...manager import notification

RWO_STORE_ADMIN_EMAIL = os.getenv("RWO_STORE_ADMIN_EMAIL")
RWO_PORTAL_URL = os.getenv("RWO_PORTAL_URL", "http://localhost:3000")

router = APIRouter(
    prefix="/v1/order",
    tags=["order"],
    responses={404: {"description": "Not found"}},
    dependencies=[],
)


@router.put("/submit", operation_id="submit_order", response_model=SubmitOrderResponse)
@rollback_error500()
def submit_order(sor: SubmitOrderRequest, db: Session = Depends(get_db_session)):
    tx_id = generate_tx_id()
    token = generate_token()
    order = Order(
        **sor.dict(), id=0, status=OrderStatus.pending, tx_id=tx_id, token=token
    )
    db_order = crud.add_order(order, db)
    return SubmitOrderResponse(tx_id=tx_id)

@router.put(
    "/verify", operation_id="verify_order", response_model=VerifyOrderPaymentResponse
)
@async_rollback_error500()
async def verify_order(
    vopr: VerifyOrderPaymentRequest, db: Session = Depends(get_db_session), redis: aioredis.Redis = Depends(get_redis)
):
    order = crud.get_order_by_tx_id_with_lock(vopr.tx_id, db)
    require(order.status == OrderStatus.pending.value, "Wrong order status")
    require(
        verify_hash(
            vopr.tx_id, vopr.tx_hash, order.wallet, order.product_id, vopr.amount
        ),
        "Could NOT verify transaction",
    )
    order.tx_hash = vopr.tx_hash
    order.status = OrderStatus.paid.value
    crud.add_order(order, db)
    await notification.create(
        db=db,
        redis=redis,
        subscriber="user",
        channel="email",
        recipient=order.email,
        data={
            "product_id": order.product_id,
            "status": OrderStatus.paid.value,
            "tx_id": vopr.tx_id,
            "created_at": order.created_at
        }
    )
    my_order = Order.from_orm(order)
    await notification.create(
        db=db,
        redis=redis,
        subscriber="admin",
        channel="email",
        recipient=RWO_STORE_ADMIN_EMAIL,
        data={ **my_order.dict(), "portal_url": RWO_PORTAL_URL }
    )
    return VerifyOrderPaymentResponse(verified=True)


@router.post(
    "/retrieve", operation_id="retrieve_order", response_model=RetrieveOrderResponse
)
@rollback_error500()
def retrieve_order(ror: RetrieveOrderRequest, db: Session = Depends(get_db_session)):
    order = crud.get_order_by_tx_id(ror.tx_id, db)
    resp = RetrieveOrderResponse(verified=False, order=None)
    if (
        not order
        or not order.token == ror.token
        or not order.status in ( OrderStatus.paid.value, OrderStatus.fulfilled.value )
    ):
        return resp
    order.token = ""
    resp.verified = True
    resp.order = order
    return resp


@router.post(
    "/fulfill", operation_id="fulfill_order", response_model=FulfillOrderResponse
)
@rollback_error500()
def fulfill_order(ffor: FulfillOrderRequest, db: Session = Depends(get_db_session)):
    order = crud.get_order_by_tx_id_with_lock(ffor.tx_id, db)
    resp = FulfillOrderResponse(fulfilled=False)
    if (
        not order
        or not order.token == ffor.token
        or not order.status == OrderStatus.paid.value
    ):
        return resp
    order.status = OrderStatus.fulfilled.value
    crud.add_order(order, db)
    resp.fulfilled = True
    return resp
