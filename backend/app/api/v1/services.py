from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.schemas.services import ServiceCreate, ServiceUpdate, ServiceResponse
from app.api.v1.auth import get_current_hospital
from app.db.session import get_db
from app.db.models.hospital import Hospital
from app.db.models.service import Service

router = APIRouter()

@router.get("/")
def get_services(
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    services = db.query(Service).filter(Service.hospital_id == current_hospital.id).all()
    return [{"id": s.id, "name": s.name, "description": s.description, "is_available": s.is_available} for s in services]

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_service(
    service: ServiceCreate,
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    new_service = Service(
        name=service.name,
        description=service.description,
        is_available=True,
        hospital_id=current_hospital.id
    )
    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    
    return {"id": new_service.id, "name": new_service.name, "description": new_service.description, "is_available": new_service.is_available}

@router.put("/{service_id}")
def update_service(
    service_id: int,
    service: ServiceUpdate,
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    db_service = db.query(Service).filter(Service.id == service_id, Service.hospital_id == current_hospital.id).first()
    if not db_service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    
    updates = service.dict(exclude_unset=True)
    for key, value in updates.items():
        setattr(db_service, key, value)
    
    db.commit()
    db.refresh(db_service)
    return {"id": db_service.id, "name": db_service.name, "description": db_service.description, "is_available": db_service.is_available}

@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(
    service_id: int,
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    db_service = db.query(Service).filter(Service.id == service_id, Service.hospital_id == current_hospital.id).first()
    if not db_service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    
    db.delete(db_service)
    db.commit()
    return None
