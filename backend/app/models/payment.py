from sqlalchemy import Column, Integer, String, Float, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database.base import Base, TimestampMixin
from app.core.constants import PaymentStatus, PaymentMethod


class Payment(Base, TimestampMixin):
    """Payment model for tracking transactions."""
    
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    payment_method = Column(Enum(PaymentMethod), nullable=False, index=True)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False, index=True)
    transaction_id = Column(String(255), nullable=True, unique=True)  # Provider's transaction ID
    notes = Column(String(500), nullable=True)
    
    # Relationships
    booking = relationship("Booking", back_populates="payment")
    user = relationship("User", back_populates="payments")
    
    def __repr__(self):
        return f"<Payment(id={self.id}, booking_id={self.booking_id}, amount={self.amount})>"
