from datetime import date
from sqlalchemy.orm import Session
from app.models.booking import Booking
from app.models.room import Room
from app.crud.booking import BookingCRUD
from app.crud.property import PropertyCRUD, RoomCRUD
from app.core.constants import BookingStatus


class BookingService:
    """Business logic for bookings."""
    
    @staticmethod
    def check_room_availability(
        db: Session,
        room_id: int,
        check_in: date,
        check_out: date
    ) -> bool:
        """Check if a room is available for the given dates."""
        if check_in >= check_out:
            raise ValueError("Check-out date must be after check-in date")
        
        # Find overlapping bookings
        overlapping = BookingCRUD.get_room_bookings(
            db=db,
            room_id=room_id,
            check_in=check_in,
            check_out=check_out
        )
        
        return len(overlapping) == 0
    
    @staticmethod
    def check_property_availability(
        db: Session,
        property_id: int,
        check_in: date,
        check_out: date
    ) -> bool:
        """Check if entire property is available (all rooms must be available)."""
        if check_in >= check_out:
            raise ValueError("Check-out date must be after check-in date")
        
        property = PropertyCRUD.get_property_by_id(db, property_id)
        if not property:
            raise ValueError("Property not found")
        
        # Get all active rooms in property
        rooms = RoomCRUD.get_rooms_by_property(db, property_id, active_only=True)
        
        # Check if all rooms are available
        for room in rooms:
            if not BookingService.check_room_availability(db, room.id, check_in, check_out):
                return False
        
        return True
    
    @staticmethod
    def get_conflicting_bookings(
        db: Session,
        property_id: int,
        room_id: int | None,
        check_in: date,
        check_out: date
    ) -> list[Booking]:
        """Get bookings that conflict with proposed dates."""
        if room_id:
            return BookingCRUD.get_room_bookings(db, room_id, check_in, check_out)
        else:
            return BookingCRUD.get_property_bookings(db, property_id, check_in, check_out)
    
    @staticmethod
    def calculate_number_of_nights(check_in: date, check_out: date) -> int:
        """Calculate number of nights."""
        return (check_out - check_in).days
    
    @staticmethod
    def validate_booking_dates(check_in: date, check_out: date) -> tuple[bool, str]:
        """Validate booking dates."""
        if check_in >= check_out:
            return False, "Check-out date must be after check-in date"
        
        # You can add more validations here, like minimum stay, etc.
        return True, ""
