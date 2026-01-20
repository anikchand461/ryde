# backend/app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, utils
from ..database import get_db

router = APIRouter(tags=["Users"])

@router.post("/users/")
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    hashed_password = utils.hash(user.password)
    new_user = models.User(full_name=user.full_name, email=user.email, phone=user.phone, hashed_password=hashed_password, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    if user.role == models.UserRole.OWNER:
        owner = models.VehicleOwner(user_id=new_user.id, **user.owner_profile.dict())
        db.add(owner)
    elif user.role == models.UserRole.REPAIR:
        repair = models.RepairShop(user_id=new_user.id, **user.repair_profile.dict())
        db.add(repair)
    elif user.role == models.UserRole.TOWING:
        towing = models.TowingProvider(user_id=new_user.id, **user.towing_profile.dict())
        db.add(towing)
    db.commit()
    return new_user
