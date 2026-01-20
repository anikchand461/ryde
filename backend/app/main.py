# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, users, repair, towing, bookings

app = FastAPI()

origins = ["*"]  # Allow all origins for simplicity

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(repair.router)
app.include_router(towing.router)
app.include_router(bookings.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}
