from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Optional


import jwt
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, FastAPI, HTTPException, status
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.orm import Session

from . import models, schemas

from app.models import (
    LeaveRequest,
    LeaveApproval,
    CertificateRequest,
    CertificateApproval,
    CustomLetterRequest,
)
from .database import Base, engine, get_db

from fastapi.middleware.cors import CORSMiddleware


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# In production, read these from environment variables instead of hardcoding.
JWT_SECRET_KEY = "CHANGE_THIS_SECRET_KEY_IN_PRODUCTION"
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60

app = FastAPI(title="College Management & Leave API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user



@app.on_event("startup")
def on_startup() -> None:
    # Create tables if they don't exist. For production, prefer Alembic migrations.
    Base.metadata.create_all(bind=engine)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def create_jwt_for_user(user: models.User) -> str:
    """Create a very simple JWT containing the user id, email and role."""
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "exp": expire,
    }
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token


@app.post("/users/", response_model=schemas.AuthResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered.",
        )

    hashed_password = get_password_hash(user_in.password)
    user = models.User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hashed_password,
        role=user_in.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    jwt_token = create_jwt_for_user(user)

    return schemas.AuthResponse(
        message="Signup successful",
        jwt_token=jwt_token,
        user=user,
    )

# ---------------------------------------------------------
# College registration and access requests
# ---------------------------------------------------------


@app.post("/colleges/register", response_model=schemas.CollegeOut)
def register_college(
    data: schemas.CollegeRegisterRequest,
    db: Session = Depends(get_db),
):
    """
    Only a Principal can register a college.
    This should be called after signup, from the Principal's flow.
    """
    principal = db.query(models.User).filter(models.User.id == data.principal_id).first()
    if not principal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Principal user not found",
        )
    if principal.role != "principal":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only a Principal can register a college.",
        )

    existing = db.query(models.College).filter(models.College.name == data.college_name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A college with this name already exists.",
        )

    departments_str = ",".join(data.departments) if data.departments else ""

    college = models.College(
        name=data.college_name,
        address=data.address,
        city=data.city,
        zip_code=data.zip_code,
        departments=departments_str,
        principal_id=principal.id,
    )
    db.add(college)
    db.commit()
    db.refresh(college)

    principal.college_name = college.name
    principal.department_name = None
    principal.access_status = "approved"

    db.commit()
    db.refresh(principal)

    return schemas.CollegeOut(
        id=college.id,
        name=college.name,
        address=college.address,
        city=college.city,
        zip_code=college.zip_code,
        departments=college.departments,
        principal_name=principal.name,
        principal_email=principal.email,
        vice_principal_name=None,
        vice_principal_email=None,
    )



@app.post("/access/vice-principal", response_model=schemas.UserProfile)
def request_vice_principal_access(
    data: schemas.VicePrincipalAccessRequest,
    db: Session = Depends(get_db),
):
    """
    Vice Principal Access Page:
    - user selects an existing college
    - submits a request that will be approved by the Principal
    """
    user = db.query(models.User).filter(models.User.id == data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    if user.role != "vice_principal":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is only for vice principals.",
        )

    college = db.query(models.College).filter(models.College.name == data.college_name).first()
    if not college:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="College does not exist. A Principal must register it first.",
        )

    # Update user's college and set access status to pending
    user.college_name = data.college_name
    user.department_name = None
    user.access_status = "pending"
    
    db.commit()
    db.refresh(user)

    return user


@app.post("/access/hod", response_model=schemas.UserProfile)
def request_hod_access(
    data: schemas.HODAccessRequest,
    db: Session = Depends(get_db),
):
    """
    HOD Access Page:
    - user chooses a college and department
    - request must be approved by Principal or Vice Principal
    """
    user = db.query(models.User).filter(models.User.id == data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    if user.role != "hod":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is only for HOD users.",
        )

    college = db.query(models.College).filter(models.College.name == data.college_name).first()
    if not college:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="College does not exist. A Principal must register it first.",
        )

    # Update user's college and department, set access status to pending
    user.college_name = data.college_name
    user.department_name = data.department_name
    user.access_status = "pending"
    
    db.commit()
    db.refresh(user)

    return user


