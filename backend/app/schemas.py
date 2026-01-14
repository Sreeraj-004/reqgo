from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "student"


class UserProfile(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    college_name: Optional[str] = None
    department_name: Optional[str] = None
    access_status: Optional[str] = None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    message: str
    jwt_token: str
    user: UserProfile


class LeaveBase(BaseModel):
    leave_type: str  # emergency, medical, personal, wedding
    subject: str
    reason: Optional[str] = None
    from_date: date
    to_date: date


class LeaveCreate(LeaveBase):
    student_id: int


class LeaveUpdateStatus(BaseModel):
    status: str  # approved or rejected
    approver_id: int  # the user who approves/rejects


class LeaveOut(LeaveBase):
    id: int
    student_id: int
    approver_id: Optional[int] = None
    status: str
    body: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    sender_id: int
    content: str


class MessageOut(BaseModel):
    id: int
    leave_id: int
    sender_id: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class CollegeRegisterRequest(BaseModel):
    principal_id: int
    college_name: str
    address: str
    city: str
    zip_code: str
    departments: List[str]


class CollegeOut(BaseModel):
    id: int
    name: str
    address: str
    city: str
    zip_code: str
    departments: Optional[str]

    principal_name: str
    principal_email: str

    vice_principal_name: Optional[str]
    vice_principal_email: Optional[str]

    class Config:
        orm_mode = True


class VicePrincipalAccessRequest(BaseModel):
    user_id: int
    college_name: str


class HODAccessRequest(BaseModel):
    user_id: int
    college_name: str
    department_name: str


class StudentAccessRequest(BaseModel):
    user_id: int
    college_name: str
    department_name: str


class AccessRequestOut(BaseModel):
    id: int
    user_id: int
    role_requested: str
    college_name: str
    department_name: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class CollegeUpdate(BaseModel):
    name: str
    address: str
    city: str
    zip_code: str
    departments: List[str]

