from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Service(Base):
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False)
    
    # Relations
    hospital = relationship("Hospital", back_populates="services")
