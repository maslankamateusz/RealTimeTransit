from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from .session import Base

class Vehicle(Base):
    __tablename__ = "vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String, unique=True, nullable=False)
    bus_brand = Column(String, nullable=True)
    depot = Column(String, nullable=True)

class DailyLog(Base):
    __tablename__ = "daily_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    vehicle_id = Column(String, ForeignKey("vehicles.vehicle_id"), nullable=False)
    route_short_name = Column(String, nullable=False)
    schedule_number = Column(String, nullable=False)

    vehicle = relationship("Vehicle")
