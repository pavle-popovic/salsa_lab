import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..database import Base
from .user import User # Import User for Comment model FK

class WorldDifficulty(enum.Enum):
    Beginner = "Beginner"
    Intermediate = "Intermediate"
    Advanced = "Advanced"

class World(Base):
    __tablename__ = "worlds"

    id: Column[uuid.UUID] = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Column[str] = Column(String, nullable=False)
    description: Column[str] = Column(Text, nullable=False)
    slug: Column[str] = Column(String, unique=True, nullable=False)
    order_index: Column[int] = Column(Integer, nullable=False)
    is_free: Column[bool] = Column(Boolean, default=False, nullable=False)
    image_url: Column[str] = Column(String, nullable=False)
    difficulty: Column[WorldDifficulty] = Column(Enum(WorldDifficulty), nullable=False)
    is_published: Column[bool] = Column(Boolean, default=False, nullable=False)

    levels: relationship["Level"] = relationship("Level", back_populates="world", order_by="Level.order_index")


class Level(Base):
    __tablename__ = "levels"

    id: Column[uuid.UUID] = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    world_id: Column[uuid.UUID] = Column(UUID(as_uuid=True), ForeignKey("worlds.id"), nullable=False)
    title: Column[str] = Column(String, nullable=False)
    order_index: Column[int] = Column(Integer, nullable=False)

    world: relationship["World"] = relationship("World", back_populates="levels")
    lessons: relationship["Lesson"] = relationship("Lesson", back_populates="level", order_by="Lesson.order_index")


class Lesson(Base):
    __tablename__ = "lessons"

    id: Column[uuid.UUID] = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    level_id: Column[uuid.UUID] = Column(UUID(as_uuid=True), ForeignKey("levels.id"), nullable=False)
    title: Column[str] = Column(String, nullable=False)
    description: Column[str] = Column(Text, nullable=False)
    video_url: Column[str] = Column(String, nullable=False)
    xp_value: Column[int] = Column(Integer, default=50, nullable=False)
    order_index: Column[int] = Column(Integer, nullable=False)
    is_boss_battle: Column[bool] = Column(Boolean, default=False, nullable=False)
    duration_minutes: Column[int] = Column(Integer, nullable=False)

    level: relationship["Level"] = relationship("Level", back_populates="lessons")
    comments: relationship["Comment"] = relationship("Comment", back_populates="lesson")
    user_progress: relationship["UserProgress"] = relationship("UserProgress", back_populates="lesson")
    boss_submissions: relationship["BossSubmission"] = relationship("BossSubmission", back_populates="lesson")


class Comment(Base):
    __tablename__ = "comments"

    id: Column[uuid.UUID] = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Column[uuid.UUID] = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    lesson_id: Column[uuid.UUID] = Column(UUID(as_uuid=True), ForeignKey("lessons.id"), nullable=False)
    parent_id: Column[uuid.UUID | None] = Column(UUID(as_uuid=True), ForeignKey("comments.id"), nullable=True)
    content: Column[str] = Column(Text, nullable=False)
    created_at: Column[datetime] = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: relationship["User"] = relationship("User", back_populates="comments")
    lesson: relationship["Lesson"] = relationship("Lesson", back_populates="comments")
    parent: relationship["Comment"] = relationship("Comment", remote_side=[id], back_populates="replies")
    replies: relationship["Comment"] = relationship("Comment", back_populates="parent", cascade="all, delete-orphan")