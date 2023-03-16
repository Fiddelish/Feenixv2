# type: ignore
from typing import Any, Callable, List
from sqlalchemy.orm import Session
from . import models as dbmodels
from ..api import models as apimodels



def commit(db: Session):
    db.commit()

def detach(object, db: Session):
    if not object:
        return
    db.expunge(object)

def attach(object, db: Session):
    if not object:
        return
    db.add(object)


#
# Products
#
def get_product_by_id(product_id: int, db: Session):
    return db.query(dbmodels.Product).filter(dbmodels.Product.id == product_id).first()

def get_products(db: Session):
    return db.query(dbmodels.Product).all()

def add_product(product: apimodels.Product, db: Session) -> dbmodels.Product:
    if (product.id > 0):
        db_product = get_product_by_id(product.id, db)
    else:
        db_product = dbmodels.Product()
    db_product.name = product.name
    db_product.description = product.description
    db_product.price = product.price
    db_product.quantity = product.quantity
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def delete_product_by_id(product_id: int, db: Session):
    product = get_product_by_id(product_id, db)
    db.delete(product)
    db.commit()

#
# Orders
#
def get_order_by_id(order_id: int, db: Session) -> dbmodels.Order:
    return db.query(dbmodels.Order).filter(dbmodels.Order.id == order_id).first()

def get_orders_by_status(order_status: apimodels.OrderStatus, db: Session) -> List[dbmodels.Order]:
    return db.query(dbmodels.Order).filter(dbmodels.Order.status == order_status).all()

def add_order(order: apimodels.Order, db: Session) -> dbmodels.Order:
    if (order.id > 0):
        db_order = get_order_by_id(order.id, db)
    else:
        db_order = dbmodels.Order()
    db_order.product_id = order.product_id
    db_order.timestamp = order.timestamp
    db_order.email = order.email
    db_order.wallet = order.wallet
    db_order.quantity = order.quantity
    db_order.total = order.total
    db_order.internal_tx_id = order.internal_tx_id
    db_order.accessor = order.accessor
    db_order.tx_hash = order.tx_hash
    db_order.status = order.status
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order
