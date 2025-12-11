from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from sqlalchemy.orm import Session

from app.schemas.capacity import CapacityCreate, CapacityUpdate, CapacityResponse
from app.api.v1.auth import get_current_hospital
from app.db.session import get_db
from app.db.models.hospital import Hospital
from app.db.models.capacity import Capacity

router = APIRouter()

@router.get("/")
def get_capacity(
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    capacity = db.query(Capacity).filter(Capacity.hospital_id == current_hospital.id).first()
    if not capacity:
        return {
            "beds": 0, "occupied_beds": 0, "total_doctors": 0, "active_doctors": 0,
            "total_nurses": 0, "active_nurses": 0, "waiting_queue": 0, "average_wait_time": 0
        }
    return {
        "beds": capacity.beds, "occupied_beds": capacity.occupied_beds,
        "total_doctors": capacity.total_doctors, "active_doctors": capacity.active_doctors,
        "total_nurses": capacity.total_nurses, "active_nurses": capacity.active_nurses,
        "waiting_queue": capacity.waiting_queue, "average_wait_time": capacity.average_wait_time
    }

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_capacity(
    capacity: CapacityCreate,
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    existing = db.query(Capacity).filter(Capacity.hospital_id == current_hospital.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Capacity already exists for this hospital")
    
    new_capacity = Capacity(hospital_id=current_hospital.id, **capacity.dict())
    db.add(new_capacity)
    db.commit()
    db.refresh(new_capacity)
    return capacity.dict()

@router.put("/")
def update_capacity(
    capacity: CapacityUpdate,
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    db_capacity = db.query(Capacity).filter(Capacity.hospital_id == current_hospital.id).first()
    if not db_capacity:
        db_capacity = Capacity(hospital_id=current_hospital.id)
        db.add(db_capacity)
    
    updates = capacity.dict(exclude_unset=True)
    for key, value in updates.items():
        setattr(db_capacity, key, value)
    
    if db_capacity.occupied_beds > db_capacity.beds:
        raise HTTPException(status_code=400, detail="Le nombre de lits occupés ne peut pas dépasser le nombre total de lits.")
    
    if db_capacity.active_doctors > db_capacity.total_doctors:
        raise HTTPException(status_code=400, detail="Le nombre de médecins actifs ne peut pas dépasser le nombre total de médecins.")
    
    if db_capacity.active_nurses > db_capacity.total_nurses:
        raise HTTPException(status_code=400, detail="Le nombre d'infirmiers actifs ne peut pas dépasser le nombre total d'infirmiers.")
    
    db.commit()
    db.refresh(db_capacity)
    
    return {
        "beds": db_capacity.beds, "occupied_beds": db_capacity.occupied_beds,
        "total_doctors": db_capacity.total_doctors, "active_doctors": db_capacity.active_doctors,
        "total_nurses": db_capacity.total_nurses, "active_nurses": db_capacity.active_nurses,
        "waiting_queue": db_capacity.waiting_queue, "average_wait_time": db_capacity.average_wait_time
    }
