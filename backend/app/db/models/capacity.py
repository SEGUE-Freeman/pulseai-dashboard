from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Capacity(Base):
    __tablename__ = "capacity"
    
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), unique=True, nullable=False)
    
    # Capacités
    beds = Column(Integer, default=0)
    occupied_beds = Column(Integer, default=0)
    
    # Personnel médical
    total_doctors = Column(Integer, default=0)
    active_doctors = Column(Integer, default=0)
    total_nurses = Column(Integer, default=0)
    active_nurses = Column(Integer, default=0)
    
    # Statistiques d'affluence
    waiting_queue = Column(Integer, default=0)
    average_wait_time = Column(Integer, default=0)  # En minutes
    
    # Relations
    hospital = relationship("Hospital", back_populates="capacity")
