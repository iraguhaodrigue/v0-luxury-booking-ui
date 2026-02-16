from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database.db import get_db_session
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.payment import (
    PaymentInitiate, PaymentResponse, PaymentListResponse,
    PaymentCallbackPayPal, PaymentCallbackMoMo
)
from app.crud.payment import PaymentCRUD
from app.crud.booking import BookingCRUD
from app.services.payment_service import PaymentService
from app.core.constants import PaymentStatus

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.post("", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payment_data: PaymentInitiate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    """Create a payment for a booking."""
    # Get booking
    booking = BookingCRUD.get_booking_by_id(db, payment_data.booking_id)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Verify user owns the booking
    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to pay for this booking"
        )
    
    # Check if payment already exists
    existing_payment = PaymentCRUD.get_payment_by_booking(db, payment_data.booking_id)
    if existing_payment:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Payment already exists for this booking"
        )
    
    # Create payment
    payment = PaymentCRUD.create_payment(
        db=db,
        booking_id=payment_data.booking_id,
        user_id=current_user.id,
        amount=booking.total_price,
        payment_method=payment_data.payment_method
    )
    
    return PaymentResponse.from_orm(payment)


@router.get("/me", response_model=list[PaymentListResponse])
async def get_my_payments(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    """Get current user's payments."""
    payments = PaymentCRUD.get_user_payments(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    return [PaymentListResponse.from_orm(p) for p in payments]


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    """Get payment details."""
    payment = PaymentCRUD.get_payment_by_id(db, payment_id)
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Check authorization
    if payment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this payment"
        )
    
    return PaymentResponse.from_orm(payment)


@router.post("/{payment_id}/initiate", response_model=dict)
async def initiate_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    """Initiate payment processing."""
    payment = PaymentCRUD.get_payment_by_id(db, payment_id)
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Check authorization
    if payment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to process this payment"
        )
    
    # Check payment not already processed
    if payment.payment_status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment already {payment.payment_status}"
        )
    
    # Initiate payment with provider
    result = PaymentService.initiate_payment(payment_id, payment.payment_method)
    
    return result


@router.post("/webhook/paypal")
async def paypal_webhook(
    callback: PaymentCallbackPayPal,
    db: Session = Depends(get_db_session)
):
    """Handle PayPal payment webhook."""
    result = await PaymentService.process_payment_webhook(
        db=db,
        payment_id=callback.booking_id,  # In real scenario, map properly
        transaction_id=callback.transaction_id,
        status=callback.status
    )
    return result


@router.post("/webhook/momo")
async def momo_webhook(
    callback: PaymentCallbackMoMo,
    db: Session = Depends(get_db_session)
):
    """Handle Rwanda MoMo payment webhook."""
    result = await PaymentService.process_payment_webhook(
        db=db,
        payment_id=callback.booking_id,  # In real scenario, map properly
        transaction_id=callback.transaction_id,
        status=callback.status
    )
    return result
