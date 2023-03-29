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
    RetrieveOrderRequest,
    RetrieveOrderResponse,
    FulfillOrderRequest,
    FulfillOrderResponse,
)
from ...db import crud
from ..dependencies import get_db_session
from ...common import require

router = APIRouter(
    prefix="/v1/order",
    tags=["order"],
    responses={404: {"description": "Not found"}},
    dependencies=[],
)

@router.put(
    "/",
    operation_id="submit_order",
    response_model=SubmitOrderResponse
)
@rollback_error500()
def submit_order(sor: SubmitOrderRequest, db: Session = Depends(get_db_session)):
    order = Order()
    return crud.add_order(order, db)

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
