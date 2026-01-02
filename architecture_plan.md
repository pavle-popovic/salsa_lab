# Project Architecture Plan

## 1. Data Schema (PostgreSQL)

### SQL Models

#### User
- `id`: UUID (PK)
- `email`: String (Unique, Indexed)
- `hashed_password`: String
- `role`: Enum('student', 'admin', 'instructor') (Default: 'student')
- `created_at`: DateTime (Default: Now)
- `updated_at`: DateTime (Default: Now)

#### UserProfile
- `id`: UUID (PK)
- `user_id`: UUID (FK -> User.id, Unique)
- `first_name`: String
- `last_name`: String
- `avatar_url`: String (Nullable)
- `current_level_tag`: Enum('Beginner', 'Novice', 'Intermediate', 'Advanced')
- `xp`: Integer (Default: 0)
- `level`: Integer (Default: 1)
- `streak_count`: Integer (Default: 0)
- `last_login_date`: DateTime (Nullable)
- `badges`: JSONB (Default: [])

#### Subscription
- `id`: UUID (PK)
- `user_id`: UUID (FK -> User.id, Unique)
- `stripe_customer_id`: String (Indexed)
- `stripe_subscription_id`: String (Nullable)
- `status`: Enum('active', 'past_due', 'canceled', 'incomplete', 'trialing')
- `tier`: Enum('rookie', 'social_dancer', 'performer') (Default: 'rookie')
- `current_period_end`: DateTime

#### World
- `id`: UUID (PK)
- `title`: String
- `description`: Text
- `slug`: String (Unique, Indexed)
- `order_index`: Integer
- `is_free`: Boolean (Default: False)
- `image_url`: String
- `difficulty`: Enum('Beginner', 'Intermediate', 'Advanced')
- `is_published`: Boolean (Default: False)

#### Level
- `id`: UUID (PK)
- `world_id`: UUID (FK -> World.id)
- `title`: String
- `order_index`: Integer

#### Lesson
- `id`: UUID (PK)
- `level_id`: UUID (FK -> Level.id)
- `title`: String
- `description`: Text
- `video_url`: String
- `xp_value`: Integer (Default: 50)
- `order_index`: Integer
- `is_boss_battle`: Boolean (Default: False)
- `duration_minutes`: Integer

#### UserProgress
- `id`: UUID (PK)
- `user_id`: UUID (FK -> User.id)
- `lesson_id`: UUID (FK -> Lesson.id)
- `is_completed`: Boolean (Default: False)
- `completed_at`: DateTime (Nullable)
- `unique_constraint`: (user_id, lesson_id)

#### BossSubmission
- `id`: UUID (PK)
- `user_id`: UUID (FK -> User.id)
- `lesson_id`: UUID (FK -> Lesson.id)
- `video_url`: String
- `status`: Enum('pending', 'approved', 'rejected') (Default: 'pending')
- `instructor_feedback`: Text (Nullable)
- `instructor_video_url`: String (Nullable)
- `submitted_at`: DateTime (Default: Now)
- `reviewed_at`: DateTime (Nullable)
- `reviewed_by`: UUID (FK -> User.id, Nullable)

#### Comment
- `id`: UUID (PK)
- `user_id`: UUID (FK -> User.id)
- `lesson_id`: UUID (FK -> Lesson.id)
- `parent_id`: UUID (FK -> Comment.id, Nullable) (For threading)
- `content`: Text
- `created_at`: DateTime (Default: Now)

### Pydantic Schemas (API)

#### Auth & User
- `UserRegisterRequest`: email, password, first_name, last_name, current_level_tag
- `UserLoginRequest`: email, password
- `TokenResponse`: access_token, token_type
- `UserProfileResponse`: id, first_name, last_name, xp, level, streak_count, tier, avatar_url

#### Course Content
- `WorldResponse`: id, title, description, image_url, difficulty, progress_percentage, is_locked
- `LessonResponse`: id, title, description, video_url, xp_value, is_completed, is_locked, is_boss_battle
- `LessonDetailResponse`: id, title, description, video_url, xp_value, next_lesson_id, prev_lesson_id, comments: List[CommentResponse]

#### Gamification
- `XPGainResponse`: xp_gained, new_total_xp, leveled_up (bool), new_level
- `LeaderboardEntry`: user_id, name, avatar_url, xp_total, rank

#### Submissions
- `SubmissionCreateRequest`: lesson_id, video_url
- `SubmissionResponse`: id, status, feedback, submitted_at
- `GradeSubmissionRequest`: status (approved/rejected), feedback_text, feedback_video_url

## 2. Frontend Specification (Next.js + Tailwind)

### Page Routing
- `/`: `LandingPage`
- `/login`: `LoginPage`
- `/register`: `RegisterPage`
- `/courses`: `CoursesPage`
- `/lesson/[lessonId]`: `LessonPage`
- `/profile`: `ProfilePage`
- `/pricing`: `PricingPage`
- `/admin`: `AdminDashboardPage`
- `/admin/builder`: `AdminBuilderPage`
- `/admin/grading`: `AdminGradingPage`

### Component Hierarchy & Props