@app.post("/access/student", response_model=schemas.UserProfile)
def request_student_access(
    data: schemas.StudentAccessRequest,
    db: Session = Depends(get_db),
):
    """
    Student Access Page:
    - user chooses a college and department
    - request must be approved before access is granted
    """
    user = db.query(models.User).filter(models.User.id == data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    if user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is only for student users.",
        )

    college = db.query(models.College).filter(models.College.name == data.college_name).first()
    if not college:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="College does not exist. A Principal must register it first.",
        )

    # Update user's college and department, set access status to pending
    user.college_name = data.college_name
    user.department_name = data.department_name
    user.access_status = "pending"
    
    db.commit()
    db.refresh(user)

    return user


@app.post("/auth/login", response_model=schemas.AuthResponse)
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, credentials.email)
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    jwt_token = create_jwt_for_user(user)

    return schemas.AuthResponse(
        message="Login successful",
        jwt_token=jwt_token,
        user=user,
    )


@app.post("/leaves/", response_model=schemas.LeaveOut, status_code=201)
def create_leave_request(
    leave_in: schemas.LeaveCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can request leave")

    leave = models.LeaveRequest(
        student_id=current_user.id,
        leave_type=leave_in.leave_type,
        subject=leave_in.subject,
        reason=leave_in.reason,
        from_date=leave_in.from_date,
        to_date=leave_in.to_date,
        overall_status="in_progress",
    )

    db.add(leave)
    db.commit()
    db.refresh(leave)

    return leave


@app.get("/leaves/", response_model=List[schemas.LeaveOut])
def list_leave_requests(
    status_filter: Optional[str] = None,
    student_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """
    List leave requests.

    - status_filter: "pending", "approved" or "rejected"
    - student_id: filter leaves created by one student/user
    """
    query = db.query(models.LeaveRequest)
    if status_filter:
        query = query.filter(models.LeaveRequest.status == status_filter)
    if student_id:
        query = query.filter(models.LeaveRequest.student_id == student_id)
    return query.order_by(models.LeaveRequest.created_at.desc()).all()


# ---------------------------------------------------------
# Simple dashboard helpers for each role
# ---------------------------------------------------------


@app.get("/dashboard/principal/leaves", response_model=List[schemas.LeaveOut])
def principal_dashboard_leaves(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Principal dashboard:
    - See leave requests created by vice-principals (their decisions).
    """
    query = (
        db.query(models.LeaveRequest)
        .join(models.User, models.LeaveRequest.student_id == models.User.id)
        .filter(models.User.role == "vice_principal")
    )
    if status_filter:
        query = query.filter(models.LeaveRequest.status == status_filter)
    return query.order_by(models.LeaveRequest.created_at.desc()).all()


@app.get("/dashboard/vice-principal/leaves", response_model=List[schemas.LeaveOut])
def vice_principal_dashboard_leaves(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Vice-Principal dashboard:
    - See leave requests created by HODs.
    """
    query = (
        db.query(models.LeaveRequest)
        .join(models.User, models.LeaveRequest.student_id == models.User.id)
        .filter(models.User.role == "hod")
    )
    if status_filter:
        query = query.filter(models.LeaveRequest.status == status_filter)
    return query.order_by(models.LeaveRequest.created_at.desc()).all()


@app.get("/dashboard/hod/leaves", response_model=List[schemas.LeaveOut])
def hod_dashboard_leaves(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    HOD dashboard:
    - See leave requests created by students.
    """
    query = (
        db.query(models.LeaveRequest)
        .join(models.User, models.LeaveRequest.student_id == models.User.id)
        .filter(models.User.role == "student")
    )
    if status_filter:
        query = query.filter(models.LeaveRequest.status == status_filter)
    return query.order_by(models.LeaveRequest.created_at.desc()).all()


@app.get("/leaves/{leave_id}", response_model=schemas.LeaveOut)
def get_leave_request(leave_id: int, db: Session = Depends(get_db)):
    leave = db.query(models.LeaveRequest).filter(models.LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found",
        )
    return leave


@app.put("/leaves/{leave_id}/status", response_model=schemas.LeaveOut)
def update_leave_status(
    leave_id: int,
    status_update: schemas.LeaveUpdateStatus,
    db: Session = Depends(get_db),
):
    leave = db.query(models.LeaveRequest).filter(models.LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found",
        )

    if status_update.status not in {"approved", "rejected"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status value",
        )

    # Who is approving?
    approver = db.query(models.User).filter(models.User.id == status_update.approver_id).first()
    if not approver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Approver user not found",
        )

    # Whose leave is this (what role made the request)?
    requester = db.query(models.User).filter(models.User.id == leave.student_id).first()
    if not requester:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requesting user not found",
        )

    # Simple hierarchy:
    # - Principal can approve vice-principal requests
    # - Vice-principal can approve HOD requests
    # - HOD can approve student requests
    if requester.role == "vice_principal" and approver.role != "principal":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the Principal can approve vice-principal requests.",
        )
    if requester.role == "hod" and approver.role != "vice_principal":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the Vice-Principal can approve HOD requests.",
        )
    if requester.role == "student" and approver.role != "hod":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the HOD can approve student requests.",
        )

    leave.status = status_update.status
    leave.approver_id = approver.id

    db.commit()
    db.refresh(leave)
    return leave


@app.post("/leaves/{leave_id}/messages", response_model=schemas.MessageOut, status_code=status.HTTP_201_CREATED)
def create_leave_message(
    leave_id: int,
    message_in: schemas.MessageCreate,
    db: Session = Depends(get_db),
):
    leave = db.query(models.LeaveRequest).filter(models.LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found",
        )

    sender = db.query(models.User).filter(models.User.id == message_in.sender_id).first()
    if not sender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sender user not found",
        )

    msg = models.LeaveMessage(
        leave_id=leave_id,
        sender_id=message_in.sender_id,
        content=message_in.content,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


@app.get("/leaves/{leave_id}/messages", response_model=List[schemas.MessageOut])
def list_leave_messages(leave_id: int, db: Session = Depends(get_db)):
    leave = db.query(models.LeaveRequest).filter(models.LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found",
        )

    messages = (
        db.query(models.LeaveMessage)
        .filter(models.LeaveMessage.leave_id == leave_id)
        .order_by(models.LeaveMessage.created_at.asc())
        .all()
    )
    return messages


@app.get("/leaves/{leave_id}/letter")
def get_leave_letter(leave_id: int, db: Session = Depends(get_db)):
    leave = db.query(models.LeaveRequest).filter(models.LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found",
        )

    student = db.query(models.User).filter(models.User.id == leave.student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student user not found",
        )

    body = render_leave_body(
        leave_type=leave.leave_type,
        student_name=student.name,
        reason=leave.reason,
        from_date=str(leave.from_date),
        to_date=str(leave.to_date),
    )
    return {"letter": body}

@app.get("/colleges/", response_model=List[schemas.CollegeOut])
def list_colleges(db: Session = Depends(get_db)):
    colleges = db.query(models.College).all()
    result = []

    for c in colleges:
        vp = (
            db.query(models.User)
            .filter(
                models.User.role == "vice_principal",
                models.User.college_name == c.name,
                models.User.access_status == "approved",
            )
            .first()
        )

        result.append({
            "id": c.id,
            "name": c.name,
            "address": c.address,
            "city": c.city,
            "zip_code": c.zip_code,
            "departments": c.departments,
            "principal_name": c.principal.name,
            "principal_email": c.principal.email,
            "vice_principal_name": vp.name if vp else None,
            "vice_principal_email": vp.email if vp else None,
        })

    return result



def render_leave_body(
    leave_type: str,
    student_name: str,
    reason: Optional[str],
    from_date: str,
    to_date: str,
) -> str:
    """
    Very simple text-template renderer using the .txt files in /templates.
    The templates can use the following placeholders:
      {student_name}, {reason}, {from_date}, {to_date}
    """
    templates_dir = Path(__file__).resolve().parent.parent / "templates"
    template_map = {
        "emergency": "leave_emergency.txt",
        "medical": "leave_medical.txt",
        "personal": "leave_personal.txt",
        "wedding": "leave_wedding.txt",
    }

    template_name = template_map.get(leave_type.lower())
    # If we do not find a template, use a simple generic body.
    if not template_name:
        return (
            f"Dear Sir/Madam,\n\n"
            f"I, {student_name}, request leave from {from_date} to {to_date}.\n"
            f"Reason: {reason or 'N/A'}.\n\n"
            f"Thank you.\n"
        )

    template_path = templates_dir / template_name
    if not template_path.exists():
        return (
            f"Dear Sir/Madam,\n\n"
            f"I, {student_name}, request leave from {from_date} to {to_date}.\n"
            f"Reason: {reason or 'N/A'}.\n\n"
            f"Thank you.\n"
        )

    # Read the template exactly as it is in the folder.
    content = template_path.read_text(encoding="utf-8")

    # The current templates use {{from_date}} style placeholders.
    # We replace those placeholders with real values, without changing the files.
    content = content.replace("{{from_date}}", from_date)
    content = content.replace("{{to_date}}", to_date)
    content = content.replace("{{reason}}", reason or "")
    content = content.replace("{{student_name}}", student_name)

    return content


@app.post("/certificate-requests", response_model=schemas.CertificateRequestOut, status_code=201)
def create_certificate_request(
    data: schemas.CertificateRequestCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "student":
        raise HTTPException(403, "Only students can request certificates")

    if not data.certificates or not any(c.strip() for c in data.certificates):
        raise HTTPException(400, "At least one certificate is required")

    request = models.CertificateRequest(
        student_id=current_user.id,
        certificates=",".join(data.certificates),
        purpose=data.purpose,
        overall_status="in_progress",
    )

    db.add(request)
    db.commit()
    db.refresh(request)

    hod = (
        db.query(models.User)
        .filter(
            models.User.role == "hod",
            models.User.college_name == current_user.college_name,
            models.User.department_name == current_user.department_name,
            models.User.access_status == "approved",
        )
        .first()
    )

    if not hod:
        raise HTTPException(400, "HOD not found for your department")

    approval = models.CertificateApproval(
        request_id=request.id,
        approver_id=hod.id,
        approver_role="hod",
        status="pending",
    )

    db.add(approval)
    db.commit()

    # ✅ MANUAL RESPONSE (THIS IS THE KEY)
    return schemas.CertificateRequestOut(
        id=request.id,
        student_id=request.student_id,
        certificates=request.certificates.split(","),
        purpose=request.purpose,
        overall_status=request.overall_status,
        created_at=request.created_at,
    )

@app.post("/certificate-requests/{request_id}/approve")
def approve_certificate_request(
    request_id: int,
    remarks: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    approval = (
        db.query(models.CertificateApproval)
        .filter(
            models.CertificateApproval.request_id == request_id,
            models.CertificateApproval.approver_id == current_user.id,
            models.CertificateApproval.status == "pending",
        )
        .first()
    )

    if not approval:
        raise HTTPException(404, "No pending approval found")

    approval.status = "approved"
    approval.remarks = remarks
    approval.acted_at = datetime.utcnow()

    # Forward logic
    if approval.approver_role == "hod":
        principal = (
            db.query(models.User)
            .filter(
                models.User.college_name == current_user.college_name,
                models.User.role.in_(["principal", "vice_principal"]),
            )
            .first()
        )

        if principal:
            db.add(
                models.CertificateApproval(
                    request_id=request_id,
                    approver_id=principal.id,
                    approver_role=principal.role,
                    status="pending",
                )
            )

    else:
        # Final approval
        approval.request.overall_status = "approved"

    db.commit()
    return {"message": "Certificate request approved"}


#edit - college - get
@app.get("/colleges/by-principal/{principal_id}")
def get_college_by_principal(
    principal_id: int,
    db: Session = Depends(get_db),
):
    college = (
        db.query(models.College)
        .filter(models.College.principal_id == principal_id)
        .first()
    )

    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    return college

@app.put("/colleges/{college_id}")
def update_college(
    college_id: int,
    data: schemas.CollegeUpdate,
    db: Session = Depends(get_db),
):
    college = db.query(models.College).filter(models.College.id == college_id).first()

    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    college.name = data.name
    college.address = data.address
    college.city = data.city
    college.zip_code = data.zip_code
    college.departments = ",".join(data.departments)

    db.commit()
    db.refresh(college)

    return college



# accept and reject access requests
@app.get("/access/pending", response_model=List[schemas.UserProfile])
def get_pending_access_requests(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    print(
    "DEBUG ROLE:", current_user.role,
    "COLLEGE:", current_user.college_name,
    "STATUS:", current_user.access_status
)
    if not current_user.college_name:
        return []

    base_query = db.query(models.User).filter(
        models.User.college_name == current_user.college_name,
        models.User.access_status == "pending",
    )

    role_map = {
        "principal": "vice_principal",
        "vice_principal": "hod",
        "hod": "student",
    }

    target_role = role_map.get(current_user.role)

    if not target_role:
        return []

    users = base_query.filter(models.User.role == target_role).all()
    return users

@app.post("/access/approve/{user_id}")
def approve_access_request(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot approve yourself"
        )

    if user.college_name != current_user.college_name:
        raise HTTPException(
            status_code=403,
            detail="College mismatch"
        )

    if user.access_status != "pending":
        raise HTTPException(
            status_code=400,
            detail="Request is not pending"
        )

    user.access_status = "approved"
    db.commit()

    return {"message": "Access approved"}


@app.post("/access/reject/{user_id}")
def reject_access_request(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot reject yourself"
        )

    if user.college_name != current_user.college_name:
        raise HTTPException(
            status_code=403,
            detail="College mismatch"
        )

    if user.access_status != "pending":
        raise HTTPException(
            status_code=400,
            detail="Request is not pending"
        )

    user.access_status = "rejected"
    user.college_name = None
    user.department_name = None

    db.commit()

    return {"message": "Access rejected"}


@app.get("/requests", response_model=List[schemas.UnifiedRequestOut])
def get_all_requests(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    results = []

    # -------------------------
    # LEAVE REQUESTS
    # -------------------------
    leaves = (
        db.query(models.LeaveRequest)
        .join(models.User, models.LeaveRequest.student_id == models.User.id)
        .all()
    )

    for leave in leaves:
        results.append({
            "id": leave.id,
            "sender": leave.student.name,
            "type": "Leave",
            "subject": leave.subject,
            "created_at": leave.created_at,
            "view_url": f"/leaves/{leave.id}",
        })

    # -------------------------
    # CERTIFICATE REQUESTS
    # -------------------------
    certificates = (
        db.query(models.CertificateRequest)
        .join(models.User, models.CertificateRequest.student_id == models.User.id)
        .all()
    )

    for cert in certificates:
        results.append({
            "id": cert.id,
            "sender": cert.student.name,
            "type": "Certificate",
            "subject": "Certificate Request",
            "created_at": cert.created_at,
            "view_url": f"/certificate-requests/{cert.id}",
        })

    # -------------------------
    # CUSTOM LETTERS
    # -------------------------
    custom_letters = (
        db.query(models.CustomLetterRequest)
        .join(models.User, models.CustomLetterRequest.student_id == models.User.id)
        .all()
    )

    for letter in custom_letters:
        results.append({
            "id": letter.id,
            "sender": letter.student.name,
            "type": "Custom Letter",
            "subject": f"Letter to {letter.to_role}",
            "created_at": letter.created_at,
            "view_url": f"/custom-letters/{letter.id}",
        })

    # -------------------------
    # SORT BY TIME DESC
    # -------------------------
    results.sort(key=lambda x: x["created_at"], reverse=True)

    return results

@app.get("/certificate-requests/{request_id}")
def get_certificate_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    request = (
        db.query(models.CertificateRequest)
        .filter(models.CertificateRequest.id == request_id)
        .first()
    )

    if not request:
        raise HTTPException(status_code=404, detail="Certificate request not found")

    return {
        "id": request.id,
        "type": "Certificate",
        "student": {
            "name": request.student.name,
            "department": request.student.department_name,
        },
        "certificates": request.certificates.split(","),
        "purpose": request.purpose,
        "status": request.overall_status,
        "created_at": request.created_at,
        "approvals": [
            {
                "role": a.approver_role,
                "status": a.status,
                "remarks": a.remarks,
                "acted_at": a.acted_at,
            }
            for a in request.approvals
        ],
    }

@app.get("/certificate-requests/{request_id}")
def get_certificate_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    request = (
        db.query(models.CertificateRequest)
        .filter(models.CertificateRequest.id == request_id)
        .first()
    )

    if not request:
        raise HTTPException(status_code=404, detail="Certificate request not found")

    # Authorization: student can view own request, approvers can view all
    if current_user.role == "student" and request.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return {
        "id": request.id,
        "type": "Certificate",
        "student": {
            "name": request.student.name,
            "department": request.student.department_name,
        },
        "certificates": request.certificates.split(","),
        "purpose": request.purpose,
        "status": request.overall_status,
        "created_at": request.created_at,
        "approvals": [
            {
                "role": a.approver_role,
                "status": a.status,
                "remarks": a.remarks,
                "acted_at": a.acted_at,
            }
            for a in request.approvals
        ],
    }

class DecisionSchema(BaseModel):
    status: str  # approved | rejected
    remarks: Optional[str] = None


@app.post("/leaves/{leave_id}/decision")
def decide_leave_request(
    leave_id: int,
    payload: DecisionSchema,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ["hod", "vice_principal", "principal"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    leave = db.query(LeaveRequest).filter_by(id=leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")

    if leave.overall_status != "in_progress":
        raise HTTPException(status_code=400, detail="Request already decided")

    approval = LeaveApproval(
        leave_id=leave.id,
        approver_id=current_user.id,
        approver_role=current_user.role,
        status=payload.status,
        remarks=payload.remarks,
        acted_at=datetime.utcnow(),
    )

    leave.overall_status = payload.status

    db.add(approval)
    db.commit()

    return {"message": f"Leave request {payload.status}"}

@app.post("/certificate-requests/{request_id}/decision")
def decide_certificate_request(
    request_id: int,
    payload: DecisionSchema,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ["hod", "vice_principal", "principal"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    req = db.query(CertificateRequest).filter_by(id=request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Certificate request not found")

    if req.overall_status != "in_progress":
        raise HTTPException(status_code=400, detail="Request already decided")

    approval = CertificateApproval(
        request_id=req.id,
        approver_id=current_user.id,
        approver_role=current_user.role,
        status=payload.status,
        remarks=payload.remarks,
        acted_at=datetime.utcnow(),
    )

    req.overall_status = payload.status

    db.add(approval)
    db.commit()

    return {"message": f"Certificate request {payload.status}"}

