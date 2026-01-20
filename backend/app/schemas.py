# backend/app/schemas.py
from pydantic import BaseModel
from typing import Optional, List
from .models import UserRole, VehicleType, BookingStatus

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    full_name: str
    email: str
    phone: str

class UserCreate(UserBase):
    password: str
    role: UserRole
    owner_profile: Optional[dict] = None
    repair_profile: Optional[dict] = None
    towing_profile: Optional[dict] = None

class VehicleOwnerCreate(BaseModel):
    vehicle_type: VehicleType
    vehicle_name: str
    vehicle_model: str
    vehicle_registration: str

class RepairShopCreate(BaseModel):
    vehicle_types: str
    breakdown_services: str
    location_lat: float
    location_long: float
    shop_timings: str
    shop_name: str
    amenities: str

class TowingProviderCreate(BaseModel):
    vehicle_types: str
    towing_capabilities: str
    base_lat: float
    base_long: float
    coverage_radius_km: float
    availability_timings: str
    provider_name: str
    towing_capacity: str
    additional_services: str

class BookingCreate(BaseModel):
    provider_id: int
    service_type: str
    breakdown_type: Optional[str] = None
    description: Optional[str] = None
    location_lat: float
    location_long: float

class Booking(BaseModel):
    id: int
    user_id: int
    provider_id: int
    service_type: str
    status: BookingStatus

    class Config:
        orm_mode = True
