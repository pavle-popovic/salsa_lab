# Master Requirements Document (MRD): The Salsa Lab (LMS Platform)

**Input Context:** The Development Team will be provided with a set of HTML/Tailwind files (`index.html`, `lesson.html`, `pricing.html`, `register.html`, `profile.html`). The goal is to refactor this static code into a dynamic **Next.js/React** application backed by a scalable API.

---

## I. Global Architecture & Standards
* **Frontend:** Next.js (React) + Tailwind CSS.
    * *Instruction:* Maintain the provided "Dark Mode/Gaming" aesthetic. Use **AOS** (Animate On Scroll) for landing page animations.
    * *Component Strategy:* Refactor the HTML into reusable components: `NavBar`, `SidebarQuestLog`, `VideoPlayer`, `XPBar`, `CourseCard`.
* **Backend:** Python (FastAPI).
* **Database:** * **PostgreSQL:** For User Data, Course Progress, Transactions, and Relationships.
    * **Redis:** For Leaderboards (Real-time rank sorting) and Caching.
* **File Storage (Media):** AWS S3 + CloudFront (for delivering course videos and storing user "Boss Battle" submissions).
* **Authentication:** NextAuth.js or custom JWT (JSON Web Tokens).
* **Payments:** Stripe (Subscription Management).

---

## II. Authentication & Onboarding Module
**User Flow:** Visitor → Register (Character Creation) → Onboarding → Student Dashboard.

### 1. Registration (`register.html`)
* **Inputs:** First Name, Last Name, Email, Password.
* **Gamification Input:** **Current Level Selector** (Total Beginner, Novice, Intermediate, Advanced).
    * *Logic:* This selection sets the user's initial "User Persona" tag in the DB.
* **Account Creation:**
    * Create `user_id`.
    * Initialize Gamification Stats: `XP = 0`, `Level = 1`, `Streak = 0`, `Badges = []`.
    * Assign Default Avatar (Random color generation).

### 2. Login
* **Security:** Standard Email/Password login.
* **Session:** Persistent login required (so users don't break their streak due to UX friction).

---

## III. The Course Engine ("The Worlds")
**UI Context:** `courses.html` (Map) and `lesson.html` (The Classroom).

### 1. Data Structure (Hierarchy)
The content must be structured in the DB as follows:
* **World** (e.g., "World 1: The Foundation")
    * **Level** (e.g., "Level 1.1: Basic Steps")
        * **Lesson/Asset** (Video URL, Description, XP Value).

### 2. The Classroom Interface (`lesson.html`)
* **Video Player:**
    * Must support HLS streaming (adaptive quality) or Vimeo/YouTube Embeds (configurable in Admin).
    * **Autoplay Logic:** If coming from previous lesson, autoplay.
* **The "Quest Log" (Sidebar):**
    * **Dynamic State:**
        * *Completed Lesson:* Show Checkmark (Green).
        * *Current Lesson:* Highlighted (Blue).
        * *Locked Lesson:* Show Lock Icon (Grey). User cannot click.
* **Action Button:** "Complete & Claim [X] XP".
    * *Logic:* Clicking sends API request → Updates User Progress → Triggers "XP Gained" Toast Notification → Unlocks next lesson in the chain.

### 3. Progression Logic (The Lock System)
* **Sequential Unlocking:** Lesson 1.2 is locked until Lesson 1.1 is marked complete.
* **World Unlocking:** World 2 is locked until World 1 "Boss Battle" is submitted (or marked complete).

---

## IV. The "Boss Battle" System (Homework)
**UI Context:** The final item in a specific World/Module (Red visual styling in Sidebar).

### 1. Submission Interface
* **Input:** Video Uploader (Drag & Drop) or Link Input (YouTube/Instagram/TikTok link).
* **Storage:** If direct upload, compress video and store in AWS S3 (Bucket: `user-submissions`).

### 2. State Management
* **Pending:** User submitted video. (Shows "Under Review" in UI).
* **Approved:** Instructor marks as "Pass". (Unlocks next World + Awards Massive XP).
* **Rejected:** Instructor requests re-do. (User stays on current World).
* *Note:* For "Rookie" (Free) users, this might be auto-approved to save instructor time, or restricted entirely.

---

## V. Gamification & User Dashboard
**UI Context:** `profile.html` and Global Navbar HUD.

### 1. The XP System
* **Events:**
    * Watch Lesson: +50 XP.
    * Daily Login: +10 XP.
    * Submit Boss Battle: +500 XP.
* **Leveling Formula:** `Level = floor(sqrt(XP / 100))`. (Frontend must calculate progress bar percentage to next level).

### 2. The Streak Engine
* **Logic:**
    * On Login, check `last_login_date`.
    * If `last_login` == yesterday, `streak += 1`.
    * If `last_login` < yesterday, `streak = 0`.
* **Display:** Fire Icon + Day Count in Navbar.

### 3. Leaderboards
* **Scope:** Global (All users) or Cohort-based (Users who joined this month).
* **Sorting:** Total XP earned in the last 30 days.

---

## VI. Monetization & Subscriptions
**UI Context:** `pricing.html`.

### 1. Tiers (Stripe Products)
* **Rookie (Free):**
    * Access: World 1 Only.
    * Features: No direct feedback.
* **Social Dancer ($29/mo):**
    * Access: All Worlds.
    * Features: Unlimited video access.
* **Performer ($49/mo):**
    * Access: All Worlds + Direct Feedback.
    * Features: "Certified" Badge on profile.

### 2. The Paywall (Middleware)
* **Backend Logic:** Before serving a video URL (e.g., for World 2), the API must check:
    * `if (user.subscription_status === 'active') OR (world.is_free === true)`.
    * If false, return 403 Forbidden and redirect Frontend to `pricing.html`.

---

## VII. Community & Social Features
**UI Context:** Discussion Tab in `lesson.html` & Community Feed.

### 1. Lesson Discussions
* **Threaded Comments:** Users can ask questions specific to a video.
* **Upvotes:** Users can "Like" comments (giving XP to the commenter).

### 2. Activity Feed
* **Events:** "Alex just unlocked World 2", "Maria just hit a 30 Day Streak."
* **Goal:** Social Proof to keep users engaged.

---

## VIII. Admin Dashboard (Instructor View)
**UI Context:** Hidden route `/admin`. **(CRITICAL FOR CONTENT MANAGEMENT)**

### 1. Submission Queue (Grading)
* **Interface:** List of pending "Boss Battle" videos.
* **Actions:**
    * **Watch Video.**
    * **Grade:** Pass / Fail.
    * **Comment:** Text or Video reply (using VideoAsk integration or text field).

### 2. Content Management (CMS)
* **Course Builder:** A UI form to Create Worlds, Levels, and Lessons.
* **Video Upload:** Drag-and-drop interface to upload course videos to AWS S3.
* **Asset Management:** Ability to change the XP value of lessons or update descriptions without touching code.

---

## IX. Non-Functional Requirements
* **Mobile Responsiveness:** The Player and Sidebar must collapse gracefully on mobile (Hamburger menu for Quest Log).
* **Performance:**
    * Landing page video must lazy-load or use a poster image to prevent Slow LCP (Largest Contentful Paint).
    * Use Static Site Generation (SSG) for public pages (Home, Pricing) for SEO speed.
* **SEO:**
    * Meta tags for "Online Salsa Course", "Mambo On2 Classes".
    * OpenGraph tags for social sharing.