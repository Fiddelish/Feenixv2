from rwo.api import models as apimodels
from rwo.db import models as dbmodels
from faker import Faker
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from sqlalchemy.orm import scoped_session, sessionmaker, Session, aliased

from datetime import datetime
import os
import string
import random
import json

RWO_DB_USER = os.getenv("RWO_DB_USER", "rwouser")
RWO_DB_PASSWORD = os.getenv("RWO_DB_PASSWORD", "rwopwd")
RWO_DB_SERVER = os.getenv("RWO_DB_SERVER", "rwosrv:15432")
RWO_DB = os.getenv("RWO_DB", "rwo")
RWO_DB_CONN_STRING = (
    f"postgresql://{RWO_DB_USER}:{RWO_DB_PASSWORD}@{RWO_DB_SERVER}/{RWO_DB}"
)

engine = create_engine(RWO_DB_CONN_STRING, poolclass=NullPool)

customer_sessions = {None: scoped_session(sessionmaker(bind=engine))}

ALPHANUM = string.ascii_lowercase + string.digits


def DBSession(customer_id: str = None):
    c_session = customer_sessions.get(customer_id)
    if c_session is not None:
        return c_session
    c_engine = engine.execution_options(
        schema_translate_map={None: "public", "customer_id": customer_id}
    )
    c_session = scoped_session(sessionmaker(bind=c_engine))
    customer_sessions[customer_id] = c_session
    return c_session


def fake_order_notifications(db: Session):
    faker = Faker("sv_SE")
    for _ in range(5):
        o = dbmodels.Order(
            product_id=1,
            email=faker.email(),
            wallet="".join(
                random.choice(string.ascii_letters + string.digits) for i in range(32)
            ),
            quantity=1,
            tx_id="".join(
                random.choice(string.ascii_uppercase + string.digits) for i in range(12)
            ),
            token="".join(random.choice(string.ascii_lowercase) for i in range(8)),
            status=random.choice(
                [
                    apimodels.OrderStatus.pending,
                    apimodels.OrderStatus.paid,
                    apimodels.OrderStatus.fulfilled,
                ]
            ),
        )
        if o.status in [
            apimodels.OrderStatus.pending,
            apimodels.OrderStatus.paid,
            apimodels.OrderStatus.fulfilled,
        ]:
            o.notifications.append(
                dbmodels.OrderNotification(
                    status=apimodels.OrderStatus.pending,
                    subscriber="user",
                    channel="email",
                    created_at=datetime.utcnow(),
                )
            )
        if o.status in [apimodels.OrderStatus.paid, apimodels.OrderStatus.fulfilled]:
            o.notifications.append(
                dbmodels.OrderNotification(
                    status=apimodels.OrderStatus.paid,
                    subscriber="user",
                    channel="email",
                )
            )
            o.notifications.append(
                dbmodels.OrderNotification(
                    status=apimodels.OrderStatus.paid,
                    subscriber="admin",
                    channel="email",
                )
            )
        if o.status in [apimodels.OrderStatus.fulfilled]:
            o.notifications.append(
                dbmodels.OrderNotification(
                    status=apimodels.OrderStatus.fulfilled,
                    subscriber="user",
                    channel="email",
                )
            )
        db.add(o)
    db.commit()


def get_fake_data1(db: Session):
    return (
        db.query(dbmodels.OrderNotification)
        .join(dbmodels.Order)
        .filter(dbmodels.OrderNotification.successful.is_(None))
        .order_by(dbmodels.OrderNotification.created_at.asc())
        .all()
    )


def query_data2(db: Session):
    n = aliased(dbmodels.OrderNotification)
    o = aliased(dbmodels.Order)
    p = aliased(dbmodels.Product)
    return (
        db.query(
            n.id,
            n.status,
            n.subscriber,
            n.created_at,
            o.email,
            o.quantity,
            o.tx_id,
            o.token,
            p.name.label("product_name"),
            p.description.label("product_description"),
            p.price.label("product_price"),
        )
        .select_from(n)
        .join(o)
        .join(p)
        .filter(n.successful.is_(None))
        .order_by(n.id.asc())
    )


def query_data3(db: Session, channel: str, subscriber: str, cursor: int):
    q = (
        db.query(dbmodels.OrderNotification, dbmodels.Order, dbmodels.Product)
        .select_from(dbmodels.OrderNotification)
        .join(dbmodels.Order)
        .join(dbmodels.Product)
        .filter(
            dbmodels.OrderNotification.successful.is_(None),
            dbmodels.OrderNotification.id > cursor,
            dbmodels.OrderNotification.channel == channel,
            dbmodels.OrderNotification.subscriber == subscriber,
        )
        .order_by(dbmodels.OrderNotification.id.asc())
    )
    r = []
    for n, o, p in q:
        r.append(
            apimodels.OrderNotification(
                id=n.id,
                product_name=p.name,
                product_description=p.description,
                product_quantity=o.quantity,
                order_status=n.status,
                order_email=o.email,
                order_tx_id=o.tx_id,
                order_token=o.token,
                subscriber=n.subscriber,
                channel=n.channel,
                created_at=n.created_at,
                updated_at=n.updated_at,
            )
        )
    return r


try:
    db = DBSession()
    fake_order_notifications(db)
    # r = query_data3(db, "email", "user", 5)
    # for _ in r:
    #     print(_.id, _.order_email)
finally:
    db.close()
