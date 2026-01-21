connected_clients = {}


async def send_notification(user_id: int, message: str):
    websocket = connected_clients.get(user_id)
    if websocket:
        await websocket.send_text(message)
