from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class OrderStatus(str, Enum):
    pending = "pending"
    paid = "paid"
    cancelled = "cancelled"
    failed = "failed"


class Product(BaseModel):
    id: int
    name: str
    description: Optional[str] = Field(None, nullable=True)
    price: int
    quantity: int

    class Config:
        orm_mode = True

class Order(BaseModel):
    id: int
    product_id: str
    timestamp: datetime
    email: str
    wallet: str
    quantity: int
    total: int
    internal_tx_id: str
    accessor: str
    tx_hash: Optional[str] = Field(None, nullable=True)
    status: OrderStatus

    class Config:
        orm_mode = True

class CreateOrderRequest(BaseModel):
    product_id: str
    email: str
    wallet: str
    quantity: int
    total: int

class CreateOrderResponse(BaseModel):
    order_id: int
    internal_tx_id: str

class VerifyPaymentRequest(BaseModel):
    order_id: int
    tx_hash: str

class VerifyPaymentResponse(BaseModel):
    verified: bool
    message: str