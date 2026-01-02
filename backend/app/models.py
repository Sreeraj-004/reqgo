from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="student")  # student, faculty, admin
    
    # College and department assignment
    college_name = Column(String(255), nullable=True)
    department_name = Column(String(255), nullable=True)
    access_status = Column(String(20), nullable=True, default="pending")  # pending/approved/rejected

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


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    approver_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    leave_type = Column(String(50), nullable=False)  # emergency, medical, personal, wedding
    subject = Column(String(255), nullable=False)
    body = Column(Text, nullable=True)
    reason = Column(Text, nullable=True)

    from_date = Column(Date, nullable=False)
    to_date = Column(Date, nullable=False)

    # Simple overall status for the request
    # pending -> approved / rejected
    status = Column(
        String(20),
        nullable=False,
        default="pending",
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
        back_populates="leave_requests",
    )
    approver = relationship(
        "User",
        foreign_keys=[approver_id],
        back_populates="approvals",
    )


class LeaveMessage(Base):
    __tablename__ = "leave_messages"

    id = Column(Integer, primary_key=True, index=True)
    leave_id = Column(Integer, ForeignKey("leave_requests.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    leave = relationship("LeaveRequest", backref="messages")
    sender = relationship("User")




