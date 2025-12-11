from pydantic import BaseModel

class LocationBase(BaseModel):
    latitude: float | None = None
    longitude: float | None = None
    city: str | None = None
    region: str | None = None
    country: str = "Cameroon"

class LocationCreate(LocationBase):
    pass

class LocationUpdate(BaseModel):
    latitude: float | None = None
    longitude: float | None = None
    city: str | None = None
    region: str | None = None
    country: str | None = None

class LocationResponse(LocationBase):
    id: int
    hospital_id: int
    
    class Config:
        from_attributes = True
