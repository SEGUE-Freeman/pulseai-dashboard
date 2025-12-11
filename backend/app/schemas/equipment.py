from pydantic import BaseModel

class EquipmentBase(BaseModel):
    name: str
    quantity: int = 0
    available: bool = True

class EquipmentCreate(EquipmentBase):
    pass

class EquipmentUpdate(BaseModel):
    name: str | None = None
    quantity: int | None = None
    available: bool | None = None

class EquipmentResponse(EquipmentBase):
    id: int
    hospital_id: int
    
    class Config:
        from_attributes = True
