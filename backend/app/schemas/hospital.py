from pydantic import BaseModel, EmailStr

class HospitalBase(BaseModel):
    name: str
    email: EmailStr
    address: str | None = None
    phone: str | None = None

class HospitalCreate(HospitalBase):
    password: str

class HospitalUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    phone: str | None = None

class HospitalResponse(HospitalBase):
    id: int
    
    class Config:
        from_attributes = True

class HospitalDashboard(BaseModel):
    id: int
    name: str
    email: str
    address: str | None
    phone: str | None
    services: list
    capacity: dict | None
    location: dict | None
    equipment: list
    
    class Config:
        from_attributes = True
