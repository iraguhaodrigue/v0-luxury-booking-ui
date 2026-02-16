from sqlalchemy import Column, Integer, String, Float, Text, Enum
from sqlalchemy.orm import relationship
from app.database.base import Base, TimestampMixin
from app.core.constants import ServiceType


class Service(Base, TimestampMixin):
    """Service model for additional services offered."""
    
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    service_type = Column(Enum(ServiceType), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    is_active = Column(True, default=True, nullable=False)
    
    # Relationships
    bookings = relationship(
        "BookingService",
        back_populates="service",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self):
        return f"<Service(id={self.id}, name={self.name}, type={self.service_type})>"
