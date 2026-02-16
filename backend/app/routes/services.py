from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database.db import get_db_session
from app.dependencies import get_current_user, get_admin_user
from app.models.user import User
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceResponse
from app.crud.service import ServiceCRUD
from app.core.constants import ServiceType

router = APIRouter(prefix="/api/services", tags=["services"])


@router.get("", response_model=list[ServiceResponse])
async def list_services(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    service_type: ServiceType | None = None,
    db: Session = Depends(get_db_session)
):
    """List all available services."""
    services = ServiceCRUD.get_all_services(
        db=db,
        skip=skip,
        limit=limit,
        service_type=service_type
    )
    return [ServiceResponse.from_orm(s) for s in services]


@router.get("/{service_id}", response_model=ServiceResponse)
async def get_service(
    service_id: int,
    db: Session = Depends(get_db_session)
):
    """Get service details."""
    service = ServiceCRUD.get_service_by_id(db, service_id)
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    return ServiceResponse.from_orm(service)


@router.post("", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(
    service_data: ServiceCreate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db_session)
):
    """Create a new service (admin only)."""
    service = ServiceCRUD.create_service(
        db=db,
        name=service_data.name,
        service_type=service_data.service_type,
        description=service_data.description,
        price=service_data.price
    )
    return ServiceResponse.from_orm(service)


@router.put("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: int,
    service_data: ServiceUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db_session)
):
    """Update a service (admin only)."""
    service = ServiceCRUD.get_service_by_id(db, service_id)
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    updated_service = ServiceCRUD.update_service(
        db=db,
        service=service,
        **service_data.model_dump(exclude_unset=True)
    )
    return ServiceResponse.from_orm(updated_service)


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db_session)
):
    """Delete a service (admin only)."""
    service = ServiceCRUD.get_service_by_id(db, service_id)
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    ServiceCRUD.delete_service(db, service)
