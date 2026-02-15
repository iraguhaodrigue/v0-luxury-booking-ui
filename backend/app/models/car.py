from sqlalchemy import Column, Integer, String, Float, Text, Enum, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database.base import Base, TimestampMixin
from app.core.constants import CarAvailabilityStatus


class Car(Base, TimestampMixin):
    """Car model for car rental service."""
    
    __tablename__ = "cars"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    brand = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    year = Column(Integer, nullable=True)
    license_plate = Column(String(50), unique=True, nullable=False)
    price_per_day = Column(Float, nullable=False)
    availability_status = Column(Enum(CarAvailabilityStatus), default=CarAvailabilityStatus.AVAILABLE, nullable=False, index=True)
    max_passengers = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    description = Column(Text, nullable=True)
    
    # Relationships
    bookings = relationship(
        "CarBooking",
        back_populates="car",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self):
        return f"<Car(id={self.id}, brand={self.brand}, model={self.model})>"


class CarBooking(Base, TimestampMixin):
    """Car booking model for tracking car rentals."""
    
    __tablename__ = "car_bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True, index=True)  # Optional link to main booking
    car_id = Column(Integer, ForeignKey("cars.id"), nullable=False, index=True)
    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=False, index=True)
    total_price = Column(Float, nullable=False)
    pickup_location = Column(String(255), nullable=True)
    dropoff_location = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    
    # Relationships
    booking = relationship("Booking", back_populates="car_bookings")
    car = relationship("Car", back_populates="bookings")
    
    def __repr__(self):
        return f"<CarBooking(id={self.id}, car_id={self.car_id})>"
