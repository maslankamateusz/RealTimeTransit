from sqlalchemy import Column, Integer, String, Date, ForeignKey, Float, DateTime 
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY, JSON
from .session import Base

class Vehicle(Base):
    __tablename__ = "vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String, unique=True, nullable=False)
    bus_brand = Column(String, nullable=True)
    depot = Column(String, nullable=True)

class DailyLogs(Base):
    __tablename__ = "daily_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    vehicle_id = Column(String, ForeignKey("vehicles.vehicle_id"), nullable=False)
    schedule_number = Column(ARRAY(String), nullable=False) 
    route_short_names = Column(ARRAY(JSON), nullable=False)  
    vehicle = relationship("Vehicle", backref="daily_logs")

class VehiclesStatus(Base):
    __tablename__ = "vehicles_status"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String, ForeignKey("vehicles.vehicle_id"), unique=True, nullable=False)
    schedule_number = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    last_updated = Column(DateTime, nullable=False)

    vehicle = relationship("Vehicle")
