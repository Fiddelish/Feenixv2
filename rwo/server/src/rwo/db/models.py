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
    description = Column(String(1024), nullable=True)
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
    product = relationship("Product")
    CheckConstraint("quantity > 0")


class Notification(Base):
    __tablename__ = "notification"
    id = Column(Integer, primary_key=True)
    subscriber = Column(String(16), nullable=False)
    channel = Column(String(16), nullable=False)
    recipient = Column(String(255), nullable=False)
    data = Column(Text, nullable=True)
    successful = Column(Boolean, nullable=True)
    delivery_report = Column(Text, nullable=True)
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
        Index("subscriberIDX", "subscriber", unique=False),
        Index("channelIDX", "channel", unique=False),
        Index("recipientIDX", "recipient", unique=False),
        Index("successfulIDX", "successful", unique=False),
    )
