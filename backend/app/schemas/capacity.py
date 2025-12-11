from pydantic import BaseModel

class CapacityBase(BaseModel):
    beds: int = 0
    occupied_beds: int = 0
    total_doctors: int = 0
    active_doctors: int = 0
    total_nurses: int = 0
    active_nurses: int = 0
    waiting_queue: int = 0
    average_wait_time: int = 0

class CapacityCreate(CapacityBase):
    pass

class CapacityUpdate(BaseModel):
    beds: int | None = None
    occupied_beds: int | None = None
    total_doctors: int | None = None
    active_doctors: int | None = None
    total_nurses: int | None = None
    active_nurses: int | None = None
    waiting_queue: int | None = None
    average_wait_time: int | None = None

class CapacityResponse(CapacityBase):
    id: int
    hospital_id: int
    
    class Config:
        from_attributes = True
