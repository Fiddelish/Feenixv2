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
        new_product = False
        db_product = get_product_by_id(product.id, db)
    else:
        new_product = True
        db_product = dbmodels.Product()
    db_product.name = product.name
    db_product.description = product.description
    db_product.price = product.price
    db_product.image = product.image
    db_product.quantity = product.quantity
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def delete_product_by_id(product_id: int, db: Session):
    product = get_product_by_id(product_id, db)
    db.delete(product)
    db.commit()
