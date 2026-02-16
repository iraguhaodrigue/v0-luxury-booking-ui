import httpx
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.core.constants import PaymentStatus, PaymentMethod
from app.crud.payment import PaymentCRUD
from app.crud.booking import BookingCRUD
from app.core.constants import BookingStatus

settings = get_settings()


class PaymentService:
    """Business logic for payments."""
    
    @staticmethod
    def initiate_payment(
        payment_id: int,
        payment_method: PaymentMethod
    ) -> dict:
        """Initiate payment with external provider."""
        if payment_method == PaymentMethod.PAYPAL:
            return PaymentService._initiate_paypal(payment_id)
        elif payment_method == PaymentMethod.MOMO:
            return PaymentService._initiate_momo(payment_id)
        else:
            return {"status": "unsupported", "message": "Payment method not supported"}
    
    @staticmethod
    def _initiate_paypal(payment_id: int) -> dict:
        """Initiate PayPal payment."""
        # Stub implementation
        return {
            "status": "pending",
            "provider": "paypal",
            "message": "PayPal payment integration ready",
            "redirect_url": f"https://paypal.example.com/checkout/{payment_id}",
            "api_key_required": settings.PAYPAL_API_KEY is not None
        }
    
    @staticmethod
    def _initiate_momo(payment_id: int) -> dict:
        """Initiate Rwanda MoMo payment."""
        # Stub implementation
        return {
            "status": "pending",
            "provider": "momo",
            "message": "MoMo payment integration ready",
            "redirect_url": f"https://momo.example.com/checkout/{payment_id}",
            "api_key_required": settings.MOMO_API_KEY is not None
        }
    
    @staticmethod
    async def process_payment_webhook(
        db: Session,
        payment_id: int,
        transaction_id: str,
        status: str
    ) -> dict:
        """Process payment webhook from external provider."""
        # Stub - would validate webhook and update payment status
        payment_status = PaymentStatus.COMPLETED if status == "success" else PaymentStatus.FAILED
        
        payment = PaymentCRUD.get_payment_by_id(db, payment_id)
        if not payment:
            return {"success": False, "message": "Payment not found"}
        
        # Update payment
        PaymentCRUD.update_payment(
            db=db,
            payment=payment,
            payment_status=payment_status,
            transaction_id=transaction_id
        )
        
        # Update booking status if payment successful
        if payment_status == PaymentStatus.COMPLETED:
            booking = BookingCRUD.get_booking_by_id(db, payment.booking_id)
            if booking:
                BookingCRUD.update_booking(
                    db=db,
                    booking=booking,
                    status=BookingStatus.CONFIRMED
                )
        
        return {
            "success": True,
            "payment_id": payment_id,
            "new_status": payment_status
        }
    
    @staticmethod
    def validate_payment_amount(payment_amount: float, booking_total: float) -> bool:
        """Validate payment amount matches booking total."""
        # Allow small rounding differences
        return abs(payment_amount - booking_total) < 0.01
