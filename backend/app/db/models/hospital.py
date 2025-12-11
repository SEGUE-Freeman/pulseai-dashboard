from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.db.base import Base

class Hospital(Base):
    __tablename__ = "hospitals"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    address = Column(String)
    phone = Column(String)
    
    # Relations
    services = relationship("Service", back_populates="hospital", cascade="all, delete-orphan")
    capacity = relationship("Capacity", back_populates="hospital", uselist=False, cascade="all, delete-orphan")
    location = relationship("Location", back_populates="hospital", uselist=False, cascade="all, delete-orphan")
    equipment = relationship("Equipment", back_populates="hospital", cascade="all, delete-orphan")
