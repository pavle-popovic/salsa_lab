from typing import Annotated
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from output.backend.dependencies import get_db, get_current_user
from output.backend.schemas import gamification as gamification_schemas
from output.backend.models import progress as progress_models
from output.backend.models import user as user_models
from output.backend.models import course as course_models
from output.backend.services import gamification_service

router = APIRouter(prefix="/progress", tags=["progress"])


@router.post("/lessons/{lesson_id}/complete", response_model=gamification_schemas.XPGainResponse)
def complete_lesson(
    lesson_id: uuid.UUID,
    current_user: Annotated[user_models.User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    lesson = db.query(course_models.Lesson).filter(course_models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    user_profile = db.query(user_models.UserProfile).filter(user_models.UserProfile.user_id == current_user.id).first()
    if not user_profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")

    user_progress = (
        db.query(progress_models.UserProgress)
        .filter(
            progress_models.UserProgress.user_id == current_user.id,
            progress_models.UserProgress.lesson_id == lesson_id,
        )
        .first()
    )

    xp_gained = 0
    leveled_up = False
    old_level = user_profile.level

    if user_progress and user_progress.is_completed:
        # Lesson already completed, return current stats without adding XP again
        return gamification_schemas.XPGainResponse(
            xp_gained=0,
            new_total_xp=user_profile.xp,
            leveled_up=False,
            new_level=user_profile.level,
            streak_count=user_profile.streak_count
        )
    elif user_progress and not user_progress.is_completed:
        # Mark as completed if it exists but wasn't completed
        user_progress.is_completed = True
        user_progress.completed_at = datetime.utcnow()
        xp_gained = lesson.xp_value
    else:
        # Create new UserProgress entry
        user_progress = progress_models.UserProgress(
            id=uuid.uuid4(),
            user_id=current_user.id,
            lesson_id=lesson_id,
            is_completed=True,
            completed_at=datetime.utcnow(),
        )
        db.add(user_progress)
        xp_gained = lesson.xp_value

    # Add XP to user profile
    user_profile.xp += xp_gained

    # Calculate new level
    new_level = gamification_service.calculate_level(user_profile.xp)
    if new_level > old_level:
        leveled_up = True
        user_profile.level = new_level

    # Update streak
    updated_streak = gamification_service.update_streak(current_user.id, db)
    user_profile.streak_count = updated_streak

    db.commit()
    db.refresh(user_profile)

    return gamification_schemas.XPGainResponse(
        xp_gained=xp_gained,
        new_total_xp=user_profile.xp,
        leveled_up=leveled_up,
        new_level=user_profile.level,
        streak_count=user_profile.streak_count
    )