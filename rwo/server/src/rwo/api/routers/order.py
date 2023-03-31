from typing import List
from sqlalchemy.orm import Session
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from ..decor import rollback_error500
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
from ..dependencies import get_db_session
from ...common import require
from ...common.blockchain import (
    generate_tx_id,
    generate_token,
    verify_hash,
)

router = APIRouter(
    prefix="/v1/order",
    tags=["order"],
    responses={404: {"description": "Not found"}},
    dependencies=[],
)

@router.put(
    "/submit",
    operation_id="submit_order",
    response_model=SubmitOrderResponse
)
@rollback_error500()
def submit_order(sor: SubmitOrderRequest, db: Session = Depends(get_db_session)):
    tx_id = generate_tx_id()
    token = generate_token()
    order = Order(
        **sor.dict(),
        id=0,
        status=OrderStatus.pending,
        tx_id=tx_id,
        token=token
    )
    crud.add_order(order, db)
    return SubmitOrderResponse(tx_id=tx_id)

@router.put(
    "/verify",
    operation_id="verify_order",
    response_model=VerifyOrderPaymentResponse
)
@rollback_error500()
def verify_order(vopr: VerifyOrderPaymentRequest, db: Session = Depends(get_db_session)):
    order = crud.get_order_by_tx_id_with_lock(vopr.tx_id, db)
    require(order.status == OrderStatus.pending.value, "Wrong order status")
    require(
        verify_hash(vopr.tx_id, vopr.tx_hash, order.wallet, order.product_id, vopr.amount),
        "Could NOT verify transaction"
    )
    order.status = OrderStatus.paid.value
    crud.add_order(order, db)
    return VerifyOrderPaymentResponse(verified=True)

@router.post(
    "/retrieve",
    operation_id="retrieve_order",
    response_model=RetrieveOrderResponse
)
@rollback_error500()
def retrieve_order(ror: RetrieveOrderRequest, db: Session = Depends(get_db_session)):
    order = crud.get_order_by_tx_id(ror.tx_id, db)
    resp = RetrieveOrderResponse(verified=False, order=None)
    if (not order or not order.token == ror.token or not order.status == OrderStatus.pending.value):
        return resp
    order.token = ""
    resp.verified = True
    resp.order = order
    return resp

@router.post(
    "/fulfill",
    operation_id="fulfill_order",
    response_model=FulfillOrderResponse
)
@rollback_error500()
def fulfill_order(ffor: FulfillOrderRequest, db: Session = Depends(get_db_session)):
    order = crud.get_order_by_tx_id_with_lock(ffor.tx_id, db)
    resp = FulfillOrderResponse(fullfilled=False)
    if (not order or not order.token == ffor.token or not order.status == OrderStatus.pending.value):
        return resp
    order.status = OrderStatus.fulfilled.value
    crud.add_order(order, db)
    resp.fulfilled = True
    return resp
