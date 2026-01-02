from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime


class CommentResponse(BaseModel):
    id: UUID
    user_id: UUID
    content: str
    created_at: datetime
    replies: List['CommentResponse'] = []  # Self-referencing for threaded comments


class LessonResponse(BaseModel):
    id: UUID
    title: str
    description: str
    video_url: str
    xp_value: int
    is_completed: bool
    is_locked: bool
    is_boss_battle: bool


class LessonDetailResponse(LessonResponse):
    next_lesson_id: Optional[UUID] = None
    prev_lesson_id: Optional[UUID] = None
    comments: List[CommentResponse] = []


class WorldResponse(BaseModel):
    id: UUID
    title: str
    description: str
    image_url: str
    difficulty: str  # Corresponds to Enum('Beginner', 'Intermediate', 'Advanced')
    progress_percentage: float
    is_locked: bool


# Update forward references for CommentResponse
CommentResponse.update_forward_refs()