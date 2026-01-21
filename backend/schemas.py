from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class UserBase(BaseModel):
	name: str
	email: str
	phone: str
	role: str
	password: str
	vehicle_type: Optional[str] = None
	vehicle_name: Optional[str] = None
	vehicle_model: Optional[str] = None
	vehicle_registration: Optional[str] = None


class VehicleBase(BaseModel):
	type: str
	name: str
	model: str
	registration: str


class RepairProviderBase(BaseModel):
	vehicle_types: List[str]
	breakdowns: Dict[str, List[str]]
	lat: float
	lng: float
	timings: str
	shop_name: str
	email: str
	phone: str
	amenities: List[str]


class TowingProviderBase(BaseModel):
	vehicle_types: List[str]
	capabilities: List[str]
	lat: float
	lng: float
	radius: float
	timings: str
	provider_name: str
	email: str
	phone: str
	capacity: str
	additional_services: List[str]


class BookingBase(BaseModel):
	provider_id: int
	type: str
	breakdown_type: str
	description: str
	lat: float
	lng: float
	reason: Optional[str] = None


class BookingResponse(BookingBase):
	id: int
	user_id: int
	status: str
	created_at: datetime

	class Config:
		orm_mode = True


class ProviderResponse(BaseModel):
	id: int  # provider user id used for booking
	provider_record_id: int
	name: str
	lat: float
	lng: float
	distance: float
	details: Dict[str, Any]

	class Config:
		orm_mode = True


class Token(BaseModel):
	access_token: str
	token_type: str
	user_id: int
	role: str
	vehicle_type: Optional[str] = None
