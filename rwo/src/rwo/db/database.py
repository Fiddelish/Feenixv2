from sqlalchemy import create_engine, event, exc
from sqlalchemy.pool import NullPool
from sqlalchemy.orm import scoped_session, sessionmaker, class_mapper
from sqlalchemy.ext.declarative import declarative_base
import os

RWO_DB_USER = os.getenv("RWO_DB_USER", "quantotto")
RWO_DB_PASSWORD = os.getenv("RWO_DB_PASSWORD", "quantott0")
RWO_DB_SERVER = os.getenv("RWO_DB_SERVER", "127.0.0.1:5432")
RWO_DB = os.getenv("RWO_DB", "hugs")
RWO_DB_CONN_STRING = f"postgresql://{RWO_DB_USER}:{RWO_DB_PASSWORD}@{RWO_DB_SERVER}/{RWO_DB}"

engine = create_engine(RWO_DB_CONN_STRING, poolclass=NullPool)

customer_sessions = {
    None: scoped_session(sessionmaker(bind=engine))
}

def DBSession(customer_id: str=None):
    c_session = customer_sessions.get(customer_id)
    if c_session is not None:
        return c_session
    c_engine = engine.execution_options(
        schema_translate_map={
            None: "public",
            "customer_id": customer_id
        }
    )
    c_session = scoped_session(sessionmaker(bind=c_engine))
    customer_sessions[customer_id] = c_session
    return c_session



class BaseModel(object):

    @classmethod
    def query(cls, customer_id: str=None):
        mapper = class_mapper(cls)
        return DBSession(customer_id).registry().query(mapper)


Base = declarative_base(cls=BaseModel)

@event.listens_for(engine, "connect")
def connect(dbapi_connection, connection_record):
    connection_record.info["pid"] = os.getpid()


@event.listens_for(engine, "checkout")
def checkout(dbapi_connection, connection_record, connection_proxy):
    pid = os.getpid()
    if connection_record.info["pid"] != pid:
        connection_record.connection = connection_proxy.connection = None
        raise exc.DisconnectionError(
            "Connection record belongs to pid %s, "
            "attempting to check out in pid %s" % (connection_record.info["pid"], pid)
        )
