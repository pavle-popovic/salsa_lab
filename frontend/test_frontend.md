# Frontend Testing Guide

## Prerequisites

1. **Start the backend server:**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. **Start the frontend dev server:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Ensure Docker containers are running:**
   ```bash
   docker-compose up -d
   ```

## Test Checklist

### Authentication Flow
- [ ] **Home Page** (`/`)
  - Hero section displays correctly
  - Background video plays
  - Navigation works
  - "Start Level 1" button redirects to courses

- [ ] **Register Page** (`/register`)
  - Form fields work correctly
  - Level selector dropdown functions
  - Submit creates account and redirects
  - Error handling for duplicate emails

- [ ] **Login Page** (`/login`)
  - Login with valid credentials works
  - Error message shows for invalid credentials
  - Redirects to courses on success
  - "Create new account" link works

### Course Flow
- [ ] **Courses Page** (`/courses`)
  - Lists all available worlds
  - Shows lock status correctly
  - Progress bars display
  - Clicking world navigates to world detail

- [ ] **World Detail** (`/courses/[id]`)
  - Shows all lessons in world
  - Lock/unlock status per lesson
  - Progress tracking
  - "Start First Lesson" button works

- [ ] **Lesson Page** (`/lesson/[id]`)
  - Video player loads and plays
  - Quest log sidebar shows correct state
  - Complete button awards XP
  - Level up notification appears
  - Next lesson unlocks after completion
  - Navigation between lessons works

### Profile & User Features
- [ ] **Profile Page** (`/profile`)
  - Displays user stats (XP, Level, Streak)
  - Level progress bar calculates correctly
  - Avatar displays (or placeholder)
  - "Continue Learning" link works

### Pricing
- [ ] **Pricing Page** (`/pricing`)
  - All three tiers display
  - "Most Popular" badge on Social Dancer
  - Feature lists are correct
  - Buttons are clickable (Stripe integration pending)

### Admin Features
- [ ] **Admin Dashboard** (`/admin`)
  - Requires admin role
  - Stats display correctly
  - Sidebar navigation works
  - Quick actions function

- [ ] **Admin Grading** (`/admin/grading`)
  - Lists pending submissions
  - Video player works
  - Approve/Reject buttons function
  - Feedback textarea works
  - Submission queue updates after grading

- [ ] **Admin Builder** (`/admin/builder`)
  - World settings form works
  - Lesson list displays
  - Add lesson button (UI ready)
  - Save/Preview buttons (UI ready)

### Global Features
- [ ] **NavBar**
  - Shows user info when logged in
  - XP and Streak display
  - Avatar/initial shows
  - Logout works (if implemented)

- [ ] **Global Audio Player**
  - Background music plays
  - Mute/unmute toggle works
  - Persists across navigation

- [ ] **Footer**
  - Links work correctly
  - Styling matches design

## Common Issues & Solutions

### CORS Errors
- Ensure backend CORS is configured for `http://localhost:3000`
- Check `backend/config.py` CORS_ORIGINS setting

### Authentication Errors
- Check that JWT token is being stored in localStorage
- Verify token is sent in Authorization header
- Check backend SECRET_KEY is set

### API Connection Errors
- Verify backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure database is initialized

### Video Not Playing
- Check video URLs are valid
- Verify CORS allows video resources
- Check browser console for errors

## Manual Test Scenarios

### Scenario 1: New User Registration
1. Go to `/register`
2. Fill in all fields
3. Select "Beginner" level
4. Submit form
5. Should redirect to `/courses`
6. Check profile shows XP=0, Level=1

### Scenario 2: Complete First Lesson
1. Login as existing user
2. Go to `/courses`
3. Click on first world
4. Click on first lesson
5. Watch video (or skip)
6. Click "Complete & Claim XP"
7. Verify XP increases
8. Check next lesson unlocks

### Scenario 3: Admin Grading
1. Login as admin user
2. Go to `/admin/grading`
3. Select a submission
4. Watch video
5. Add feedback
6. Click "Approve & Unlock"
7. Verify submission moves out of queue

## Browser Testing

Test in:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Mobile viewport (responsive design)

## Performance Checks

- [ ] Page load times < 2s
- [ ] Images lazy load
- [ ] Video doesn't block initial render
- [ ] Smooth navigation transitions

