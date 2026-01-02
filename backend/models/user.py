import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum, JSON, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..database import Base

class UserRole(enum.Enum):
    student = "student"
    admin = "admin"
    instructor = "instructor"

class UserLevelTag(enum.Enum):
    Beginner = "Beginner"
    Novice = "Novice"
    Intermediate = "Intermediate"
    Advanced = "Advanced"

class SubscriptionStatus(enum.Enum):
    active = "active"
    past_due = "past_due"
    canceled = "canceled"
    incomplete = "incomplete"
    trialing = "trialing"

class SubscriptionTier(enum.Enum):
    rookie = "rookie"
    social_dancer = "social_dancer"
    performer = "performer"

class User(Base):
    __tablename__ = "users"

    id: Column[uuid.UUID] = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Column[str] = Column(String, unique=True, index=True, nullable=False)
    hashed_password: Column[str] = Column(String, nullable=False)
    role: Column[UserRole] = Column(Enum(UserRole), default=UserRole.student, nullable=False)
    created_at: Column[datetime] = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Column[datetime] = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    profile: relationship["UserProfile", uselist=False, back_populates="user"] = relationship("UserProfile", uselist=False, back_populates="user")
    subscription: relationship["Subscription", uselist=False, back_populates="user"] = relationship("Subscription", uselist=False, back_populates="user")
    progress: relationship["UserProgress"] = relationship("UserProgress", back_populates="user")
    submissions: relationship["BossSubmission"] = relationship("BossSubmission", back_populates="user")
    comments: relationship["Comment"] = relationship("Comment", back_populates="user")
    reviewed_submissions: relationship["BossSubmission"] = relationship("BossSubmission", back_populates="reviewer", foreign_keys="[BossSubmission.reviewed_by]")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Column[uuid.UUID] = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Column[uuid.UUID] = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    first_name: Column[str] = Column(String, nullable=False)
    last_name: Column[str] = Column(String, nullable=False)
    avatar_url: Column[str | None] = Column(String, nullable=True)
    current_level_tag: Column[UserLevelTag] = Column(Enum(UserLevelTag), default=UserLevelTag.Beginner, nullable=False)
    xp: Column[int] = Column(Integer, default=0, nullable=False)
    level: Column[int] = Column(Integer, default=1, nullable=False)
    streak_count: Column[int] = Column(Integer, default=0, nullable=False)
    last_login_date: Column[datetime | None] = Column(DateTime(timezone=True), nullable=True)
    badges: Column[list[str]] = Column(JSON, default=[], nullable=False)

    user: relationship["User"] = relationship("User", back_populates="profile")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Column[uuid.UUID] = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Column[uuid.UUID] = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    stripe_customer_id: Column[str] = Column(String, index=True, nullable=False)
    stripe_subscription_id: Column[str | None] = Column(String, nullable=True)
    status: Column[SubscriptionStatus] = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.incomplete, nullable=False)
    tier: Column[SubscriptionTier] = Column(Enum(SubscriptionTier), default=SubscriptionTier.rookie, nullable=False)
    current_period_end: Column[datetime | None] = Column(DateTime(timezone=True), nullable=True)

    user: relationship["User"] = relationship("User", back_populates="subscription")