import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Import Components
import AdminSidebar from '../../components/AdminSidebar';
import CourseEditor from '../../components/CourseEditor';

// --- Interfaces for API Responses ---

// From /api/courses/worlds (simplified list)
interface BasicWorldResponse {
    id: string;
    title: string;
    slug: string;
    is_published: boolean;
    // Other fields like description, image_url, difficulty are also present but not strictly needed for initial list
}

// Detailed Lesson structure for CourseEditor
interface LessonForEditor {
    id: string;
    title: string;
    description: string;
    video_url: string;
    xp_value: number;
    order_index: number;
    is_boss_battle: boolean;
    duration_minutes: number;
}

// Detailed Level structure for CourseEditor
interface LevelForEditor {
    id: string;
    title: string;
    order_index: number;
    lessons: LessonForEditor[];
}

// Detailed World structure for CourseEditor (from /api/courses/worlds/{world_slug})
interface WorldForEditor {
    id: string;
    title: string;
    description: string;
    slug: string;
    order_index: number;
    is_free: boolean;
    image_url: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    is_published: boolean;
    levels: LevelForEditor[];
}

// Define the interface for the component's props
interface AdminBuilderPageProps {}

const AdminBuilderPage: React.FC<AdminBuilderPageProps> = () => {
    const [currentWorld, setCurrentWorld] = useState<WorldForEditor | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWorldData = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login'); // Redirect to login if not authenticated
                return;
            }

            try {
                // First, fetch a list of all worlds to determine which one to load
                const allWorldsResponse = await fetch('/api/courses/worlds', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!allWorldsResponse.ok) {
                    if (allWorldsResponse.status === 401 || allWorldsResponse.status === 403) {
                        localStorage.removeItem('token');
                        navigate('/login');
                        return;
                    }
                    throw new Error(`Failed to fetch worlds list: ${allWorldsResponse.statusText}`);
                }

                const basicWorlds: BasicWorldResponse[] = await allWorldsResponse.json();

                if (basicWorlds.length > 0) {
                    // If worlds exist, load the first one for editing by default
                    const firstWorldSlug = basicWorlds[0].slug;
                    const detailedWorldResponse = await fetch(`/api/courses/worlds/${firstWorldSlug}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!detailedWorldResponse.ok) {
                        if (detailedWorldResponse.status === 401 || detailedWorldResponse.status === 403) {
                            localStorage.removeItem('token');
                            navigate('/login');
                            return;
                        }
                        throw new Error(`Failed to fetch detailed world data: ${detailedWorldResponse.statusText}`);
                    }

                    const detailedWorld: WorldForEditor = await detailedWorldResponse.json();
                    setCurrentWorld(detailedWorld);
                } else {
                    // If no worlds exist, initialize a default "new world" for creation
                    setCurrentWorld({
                        id: 'new-world', // Temporary ID for a new world
                        title: 'New World Title',
                        description: 'A description for your new world.',
                        slug: 'new-world-slug',
                        order_index: 0,
                        is_free: false,
                        image_url: 'https://via.placeholder.com/1200x600?text=New+World+Image',
                        difficulty: 'Beginner',
                        is_published: false,
                        levels: [], // Start with no levels
                    });
                }

            } catch (err) {
                console.error('Error fetching world data:', err);
                setError('Network error or failed to load world data.');
            } finally {
                setLoading(false);
            }
        };

        fetchWorldData();
    }, [navigate]);

    if (loading) {
        return (
            <div className="bg-mambo-dark text-white font-sans h-screen flex items-center justify-center">
                <p>Loading course editor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-mambo-dark text-white font-sans h-screen flex items-center justify-center">
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }

    if (!currentWorld) {
        return (
            <div className="bg-mambo-dark text-white font-sans h-screen flex items-center justify-center">
                <p>No world data available to edit.</p>
            </div>
        );
    }

    return (
        <body className="bg-mambo-dark text-white font-sans flex h-screen overflow-hidden">
            <AdminSidebar activeRoute={location.pathname} />

            <main className="flex-1 overflow-y-auto">
                <CourseEditor world={currentWorld} />
            </main>
        </body>
    );
};

export default AdminBuilderPage;