#### Shared Components
1. `NavBar`: `interface NavBarProps { user?: UserProfileResponse }`
2. `Footer`: `interface FooterProps {}`
3. `Button`: `interface ButtonProps { variant: 'primary' | 'secondary' | 'outline'; ... }`
4. `Modal`: `interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: ReactNode }`

#### Landing Page Components
5. `HeroSection`: `interface HeroSectionProps {}` (Video background, AOS animations)
6. `FeatureGrid`: `interface FeatureGridProps {}` (About section)

#### Course & Lesson Components
7. `WorldCard`: `interface WorldCardProps { world: WorldResponse }` (Progress bar, Lock state)
8. `VideoPlayer`: `interface VideoPlayerProps { url: string; poster?: string; onEnded?: () => void }`
9. `QuestLogSidebar`: `interface QuestLogSidebarProps { currentLessonId: string; lessons: LessonResponse[]; worldTitle: string }`
10. `LessonItem`: `interface LessonItemProps { lesson: LessonResponse; isActive: boolean }`
11. `XPToast`: `interface XPToastProps { xpAmount: number; isVisible: boolean }`
12. `CommentSection`: `interface CommentSectionProps { comments: CommentResponse[]; lessonId: string }`
13. `BossBattleUploader`: `interface BossBattleUploaderProps { lessonId: string; onUploadComplete: (url: string) => void }`

#### Profile & Dashboard Components
14. `ProfileHeader`: `interface ProfileHeaderProps { profile: UserProfileResponse }`
15. `StatCard`: `interface StatCardProps { icon: string; label: string; value: string | number }`
16. `StreakDisplay`: `interface StreakDisplayProps { days: number }`
17. `ActivityFeed`: `interface ActivityFeedProps { activities: ActivityItem[] }`
18. `BadgeGrid`: `interface BadgeGridProps { badges: Badge[] }`

#### Admin Components
19. `AdminSidebar`: `interface AdminSidebarProps { activeRoute: string }`
20. `StatOverview`: `interface StatOverviewProps { stats: AdminStats }`
21. `SubmissionCard`: `interface SubmissionCardProps { submission: SubmissionResponse; onSelect: () => void }`
22. `GradingPanel`: `interface GradingPanelProps { submission: SubmissionResponse; onGrade: (data: GradeSubmissionRequest) => void }`
23. `CourseEditor`: `interface CourseEditorProps { world: WorldResponse }` (Drag & drop lessons)

#### Pricing Components
24. `PricingCard`: `interface PricingCardProps { tier: string; price: string; features: string[]; isPopular?: boolean }`

**Total Components: 24, Total Pages: 10**

## 3. Backend Logic Spec (FastAPI)

### File Structure

#### Core
1. `main.py`: App entry point, CORS, Middleware setup.
2. `config.py`: Env variables (DB_URL, STRIPE_KEY, AWS_KEYS).
3. `database.py`: SQLAlchemy engine, SessionLocal, Base.
4. `dependencies.py`: `get_db`, `get_current_user`, `get_admin_user`.

#### Models & Schemas
5. `models/user.py`: User, UserProfile, Subscription SQL models.
6. `models/course.py`: World, Level, Lesson SQL models.
7. `models/progress.py`: UserProgress, BossSubmission SQL models.
8. `schemas/auth.py`: Pydantic models for Auth.
9. `schemas/course.py`: Pydantic models for Course data.
10. `schemas/gamification.py`: Pydantic models for XP/Stats.

#### Routers
11. `routers/auth.py`:
    - `POST /register`: Hash password, create User, create UserProfile (default stats), return Token.
    - `POST /token`: Validate creds, return JWT.
12. `routers/users.py`:
    - `GET /me`: Return UserProfile with calculated Level.
    - `GET /leaderboard`: Fetch top users by XP (Redis cached).
13. `routers/courses.py`:
    - `GET /worlds`: List all worlds. Check Subscription for lock status.
    - `GET /lessons/{id}`: Get lesson details. Check prerequisites (prev lesson completed).
14. `routers/progress.py`:
    - `POST /lessons/{id}/complete`: Create UserProgress. Add XP. Update Streak. Return XPGainResponse.
15. `routers/submissions.py`:
    - `POST /upload-url`: Generate S3 Presigned URL for video upload.
    - `POST /submit`: Create BossSubmission record.
16. `routers/admin.py`:
    - `GET /stats`: Aggregated analytics.
    - `GET /submissions`: List pending submissions.
    - `POST /submissions/{id}/grade`: Update status, send notification, unlock next world if approved.
    - `POST /worlds`: Create/Update course content.
17. `routers/payments.py`:
    - `POST /create-checkout-session`: Init Stripe session.
    - `POST /webhook`: Handle `invoice.payment_succeeded` to update Subscription table.

#### Services & Utils
18. `services/auth_service.py`: `verify_password`, `create_access_token`.
19. `services/gamification_service.py`: `calculate_level(xp)`, `update_streak(user_id)`.
20. `services/s3_service.py`: `generate_presigned_url`.
21. `services/stripe_service.py`: Stripe API wrappers.

**Total Backend Files: 21**