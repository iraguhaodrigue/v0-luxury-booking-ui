from fastapi import APIRouter, Depends, HTTPException, status, Query
from datetime import date
from sqlalchemy.orm import Session
from app.database.db import get_db_session
from app.dependencies import get_current_user, get_admin_user
from app.models.user import User
from app.schemas.booking import (
    BookingCreate, BookingUpdate, BookingResponse,
    BookingListResponse
)
from app.crud.booking import BookingCRUD
from app.services.booking_service import BookingService
from app.crud.property import PropertyCRUD, RoomCRUD
from app.crud.service import ServiceCRUD
from app.services.pricing_service import PricingService

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    """Create a new booking."""
    # Validate dates
    is_valid, error_msg = BookingService.validate_booking_dates(
        booking_data.check_in,
        booking_data.check_out
    )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    # Check property exists
    property = PropertyCRUD.get_property_by_id(db, booking_data.property_id)
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Check availability and get conflicting bookings
    if booking_data.room_id:
        # Single room booking
        room = RoomCRUD.get_room_by_id(db, booking_data.room_id)
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room not found"
            )
        
        available = BookingService.check_room_availability(
            db, booking_data.room_id, booking_data.check_in, booking_data.check_out
        )
    else:
        # Entire property booking
        available = BookingService.check_property_availability(
            db, booking_data.property_id, booking_data.check_in, booking_data.check_out
        )
    
    if not available:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Property/room is not available for these dates"
        )
    
    # Calculate total price
    num_nights = BookingService.calculate_number_of_nights(
        booking_data.check_in, booking_data.check_out
    )
    
    total_price = PricingService.calculate_booking_price(
        db=db,
        property=property,
        room_id=booking_data.room_id,
        num_nights=num_nights,
        services=booking_data.services or []
    )
    
    # Create booking
    booking = BookingCRUD.create_booking(
        db=db,
        user_id=current_user.id,
        property_id=booking_data.property_id,
        room_id=booking_data.room_id,
        check_in=booking_data.check_in,
        check_out=booking_data.check_out,
        total_price=total_price,
        notes=booking_data.notes
    )
    
    # Add services to booking
    if booking_data.services:
        for service_data in booking_data.services:
            service = ServiceCRUD.get_service_by_id(db, service_data.service_id)
            if service:
                BookingCRUD.add_service_to_booking(
                    db=db,
                    booking_id=booking.id,
                    service_id=service_data.service_id,
                    price_at_booking=service.price,
                    quantity=service_data.quantity
                )
    
    db.refresh(booking)
    return BookingResponse.from_orm(booking)


@router.get("/me", response_model=list[BookingListResponse])
async def get_my_bookings(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    """Get current user's bookings."""
    bookings = BookingCRUD.get_user_bookings(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    return [BookingListResponse.from_orm(b) for b in bookings]


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    """Get booking details."""
    booking = BookingCRUD.get_booking_by_id(db, booking_id)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check authorization
    if booking.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this booking"
        )
    
    return BookingResponse.from_orm(booking)


@router.put("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: int,
    booking_data: BookingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    """Update booking (admin only)."""
    booking = BookingCRUD.get_booking_by_id(db, booking_id)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    updated_booking = BookingCRUD.update_booking(
        db=db,
        booking=booking,
        status=booking_data.status,
        notes=booking_data.notes
    )
    
    return BookingResponse.from_orm(updated_booking)


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    """Cancel a booking."""
    booking = BookingCRUD.get_booking_by_id(db, booking_id)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check authorization
    if booking.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this booking"
        )
    
    BookingCRUD.update_booking(
        db=db,
        booking=booking,
        status="cancelled"
    )
