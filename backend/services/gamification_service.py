import math
from datetime import date, datetime, timedelta
from typing import TYPE_CHECKING

from sqlalchemy.orm import Session

if TYPE_CHECKING:
    from output.backend.models.user import UserProfile

def calculate_level(xp: int) -> int:
    # Formula from requirements: Level = floor(sqrt(XP / 100))
    # However, the architecture plan states: Return floor(xp / 1000) + 1.
    # I will use the architecture plan's formula as it's more explicit for the backend.
    # The frontend can then calculate progress bar percentage based on this.
    return math.floor(xp / 1000) + 1

def update_streak(user_profile: "UserProfile", db: Session) -> None:
    today = date.today()
    
    if user_profile.last_login_date:
        last_login_date_only = user_profile.last_login_date.date()
        
        if last_login_date_only == today - timedelta(days=1):
            # Logged in yesterday, increment streak
            user_profile.streak_count += 1
        elif last_login_date_only < today - timedelta(days=1):
            # Missed a day, reset streak
            user_profile.streak_count = 1
        # If last_login_date_only == today, do nothing (already logged in today)
    else:
        # First login, start streak
        user_profile.streak_count = 1
    
    user_profile.last_login_date = datetime.utcnow()
    db.add(user_profile)
    db.commit()
    db.refresh(user_profile)