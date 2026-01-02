from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID


class UserProfileResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    xp: int
    level: int
    streak_count: int
    tier: str  # Corresponds to Enum('rookie', 'social_dancer', 'performer')
    avatar_url: Optional[str] = None


class XPGainResponse(BaseModel):
    xp_gained: int
    new_total_xp: int
    leveled_up: bool
    new_level: int


class LeaderboardEntry(BaseModel):
    user_id: UUID
    name: str
    avatar_url: Optional[str] = None
    xp_total: int
    rank: int