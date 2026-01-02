from pydantic import BaseModel, EmailStr
from typing import Optional


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    current_level_tag: str  # Corresponds to Enum('Beginner', 'Novice', 'Intermediate', 'Advanced')


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None