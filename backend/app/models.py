from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="student")

    college_name = Column(String(255), nullable=True)
    department_name = Column(String(255), nullable=True)
    access_status = Column(String(20), nullable=False, default="pending")

    # ======================
    # LEAVE RELATIONSHIPS
    # ======================

    leave_requests = relationship(
        "LeaveRequest",
        back_populates="student",
        foreign_keys="LeaveRequest.student_id",
        cascade="all, delete-orphan",
    )

    leave_approvals = relationship(
        "LeaveApproval",
        back_populates="approver",
        foreign_keys="LeaveApproval.approver_id",
    )

    # ======================
    # CERTIFICATE RELATIONSHIPS ✅ ADD THIS
    # ======================

    certificate_requests = relationship(
        "CertificateRequest",
        foreign_keys="CertificateRequest.student_id",
        back_populates="student",
        cascade="all, delete-orphan",
    )

    certificate_approvals = relationship(
        "CertificateApproval",
        back_populates="approver",
        foreign_keys="CertificateApproval.approver_id",
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
    hod_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    leave_type = Column(String(50), nullable=False)
    subject = Column(String(255), nullable=False)
    body = Column(Text, nullable=True)
    reason = Column(Text, nullable=True)

    from_date = Column(Date, nullable=False)
    to_date = Column(Date, nullable=False)

    # draft → in_progress → approved / rejected
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

    # relationships
    student = relationship(
        "User",
        foreign_keys=[student_id],
        back_populates="leave_requests",
    )

    approvals = relationship(
        "LeaveApproval",
        back_populates="leave",
        cascade="all, delete-orphan",
    )

class LeaveApproval(Base):
    __tablename__ = "leave_approvals"

    id = Column(Integer, primary_key=True, index=True)

    leave_id = Column(Integer, ForeignKey("leave_requests.id"), nullable=False)
    approver_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # hod / vice_principal / principal
    approver_role = Column(String(50), nullable=False)

    # pending / approved / rejected / forwarded
    status = Column(String(20), nullable=False, default="pending")

    remarks = Column(Text, nullable=True)

    acted_at = Column(DateTime(timezone=True), nullable=True)

    # relationships
    leave = relationship(
        "LeaveRequest",
        back_populates="approvals",
    )

    approver = relationship(
        "User",
        foreign_keys=[approver_id],
        back_populates="leave_approvals",
    )


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)

    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    content = Column(Text, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])



class CertificateRequest(Base):
    __tablename__ = "certificate_requests"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Comma-separated certificate names
    certificates = Column(Text, nullable=False)

    purpose = Column(Text, nullable=True)
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

    # in_progress → approved → rejected
    overall_status = Column(
        String(20),
        nullable=False,
        default="in_progress",
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # relationships
    student = relationship(
        "User",
        foreign_keys=[student_id],
        back_populates="certificate_requests",
    )

    approvals = relationship(
        "CertificateApproval",
        back_populates="request",
        cascade="all, delete-orphan",
        order_by="CertificateApproval.id",
    )

class CertificateApproval(Base):
    __tablename__ = "certificate_approvals"

    id = Column(Integer, primary_key=True, index=True)

    request_id = Column(
        Integer,
        ForeignKey("certificate_requests.id", ondelete="CASCADE"),
        nullable=False,
    )

    approver_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    # hod / vice_principal / principal
    approver_role = Column(String(50), nullable=False)

    # pending / approved / rejected
    status = Column(String(20), nullable=False, default="pending")

    remarks = Column(Text, nullable=True)

    acted_at = Column(DateTime(timezone=True), nullable=True)

    # relationships
    request = relationship("CertificateRequest", back_populates="approvals")

    approver = relationship("User")

class CustomLetterRequest(Base):
    __tablename__ = "custom_letter_requests"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    receiver_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    to_role = Column(String(50), nullable=False)  # principal / vice_principal / hod
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

    # ✅ EXPLICIT RELATIONSHIPS (THIS IS THE KEY)
    student = relationship(
        "User",
        foreign_keys=[student_id],
        backref="custom_letter_requests",
    )

    receiver = relationship(
        "User",
        foreign_keys=[receiver_id],
    )
