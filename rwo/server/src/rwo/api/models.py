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
    price: int
    quantity: int

    class Config:
        orm_mode = True

class Order(BaseModel):
    id: int
    product_id: str
    email: str
    wallet: str
    quantity: int
    tx_id: str
    token: str
    tx_hash: Optional[str] = Field(None, nullable=True)
    status: OrderStatus

    class Config:
        orm_mode = True

class RetrieveRequest(BaseModel):
    tx_id: str
    token: str

class RetrieveResponse(BaseModel):
    verified: bool
    order: Optional[Order] = Field(None, nullable=True)

class FulfillRequest(BaseModel):
    tx_id: str
    token: str

class FulfillResponse(BaseModel):
    fulfilled: bool
