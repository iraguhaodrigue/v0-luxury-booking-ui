from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.booking import Booking, BookingService
from app.models.room import Room
from app.core.constants import BookingStatus


class BookingCRUD:
    """CRUD operations for Booking model."""
    
    @staticmethod
    def create_booking(
        db: Session,
        user_id: int,
        property_id: int,
        room_id: int | None,
        check_in: date,
        check_out: date,
        total_price: float,
        notes: str | None = None
    ) -> Booking:
        """Create a new booking."""
        booking = Booking(
            user_id=user_id,
            property_id=property_id,
            room_id=room_id,
            check_in=check_in,
            check_out=check_out,
            total_price=total_price,
            status=BookingStatus.PENDING,
            notes=notes
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)
        return booking
    
    @staticmethod
    def get_booking_by_id(db: Session, booking_id: int) -> Booking | None:
        """Get booking by ID."""
        return db.query(Booking).filter(Booking.id == booking_id).first()
    
    @staticmethod
    def get_user_bookings(
        db: Session,
        user_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> list[Booking]:
        """Get all bookings for a user."""
        return db.query(Booking).filter(
            Booking.user_id == user_id
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_property_bookings(
        db: Session,
        property_id: int,
        check_in: date | None = None,
        check_out: date | None = None
    ) -> list[Booking]:
        """Get all bookings for a property, optionally filtered by date range."""
        query = db.query(Booking).filter(Booking.property_id == property_id)
        
        if check_in and check_out:
            # Get overlapping bookings
            query = query.filter(
                and_(
                    Booking.check_in < check_out,
                    Booking.check_out > check_in,
                    Booking.status != BookingStatus.CANCELLED
                )
            )
        
        return query.all()
    
    @staticmethod
    def get_room_bookings(
        db: Session,
        room_id: int,
        check_in: date | None = None,
        check_out: date | None = None
    ) -> list[Booking]:
        """Get all bookings for a room."""
        query = db.query(Booking).filter(Booking.room_id == room_id)
        
        if check_in and check_out:
            query = query.filter(
                and_(
                    Booking.check_in < check_out,
                    Booking.check_out > check_in,
                    Booking.status != BookingStatus.CANCELLED
                )
            )
        
        return query.all()
    
    @staticmethod
    def update_booking(
        db: Session,
        booking: Booking,
        status: BookingStatus | None = None,
        notes: str | None = None
    ) -> Booking:
        """Update booking."""
        if status is not None:
            booking.status = status
        if notes is not None:
            booking.notes = notes
        
        db.commit()
        db.refresh(booking)
        return booking
    
    @staticmethod
    def delete_booking(db: Session, booking: Booking) -> None:
        """Delete booking."""
        db.delete(booking)
        db.commit()
    
    @staticmethod
    def add_service_to_booking(
        db: Session,
        booking_id: int,
        service_id: int,
        price_at_booking: float,
        quantity: int = 1
    ) -> BookingService:
        """Add a service to a booking."""
        booking_service = BookingService(
            booking_id=booking_id,
            service_id=service_id,
            quantity=quantity,
            price_at_booking=price_at_booking
        )
        db.add(booking_service)
        db.commit()
        db.refresh(booking_service)
        return booking_service
