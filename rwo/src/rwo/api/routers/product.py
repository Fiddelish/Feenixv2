from typing import List
from sqlalchemy.orm import Session
from fastapi import (
    APIRouter,
    Path,
    Depends
)

from ..decor import rollback_error500
from ..models import Product
from ...db import crud
from ..dependencies import get_db_session

router = APIRouter(
    prefix="/v1/product",
    tags=["product"],
    responses={404: {"description": "Not found"}},
    dependencies=[],
)

@router.get(
    "/products",
    operation_id="get_products",
    response_model=List[Product]
)
@rollback_error500()
def get_products(db: Session = Depends(get_db_session)):
    return crud.get_products(db)

@router.get(
    "/product/{product_id}",
    operation_id="get_product_by_id",
    response_model=Product
)
@rollback_error500()
def get_product_by_id(
    product_id: int = Path(..., alias="product_id"),
    db: Session = Depends(get_db_session)
):
    return crud.get_product_by_id(product_id, db)
