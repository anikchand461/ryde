from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Vehicle, RepairProvider, TowingProvider
from ..schemas import UserBase, VehicleBase, RepairProviderBase, TowingProviderBase, Token
from ..auth import create_access_token

router = APIRouter()

@router.post("/register")
def register(user: UserBase, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = User(**user.dict())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    # Create primary vehicle record if provided
    if user.vehicle_type and user.vehicle_name and user.vehicle_model and user.vehicle_registration:
        vehicle = Vehicle(
            user_id=new_user.id,
            type=user.vehicle_type,
            name=user.vehicle_name,
            model=user.vehicle_model,
            registration=user.vehicle_registration,
        )
        db.add(vehicle)
        db.commit()
    return {"id": new_user.id}

@router.post("/register/owner")
def register_owner(vehicle: VehicleBase, user_id: int, db: Session = Depends(get_db)):
    new_vehicle = Vehicle(**vehicle.dict(), user_id=user_id)
    db.add(new_vehicle)
    db.commit()
    return {"message": "Owner registered"}

@router.post("/register/repair")
def register_repair(provider: RepairProviderBase, user_id: int, db: Session = Depends(get_db)):
    new_provider = RepairProvider(**provider.dict(), user_id=user_id)
    db.add(new_provider)
    db.commit()
    return {"message": "Repair provider registered"}

@router.post("/register/towing")
def register_towing(provider: TowingProviderBase, user_id: int, db: Session = Depends(get_db)):
    new_provider = TowingProvider(**provider.dict(), user_id=user_id)
    db.add(new_provider)
    db.commit()
    return {"message": "Towing provider registered"}

@router.post("/login")
def login(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email, User.password == password).first()  # Plaintext for simplicity
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user.id})
    # Pull primary vehicle
    vehicle = db.query(Vehicle).filter(Vehicle.user_id == user.id).first()
    vehicle_type = vehicle.type if vehicle else user.vehicle_type
    return Token(access_token=access_token, token_type="bearer", user_id=user.id, role=user.role, vehicle_type=vehicle_type)