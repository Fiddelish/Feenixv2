from sqlalchemy import (
    Column,
    ForeignKey,
    CheckConstraint,
    Index,
    Integer,
    BigInteger,
    String,
    DateTime,
    Text,
    Boolean,
)
from sqlalchemy.orm import relationship

from datetime import datetime

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
    email = Column(String(255), nullable=False)
    wallet = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False)
    tx_id = Column(String(255), unique=True, nullable=False)
    token = Column(String(255), unique=True, nullable=False)
    tx_hash = Column(String(255), unique=True, nullable=True)
    status = Column(String(32), nullable=False)
    created_at = Column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow()
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow(),
        onupdate=datetime.utcnow(),
    )
    notifications = relationship("OrderNotification", back_populates="order")
    product = relationship("Product")
    CheckConstraint("quantity > 0")


class OrderNotification(Base):
    __tablename__ = "order_notification"
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("order.id"), nullable=False)
    status = Column(String(32), nullable=False)
    subscriber = Column(String(16), nullable=False)
    channel = Column(String(16), nullable=False)
    is_successful = Column(Boolean, nullable=True)
    report = Column(Text)
    created_at = Column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow()
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow(),
        onupdate=datetime.utcnow(),
    )
    __table_args__ = (
        Index("ntfyIDX", "order_id", "status", "subscriber", "channel", unique=True),
    )
    order = relationship("Order", back_populates="notifications")
