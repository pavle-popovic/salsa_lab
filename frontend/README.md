# The Mambo Inn - Frontend

Next.js frontend application for The Mambo Inn LMS platform.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Axios** (via fetch API)
- **Framer Motion** (for animations)
- **React Icons** (for icons)
- **AOS** (Animate On Scroll)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8000`
- PostgreSQL and Redis running (via docker-compose)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── login/             # Login page
│   ├── register/           # Registration page
│   ├── courses/           # Courses listing
│   ├── lesson/[id]/       # Lesson player
│   ├── profile/           # User profile
│   ├── pricing/           # Pricing page
│   └── admin/             # Admin pages
├── components/            # Reusable React components
│   ├── NavBar.tsx
│   ├── Footer.tsx
│   ├── GlobalAudioPlayer.tsx
│   ├── QuestLogSidebar.tsx
│   └── AdminSidebar.tsx
├── contexts/              # React Context providers
│   └── AuthContext.tsx    # Authentication state
├── lib/                   # Utility functions
│   └── api.ts             # API client
└── public/               # Static assets
    └── assets/            # Images, videos, audio
```

## Features

### Authentication
- User registration with level selection
- Login with JWT tokens
- Persistent sessions via localStorage
- Protected routes

### Course System
- World-based course structure
- Lesson progression with locking
- Video player integration
- XP rewards on completion
- Progress tracking

### Gamification
- XP system with level calculation
- Streak tracking
- Badge system (UI ready)
- Leaderboard (UI ready)

### Admin Features
- Dashboard with statistics
- Grading queue for boss battles
- Course builder interface

## API Integration

All API calls are handled through `lib/api.ts`. The API client:
- Automatically includes JWT tokens
- Handles errors gracefully
- Stores tokens in localStorage

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)

## Building for Production

```bash
npm run build
npm start
```

## Testing

See `test_frontend.md` for comprehensive testing guide.
