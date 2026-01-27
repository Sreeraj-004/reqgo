from fastapi import WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
import jwt

from ..database import get_db
from .. import models
from ..config import JWT_SECRET_KEY, JWT_ALGORITHM



class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        self.active_connections.pop(user_id, None)

    async def notify(self, user_id: int, payload: dict):
        websocket = self.active_connections.get(user_id)
        if websocket:
            await websocket.send_json(payload)


manager = ConnectionManager()


def get_current_user_ws(websocket: WebSocket, db: Session):
    token = websocket.query_params.get("token")
    if not token:
        raise WebSocketDisconnect()

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
        )
        user_id = payload.get("sub")
    except jwt.PyJWTError:
        raise WebSocketDisconnect()

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if not user:
        raise WebSocketDisconnect()

    return user
