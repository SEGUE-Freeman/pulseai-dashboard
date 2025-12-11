from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Equipment(Base):
    __tablename__ = "equipment"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    quantity = Column(Integer, default=0)
    available = Column(Boolean, default=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False)
    
    # Relations
    hospital = relationship("Hospital", back_populates="equipment")
