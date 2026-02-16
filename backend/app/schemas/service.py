from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from app.core.constants import ServiceType


class ServiceBase(BaseModel):
    """Base service schema."""
    name: str = Field(..., min_length=1, max_length=255)
    service_type: ServiceType
    description: str | None = None
    price: float = Field(..., gt=0)


class ServiceCreate(ServiceBase):
    """Service creation schema."""
    pass


class ServiceUpdate(BaseModel):
    """Service update schema."""
    name: str | None = Field(None, max_length=255)
    service_type: ServiceType | None = None
    description: str | None = None
    price: float | None = Field(None, gt=0)
    is_active: bool | None = None


class ServiceResponse(ServiceBase):
    """Service response schema."""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
