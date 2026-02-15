from pydantic import BaseModel, Field, ConfigDict
from datetime import date, datetime
from app.core.constants import CarAvailabilityStatus


class CarBase(BaseModel):
    """Base car schema."""
    name: str = Field(..., min_length=1, max_length=255)
    brand: str = Field(..., min_length=1, max_length=100)
    model: str = Field(..., min_length=1, max_length=100)
    year: int | None = None
    license_plate: str = Field(..., min_length=1, max_length=50)
    price_per_day: float = Field(..., gt=0)
    max_passengers: int | None = None
    description: str | None = None


class CarCreate(CarBase):
    """Car creation schema."""
    pass


class CarUpdate(BaseModel):
    """Car update schema."""
    name: str | None = Field(None, max_length=255)
    brand: str | None = Field(None, max_length=100)
    model: str | None = Field(None, max_length=100)
    year: int | None = None
    license_plate: str | None = Field(None, max_length=50)
    price_per_day: float | None = Field(None, gt=0)
    availability_status: CarAvailabilityStatus | None = None
    max_passengers: int | None = None
    description: str | None = None
    is_active: bool | None = None


class CarResponse(CarBase):
    """Car response schema."""
    id: int
    availability_status: CarAvailabilityStatus
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class CarBookingBase(BaseModel):
    """Base car booking schema."""
    car_id: int
    start_date: date
    end_date: date
    pickup_location: str | None = None
    dropoff_location: str | None = None
    notes: str | None = None


class CarBookingCreate(CarBookingBase):
    """Car booking creation schema."""
    booking_id: int | None = None


class CarBookingUpdate(BaseModel):
    """Car booking update schema."""
    pickup_location: str | None = None
    dropoff_location: str | None = None
    notes: str | None = None


class CarBookingResponse(CarBookingBase):
    """Car booking response schema."""
    id: int
    booking_id: int | None
    total_price: float
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
