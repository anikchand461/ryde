# backend/app/routers/repair.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user

router = APIRouter(tags=["Repair"])

@router.get("/repair-shops/")
def get_repair_shops(lat: float, long: float, db: Session = Depends(get_db)):
    # Simple distance filter, in production use geospatial
    shops = db.query(models.RepairShop).all()
    nearby = [shop for shop in shops if abs(shop.location_lat - lat) < 0.1 and abs(shop.location_long - long) < 0.1]
    return nearby
