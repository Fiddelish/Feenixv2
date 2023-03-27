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
    RetrieveRequest,
    RetrieveResponse,
    FulfillRequest,
    FulfillResponse,
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
    operation_id="add_order",
    response_model=Order
)
@rollback_error500()
def add_order(order: Order, db: Session = Depends(get_db_session)):
    return crud.add_order(order, db)

@router.post(
    "/retrieve",
    operation_id="retrieve_order",
    response_model=RetrieveResponse
)
@rollback_error500()
def retrieve_order(rr: RetrieveRequest, db: Session = Depends(get_db_session)):
    order = crud.get_order_by_tx_id(rr.tx_id, db)
    resp = RetrieveResponse(verified=False, order=None)
    if (not order or not order.token == rr.token or not order.status == OrderStatus.pending.value):
        return resp
    order.token = ""
    resp.verified = True
    resp.order = order
    return resp

@router.post(
    "/fulfill",
    operation_id="fulfill_order",
    response_model=FulfillResponse
)
@rollback_error500()
def fulfill_order(rr: FulfillRequest, db: Session = Depends(get_db_session)):
    order = crud.get_order_by_tx_id_with_lock(rr.tx_id, db)
    resp = FulfillResponse(fullfilled=False)
    if (not order or not order.token == rr.token or not order.status == OrderStatus.pending.value):
        return resp
    order.status = OrderStatus.fulfilled.value
    crud.add_order(order, db)
    resp.fulfilled = True
    return resp
