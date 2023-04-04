from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum


class OrderStatus(str, Enum):
    pending = "pending"
    paid = "paid"
    fulfilled = "fulfilled"
    cancelled = "cancelled"
    failed = "failed"


class Product(BaseModel):
    id: int
    name: str
    description: Optional[str] = Field(None, nullable=True)
    quantity: int

    class Config:
        orm_mode = True


class Order(BaseModel):
    id: int
    product_id: int
    email: str
    wallet: str
    quantity: int
    tx_id: str
    token: str
    tx_hash: Optional[str] = Field(None, nullable=True)
    status: OrderStatus

    class Config:
        orm_mode = True


class SubmitOrderRequest(BaseModel):
    product_id: int
    email: str
    wallet: str
    quantity: int


class SubmitOrderResponse(BaseModel):
    tx_id: str


class VerifyOrderPaymentRequest(BaseModel):
    tx_id: str
    tx_hash: str
    amount: int


class VerifyOrderPaymentResponse(BaseModel):
    verified: bool


class RetrieveOrderRequest(BaseModel):
    tx_id: str
    token: str


class RetrieveOrderResponse(BaseModel):
    verified: bool
    order: Optional[Order] = Field(None, nullable=True)


class FulfillOrderRequest(BaseModel):
    tx_id: str
    token: str


class FulfillOrderResponse(BaseModel):
    fulfilled: bool
