from sqlalchemy.orm import Session
from app.models.property import Property, Room
from app.core.constants import PropertyType


class PropertyCRUD:
    """CRUD operations for Property model."""
    
    @staticmethod
    def create_property(
        db: Session,
        name: str,
        location: str,
        price_per_night: float,
        property_type: PropertyType,
        description: str | None = None,
        max_guests: int | None = None,
        bedrooms: int | None = None,
        bathrooms: int | None = None,
        images: list[str] | None = None
    ) -> Property:
        """Create a new property."""
        property = Property(
            name=name,
            description=description,
            location=location,
            price_per_night=price_per_night,
            property_type=property_type,
            max_guests=max_guests,
            bedrooms=bedrooms,
            bathrooms=bathrooms,
            images=images,
            is_active=True
        )
        db.add(property)
        db.commit()
        db.refresh(property)
        return property
    
    @staticmethod
    def get_property_by_id(db: Session, property_id: int) -> Property | None:
        """Get property by ID."""
        return db.query(Property).filter(Property.id == property_id).first()
    
    @staticmethod
    def get_all_properties(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        location: str | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        property_type: PropertyType | None = None
    ) -> list[Property]:
        """Get all properties with optional filters."""
        query = db.query(Property).filter(Property.is_active == True)
        
        if location:
            query = query.filter(Property.location.ilike(f"%{location}%"))
        
        if min_price:
            query = query.filter(Property.price_per_night >= min_price)
        
        if max_price:
            query = query.filter(Property.price_per_night <= max_price)
        
        if property_type:
            query = query.filter(Property.property_type == property_type)
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def update_property(db: Session, property: Property, **kwargs) -> Property:
        """Update property."""
        for key, value in kwargs.items():
            if value is not None and hasattr(property, key):
                setattr(property, key, value)
        
        db.commit()
        db.refresh(property)
        return property
    
    @staticmethod
    def delete_property(db: Session, property: Property) -> None:
        """Delete property."""
        db.delete(property)
        db.commit()


class RoomCRUD:
    """CRUD operations for Room model."""
    
    @staticmethod
    def create_room(
        db: Session,
        property_id: int,
        name: str,
        capacity: int,
        price_modifier: float = 1.0,
        description: str | None = None,
        bedrooms: int | None = None,
        bathrooms: int | None = None
    ) -> Room:
        """Create a new room."""
        room = Room(
            property_id=property_id,
            name=name,
            description=description,
            capacity=capacity,
            price_modifier=price_modifier,
            bedrooms=bedrooms,
            bathrooms=bathrooms,
            is_active=True
        )
        db.add(room)
        db.commit()
        db.refresh(room)
        return room
    
    @staticmethod
    def get_room_by_id(db: Session, room_id: int) -> Room | None:
        """Get room by ID."""
        return db.query(Room).filter(Room.id == room_id).first()
    
    @staticmethod
    def get_rooms_by_property(
        db: Session,
        property_id: int,
        active_only: bool = True
    ) -> list[Room]:
        """Get all rooms in a property."""
        query = db.query(Room).filter(Room.property_id == property_id)
        
        if active_only:
            query = query.filter(Room.is_active == True)
        
        return query.all()
    
    @staticmethod
    def update_room(db: Session, room: Room, **kwargs) -> Room:
        """Update room."""
        for key, value in kwargs.items():
            if value is not None and hasattr(room, key):
                setattr(room, key, value)
        
        db.commit()
        db.refresh(room)
        return room
    
    @staticmethod
    def delete_room(db: Session, room: Room) -> None:
        """Delete room."""
        db.delete(room)
        db.commit()
