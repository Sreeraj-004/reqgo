from app import models
from sqlalchemy.orm import Session


def send_system_message(
    *,
    db: Session,
    sender_id: int,
    receiver_id: int,
    text: str,
):
    msg = models.Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        content=text,
    )

    db.add(msg)
    db.commit()
