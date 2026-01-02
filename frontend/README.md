# The Salsa Lab - Frontend

This is the frontend application for The Salsa Lab, built with **React**, **TypeScript**, and **Tailwind CSS**.

## Technical Structure

- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Hooks (useState, useEffect, Context)
- **Icons**: FontAwesome

### Directory Structure

- `src/components/`: Reusable UI components (NavBar, HeroSection, VideoPlayer, etc.).
- `src/pages/`: Page components corresponding to routes (LandingPage, CoursesPage, LessonPage, etc.).
- `src/App.tsx`: Main application component and route definitions.
- `src/main.tsx`: Entry point.

### Key Features

- **Gamified UI**: XP toasts, progress bars, and level-up notifications.
- **Video Player**: Custom video player with progress tracking.
- **Admin Dashboard**: Dedicated interface for instructors to manage content and grade submissions.
- **Responsive Design**: Mobile-first approach using Tailwind.

## How to Run Locally

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Set up Environment Variables**:
    Create a `.env` file if needed (e.g., for API base URL if not proxying).
    ```env
    VITE_API_URL=http://localhost:8000
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:3000` (or the port shown in the terminal).