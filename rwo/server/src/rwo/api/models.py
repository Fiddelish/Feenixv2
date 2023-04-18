from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime


class OrderStatus(str, Enum):
    pending = "pending"
    paid = "paid"
    fulfilled = "fulfilled"
    cancelled = "cancelled"
    failed = "failed"

class DisputeStatus(str, enum):
    submitted = "submitted"
    in_review = "in_review"
    rejected = "rejected"
    resolved = "resolved"

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
    created_at: Optional[datetime] = Field(None, nullable=True)
    updated_at: Optional[datetime] = Field(None, nullable=True)

    class Config:
        orm_mode = True

class Dispute(BaseModel):
    id: int
    product_id: int
    tx_hash: str
    wallet: str
    order_email: str
    contact_email: str
    challenge: str
    signature: Optional[str] = Field(None, nullable=True)
    status: DisputeStatus
    created_at: datetime
    updated_at: datetime
    buyer_comments: str
    store_comments: str

    class Config:
        orm_mode = True



class Notification(BaseModel):
    id: int
    subscriber: NotificationSubscriber
    channel: NotificationChannel
    recipient: str
    data: Any
    successful: Optional[bool] = Field(None, nullable=True)
    delivery_report: Optional[str] = Field(None, nullable=True)
    created_at: datetime
    updated_at: datetime

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


class UpdateNDSRequest(BaseModel):
    successful: Optional[bool] = Field(None, nullable=True)
    delivery_report: Optional[str] = Field(None, nullable=True)


class SubmitDisputeRequest(BaseModel):
    product_id: int
    tx_hash: str
    wallet: str
    order_email: str
    contact_email: str


class SubmitDisputeResponse(BaseModel):
    dispute_id: int
    challenge: str


class DisputeSignatureRequest(BaseModel):
    dispute_id: int
    signature: str


class DisputeSignatureResponse(BaseModel):
    accepted: bool
    message: str

class Challenge(BaseModel):
    challenge_id: int
    challenge: str

class Signature(BaseModel):
    challenge_id: str
    wallet: str
    signature: str
