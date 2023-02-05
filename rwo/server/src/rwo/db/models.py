from sqlalchemy import (
    Column,
    Integer,
    BigInteger,
    String,
    Binary,
)
from sqlalchemy.dialects.postgresql import JSONB

from .database import Base

class AlembicVersion(Base):
    __tablename__ = "alembic_version"
    version_num = Column(String(32), primary_key=True)


class Product(Base):
    __tablename__ = "product"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(String(1024), unique=True, nullable=True)
    price = Column(BigInteger, nullable=False)
    image = Column(Binary, nullable=True)
    quantity = Column(Integer, nullable=False)
