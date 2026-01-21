from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import RepairProvider, TowingProvider, User
from ..schemas import ProviderResponse
import math


router = APIRouter()

def calculate_distance(lat1, lng1, lat2, lng2):
    R = 6371  # Earth radius km
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

@router.get("/nearby/repair")
def get_nearby_repair(lat: float, lng: float, vehicle_type: str, db: Session = Depends(get_db)):
    providers = db.query(RepairProvider).all()
    results = []
    for p in providers:
        user = db.query(User).filter(User.id == p.user_id).first()
        dist = calculate_distance(lat, lng, p.lat, p.lng)
        if vehicle_type in p.vehicle_types and dist < 50:  # Arbitrary radius
            details = {
                "vehicle_types": p.vehicle_types,
                "breakdowns": p.breakdowns,
                "timings": p.timings,
                "shop_name": p.shop_name,
                "email": p.email,
                "phone": p.phone,
                "amenities": p.amenities,
            }
            results.append(ProviderResponse(id=user.id, provider_record_id=p.id, name=user.name, lat=p.lat, lng=p.lng, distance=dist, details=details))
    return results

@router.get("/nearby/towing")
def get_nearby_towing(lat: float, lng: float, vehicle_type: str, db: Session = Depends(get_db)):
    providers = db.query(TowingProvider).all()
    results = []
    for p in providers:
        user = db.query(User).filter(User.id == p.user_id).first()
        dist = calculate_distance(lat, lng, p.lat, p.lng)
        if vehicle_type in p.vehicle_types and dist <= p.radius:
            details = {
                "vehicle_types": p.vehicle_types,
                "capabilities": p.capabilities,
                "radius": p.radius,
                "timings": p.timings,
                "provider_name": p.provider_name,
                "email": p.email,
                "phone": p.phone,
                "capacity": p.capacity,
                "additional_services": p.additional_services,
            }
            results.append(ProviderResponse(id=user.id, provider_record_id=p.id, name=user.name, lat=p.lat, lng=p.lng, distance=dist, details=details))
    return results