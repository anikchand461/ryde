# backend/app/models.py
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from .database import Base
import enum

class UserRole(enum.Enum):
    OWNER = "OWNER"
    REPAIR = "REPAIR"
    TOWING = "TOWING"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    hashed_password = Column(String)
    role = Column(SQLEnum(UserRole))

    owner_profile = relationship("VehicleOwner", back_populates="user", uselist=False)
    repair_profile = relationship("RepairShop", back_populates="user", uselist=False)
    towing_profile = relationship("TowingProvider", back_populates="user", uselist=False)

class VehicleType(enum.Enum):
    CAR = "CAR"
    BIKE = "BIKE"
    OTHER = "OTHER"

class VehicleOwner(Base):
    __tablename__ = "vehicle_owners"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    vehicle_type = Column(SQLEnum(VehicleType))
    vehicle_name = Column(String)
    vehicle_model = Column(String)
    vehicle_registration = Column(String)

    user = relationship("User", back_populates="owner_profile")

class RepairShop(Base):
    __tablename__ = "repair_shops"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    vehicle_types = Column(String)  # Comma-separated
    breakdown_services = Column(String)  # JSON or comma-separated
    location_lat = Column(Float)
    location_long = Column(Float)
    shop_timings = Column(String)
    shop_name = Column(String)
    amenities = Column(String)

    user = relationship("User", back_populates="repair_profile")

class TowingProvider(Base):
    __tablename__ = "towing_providers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    vehicle_types = Column(String)  # Comma-separated
    towing_capabilities = Column(String)
    base_lat = Column(Float)
    base_long = Column(Float)
    coverage_radius_km = Column(Float)
    availability_timings = Column(String)
    provider_name = Column(String)
    towing_capacity = Column(String)
    additional_services = Column(String)

    user = relationship("User", back_populates="towing_profile")

class BookingStatus(enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    provider_id = Column(Integer)  # Could be repair or towing
    service_type = Column(String)  # "REPAIR" or "TOWING"
    breakdown_type = Column(String)
    description = Column(String)
    location_lat = Column(Float)
    location_long = Column(Float)
    status = Column(SQLEnum(BookingStatus), default=BookingStatus.PENDING)

    user = relationship("User", foreign_keys=[user_id])
