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
            product_id=random.choice([1, 2]),
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
        odict = {
            key: value
            for key, value in o.__dict__.items()
            if not key.startswith("_sa_")
        }
        db.add(o)

        if o.status in [
            apimodels.OrderStatus.pending,
            apimodels.OrderStatus.paid,
            apimodels.OrderStatus.fulfilled,
        ]:
            db.add(
                dbmodels.Notification(
                    subscriber="user",
                    channel="email",
                    recipient=o.email,
                    data=json.dumps({**odict, "status": apimodels.OrderStatus.pending}),
                    created_at=datetime.utcnow(),
                )
            )
        if o.status in [apimodels.OrderStatus.paid, apimodels.OrderStatus.fulfilled]:
            db.add(
                dbmodels.Notification(
                    subscriber="user",
                    channel="email",
                    recipient=o.email,
                    data=json.dumps({**odict, "status": apimodels.OrderStatus.paid}),
                    created_at=datetime.utcnow(),
                )
            )
            db.add(
                dbmodels.Notification(
                    subscriber="admin",
                    channel="email",
                    recipient=o.email,
                    data=json.dumps({**odict, "status": apimodels.OrderStatus.paid}),
                    created_at=datetime.utcnow(),
                )
            )
        if o.status in [apimodels.OrderStatus.fulfilled]:
            db.add(
                dbmodels.Notification(
                    subscriber="user",
                    channel="email",
                    recipient=o.email,
                    data=json.dumps(
                        {**odict, "status": apimodels.OrderStatus.fulfilled}
                    ),
                    created_at=datetime.utcnow(),
                )
            )
    db.commit()


try:
    db = DBSession()
    fake_order_notifications(db)
finally:
    db.close()
