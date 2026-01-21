from sqlalchemy import Column, Integer, String, Float, JSON, ForeignKey, DateTime
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    phone = Column(String)
    role = Column(String)  # "owner", "repair", "towing"
    password = Column(String)  # Hashed in production
    vehicle_type = Column(String, nullable=True)
    vehicle_name = Column(String, nullable=True)
    vehicle_model = Column(String, nullable=True)
    vehicle_registration = Column(String, nullable=True)

class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String)  # "car", "bike", "other"
    name = Column(String)
    model = Column(String)
    registration = Column(String)

class RepairProvider(Base):
    __tablename__ = "repair_providers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    vehicle_types = Column(JSON)  # ["car", "bike"]
    breakdowns = Column(JSON)  # Dict of vehicle_type: [breakdowns]
    lat = Column(Float)
    lng = Column(Float)
    timings = Column(String)
    shop_name = Column(String)
    email = Column(String)
    phone = Column(String)
    amenities = Column(JSON)

class TowingProvider(Base):
    __tablename__ = "towing_providers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    vehicle_types = Column(JSON)
    capabilities = Column(JSON)
    lat = Column(Float)
    lng = Column(Float)
    radius = Column(Float)
    timings = Column(String)
    provider_name = Column(String)
    email = Column(String)
    phone = Column(String)
    capacity = Column(String)
    additional_services = Column(JSON)

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    provider_id = Column(Integer)  # User ID of provider
    type = Column(String)  # "repair", "towing"
    breakdown_type = Column(String)
    description = Column(String)
    reason = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    status = Column(String, default="pending")  # pending, accepted, rejected, cancelled
    created_at = Column(DateTime, default=func.now())