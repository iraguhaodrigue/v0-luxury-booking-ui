from sqlalchemy.orm import Session
from app.models.payment import Payment
from app.core.constants import PaymentStatus, PaymentMethod


class PaymentCRUD:
    """CRUD operations for Payment model."""
    
    @staticmethod
    def create_payment(
        db: Session,
        booking_id: int,
        user_id: int,
        amount: float,
        payment_method: PaymentMethod
    ) -> Payment:
        """Create a new payment record."""
        payment = Payment(
            booking_id=booking_id,
            user_id=user_id,
            amount=amount,
            payment_method=payment_method,
            payment_status=PaymentStatus.PENDING
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return payment
    
    @staticmethod
    def get_payment_by_id(db: Session, payment_id: int) -> Payment | None:
        """Get payment by ID."""
        return db.query(Payment).filter(Payment.id == payment_id).first()
    
    @staticmethod
    def get_payment_by_booking(db: Session, booking_id: int) -> Payment | None:
        """Get payment for a booking."""
        return db.query(Payment).filter(Payment.booking_id == booking_id).first()
    
    @staticmethod
    def get_user_payments(
        db: Session,
        user_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> list[Payment]:
        """Get all payments for a user."""
        return db.query(Payment).filter(
            Payment.user_id == user_id
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_payment(
        db: Session,
        payment: Payment,
        payment_status: PaymentStatus | None = None,
        transaction_id: str | None = None,
        notes: str | None = None
    ) -> Payment:
        """Update payment."""
        if payment_status is not None:
            payment.payment_status = payment_status
        if transaction_id is not None:
            payment.transaction_id = transaction_id
        if notes is not None:
            payment.notes = notes
        
        db.commit()
        db.refresh(payment)
        return payment
    
    @staticmethod
    def delete_payment(db: Session, payment: Payment) -> None:
        """Delete payment."""
        db.delete(payment)
        db.commit()
