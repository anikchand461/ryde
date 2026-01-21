from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from .database import engine
from .models import Base
from .notifications import connected_clients, send_notification
from .routers import users, bookings, providers
import uvicorn

app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create DB tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(users.router, prefix="/users")
app.include_router(bookings.router, prefix="/bookings")
app.include_router(providers.router, prefix="/providers")

# Serve frontend
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await websocket.accept()
    connected_clients[user_id] = websocket
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        del connected_clients[user_id]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)