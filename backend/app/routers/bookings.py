# backend/app/routers/bookings.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user

router = APIRouter(tags=["Bookings"])

@router.post("/bookings/")
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Not authorized")
    new_booking = models.Booking(**booking.dict(), user_id=current_user.id)
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    return new_booking

@router.put("/bookings/{booking_id}")
def update_booking(booking_id: int, status: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    # Check if current_user is the provider
    if booking.provider_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    booking.status = models.BookingStatus[status.upper()]
    db.commit()
    return booking

# Add cancel logic, etc.
