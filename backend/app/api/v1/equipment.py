from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.schemas.equipment import EquipmentCreate, EquipmentUpdate, EquipmentResponse
from app.api.v1.auth import get_current_hospital
from app.db.session import get_db
from app.db.models.hospital import Hospital
from app.db.models.equipment import Equipment

router = APIRouter()

@router.get("/")
def get_equipment(
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    equipment_list = db.query(Equipment).filter(Equipment.hospital_id == current_hospital.id).all()
    return [{"id": e.id, "name": e.name, "quantity": e.quantity, "status": e.status} for e in equipment_list]

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_equipment(
    equipment: EquipmentCreate,
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    new_equipment = Equipment(hospital_id=current_hospital.id, **equipment.dict())
    db.add(new_equipment)
    db.commit()
    db.refresh(new_equipment)
    return {"id": new_equipment.id, "name": new_equipment.name, "quantity": new_equipment.quantity, "status": new_equipment.status}

@router.put("/{equipment_id}")
def update_equipment(
    equipment_id: int,
    equipment: EquipmentUpdate,
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    db_equipment = db.query(Equipment).filter(Equipment.id == equipment_id, Equipment.hospital_id == current_hospital.id).first()
    if not db_equipment:
        raise HTTPException(status_code=404, detail="Équipement non trouvé")
    
    updates = equipment.dict(exclude_unset=True)
    for key, value in updates.items():
        setattr(db_equipment, key, value)
    
    db.commit()
    db.refresh(db_equipment)
    return {"id": db_equipment.id, "name": db_equipment.name, "quantity": db_equipment.quantity, "status": db_equipment.status}

@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_equipment(
    equipment_id: int,
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    db_equipment = db.query(Equipment).filter(Equipment.id == equipment_id, Equipment.hospital_id == current_hospital.id).first()
    if not db_equipment:
        raise HTTPException(status_code=404, detail="Équipement non trouvé")
    
    db.delete(db_equipment)
    db.commit()
    return None
