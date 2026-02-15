from sqlalchemy import Column, Integer, String, Float, Text, Enum, ARRAY, Boolean
from sqlalchemy.orm import relationship
from app.database.base import Base, TimestampMixin
from app.core.constants import PropertyType


class Property(Base, TimestampMixin):
    """Property model for villas and apartments."""
    
    __tablename__ = "properties"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    location = Column(String(255), nullable=False, index=True)
    price_per_night = Column(Float, nullable=False)
    property_type = Column(Enum(PropertyType), nullable=False, index=True)
    images = Column(ARRAY(String), nullable=True)  # Array of image URLs
    max_guests = Column(Integer, nullable=True)
    bedrooms = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    rooms = relationship(
        "Room",
        back_populates="property",
        cascade="all, delete-orphan"
    )
    bookings = relationship(
        "Booking",
        back_populates="property",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self):
        return f"<Property(id={self.id}, name={self.name}, type={self.property_type})>"


class Room(Base, TimestampMixin):
    """Room model for individual rooms within properties."""
    
    __tablename__ = "rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    capacity = Column(Integer, nullable=False)  # Number of guests
    price_modifier = Column(Float, default=1.0, nullable=False)  # Multiplier for property price
    bedrooms = Column(Integer, nullable=True)
    bathrooms = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    property = relationship("Property", back_populates="rooms")
    bookings = relationship(
        "Booking",
        back_populates="room",
        cascade="all, delete-orphan"
    )
    
    # Foreign key constraint
    __table_args__ = (
        {"extend_existing": True},
    )
    
    def __repr__(self):
        return f"<Room(id={self.id}, name={self.name}, property_id={self.property_id})>"
