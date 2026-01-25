from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr

from pydantic import BaseModel
from pydantic import ConfigDict


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

class UserBasic(BaseModel):
    id: int
    name: str
    department_name: Optional[str]

    class Config:
        orm_mode = True



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


class LeaveCreate(BaseModel):
    leave_type: str
    subject: str
    reason: Optional[str]
    from_date: date
    to_date: date


class LeaveUpdateStatus(BaseModel):
    status: str  # approved or rejected
    approver_id: int  # the user who approves/rejects


class LeaveOut(BaseModel):
    id: int
    leave_type: str
    subject: str
    student_id: int
    hod_id: int
    reason: Optional[str]
    from_date: date
    to_date: date
    overall_status: str
    created_at: datetime

    student: UserBasic

    class Config:
        orm_mode = True

class UserMini(BaseModel):
    name: str
    department_name: str | None = None

    class Config:
        from_attributes = True

class CustomLetterOut(BaseModel):
    id: int

    # ✅ REQUIRED FOR MESSAGE ROUTING
    student_id: int
    receiver_id: int

    to_role: str
    content: str
    status: str

    created_at: datetime
    updated_at: datetime

    # UI convenience
    student: UserMini

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
    vice_principal_name: Optional[str] = None
    vice_principal_email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

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




class CertificateApprovalOut(BaseModel):
    approver_id: int
    approver_role: str
    status: str
    remarks: Optional[str]
    acted_at: Optional[datetime]

    class Config:
        orm_mode = True


class CertificateRequestCreate(BaseModel):
    certificates: List[str]
    purpose: Optional[str] = None

class CertificateRequestOut(BaseModel):
    id: int
    student_id: int
    certificates: List[str]
    purpose: Optional[str]
    overall_status: str
    created_at: datetime

    class Config:
        from_attributes = True   # ✅ Pydantic v2 fix


class UnifiedRequestOut(BaseModel):
    id: int
    sender: str
    type: str
    subject: str
    created_at: datetime
    overall_status: str
    view_url: str

    class Config:
        from_attributes = True


class DecisionSchema(BaseModel):
    status: str  # approved | rejected
    remarks: Optional[str] = None

class CustomLetterCreate(BaseModel):
    to_role: str
    content: str


class CustomLetterOut(BaseModel):
    id: int
    student_id: int
    receiver_id: int
    to_role: str
    content: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    receiver_id: int
    content: str
