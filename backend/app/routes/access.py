from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.main import get_current_user

router = APIRouter(prefix="/access", tags=["Access Requests"])


@router.get("/pending")
def get_pending_access_requests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # 🔐 Only principal allowed
    if current_user.role != "principal":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only principals can view access requests",
        )

    # 🏫 Get principal's college
    college = (
        db.query(models.College)
        .filter(models.College.principal_id == current_user.id)
        .first()
    )

    if not college:
        return []

    # 🧠 Fetch pending users from same college
    pending_users = (
        db.query(models.User)
        .filter(
            models.User.college_name == college.name,
            models.User.access_status == "pending",
            models.User.id != current_user.id,
        )
        .all()
    )

    # 🎁 Shape data for frontend
    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "department": user.department_name,
        }
        for user in pending_users
    ]
