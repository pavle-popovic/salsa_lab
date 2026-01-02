import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

// Import Components
import NavBar from '../../components/NavBar';
import VideoPlayer from '../../components/VideoPlayer';
import QuestLogSidebar from '../../components/QuestLogSidebar';
import CommentSection from '../../components/CommentSection';
import BossBattleUploader from '../../components/BossBattleUploader';
import XPToast from '../../components/XPToast';

// --- Interfaces for API Responses ---

// User Profile for NavBar
interface UserProfileResponse {
    id: string;
    first_name: string;
    last_name: string;
    xp: number;
    level: number;
    streak_count: number;
    tier: string;
    avatar_url?: string;
}

// Lesson Response for QuestLogSidebar
interface LessonResponse {
    id: string;
    title: string;
    is_completed: boolean; // Renamed from isCompleted to match backend schema
    is_boss_battle: boolean; // Added for sidebar logic
}

// Comment Response for CommentSection
interface CommentResponse {
    id: string;
    user_id: string;
    author: string; // Assuming author name is populated for display
    content: string;
    created_at: string;
    // parent_id?: string; // For threading, not strictly needed for basic display
}

// Extended Lesson Detail Response (Assumption based on UI needs)
interface LessonDetailApiResponse {
    id: string;
    title: string;
    description: string;
    video_url: string;
    xp_value: number;
    is_boss_battle: boolean;
    is_completed: boolean; // User's completion status for this specific lesson
    world_id: string;
    world_title: string;
    world_slug: string;
    lessons_in_world: LessonResponse[]; // All lessons in this world for the sidebar
    comments: CommentResponse[];
}

// XP Gain Response
interface XPGainResponse {
    xp_gained: number;
    new_total_xp: number;
    leveled_up: boolean;
    new_level: number;
}

// --- Component Props Interface ---
interface LessonPageProps {}

