from sqlalchemy import (
    Column,
    ForeignKey,
    CheckConstraint,
    DateTime,
    Integer,
    BigInteger,
    String,
)

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
    quantity = Column(Integer, nullable=False)

class Order(Base):
    __tablename__ = "order"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("product.id"), nullable=False)
    timestamp = Column(DateTime, nullable=False)
    email = Column(String(255), nullable=False)
    wallet = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False)
    total = Column(Integer, nullable=False)
    internal_tx_id = Column(String(255), unique=True, nullable=False)
    tx_hash = Column(String(255), unique=True, nullable=True)
    status = Column(String(32), nullable=False)
    CheckConstraint("quantity > 0")
