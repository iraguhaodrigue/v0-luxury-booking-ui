from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database.db import get_db_session
from app.dependencies import get_current_user, get_admin_user
from app.models.user import User
from app.schemas.property import (
    PropertyCreate, PropertyUpdate, PropertyResponse,
    PropertyDetailResponse, RoomCreate, RoomUpdate, RoomResponse
)
from app.crud.property import PropertyCRUD, RoomCRUD
from app.core.constants import PropertyType

router = APIRouter(prefix="/api/properties", tags=["properties"])


@router.get("", response_model=list[PropertyResponse])
async def list_properties(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    location: str | None = None,
    min_price: float | None = Query(None, ge=0),
    max_price: float | None = Query(None, ge=0),
    property_type: PropertyType | None = None,
    db: Session = Depends(get_db_session)
):
    """List all properties with optional filters."""
    properties = PropertyCRUD.get_all_properties(
        db=db,
        skip=skip,
        limit=limit,
        location=location,
        min_price=min_price,
        max_price=max_price,
        property_type=property_type
    )
    return [PropertyResponse.from_orm(p) for p in properties]


@router.get("/{property_id}", response_model=PropertyDetailResponse)
async def get_property(
    property_id: int,
    db: Session = Depends(get_db_session)
):
    """Get property details with rooms."""
    property = PropertyCRUD.get_property_by_id(db, property_id)
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    return PropertyDetailResponse.from_orm(property)


@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
async def create_property(
    property_data: PropertyCreate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db_session)
):
    """Create a new property (admin only)."""
    property = PropertyCRUD.create_property(
        db=db,
        name=property_data.name,
        description=property_data.description,
        location=property_data.location,
        price_per_night=property_data.price_per_night,
        property_type=property_data.property_type,
        max_guests=property_data.max_guests,
        bedrooms=property_data.bedrooms,
        bathrooms=property_data.bathrooms,
        images=property_data.images
    )
    return PropertyResponse.from_orm(property)


@router.put("/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: int,
    property_data: PropertyUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db_session)
):
    """Update a property (admin only)."""
    property = PropertyCRUD.get_property_by_id(db, property_id)
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    updated_property = PropertyCRUD.update_property(
        db=db,
        property=property,
        **property_data.model_dump(exclude_unset=True)
    )
    return PropertyResponse.from_orm(updated_property)


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(
    property_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db_session)
):
    """Delete a property (admin only)."""
    property = PropertyCRUD.get_property_by_id(db, property_id)
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    PropertyCRUD.delete_property(db, property)


@router.post("/{property_id}/rooms", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
async def create_room(
    property_id: int,
    room_data: RoomCreate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db_session)
):
    """Create a room in a property (admin only)."""
    property = PropertyCRUD.get_property_by_id(db, property_id)
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    room = RoomCRUD.create_room(
        db=db,
        property_id=property_id,
        name=room_data.name,
        description=room_data.description,
        capacity=room_data.capacity,
        price_modifier=room_data.price_modifier,
        bedrooms=room_data.bedrooms,
        bathrooms=room_data.bathrooms
    )
    return RoomResponse.from_orm(room)


@router.get("/{property_id}/rooms", response_model=list[RoomResponse])
async def list_rooms(
    property_id: int,
    db: Session = Depends(get_db_session)
):
    """List all rooms in a property."""
    property = PropertyCRUD.get_property_by_id(db, property_id)
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    rooms = RoomCRUD.get_rooms_by_property(db, property_id)
    return [RoomResponse.from_orm(r) for r in rooms]


@router.put("/{property_id}/rooms/{room_id}", response_model=RoomResponse)
async def update_room(
    property_id: int,
    room_id: int,
    room_data: RoomUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db_session)
):
    """Update a room (admin only)."""
    room = RoomCRUD.get_room_by_id(db, room_id)
    
    if not room or room.property_id != property_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    updated_room = RoomCRUD.update_room(
        db=db,
        room=room,
        **room_data.model_dump(exclude_unset=True)
    )
    return RoomResponse.from_orm(updated_room)


@router.delete("/{property_id}/rooms/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(
    property_id: int,
    room_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db_session)
):
    """Delete a room (admin only)."""
    room = RoomCRUD.get_room_by_id(db, room_id)
    
    if not room or room.property_id != property_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    RoomCRUD.delete_room(db, room)
