from datetime import date
from sqlalchemy.orm import Session
from app.crud.car import CarBookingCRUD


class CarService:
    """Business logic for car rentals."""
    
    @staticmethod
    def check_car_availability(
        db: Session,
        car_id: int,
        start_date: date,
        end_date: date
    ) -> bool:
        """Check if a car is available for the given dates."""
        if start_date >= end_date:
            raise ValueError("End date must be after start date")
        
        bookings = CarBookingCRUD.get_car_bookings_for_period(
            db=db,
            car_id=car_id,
            start_date=start_date,
            end_date=end_date
        )
        
        return len(bookings) == 0
    
    @staticmethod
    def calculate_car_rental_price(
        price_per_day: float,
        start_date: date,
        end_date: date
    ) -> float:
        """Calculate car rental price."""
        num_days = (end_date - start_date).days
        if num_days <= 0:
            num_days = 1
        
        return price_per_day * num_days
    
    @staticmethod
    def validate_rental_dates(start_date: date, end_date: date) -> tuple[bool, str]:
        """Validate car rental dates."""
        if start_date >= end_date:
            return False, "End date must be after start date"
        
        return True, ""
