from typing import Optional
from pydantic import BaseModel, Field


class Product(BaseModel):
    id: int
    name: str
    description: Optional[str] = Field(None, nullable=True)
    price: int
    quantity: int

    class Config:
        orm_mode = True
