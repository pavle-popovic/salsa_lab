import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..database import Base
from .user import User # Import User for FKs
from .course import Lesson # Import Lesson for FKs

class BossSubmissionStatus(enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class UserProgress(Base):
    __tablename__ = "user_progress"

    id: Column[uuid.UUID] = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Column[uuid.UUID] = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    lesson_id: Column[uuid.UUID] = Column(UUID(as_uuid=True), ForeignKey("lessons.id"), nullable=False)
    is_completed: Column[bool] = Column(Boolean, default=False, nullable=False)
    completed_at: Column[datetime | None] = Column(DateTime(timezone=True), nullable=True)

    user: relationship["User"] = relationship("User", back_populates="progress")
    lesson: relationship["Lesson"] = relationship("Lesson", back_populates="user_progress")

    __table_args__ = (UniqueConstraint("user_id", "lesson_id", name="_user_lesson_uc"),)


class BossSubmission(Base):
    __tablename__ = "boss_submissions"

    id: Column[uuid.UUID] = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Column[uuid.UUID] = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    lesson_id: Column[uuid.UUID] = Column(UUID(as_uuid=True), ForeignKey("lessons.id"), nullable=False)
    video_url: Column[str] = Column(String, nullable=False)
    status: Column[BossSubmissionStatus] = Column(Enum(BossSubmissionStatus), default=BossSubmissionStatus.pending, nullable=False)
    instructor_feedback: Column[str | None] = Column(Text, nullable=True)
    instructor_video_url: Column[str | None] = Column(String, nullable=True)
    submitted_at: Column[datetime] = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    reviewed_at: Column[datetime | None] = Column(DateTime(timezone=True), nullable=True)
    reviewed_by: Column[uuid.UUID | None] = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    user: relationship["User"] = relationship("User", back_populates="submissions", foreign_keys=[user_id])
    lesson: relationship["Lesson"] = relationship("Lesson", back_populates="boss_submissions")
    reviewer: relationship["User"] = relationship("User", back_populates="reviewed_submissions", foreign_keys=[reviewed_by])