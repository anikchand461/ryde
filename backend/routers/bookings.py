from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Booking, User
from ..schemas import BookingBase, BookingResponse
from ..auth import get_current_user
from ..notifications import send_notification
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/book")
async def create_booking(booking: BookingBase, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Only owners can book")
    new_booking = Booking(**booking.dict(), user_id=current_user.id)
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    # Simulate send to provider after 2 min
    await send_notification(booking.provider_id, f"New booking: {new_booking.id}")
    return BookingResponse.from_orm(new_booking)

@router.put("/booking/{booking_id}/cancel")
async def cancel_booking(booking_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.user_id == current_user.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if datetime.now() - booking.created_at > timedelta(minutes=2):
        raise HTTPException(status_code=403, detail="Cannot cancel after 2 minutes")
    booking.status = "cancelled"
    db.commit()
    await send_notification(booking.provider_id, f"Booking {booking_id} cancelled")
    return {"message": "Cancelled"}

@router.put("/booking/{booking_id}/accept")
async def accept_booking(booking_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking or current_user.id != booking.provider_id:
        raise HTTPException(status_code=404, detail="Booking not found or not yours")
    booking.status = "accepted"
    db.commit()
    await send_notification(booking.user_id, f"Booking {booking_id} accepted")
    return {"message": "Accepted"}

@router.put("/booking/{booking_id}/reject")
async def reject_booking(booking_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking or current_user.id != booking.provider_id:
        raise HTTPException(status_code=404, detail="Booking not found or not yours")
    booking.status = "rejected"
    db.commit()
    await send_notification(booking.user_id, f"Booking {booking_id} rejected")
    return {"message": "Rejected"}

@router.get("/bookings")
def get_bookings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "owner":
        bookings = db.query(Booking).filter(Booking.user_id == current_user.id).all()
    else:
        bookings = db.query(Booking).filter(Booking.provider_id == current_user.id).all()
    return [BookingResponse.from_orm(b) for b in bookings]