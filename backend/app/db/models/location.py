from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Location(Base):
    __tablename__ = "locations"
    
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), unique=True, nullable=False)
    
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    city = Column(String, nullable=True)
    region = Column(String, nullable=True)
    country = Column(String, default="Cameroon")
    
    # Relations
    hospital = relationship("Hospital", back_populates="location")