const LessonPage: React.FC<LessonPageProps> = () => {
    const { lessonId } = useParams<{ lessonId: string }>();
    const navigate = useNavigate();

    const [userProfile, setUserProfile] = useState<UserProfileResponse | undefined>(undefined);
    const [lesson, setLesson] = useState<LessonDetailApiResponse | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showXPToast, setShowXPToast] = useState<boolean>(false);
    const [xpAmount, setXPAmount] = useState<number>(0);

    // Fetch user profile and lesson details
    useEffect(() => {
        const fetchPageData = async () => {
            if (!lessonId) {
                setError("Lesson ID is missing.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            if (!token) {
                // If no token, redirect to login. Lesson page requires authentication.
                navigate('/login');
                return;
            }

            try {
                // 1. Fetch User Profile for NavBar
                const userResponse = await fetch('/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (userResponse.ok) {
                    const backendProfile: UserProfileResponse = await userResponse.json();
                    setUserProfile(backendProfile);
                } else if (userResponse.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                } else {
                    console.error('Failed to fetch user profile:', userResponse.status, userResponse.statusText);
                    setError('Failed to load user data.');
                }

                // 2. Fetch Lesson Details
                const lessonResponse = await fetch(`/api/courses/lessons/${lessonId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (lessonResponse.ok) {
                    const lessonData: LessonDetailApiResponse = await lessonResponse.json();
                    setLesson(lessonData);
                } else if (lessonResponse.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                } else {
                    console.error('Failed to fetch lesson details:', lessonResponse.status, lessonResponse.statusText);
                    setError('Failed to load lesson content.');
                }

            } catch (err) {
                console.error('Error fetching page data:', err);
                setError('Network error or failed to parse response.');
            } finally {
                setLoading(false);
            }
        };

        fetchPageData();
    }, [lessonId, navigate]);

    const handleCompleteLesson = async () => {
        if (!lessonId || lesson?.is_completed) return;

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`/api/progress/lessons/${lessonId}/complete`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data: XPGainResponse = await response.json();
                setXPAmount(data.xp_gained);
                setShowXPToast(true);
                setTimeout(() => setShowXPToast(false), 3000); // Hide toast after 3 seconds

                // Update lesson status and user profile XP/level
                setLesson(prev => prev ? { ...prev, is_completed: true } : undefined);
                setUserProfile(prev => prev ? {
                    ...prev,
                    xp: data.new_total_xp,
                    level: data.new_level,
                } : undefined);

                // Optionally navigate to the next lesson or update sidebar
                // For now, just update the current lesson's completion status
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to complete lesson.');
            }
        } catch (err) {
            console.error('Error completing lesson:', err);
            setError('Network error during lesson completion.');
        }
    };

    const handleBossBattleUploadComplete = (url: string) => {
        // Logic to handle the uploaded video URL, e.g., submit to backend
        console.log("Boss Battle video uploaded:", url);
        // This would typically trigger a POST to /api/submissions/submit
        // For now, just log it.
    };

    if (loading) {
        return (
            <div className="bg-mambo-dark text-white font-sans h-screen flex items-center justify-center">
                <p>Loading lesson...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-mambo-dark text-white font-sans h-screen flex items-center justify-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="bg-mambo-dark text-white font-sans h-screen flex items-center justify-center">
                <p>Lesson not found.</p>
            </div>
        );
    }

    // Map UserProfileResponse to NavBarProps' UserProfileResponse
    const navBarUser = userProfile ? {
        id: userProfile.id,
        username: `${userProfile.first_name} ${userProfile.last_name}`,
        profile_picture_url: userProfile.avatar_url,
    } : undefined;

    // Map LessonResponse for QuestLogSidebar
    const sidebarLessons = lesson.lessons_in_world.map(l => ({
        id: l.id,
        title: l.title,
        isCompleted: l.is_completed, // Map to component prop name
    }));

    return (
        <div className="bg-mambo-dark text-white font-sans h-screen flex flex-col overflow-hidden">
            <NavBar user={navBarUser} />

            <nav className="border-b border-gray-800 bg-mambo-panel flex-none z-20">
                <div className="px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link to={`/courses/${lesson.world_slug}`} className="text-gray-400 hover:text-white transition">
                            <i className="fa-solid fa-arrow-left"></i> Back to Map
                        </Link>
                        <span className="text-gray-600">|</span>
                        <h1 className="font-bold text-sm md:text-base">
                            {lesson.world_title} / <span className="text-mambo-blue">{lesson.title}</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* XP Boost Active - Placeholder, not dynamic */}
                        <div className="hidden md:block text-xs font-bold text-mambo-gold uppercase tracking-wider">XP Boost Active</div>
                        <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                            <img src={userProfile?.avatar_url || "https://i.pravatar.cc/150?img=68"} alt="User Avatar" />
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 overflow-y-auto bg-black relative flex flex-col">
                    <VideoPlayer url={lesson.video_url} onEnded={handleCompleteLesson} />

                    <div className="max-w-4xl mx-auto w-full px-6 py-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
                                <p className="text-gray-400 text-sm">Target: {lesson.description}</p>
                            </div>
                            {!lesson.is_completed && (
                                <button
                                    className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg shadow-green-900/20 flex items-center gap-2 transition transform active:scale-95"
                                    onClick={handleCompleteLesson}
                                >
                                    <i className="fa-solid fa-check"></i> Complete & Claim {lesson.xp_value} XP
                                </button>
                            )}
                            {lesson.is_completed && (
                                <span className="px-6 py-3 bg-gray-700 text-gray-400 font-bold rounded-lg flex items-center gap-2">
                                    <i className="fa-solid fa-check-double"></i> Completed!
                                </span>
                            )}
                        </div>

                        <CommentSection comments={lesson.comments} lessonId={lesson.id} />

                        <div className="prose prose-invert prose-sm text-gray-300">
                            {/* This static content should ideally come from lesson.description or a separate content field */}
                            <p>{lesson.description}</p>
                            {/* Example static content from skeleton, replace with dynamic if available */}
                            {/* <p>In this lesson, we break down the fundamental rhythm of New York Style Salsa. Unlike linear Salsa On1, we break on the second beat of the measure.</p>
                            <ul className="list-disc pl-5 space-y-2 mt-4">
                                <li><strong>1:</strong> Step in place (Prep)</li>
                                <li><strong>2:</strong> Break Forward (Left foot) - <em>The Accent</em></li>
                                <li><strong>3:</strong> Step in place</li>
                                <li><strong>4:</strong> Hold (Slow)</li>
                            </ul> */}
                        </div>
                    </div>
                </main>

                <QuestLogSidebar
                    currentLessonId={lesson.id}
                    lessons={sidebarLessons}
                    worldTitle={lesson.world_title}
                />
            </div>
            {lesson.is_boss_battle && (
                <div className="absolute bottom-0 right-80 p-4 bg-mambo-panel border-t border-l border-gray-800 rounded-tl-xl z-10">
                    <BossBattleUploader lessonId={lesson.id} onUploadComplete={handleBossBattleUploadComplete} />
                </div>
            )}
            <XPToast xpAmount={xpAmount} isVisible={showXPToast} />
        </div>
    );
};

export default LessonPage;