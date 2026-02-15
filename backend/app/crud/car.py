from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.car import Car, CarBooking
from app.core.constants import CarAvailabilityStatus


class CarCRUD:
    """CRUD operations for Car model."""
    
    @staticmethod
    def create_car(
        db: Session,
        name: str,
        brand: str,
        model: str,
        license_plate: str,
        price_per_day: float,
        year: int | None = None,
        max_passengers: int | None = None,
        description: str | None = None
    ) -> Car:
        """Create a new car."""
        car = Car(
            name=name,
            brand=brand,
            model=model,
            year=year,
            license_plate=license_plate,
            price_per_day=price_per_day,
            max_passengers=max_passengers,
            description=description,
            availability_status=CarAvailabilityStatus.AVAILABLE,
            is_active=True
        )
        db.add(car)
        db.commit()
        db.refresh(car)
        return car
    
    @staticmethod
    def get_car_by_id(db: Session, car_id: int) -> Car | None:
        """Get car by ID."""
        return db.query(Car).filter(Car.id == car_id).first()
    
    @staticmethod
    def get_all_cars(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        availability_status: CarAvailabilityStatus | None = None
    ) -> list[Car]:
        """Get all active cars."""
        query = db.query(Car).filter(Car.is_active == True)
        
        if availability_status:
            query = query.filter(Car.availability_status == availability_status)
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def update_car(db: Session, car: Car, **kwargs) -> Car:
        """Update car."""
        for key, value in kwargs.items():
            if value is not None and hasattr(car, key):
                setattr(car, key, value)
        
        db.commit()
        db.refresh(car)
        return car
    
    @staticmethod
    def delete_car(db: Session, car: Car) -> None:
        """Delete car."""
        db.delete(car)
        db.commit()


class CarBookingCRUD:
    """CRUD operations for CarBooking model."""
    
    @staticmethod
    def create_car_booking(
        db: Session,
        car_id: int,
        start_date: date,
        end_date: date,
        total_price: float,
        booking_id: int | None = None,
        pickup_location: str | None = None,
        dropoff_location: str | None = None,
        notes: str | None = None
    ) -> CarBooking:
        """Create a new car booking."""
        car_booking = CarBooking(
            booking_id=booking_id,
            car_id=car_id,
            start_date=start_date,
            end_date=end_date,
            total_price=total_price,
            pickup_location=pickup_location,
            dropoff_location=dropoff_location,
            notes=notes
        )
        db.add(car_booking)
        db.commit()
        db.refresh(car_booking)
        return car_booking
    
    @staticmethod
    def get_car_booking_by_id(db: Session, car_booking_id: int) -> CarBooking | None:
        """Get car booking by ID."""
        return db.query(CarBooking).filter(CarBooking.id == car_booking_id).first()
    
    @staticmethod
    def get_car_bookings_for_period(
        db: Session,
        car_id: int,
        start_date: date,
        end_date: date
    ) -> list[CarBooking]:
        """Get car bookings that overlap with given dates."""
        return db.query(CarBooking).filter(
            and_(
                CarBooking.car_id == car_id,
                CarBooking.start_date < end_date,
                CarBooking.end_date > start_date
            )
        ).all()
    
    @staticmethod
    def get_bookings_by_main_booking(db: Session, booking_id: int) -> list[CarBooking]:
        """Get all car bookings linked to a main booking."""
        return db.query(CarBooking).filter(CarBooking.booking_id == booking_id).all()
    
    @staticmethod
    def update_car_booking(
        db: Session,
        car_booking: CarBooking,
        **kwargs
    ) -> CarBooking:
        """Update car booking."""
        for key, value in kwargs.items():
            if value is not None and hasattr(car_booking, key):
                setattr(car_booking, key, value)
        
        db.commit()
        db.refresh(car_booking)
        return car_booking
    
    @staticmethod
    def delete_car_booking(db: Session, car_booking: CarBooking) -> None:
        """Delete car booking."""
        db.delete(car_booking)
        db.commit()
