from fastapi import APIRouter, Depends, HTTPException, status, Query
from datetime import date
from sqlalchemy.orm import Session
from app.database.db import get_db_session
from app.dependencies import get_current_user, get_admin_user
from app.models.user import User
from app.schemas.car import (
    CarCreate, CarUpdate, CarResponse,
    CarBookingCreate, CarBookingUpdate, CarBookingResponse
)
from app.crud.car import CarCRUD, CarBookingCRUD
from app.services.car_service import CarService
from app.core.constants import CarAvailabilityStatus

router = APIRouter(prefix="/api/cars", tags=["cars"])


# ============ CAR ENDPOINTS ============

@router.get("", response_model=list[CarResponse])
async def list_cars(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    availability_status: CarAvailabilityStatus | None = None,
    db: Session = Depends(get_db_session)
):
    """List all available cars."""
    cars = CarCRUD.get_all_cars(
        db=db,
        skip=skip,
        limit=limit,
        availability_status=availability_status
    )
    return [CarResponse.from_orm(c) for c in cars]


@router.get("/{car_id}", response_model=CarResponse)
async def get_car(
    car_id: int,
    db: Session = Depends(get_db_session)
):
    """Get car details."""
    car = CarCRUD.get_car_by_id(db, car_id)
    
    if not car:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Car not found"
        )
    
    return CarResponse.from_orm(car)


@router.post("", response_model=CarResponse, status_code=status.HTTP_201_CREATED)
async def create_car(
    car_data: CarCreate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db_session)
):
    """Create a new car (admin only)."""
    car = CarCRUD.create_car(
        db=db,
        name=car_data.name,
        brand=car_data.brand,
        model=car_data.model,
        year=car_data.year,
        license_plate=car_data.license_plate,
        price_per_day=car_data.price_per_day,
        max_passengers=car_data.max_passengers,
        description=car_data.description
    )
    return CarResponse.from_orm(car)


@router.put("/{car_id}", response_model=CarResponse)
async def update_car(
    car_id: int,
    car_data: CarUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db_session)
):
    """Update a car (admin only)."""
    car = CarCRUD.get_car_by_id(db, car_id)
    
    if not car:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Car not found"
        )
    
    updated_car = CarCRUD.update_car(
        db=db,
        car=car,
        **car_data.model_dump(exclude_unset=True)
    )
    return CarResponse.from_orm(updated_car)


@router.delete("/{car_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_car(
    car_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db_session)
):
    """Delete a car (admin only)."""
    car = CarCRUD.get_car_by_id(db, car_id)
    
    if not car:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Car not found"
        )
    
    CarCRUD.delete_car(db, car)


# ============ CAR BOOKING ENDPOINTS ============

@router.post("/bookings", response_model=CarBookingResponse, status_code=status.HTTP_201_CREATED)
async def create_car_booking(
    car_booking_data: CarBookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    """Create a car booking."""
    # Validate dates
    is_valid, error_msg = CarService.validate_rental_dates(
        car_booking_data.start_date,
        car_booking_data.end_date
    )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    # Check car exists
    car = CarCRUD.get_car_by_id(db, car_booking_data.car_id)
    if not car:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Car not found"
        )
    
    # Check availability
    available = CarService.check_car_availability(
        db,
        car_booking_data.car_id,
        car_booking_data.start_date,
        car_booking_data.end_date
    )
    
    if not available:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Car is not available for the requested dates"
        )
    
    # Calculate total price
    total_price = CarService.calculate_car_rental_price(
        car.price_per_day,
        car_booking_data.start_date,
        car_booking_data.end_date
    )
    
    # Create car booking
    car_booking = CarBookingCRUD.create_car_booking(
        db=db,
        car_id=car_booking_data.car_id,
        start_date=car_booking_data.start_date,
        end_date=car_booking_data.end_date,
        total_price=total_price,
        booking_id=car_booking_data.booking_id,
        pickup_location=car_booking_data.pickup_location,
        dropoff_location=car_booking_data.dropoff_location,
        notes=car_booking_data.notes
    )
    
    return CarBookingResponse.from_orm(car_booking)


@router.get("/bookings/{car_booking_id}", response_model=CarBookingResponse)
async def get_car_booking(
    car_booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    """Get car booking details."""
    car_booking = CarBookingCRUD.get_car_booking_by_id(db, car_booking_id)
    
    if not car_booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Car booking not found"
        )
    
    return CarBookingResponse.from_orm(car_booking)


@router.put("/bookings/{car_booking_id}", response_model=CarBookingResponse)
async def update_car_booking(
    car_booking_id: int,
    car_booking_data: CarBookingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    """Update car booking."""
    car_booking = CarBookingCRUD.get_car_booking_by_id(db, car_booking_id)
    
    if not car_booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Car booking not found"
        )
    
    updated_car_booking = CarBookingCRUD.update_car_booking(
        db=db,
        car_booking=car_booking,
        **car_booking_data.model_dump(exclude_unset=True)
    )
    
    return CarBookingResponse.from_orm(updated_car_booking)


@router.delete("/bookings/{car_booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_car_booking(
    car_booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    """Delete car booking."""
    car_booking = CarBookingCRUD.get_car_booking_by_id(db, car_booking_id)
    
    if not car_booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Car booking not found"
        )
    
    CarBookingCRUD.delete_car_booking(db, car_booking)


@router.get("/{car_id}/availability", response_model=dict)
async def check_car_availability(
    car_id: int,
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db_session)
):
    """Check if a car is available for given dates."""
    car = CarCRUD.get_car_by_id(db, car_id)
    
    if not car:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Car not found"
        )
    
    try:
        available = CarService.check_car_availability(db, car_id, start_date, end_date)
        total_price = CarService.calculate_car_rental_price(
            car.price_per_day, start_date, end_date
        )
        
        return {
            "car_id": car_id,
            "available": available,
            "start_date": start_date,
            "end_date": end_date,
            "price_per_day": car.price_per_day,
            "total_price": total_price,
            "num_days": (end_date - start_date).days
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
