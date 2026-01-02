from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from output.backend.dependencies import get_db, get_current_user
from output.backend.schemas import course as course_schemas
from output.backend.models import course as course_models
from output.backend.models import progress as progress_models
from output.backend.models import user as user_models

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("/worlds", response_model=List[course_schemas.WorldResponse])
def get_worlds(
    current_user: Annotated[user_models.User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    worlds = db.query(course_models.World).options(joinedload(course_models.World.levels).joinedload(course_models.Level.lessons)).order_by(course_models.World.order_index).all()

    user_progress_map = {
        (p.lesson_id): p.is_completed
        for p in db.query(progress_models.UserProgress)
        .filter(progress_models.UserProgress.user_id == current_user.id)
        .all()
    }

    user_subscription_active = (
        current_user.subscription and current_user.subscription.status == user_models.SubscriptionStatus.active
    )

    world_responses: List[course_schemas.WorldResponse] = []
    for world in worlds:
        total_lessons_in_world = sum(len(level.lessons) for level in world.levels)
        completed_lessons_in_world = 0

        for level in world.levels:
            for lesson in level.lessons:
                if user_progress_map.get(lesson.id, False):
                    completed_lessons_in_world += 1

        progress_percentage = (
            (completed_lessons_in_world / total_lessons_in_world) * 100
            if total_lessons_in_world > 0
            else 0
        )

        is_locked = False
        if not world.is_free and not user_subscription_active:
            is_locked = True
        
        # Check if previous world's boss battle is completed for non-free worlds
        if world.order_index > 1 and not world.is_free:
            previous_world = db.query(course_models.World).filter(course_models.World.order_index == world.order_index - 1).first()
            if previous_world:
                boss_lesson_in_prev_world = (
                    db.query(course_models.Lesson)
                    .join(course_models.Level)
                    .filter(
                        course_models.Level.world_id == previous_world.id,
                        course_models.Lesson.is_boss_battle == True
                    )
                    .first()
                )
                if boss_lesson_in_prev_world:
                    boss_submission = (
                        db.query(progress_models.BossSubmission)
                        .filter(
                            progress_models.BossSubmission.user_id == current_user.id,
                            progress_models.BossSubmission.lesson_id == boss_lesson_in_prev_world.id,
                            progress_models.BossSubmission.status == progress_models.SubmissionStatus.approved
                        )
                        .first()
                    )
                    if not boss_submission:
                        is_locked = True


        world_responses.append(
            course_schemas.WorldResponse(
                id=world.id,
                title=world.title,
                description=world.description,
                image_url=world.image_url,
                difficulty=world.difficulty.value,
                progress_percentage=round(progress_percentage, 2),
                is_locked=is_locked,
                order_index=world.order_index
            )
        )
    return world_responses


@router.get("/lessons/{lesson_id}", response_model=course_schemas.LessonDetailResponse)
def get_lesson_detail(
    lesson_id: uuid.UUID,
    current_user: Annotated[user_models.User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    lesson = (
        db.query(course_models.Lesson)
        .options(joinedload(course_models.Lesson.level).joinedload(course_models.Level.world))
        .filter(course_models.Lesson.id == lesson_id)
        .first()
    )

    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    # Check if the world is locked for the user
    world = lesson.level.world
    user_subscription_active = (
        current_user.subscription and current_user.subscription.status == user_models.SubscriptionStatus.active
    )
    
    is_world_locked = False
    if not world.is_free and not user_subscription_active:
        is_world_locked = True
    
    # Check if previous world's boss battle is completed for non-free worlds
    if world.order_index > 1 and not world.is_free:
        previous_world = db.query(course_models.World).filter(course_models.World.order_index == world.order_index - 1).first()
        if previous_world:
            boss_lesson_in_prev_world = (
                db.query(course_models.Lesson)
                .join(course_models.Level)
                .filter(
                    course_models.Level.world_id == previous_world.id,
                    course_models.Lesson.is_boss_battle == True
                )
                .first()
            )
            if boss_lesson_in_prev_world:
                boss_submission = (
                    db.query(progress_models.BossSubmission)
                    .filter(
                        progress_models.BossSubmission.user_id == current_user.id,
                        progress_models.BossSubmission.lesson_id == boss_lesson_in_prev_world.id,
                        progress_models.BossSubmission.status == progress_models.SubmissionStatus.approved
                    )
                    .first()
                )
                if not boss_submission:
                    is_world_locked = True

    if is_world_locked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This world is locked. Please subscribe or complete previous boss battles."
        )

    # Check prerequisites (previous lesson completed)
    all_lessons_in_world = (
        db.query(course_models.Lesson)
        .join(course_models.Level)
        .filter(course_models.Level.world_id == world.id)
        .order_by(course_models.Level.order_index, course_models.Lesson.order_index)
        .all()
    )

    current_lesson_index = -1
    for i, l in enumerate(all_lessons_in_world):
        if l.id == lesson.id:
            current_lesson_index = i
            break

    if current_lesson_index > 0:
        previous_lesson = all_lessons_in_world[current_lesson_index - 1]
        user_progress_prev_lesson = (
            db.query(progress_models.UserProgress)
            .filter(
                progress_models.UserProgress.user_id == current_user.id,
                progress_models.UserProgress.lesson_id == previous_lesson.id,
                progress_models.UserProgress.is_completed == True,
            )
            .first()
        )
        if not user_progress_prev_lesson:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please complete the previous lesson first."
            )

    is_completed = (
        db.query(progress_models.UserProgress)
        .filter(
            progress_models.UserProgress.user_id == current_user.id,
            progress_models.UserProgress.lesson_id == lesson_id,
            progress_models.UserProgress.is_completed == True,
        )
        .first()
        is not None
    )

    next_lesson_id: Optional[uuid.UUID] = None
    if current_lesson_index < len(all_lessons_in_world) - 1:
        next_lesson_id = all_lessons_in_world[current_lesson_index + 1].id

    prev_lesson_id: Optional[uuid.UUID] = None
    if current_lesson_index > 0:
        prev_lesson_id = all_lessons_in_world[current_lesson_index - 1].id

    # Fetch comments for the lesson
    comments = (
        db.query(progress_models.Comment)
        .filter(progress_models.Comment.lesson_id == lesson_id, progress_models.Comment.parent_id == None)
        .order_by(progress_models.Comment.created_at)
        .all()
    )
    
    comment_responses = []
    for comment in comments:
        user_commenter = db.query(user_models.User).filter(user_models.User.id == comment.user_id).first()
        user_profile_commenter = db.query(user_models.UserProfile).filter(user_models.UserProfile.user_id == comment.user_id).first()
        
        replies = (
            db.query(progress_models.Comment)
            .filter(progress_models.Comment.parent_id == comment.id)
            .order_by(progress_models.Comment.created_at)
            .all()
        )
        reply_responses = []
        for reply in replies:
            user_replier = db.query(user_models.User).filter(user_models.User.id == reply.user_id).first()
            user_profile_replier = db.query(user_models.UserProfile).filter(user_models.UserProfile.user_id == reply.user_id).first()
            reply_responses.append(
                course_schemas.CommentResponse(
                    id=reply.id,
                    user_id=reply.user_id,
                    user_name=f"{user_profile_replier.first_name} {user_profile_replier.last_name}" if user_profile_replier else user_replier.email,
                    avatar_url=user_profile_replier.avatar_url if user_profile_replier else None,
                    content=reply.content,
                    created_at=reply.created_at,
                    parent_id=reply.parent_id
                )
            )

        comment_responses.append(
            course_schemas.CommentResponse(
                id=comment.id,
                user_id=comment.user_id,
                user_name=f"{user_profile_commenter.first_name} {user_profile_commenter.last_name}" if user_profile_commenter else user_commenter.email,
                avatar_url=user_profile_commenter.avatar_url if user_profile_commenter else None,
                content=comment.content,
                created_at=comment.created_at,
                parent_id=comment.parent_id,
                replies=reply_responses
            )
        )


    return course_schemas.LessonDetailResponse(
        id=lesson.id,
        title=lesson.title,
        description=lesson.description,
        video_url=lesson.video_url,
        xp_value=lesson.xp_value,
        is_completed=is_completed,
        is_boss_battle=lesson.is_boss_battle,
        duration_minutes=lesson.duration_minutes,
        next_lesson_id=next_lesson_id,
        prev_lesson_id=prev_lesson_id,
        comments=comment_responses
    )