from sqlalchemy.orm import Session
from app.models.service import Service
from app.core.constants import ServiceType


class ServiceCRUD:
    """CRUD operations for Service model."""
    
    @staticmethod
    def create_service(
        db: Session,
        name: str,
        service_type: ServiceType,
        price: float,
        description: str | None = None
    ) -> Service:
        """Create a new service."""
        service = Service(
            name=name,
            service_type=service_type,
            description=description,
            price=price,
            is_active=True
        )
        db.add(service)
        db.commit()
        db.refresh(service)
        return service
    
    @staticmethod
    def get_service_by_id(db: Session, service_id: int) -> Service | None:
        """Get service by ID."""
        return db.query(Service).filter(Service.id == service_id).first()
    
    @staticmethod
    def get_all_services(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        service_type: ServiceType | None = None
    ) -> list[Service]:
        """Get all active services."""
        query = db.query(Service).filter(Service.is_active == True)
        
        if service_type:
            query = query.filter(Service.service_type == service_type)
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def update_service(db: Session, service: Service, **kwargs) -> Service:
        """Update service."""
        for key, value in kwargs.items():
            if value is not None and hasattr(service, key):
                setattr(service, key, value)
        
        db.commit()
        db.refresh(service)
        return service
    
    @staticmethod
    def delete_service(db: Session, service: Service) -> None:
        """Delete service."""
        db.delete(service)
        db.commit()
