from typing import Annotated, List, Optional
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from output.backend.dependencies import get_db, get_admin_user
from output.backend.schemas import gamification as gamification_schemas
from output.backend.schemas import course as course_schemas
from output.backend.models import user as user_models
from output.backend.models import progress as progress_models
from output.backend.models import course as course_models

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", response_model=gamification_schemas.AdminStatsResponse)
def get_admin_stats(
    current_admin_user: Annotated[user_models.User, Depends(get_admin_user)],
    db: Annotated[Session, Depends(get_db)],
):
    total_users = db.query(user_models.User).count()
    active_subscriptions = (
        db.query(user_models.Subscription)
        .filter(user_models.Subscription.status == user_models.SubscriptionStatus.active)
        .count()
    )
    pending_submissions = (
        db.query(progress_models.BossSubmission)
        .filter(progress_models.BossSubmission.status == progress_models.SubmissionStatus.pending)
        .count()
    )

    return gamification_schemas.AdminStatsResponse(
        total_users=total_users,
        active_subscriptions=active_subscriptions,
        pending_submissions=pending_submissions,
    )


@router.get("/submissions", response_model=List[course_schemas.SubmissionResponse])
def list_pending_submissions(
    current_admin_user: Annotated[user_models.User, Depends(get_admin_user)],
    db: Annotated[Session, Depends(get_db)],
):
    pending_submissions = (
        db.query(progress_models.BossSubmission)
        .filter(progress_models.BossSubmission.status == progress_models.SubmissionStatus.pending)
        .options(joinedload(progress_models.BossSubmission.user).joinedload(user_models.User.profile))
        .options(joinedload(progress_models.BossSubmission.lesson))
        .all()
    )

    results = []
    for submission in pending_submissions:
        user_profile = submission.user.profile if submission.user else None
        results.append(
            course_schemas.SubmissionResponse(
                id=submission.id,
                lesson_id=submission.lesson_id,
                video_url=submission.video_url,
                status=submission.status.value,
                submitted_at=submission.submitted_at,
                instructor_feedback=submission.instructor_feedback,
                instructor_video_url=submission.instructor_video_url,
                user_id=submission.user_id,
                user_name=f"{user_profile.first_name} {user_profile.last_name}" if user_profile else submission.user.email,
                lesson_title=submission.lesson.title if submission.lesson else "Unknown Lesson"
            )
        )
    return results


@router.post("/submissions/{submission_id}/grade", response_model=course_schemas.SubmissionResponse)
def grade_submission(
    submission_id: uuid.UUID,
    grade_data: course_schemas.GradeSubmissionRequest,
    current_admin_user: Annotated[user_models.User, Depends(get_admin_user)],
    db: Annotated[Session, Depends(get_db)],
):
    submission = (
        db.query(progress_models.BossSubmission)
        .filter(progress_models.BossSubmission.id == submission_id)
        .first()
    )

    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")

    submission.status = grade_data.status
    submission.instructor_feedback = grade_data.feedback_text
    submission.instructor_video_url = grade_data.feedback_video_url
    submission.reviewed_at = datetime.utcnow()
    submission.reviewed_by = current_admin_user.id

    if grade_data.status == progress_models.SubmissionStatus.approved:
        # If approved, ensure the corresponding lesson is marked as completed for the user
        user_progress = (
            db.query(progress_models.UserProgress)
            .filter(
                progress_models.UserProgress.user_id == submission.user_id,
                progress_models.UserProgress.lesson_id == submission.lesson_id,
            )
            .first()
        )
        if not user_progress:
            user_progress = progress_models.UserProgress(
                id=uuid.uuid4(),
                user_id=submission.user_id,
                lesson_id=submission.lesson_id,
                is_completed=True,
                completed_at=datetime.utcnow(),
            )
            db.add(user_progress)
        elif not user_progress.is_completed:
            user_progress.is_completed = True
            user_progress.completed_at = datetime.utcnow()
        
        # Award XP for boss battle completion
        lesson = db.query(course_models.Lesson).filter(course_models.Lesson.id == submission.lesson_id).first()
        if lesson and lesson.is_boss_battle:
            user_profile = db.query(user_models.UserProfile).filter(user_models.UserProfile.user_id == submission.user_id).first()
            if user_profile:
                user_profile.xp += lesson.xp_value # Assuming boss battles have XP values
                # Recalculate level if needed (gamification_service.calculate_level)
                # For simplicity, we'll just update XP here. Full level calculation might be in a service.
                user_profile.level = gamification_service.calculate_level(user_profile.xp)


    db.commit()
    db.refresh(submission)

    return course_schemas.SubmissionResponse(
        id=submission.id,
        lesson_id=submission.lesson_id,
        video_url=submission.video_url,
        status=submission.status.value,
        submitted_at=submission.submitted_at,
        instructor_feedback=submission.instructor_feedback,
        instructor_video_url=submission.instructor_video_url,
        user_id=submission.user_id,
        lesson_title=submission.lesson.title if submission.lesson else "Unknown Lesson"
    )


