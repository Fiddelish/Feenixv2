from typing import Optional
from pydantic import BaseModel, Field, validator
from enum import Enum
from datetime import datetime


class OrderStatus(str, Enum):
    pending = "pending"
    paid = "paid"
    fulfilled = "fulfilled"
    cancelled = "cancelled"
    failed = "failed"


class NotificationSubscriber(str, Enum):
    user = "user"
    admin = "admin"


class NotificationChannel(str, Enum):
    email = "email"


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
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class OrderNotification(BaseModel):
    id: int
    product_name: str
    product_description: str
    product_price: int
    product_quantity: int
    order_status: OrderStatus
    order_email: str
    order_tx_id: Optional[str] = Field(None, nullable=True)
    order_token: Optional[str] = Field(None, nullable=True)
    subscriber: NotificationSubscriber
    channel: NotificationChannel
    is_successful: Optional[bool] = Field(None, nullable=True)
    report: Optional[str] = Field(None, nullable=True)
    created_at: datetime
    updated_at: datetime

    @validator("product_price", pre=True)
    def cast_bigint(cls, v):
        return int(v)

    class Config:
        orm_mode = True
        extra = "forbid"
        # json_encoders = {int: str}
        arbitrary_types_allowed = True
        validate_assignment = True
        max_anystr_length = 2**20
        max_anyint_value = 2**63 - 1


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


class UpdateNDSRequest(BaseModel):
    successful: bool
    report: str
