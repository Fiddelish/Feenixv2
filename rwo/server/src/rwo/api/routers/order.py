from typing import List
from sqlalchemy.orm import Session
from fastapi import (
    APIRouter,
    Path,
    Depends
)

from ..decor import rollback_error500
from ..models import Order
from ...db import crud
from ..dependencies import get_db_session

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
