from datetime import timedelta
from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from output.backend.dependencies import get_db
from output.backend.schemas import auth as auth_schemas
from output.backend.models import user as user_models
from output.backend.services import auth_service
from output.backend.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=auth_schemas.TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: auth_schemas.UserRegisterRequest, db: Annotated[Session, Depends(get_db)]
):
    db_user = db.query(user_models.User).filter(user_models.User.email == user_data.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    hashed_password = auth_service.get_password_hash(user_data.password)

    new_user_id = uuid.uuid4()
    db_user = user_models.User(
        id=new_user_id,
        email=user_data.email,
        hashed_password=hashed_password,
        role="student",
    )
    db.add(db_user)
    db.flush()  # Flush to get user_id for profile

    db_user_profile = user_models.UserProfile(
        id=uuid.uuid4(),
        user_id=new_user_id,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        current_level_tag=user_data.current_level_tag,
        xp=0,
        level=1,
        streak_count=0,
        badges=[],
    )
    db.add(db_user_profile)
    db.commit()
    db.refresh(db_user)
    db.refresh(db_user_profile)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": db_user.email, "user_id": str(db_user.id), "role": db_user.role.value},
        expires_delta=access_token_expires,
    )
    return auth_schemas.TokenResponse(access_token=access_token, token_type="bearer")


@router.post("/token", response_model=auth_schemas.TokenResponse)
def login_for_access_token(
    form_data: Annotated[auth_schemas.UserLoginRequest, Depends()],
    db: Annotated[Session, Depends(get_db)],
):
    user = auth_service.authenticate_user(db, form_data.email, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": user.email, "user_id": str(user.id), "role": user.role.value},
        expires_delta=access_token_expires,
    )
    return auth_schemas.TokenResponse(access_token=access_token, token_type="bearer")