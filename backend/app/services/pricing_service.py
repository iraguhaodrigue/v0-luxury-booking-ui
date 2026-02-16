from datetime import date
from sqlalchemy.orm import Session
from app.models.property import Property
from app.schemas.booking import BookingServiceCreate
from app.crud.property import RoomCRUD


class PricingService:
    """Pricing calculations for bookings."""
    
    @staticmethod
    def calculate_booking_price(
        db: Session,
        property: Property,
        room_id: int | None,
        num_nights: int,
        services: list[BookingServiceCreate] = None
    ) -> float:
        """Calculate total booking price.
        
        Includes:
        - Room/property base price
        - Service costs
        """
        if services is None:
            services = []
        
        # Calculate base accommodation price
        base_price = property.price_per_night * num_nights
        
        # Apply room modifier if booking specific room
        if room_id:
            room = RoomCRUD.get_room_by_id(db, room_id)
            if room:
                base_price = base_price * room.price_modifier
        
        # Add service costs
        services_price = 0.0
        from app.crud.service import ServiceCRUD
        for service_data in services:
            service = ServiceCRUD.get_service_by_id(db, service_data.service_id)
            if service:
                services_price += service.price * service_data.quantity
        
        total_price = base_price + services_price
        return round(total_price, 2)
    
    @staticmethod
    def calculate_stay_duration(check_in: date, check_out: date) -> int:
        """Calculate number of nights."""
        return (check_out - check_in).days
    
    @staticmethod
    def calculate_room_price(
        property_price_per_night: float,
        room_modifier: float,
        num_nights: int
    ) -> float:
        """Calculate price for a room booking."""
        return property_price_per_night * room_modifier * num_nights
    
    @staticmethod
    def calculate_property_price(
        property_price_per_night: float,
        num_nights: int
    ) -> float:
        """Calculate price for entire property booking."""
        return property_price_per_night * num_nights
