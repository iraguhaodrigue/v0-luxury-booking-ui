from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from app.core.constants import PropertyType


class RoomBase(BaseModel):
    """Base room schema."""
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    capacity: int = Field(..., gt=0)
    price_modifier: float = Field(1.0, ge=0.5, le=5.0)
    bedrooms: int | None = None
    bathrooms: int | None = None


class RoomCreate(RoomBase):
    """Room creation schema."""
    pass


class RoomUpdate(BaseModel):
    """Room update schema."""
    name: str | None = Field(None, max_length=255)
    description: str | None = None
    capacity: int | None = Field(None, gt=0)
    price_modifier: float | None = Field(None, ge=0.5, le=5.0)
    bedrooms: int | None = None
    bathrooms: int | None = None
    is_active: bool | None = None


class RoomResponse(RoomBase):
    """Room response schema."""
    id: int
    property_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class PropertyBase(BaseModel):
    """Base property schema."""
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    location: str = Field(..., min_length=1, max_length=255)
    price_per_night: float = Field(..., gt=0)
    property_type: PropertyType
    max_guests: int | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    images: list[str] | None = None


class PropertyCreate(PropertyBase):
    """Property creation schema."""
    pass


class PropertyUpdate(BaseModel):
    """Property update schema."""
    name: str | None = Field(None, max_length=255)
    description: str | None = None
    location: str | None = Field(None, max_length=255)
    price_per_night: float | None = Field(None, gt=0)
    property_type: PropertyType | None = None
    max_guests: int | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    images: list[str] | None = None
    is_active: bool | None = None


class PropertyResponse(PropertyBase):
    """Property response schema."""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class PropertyDetailResponse(PropertyResponse):
    """Property detail with rooms."""
    rooms: list[RoomResponse] = []
