# backend/app/routers/towing.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user

router = APIRouter(tags=["Towing"])

@router.get("/towing-providers/")
def get_towing_providers(lat: float, long: float, db: Session = Depends(get_db)):
    providers = db.query(models.TowingProvider).all()
    nearby = [p for p in providers if abs(p.base_lat - lat) < 0.1 and abs(p.base_long - long) < 0.1]
    return nearby
