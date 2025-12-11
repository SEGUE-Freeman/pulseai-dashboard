from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from sqlalchemy.orm import Session

from app.schemas.hospital import HospitalResponse, HospitalUpdate
from app.api.v1.auth import get_current_hospital
from app.db.session import get_db
from app.db.models.hospital import Hospital

router = APIRouter()

@router.get("/me")
def get_hospital_profile(
    current_hospital: Hospital = Depends(get_current_hospital)
):
    return {
        "id": current_hospital.id,
        "name": current_hospital.name,
        "email": current_hospital.email,
        "address": current_hospital.address,
        "phone": current_hospital.phone
    }

@router.put("/me")
def update_hospital_profile(
    data: HospitalUpdate,
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    # Mettre à jour l'hôpital dans la base de données
    updates = data.dict(exclude_unset=True)
    
    for key, value in updates.items():
        setattr(current_hospital, key, value)
        
    db.commit()
    db.refresh(current_hospital)
    
    return {
        "id": current_hospital.id,
        "name": current_hospital.name,
        "email": current_hospital.email,
        "address": current_hospital.address,
        "phone": current_hospital.phone
    }

@router.get("/dashboard")
def get_dashboard(
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    # Récupérer les services de l'hôpital depuis la base de données
    from app.db.models.service import Service
    from app.db.models.capacity import Capacity
    from app.db.models.location import Location
    
    services = db.query(Service).filter(Service.hospital_id == current_hospital.id).all()
    capacity = db.query(Capacity).filter(Capacity.hospital_id == current_hospital.id).first()
    location = db.query(Location).filter(Location.hospital_id == current_hospital.id).first()
    
    # Données par défaut si aucune capacité n'existe
    capacity_data = {
        "beds": capacity.beds if capacity else 0,
        "occupied_beds": capacity.occupied_beds if capacity else 0,
        "total_doctors": capacity.total_doctors if capacity else 0,
        "active_doctors": capacity.active_doctors if capacity else 0,
        "total_nurses": capacity.total_nurses if capacity else 0,
        "active_nurses": capacity.active_nurses if capacity else 0,
        "waiting_queue": capacity.waiting_queue if capacity else 0,
        "average_wait_time": capacity.average_wait_time if capacity else 0
    }
    
    # Calculer le taux d'occupation
    occupancy_rate = 0
    if capacity_data['beds'] > 0:
        occupancy_rate = (capacity_data['occupied_beds'] / capacity_data['beds']) * 100
        
    return {
        "available_beds": capacity_data['beds'] - capacity_data['occupied_beds'],
        "occupancy_rate": round(occupancy_rate, 1),
        "active_doctors": capacity_data['active_doctors'],
        "active_services": len(services),
        "hospital_score": 0,
        "patients_today": 0,
        "recommendations_today": 0,
        "waiting_queue": capacity_data['waiting_queue']
    }
