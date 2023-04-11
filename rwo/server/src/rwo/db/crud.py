from typing import Any, Callable, List
from sqlalchemy.orm import Session, aliased
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
    db_product = dbmodels.Product()
    db_product.id = product.id
    db_product.name = product.name
    db_product.description = product.description
    db_product.quantity = product.quantity
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def update_product(product: apimodels.Product, db: Session) -> dbmodels.Product:
    db_product = get_product_by_id(product.id, db)
    db_product.name = product.name
    db_product.description = product.description
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


def get_order_by_tx_id(tx_id: str, db: Session) -> dbmodels.Order:
    return db.query(dbmodels.Order).filter(dbmodels.Order.tx_id == tx_id).first()


def get_order_by_tx_id_with_lock(tx_id: str, db: Session) -> dbmodels.Order:
    return (
        db.query(dbmodels.Order)
        .with_for_update()
        .filter(dbmodels.Order.tx_id == tx_id)
        .first()
    )


def get_orders_by_status(
    order_status: apimodels.OrderStatus, db: Session
) -> List[dbmodels.Order]:
    return db.query(dbmodels.Order).filter(dbmodels.Order.status == order_status).all()


def add_order(order: apimodels.Order, db: Session) -> dbmodels.Order:
    if order.id > 0:
        db_order = get_order_by_id(order.id, db)
    else:
        db_order = dbmodels.Order()
    db_order.product_id = order.product_id
    db_order.email = order.email
    db_order.wallet = order.wallet
    db_order.quantity = order.quantity
    db_order.tx_id = order.tx_id
    db_order.token = order.token
    db_order.tx_hash = order.tx_hash
    db_order.status = order.status
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


#
# Notifications
#
def add_notification(
    notification: dbmodels.Notification, db: Session
) -> dbmodels.Notification:
    if notification.id > 0:
        _: dbmodels.Notification = (
            db.query(dbmodels.Notification)
            .filter(dbmodels.Notification.id == notification.id)
            .one()
        )
        _.subscriber = notification.subscriber
        _.channel = notification.channel
        _.recipient = notification.recipient
        _.data = notification.data
        _.successful = notification.successful
        _.delivery_report = notification.delivery_report
        _.created_at = notification.created_at
        _.updated_at = notification.updated_at
        notification = _
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def get_notifications(
    channel: apimodels.NotificationChannel,
    subscriber: apimodels.NotificationSubscriber,
    cursor: int,
    chunk_size: int,
    db: Session,
) -> List[apimodels.Notification]:
    return (
        db.query(dbmodels.Notification)
        .select_from(dbmodels.Notification)
        .filter(
            dbmodels.Notification.id > (0 if cursor is None else cursor),
            dbmodels.Notification.successful.is_(None),
            dbmodels.Notification.channel == channel,
            dbmodels.Notification.subscriber == subscriber,
        )
        .order_by(dbmodels.Notification.id.asc())
        .limit(chunk_size)
        .all()
    )


def update_order_notification(
    id: int,
    successful: bool,
    delivery_report: str,
    db: Session,
):
    _ = db.query(dbmodels.Notification).filter_by(id=id).one()
    _.successful = successful
    _.delivery_report = delivery_report
    db.commit()
