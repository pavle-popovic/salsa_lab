from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from output.backend.dependencies import get_db, get_current_user
from output.backend.schemas import course as course_schemas
from output.backend.models import progress as progress_models
from output.backend.models import user as user_models
from output.backend.services import s3_service

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.post("/upload-url", response_model=course_schemas.PresignedUrlResponse)
def get_upload_presigned_url(
    request: course_schemas.PresignedUrlRequest,
    current_user: Annotated[user_models.User, Depends(get_current_user)],
):
    # Ensure the user is authenticated before allowing presigned URL generation
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    # Generate a unique key for the S3 object, e.g., user_id/lesson_id/timestamp_filename
    # For now, just use a generic user_id/filename structure
    object_name = f"user-submissions/{current_user.id}/{uuid.uuid4()}-{request.filename}"
    
    try:
        url = s3_service.generate_presigned_url(object_name, request.file_type)
        return course_schemas.PresignedUrlResponse(url=url, object_key=object_name)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Could not generate presigned URL: {e}")


@router.post("/submit", response_model=course_schemas.SubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_boss_battle(
    submission_data: course_schemas.SubmissionCreateRequest,
    current_user: Annotated[user_models.User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    # Check if a submission already exists for this lesson by this user
    existing_submission = (
        db.query(progress_models.BossSubmission)
        .filter(
            progress_models.BossSubmission.user_id == current_user.id,
            progress_models.BossSubmission.lesson_id == submission_data.lesson_id,
        )
        .first()
    )

    if existing_submission:
        # If an existing submission is pending or rejected, allow updating it.
        # If it's approved, maybe disallow new submissions or create a new version.
        # For now, let's update if pending/rejected, otherwise raise conflict.
        if existing_submission.status == progress_models.SubmissionStatus.approved:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You have already submitted and had this boss battle approved."
            )
        else:
            existing_submission.video_url = submission_data.video_url
            existing_submission.status = progress_models.SubmissionStatus.pending
            existing_submission.submitted_at = datetime.utcnow()
            db.commit()
            db.refresh(existing_submission)
            return course_schemas.SubmissionResponse(
                id=existing_submission.id,
                lesson_id=existing_submission.lesson_id,
                video_url=existing_submission.video_url,
                status=existing_submission.status.value,
                submitted_at=existing_submission.submitted_at,
                instructor_feedback=existing_submission.instructor_feedback,
                instructor_video_url=existing_submission.instructor_video_url
            )

    new_submission = progress_models.BossSubmission(
        id=uuid.uuid4(),
        user_id=current_user.id,
        lesson_id=submission_data.lesson_id,
        video_url=submission_data.video_url,
        status=progress_models.SubmissionStatus.pending,
    )
    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)

    return course_schemas.SubmissionResponse(
        id=new_submission.id,
        lesson_id=new_submission.lesson_id,
        video_url=new_submission.video_url,
        status=new_submission.status.value,
        submitted_at=new_submission.submitted_at,
        instructor_feedback=new_submission.instructor_feedback,
        instructor_video_url=new_submission.instructor_video_url
    )