@router.post("/worlds", response_model=course_schemas.WorldResponse, status_code=status.HTTP_201_CREATED)
def create_world(
    world_data: course_schemas.WorldCreateRequest,
    current_admin_user: Annotated[user_models.User, Depends(get_admin_user)],
    db: Annotated[Session, Depends(get_db)],
):
    db_world = course_models.World(
        id=uuid.uuid4(),
        title=world_data.title,
        description=world_data.description,
        slug=world_data.slug,
        order_index=world_data.order_index,
        is_free=world_data.is_free,
        image_url=world_data.image_url,
        difficulty=world_data.difficulty,
        is_published=world_data.is_published
    )
    db.add(db_world)
    db.commit()
    db.refresh(db_world)
    return course_schemas.WorldResponse(
        id=db_world.id,
        title=db_world.title,
        description=db_world.description,
        image_url=db_world.image_url,
        difficulty=db_world.difficulty.value,
        progress_percentage=0, # New world, no progress yet
        is_locked=False, # Admin view, or default for new
        order_index=db_world.order_index
    )

@router.put("/worlds/{world_id}", response_model=course_schemas.WorldResponse)
def update_world(
    world_id: uuid.UUID,
    world_data: course_schemas.WorldUpdateRequest,
    current_admin_user: Annotated[user_models.User, Depends(get_admin_user)],
    db: Annotated[Session, Depends(get_db)],
):
    db_world = db.query(course_models.World).filter(course_models.World.id == world_id).first()
    if not db_world:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="World not found")

    update_data = world_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "difficulty":
            setattr(db_world, key, course_models.DifficultyLevel[value])
        else:
            setattr(db_world, key, value)
    
    db.commit()
    db.refresh(db_world)
    return course_schemas.WorldResponse(
        id=db_world.id,
        title=db_world.title,
        description=db_world.description,
        image_url=db_world.image_url,
        difficulty=db_world.difficulty.value,
        progress_percentage=0, # Not relevant for update response
        is_locked=False,
        order_index=db_world.order_index
    )

@router.post("/worlds/{world_id}/levels", response_model=course_schemas.LevelResponse, status_code=status.HTTP_201_CREATED)
def create_level(
    world_id: uuid.UUID,
    level_data: course_schemas.LevelCreateRequest,
    current_admin_user: Annotated[user_models.User, Depends(get_admin_user)],
    db: Annotated[Session, Depends(get_db)],
):
    db_world = db.query(course_models.World).filter(course_models.World.id == world_id).first()
    if not db_world:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="World not found")

    db_level = course_models.Level(
        id=uuid.uuid4(),
        world_id=world_id,
        title=level_data.title,
        order_index=level_data.order_index
    )
    db.add(db_level)
    db.commit()
    db.refresh(db_level)
    return course_schemas.LevelResponse(
        id=db_level.id,
        world_id=db_level.world_id,
        title=db_level.title,
        order_index=db_level.order_index
    )

@router.post("/levels/{level_id}/lessons", response_model=course_schemas.LessonResponse, status_code=status.HTTP_201_CREATED)
def create_lesson(
    level_id: uuid.UUID,
    lesson_data: course_schemas.LessonCreateRequest,
    current_admin_user: Annotated[user_models.User, Depends(get_admin_user)],
    db: Annotated[Session, Depends(get_db)],
):
    db_level = db.query(course_models.Level).filter(course_models.Level.id == level_id).first()
    if not db_level:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Level not found")

    db_lesson = course_models.Lesson(
        id=uuid.uuid4(),
        level_id=level_id,
        title=lesson_data.title,
        description=lesson_data.description,
        video_url=lesson_data.video_url,
        xp_value=lesson_data.xp_value,
        order_index=lesson_data.order_index,
        is_boss_battle=lesson_data.is_boss_battle,
        duration_minutes=lesson_data.duration_minutes
    )
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return course_schemas.LessonResponse(
        id=db_lesson.id,
        title=db_lesson.title,
        description=db_lesson.description,
        video_url=db_lesson.video_url,
        xp_value=db_lesson.xp_value,
        is_completed=False, # Newly created, not completed
        is_locked=False, # Admin view, or default for new
        is_boss_battle=db_lesson.is_boss_battle,
        duration_minutes=db_lesson.duration_minutes
    )