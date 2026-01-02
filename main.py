from fastapi import FastAPI, Depends, Request, Form, Cookie, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
import os

# IMPORT YOUR EXISTING SETUP
from database import SessionLocal
from models import User, College, LeaveRequest, LeaveHistory
from auth import hash_password, verify_password

app = FastAPI()
templates = Jinja2Templates(directory="templates")

# ---------------- DB DEP ----------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------- LEAVE TEMPLATE LOADER ----------------
# ✅ THIS IS THE NEW PART YOU ASKED FOR

def load_leave_template(leave_type, from_date, to_date):
    file_map = {
        "medical": "templates/leave_medical.txt",
        "wedding": "templates/leave_wedding.txt",
        "personal": "templates/leave_personal.txt",
        "emergency": "templates/leave_emergency.txt"
    }

    path = file_map.get(leave_type.lower())
    if not path or not os.path.exists(path):
        return "Leave letter template not found."

    with open(path, "r") as f:
        content = f.read()

    return content.replace("{{from_date}}", from_date)\
                  .replace("{{to_date}}", to_date)

# ---------------- HOME ----------------

@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse(
        "home.html",
        {"request": request}
    )

# ---------------- LOGIN ----------------

@app.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.post("/login")
def login_submit(
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter_by(email=email).first()

    if not user or not verify_password(password, user.password):
        return RedirectResponse("/login?error=1", status_code=303)

    if user.status != "ACTIVE":
        return RedirectResponse("/login?pending=1", status_code=303)

    response = RedirectResponse("/dashboard", status_code=303)
    response.set_cookie("user_id", str(user.id))
    return response

# ---------------- SIGNUP ----------------

@app.get("/signup", response_class=HTMLResponse)
def signup_page(request: Request, db: Session = Depends(get_db)):
    colleges = db.query(College).all()
    return templates.TemplateResponse(
        "signup.html",
        {"request": request, "colleges": colleges}
    )

@app.post("/signup")
def signup_submit(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    role: str = Form(...),
    college_id: int = Form(None),
    college_name: str = Form(None),
    db: Session = Depends(get_db)
):
    hashed = hash_password(password)

    if role == "PRINCIPAL":
        college = College(name=college_name)
        db.add(college)
        db.commit()
        db.refresh(college)

        user = User(
            name=name,
            email=email,
            password=hashed,
            role="PRINCIPAL",
            college_id=college.id,
            status="ACTIVE"
        )
        db.add(user)
        db.commit()
        college.principal_id = user.id
        db.commit()
    else:
        user = User(
            name=name,
            email=email,
            password=hashed,
            role=role,
            college_id=college_id,
            status="PENDING"
        )
        db.add(user)
        db.commit()

    return RedirectResponse("/login", status_code=303)

# ---------------- DASHBOARD ----------------

@app.get("/dashboard", response_class=HTMLResponse)
def dashboard(
    request: Request,
    user_id: int = Cookie(None),
    db: Session = Depends(get_db)
):
    if not user_id:
        return RedirectResponse("/login", status_code=303)

    user = db.query(User).get(user_id)
    return templates.TemplateResponse(
        "dashboard.html",
        {"request": request, "user": user}
    )

# ---------------- APPLY LEAVE (UPDATED) ----------------
# ✅ LEAVE LETTER GENERATED HERE

@app.post("/leave/apply")
def apply_leave(
    leave_type: str = Form(...),
    from_date: str = Form(...),
    to_date: str = Form(...),
    user_id: int = Cookie(...),
    db: Session = Depends(get_db)
):
    student = db.query(User).get(user_id)

    letter_text = load_leave_template(leave_type, from_date, to_date)

    leave = LeaveRequest(
        student_id=student.id,
        college_id=student.college_id,
        leave_type=leave_type,
        from_date=from_date,
        to_date=to_date,
        status="PENDING",
        current_level="TUTOR"
    )
    db.add(leave)
    db.commit()

    # History: submission
    db.add(LeaveHistory(
        leave_id=leave.id,
        actor_role="STUDENT",
        message="Leave submitted"
    ))

    # History: generated letter (SYSTEM message)
    db.add(LeaveHistory(
        leave_id=leave.id,
        actor_role="SYSTEM",
        message=letter_text
    ))

    db.commit()
    return RedirectResponse("/dashboard", status_code=303)

# ---------------- INBOX ----------------

@app.get("/inbox", response_class=HTMLResponse)
def inbox(
    request: Request,
    user_id: int = Cookie(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).get(user_id)

    leaves = db.query(LeaveRequest).filter_by(
        current_level=user.role,
        status="PENDING"
    ).all()

    return templates.TemplateResponse(
        "inbox.html",
        {"request": request, "leaves": leaves, "user": user}
    )

# ---------------- APPROVE LEAVE ----------------

@app.post("/leave/approve")
def approve_leave(
    leave_id: int = Form(...),
    user_id: int = Cookie(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).get(user_id)
    leave = db.query(LeaveRequest).get(leave_id)

    flow = {
        "TUTOR": "HOD",
        "HOD": "PRINCIPAL",
        "PRINCIPAL": None
    }

    if leave.current_level != user.role:
        raise HTTPException(403, "Not allowed")

    next_level = flow[user.role]
    if next_level:
        leave.current_level = next_level
    else:
        leave.status = "APPROVED"
        leave.current_level = None

    db.add(LeaveHistory(
        leave_id=leave.id,
        actor_role=user.role,
        message="Approved"
    ))
    db.commit()

    return RedirectResponse("/inbox", status_code=303)

# ---------------- REJECT LEAVE ----------------

@app.post("/leave/reject")
def reject_leave(
    leave_id: int = Form(...),
    reason: str = Form(...),
    user_id: int = Cookie(...),
    db: Session = Depends(get_db)
):
    if not reason:
        raise HTTPException(400, "Reason required")

    user = db.query(User).get(user_id)
    leave = db.query(LeaveRequest).get(leave_id)

    leave.status = "REJECTED"
    leave.current_level = None

    db.add(LeaveHistory(
        leave_id=leave.id,
        actor_role=user.role,
        message=f"Rejected: {reason}"
    ))
    db.commit()

    return RedirectResponse("/inbox", status_code=303)

# ---------------- VIEW LEAVE + LETTER ----------------

@app.get("/leave/{leave_id}", response_class=HTMLResponse)
def view_leave(
    leave_id: int,
    request: Request,
    user_id: int = Cookie(...),
    db: Session = Depends(get_db)
):
    history = db.query(LeaveHistory).filter_by(leave_id=leave_id).all()

    letter = next(
        (h.message for h in history if h.actor_role == "SYSTEM"),
        "Letter not available"
    )

    return templates.TemplateResponse(
        "leave_view.html",
        {
            "request": request,
            "history": history,
            "letter": letter
        }
    )

# ---------------- LOGOUT ----------------

@app.get("/logout")
def logout():
    response = RedirectResponse("/", status_code=303)
    response.delete_cookie("user_id")
    return response
