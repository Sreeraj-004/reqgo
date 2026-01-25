from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text, func, JSON
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="student")  # student, faculty, admin

    leave_requests = relationship(
        "LeaveRequest",
        back_populates="student",
        foreign_keys="LeaveRequest.student_id",
    )
    approvals = relationship(
        "LeaveRequest",
        back_populates="approver",
        foreign_keys="LeaveRequest.approver_id",
    )
    certificate_requests = relationship(
    "CertificateRequest",
    back_populates="student",
    cascade="all, delete-orphan",
    )
    custom_letters = relationship(
        "CustomLetterRequest",
        back_populates="student",
        cascade="all, delete-orphan",
    )


class College(Base):
    """A simple college model. One principal owns a college."""

    __tablename__ = "colleges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    zip_code = Column(String(20), nullable=False)
    departments = Column(Text, nullable=True)  # store as comma-separated values
    principal_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    principal = relationship("User")
    department_list = relationship("departments", back_populates="college", cascade="all, delete-orphan")


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    hod_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    approver_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    leave_type = Column(String(50), nullable=False)
    subject = Column(String(255), nullable=False)
    body = Column(Text, nullable=True)
    reason = Column(Text, nullable=True)

    from_date = Column(Date, nullable=False)
    to_date = Column(Date, nullable=False)

    overall_status = Column(
        String(20),
        nullable=False,
        default="draft",
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    student = relationship(
        "User",
        foreign_keys=[student_id],
    )

    hod = relationship(
        "User",
        foreign_keys=[hod_id],
    )

    approver = relationship(
        "User",
        foreign_keys=[approver_id],
    )


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)

    sender_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    receiver_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    message = Column(Text, nullable=False)

    message_type = Column(
        String(20),
        nullable=False,
        default="user",
    )  # user / system

    related_entity_type = Column(
        String(50),
        nullable=True,
    )  # leave_request / certificate_request / custom_letter

    related_entity_id = Column(
        Integer,
        nullable=True,
    )

    is_read = Column(
        Integer,
        nullable=False,
        default=0,
    )  # 0 = unread, 1 = read

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    sender = relationship(
        "User",
        foreign_keys=[sender_id],
    )

    receiver = relationship(
        "User",
        foreign_keys=[receiver_id],
    )


class CertificateRequest(Base):
    __tablename__ = "certificate_requests"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    hod_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    principal_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    certificates = Column(Text, nullable=False)
    purpose = Column(Text, nullable=True)

    overall_status = Column(
        String(20),
        nullable=False,
        default="in_progress",
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    student = relationship(
        "User",
        foreign_keys=[student_id],
    )

    hod = relationship(
        "User",
        foreign_keys=[hod_id],
    )

    principal = relationship(
        "User",
        foreign_keys=[principal_id],
    )

    approvals = relationship(
        "CertificateApproval",
        back_populates="request",
        cascade="all, delete-orphan",
    )


class CertificateApproval(Base):
    __tablename__ = "certificate_approvals"

    id = Column(Integer, primary_key=True, index=True)

    request_id = Column(
        Integer,
        ForeignKey("certificate_requests.id"),
        nullable=False,
    )

    approver_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    # hod / vice_principal / principal
    approver_role = Column(String(50), nullable=False)

    # pending / approved / rejected / forwarded
    status = Column(String(20), nullable=False, default="pending")

    remarks = Column(Text, nullable=True)

    acted_at = Column(DateTime(timezone=True), nullable=True)

    # relationships
    request = relationship("CertificateRequest", back_populates="approvals")
    approver = relationship("User")



class departments(Base):
    """Department model. Each department belongs to a college."""

    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    college = relationship("College", back_populates="department_list")
    access_requests = relationship("AccessRequest", back_populates="department")


class AccessRequest(Base):
    """
    Generic access request for:
    - vice_principal
    - hod
    - student
    """

    __tablename__ = "access_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role_requested = Column(String(50), nullable=False)
    college_name = Column(String(255), nullable=False)
    department_name = Column(String(255), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(20), nullable=False, default="pending")  # pending/approved/rejected

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    department = relationship("departments", back_populates="access_requests")


class CustomLetterRequest(Base):
    __tablename__ = "custom_letter_requests"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    receiver_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    to_role = Column(String(50), nullable=False)

    content = Column(Text, nullable=False)

    status = Column(
        String(20),
        nullable=False,
        default="draft",
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    student = relationship(
        "User",
        foreign_keys=[student_id],
    )

    receiver = relationship(
        "User",
        foreign_keys=[receiver_id],
    )
