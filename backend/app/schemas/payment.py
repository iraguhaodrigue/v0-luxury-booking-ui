from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.core.constants import PaymentStatus, PaymentMethod


class PaymentBase(BaseModel):
    """Base payment schema."""
    booking_id: int
    amount: float
    payment_method: PaymentMethod


class PaymentCreate(PaymentBase):
    """Payment creation schema."""
    pass


class PaymentInitiate(BaseModel):
    """Payment initiation (for processing)."""
    booking_id: int
    payment_method: PaymentMethod


class PaymentResponse(BaseModel):
    """Payment response schema."""
    id: int
    booking_id: int
    user_id: int
    amount: float
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    transaction_id: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class PaymentListResponse(BaseModel):
    """Payment list response."""
    id: int
    booking_id: int
    amount: float
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class PaymentCallbackPayPal(BaseModel):
    """PayPal payment callback."""
    transaction_id: str
    booking_id: int
    status: str  # 'completed', 'failed', 'pending'
    amount: float


class PaymentCallbackMoMo(BaseModel):
    """Rwanda MoMo payment callback."""
    transaction_id: str
    booking_id: int
    status: str
    amount: float
