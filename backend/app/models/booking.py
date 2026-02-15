from sqlalchemy import Column, Integer, String, Float, Text, Enum, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database.base import Base, TimestampMixin
from app.core.constants import BookingStatus


class Booking(Base, TimestampMixin):
    """Booking model for property and room reservations."""
    
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=True, index=True)  # Nullable if booking entire property
    check_in = Column(Date, nullable=False, index=True)
    check_out = Column(Date, nullable=False, index=True)
    total_price = Column(Float, nullable=False)
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING, nullable=False, index=True)
    notes = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="bookings")
    property = relationship("Property", back_populates="bookings")
    room = relationship("Room", back_populates="bookings")
    services = relationship(
        "BookingService",
        back_populates="booking",
        cascade="all, delete-orphan"
    )
    car_bookings = relationship(
        "CarBooking",
        back_populates="booking",
        cascade="all, delete-orphan"
    )
    payment = relationship(
        "Payment",
        back_populates="booking",
        uselist=False,
        cascade="all, delete-orphan"
    )
    
    def __repr__(self):
        return f"<Booking(id={self.id}, user_id={self.user_id}, property_id={self.property_id})>"


class BookingService(Base, TimestampMixin):
    """Junction table linking bookings to additional services."""
    
    __tablename__ = "booking_services"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False, index=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False, index=True)
    quantity = Column(Integer, default=1, nullable=False)
    price_at_booking = Column(Float, nullable=False)  # Store price at time of booking
    
    # Relationships
    booking = relationship("Booking", back_populates="services")
    service = relationship("Service", back_populates="bookings")
    
    def __repr__(self):
        return f"<BookingService(booking_id={self.booking_id}, service_id={self.service_id})>"
