from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from sqlalchemy.orm import Session

from app.schemas.location import LocationCreate, LocationUpdate, LocationResponse
from app.api.v1.auth import get_current_hospital
from app.db.session import get_db
from app.db.models.hospital import Hospital
from app.db.models.location import Location

router = APIRouter()

@router.get("/")
def get_location(
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    location = db.query(Location).filter(Location.hospital_id == current_hospital.id).first()
    if not location:
        return {"latitude": 0.0, "longitude": 0.0, "city": "", "region": "", "country": "Cameroun"}
    return {"latitude": location.latitude, "longitude": location.longitude, 
            "city": location.city, "region": location.region, "country": location.country}

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_location(
    location: LocationCreate,
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    existing = db.query(Location).filter(Location.hospital_id == current_hospital.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Location already exists")
    
    new_location = Location(hospital_id=current_hospital.id, **location.dict())
    db.add(new_location)
    db.commit()
    db.refresh(new_location)
    return location.dict()

@router.put("/")
def update_location(
    location: LocationUpdate,
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    db_location = db.query(Location).filter(Location.hospital_id == current_hospital.id).first()
    if not db_location:
        db_location = Location(hospital_id=current_hospital.id)
        db.add(db_location)
    
    updates = location.dict(exclude_unset=True)
    for key, value in updates.items():
        setattr(db_location, key, value)
    
    db.commit()
    db.refresh(db_location)
    
    return {"latitude": db_location.latitude, "longitude": db_location.longitude,
            "city": db_location.city, "region": db_location.region, "country": db_location.country}
            
    return location.dict(exclude_unset=True)
