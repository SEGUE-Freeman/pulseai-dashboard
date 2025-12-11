from pydantic import BaseModel

class ServiceBase(BaseModel):
    name: str
    description: str | None = None

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(ServiceBase):
    name: str | None = None

class ServiceResponse(ServiceBase):
    id: int
    hospital_id: int
    
    class Config:
        from_attributes = True
