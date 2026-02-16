from pydantic import BaseModel, Field, ConfigDict
from datetime import date, datetime
from app.core.constants import BookingStatus


class BookingServiceCreate(BaseModel):
    """Create booking service link."""
    service_id: int
    quantity: int = 1


class BookingCreate(BaseModel):
    """Booking creation schema."""
    property_id: int
    room_id: int | None = None  # None if booking entire property
    check_in: date = Field(..., description="Check-in date")
    check_out: date = Field(..., description="Check-out date")
    notes: str | None = None
    services: list[BookingServiceCreate] | None = []


class BookingUpdate(BaseModel):
    """Booking update schema."""
    status: BookingStatus | None = None
    notes: str | None = None


class BookingServiceResponse(BaseModel):
    """Booking service response."""
    id: int
    booking_id: int
    service_id: int
    quantity: int
    price_at_booking: float
    
    model_config = ConfigDict(from_attributes=True)


class BookingResponse(BaseModel):
    """Booking response schema."""
    id: int
    user_id: int
    property_id: int
    room_id: int | None
    check_in: date
    check_out: date
    total_price: float
    status: BookingStatus
    notes: str | None
    services: list[BookingServiceResponse] = []
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class BookingListResponse(BaseModel):
    """Booking list response."""
    id: int
    property_id: int
    room_id: int | None
    check_in: date
    check_out: date
    total_price: float
    status: BookingStatus
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
