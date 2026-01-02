# The Salsa Lab - Architecture Documentation

This document outlines the architectural structure of The Salsa Lab application, detailing the contents of key files and the integration between the Frontend and Backend.

## System Overview

The application follows a standard client-server architecture:
- **Frontend**: Single Page Application (SPA) built with React/TypeScript.
- **Backend**: RESTful API built with FastAPI/Python.
- **Database**: Relational database (PostgreSQL) managed via SQLAlchemy ORM.
- **Containerization**: Docker and Docker Compose for orchestration.

## File Contents Summary

### Backend (`output/backend/`)

- **`main.py`**: Initializes the FastAPI app, includes routers, and configures CORS.
- **`config.py`**: Manages application settings and environment variables using Pydantic.
- **`database.py`**: Handles asynchronous database connection (`AsyncSession`) and declarative base.
- **`dependencies.py`**: Provides dependency injection functions, primarily `get_current_user` for authentication.
- **`models/`**: Contains SQLAlchemy database models.
    - `user.py`: User account, profile, and stats.
    - `course.py`: World, Level, and Lesson structures.
    - `progress.py`: User progress tracking (completed lessons, XP).
- **`schemas/`**: Contains Pydantic models for data validation.
    - `auth.py`: Login/Register request/response schemas.
    - `course.py`: Course content schemas.
    - `gamification.py`: XP and badge schemas.
- **`routers/`**: API endpoints.
    - `auth.py`: Login and registration logic.
    - `users.py`: User profile and leaderboard endpoints.
    - `courses.py`: Course content retrieval.
    - `progress.py`: Lesson completion and progress updates.
    - `submissions.py`: Video submission handling.
    - `admin.py`: Administrative endpoints for stats and grading.
    - `payments.py`: Stripe integration endpoints.
- **`services/`**: Business logic layers.
    - `auth_service.py`: Password hashing and JWT generation.
    - `gamification_service.py`: XP calculation and leveling logic.
    - `s3_service.py`: AWS S3 interaction for video storage.
    - `stripe_service.py`: Payment processing logic.

### Frontend (`output/frontend/`)

- **`src/components/`**: Reusable UI elements.
    - `NavBar.tsx`: Responsive navigation bar with user state.
    - `HeroSection.tsx`: Landing page hero with video background.
    - `VideoPlayer.tsx`: Custom video player with progress tracking.
    - `QuestLogSidebar.tsx`: Gamified lesson navigation sidebar.
    - `XPToast.tsx`: Notification component for XP gains.
    - `AdminSidebar.tsx`: Navigation for the admin dashboard.
    - `GradingPanel.tsx`: Interface for instructors to grade submissions.
- **`src/pages/`**: Main application views.
    - `LandingPage.tsx`: Public home page.
    - `LoginPage.tsx` / `RegisterPage.tsx`: Authentication pages.
    - `CoursesPage.tsx`: World selection screen.
    - `LessonPage.tsx`: Main learning interface with video and sidebar.
    - `ProfilePage.tsx`: User stats, badges, and activity feed.
    - `AdminDashboardPage.tsx`: Admin overview of stats and signups.
    - `AdminGradingPage.tsx`: Interface for reviewing student videos.

### Deployment & Configuration

- **`docker-compose.yml`**: Orchestrates the `backend`, `frontend`, and `db` services.
- **`backend/Dockerfile`**: Python environment setup for FastAPI.
- **`frontend/Dockerfile`**: Node.js environment setup for React build.