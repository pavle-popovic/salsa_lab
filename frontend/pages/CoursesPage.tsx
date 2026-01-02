import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Import components
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import WorldCard from '../../components/WorldCard';

// --- Interfaces for API Responses ---
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

interface WorldApiResponse {
    id: string;
    title: string;
    description: string;
    image_url: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    progress_percentage: number;
    is_locked: boolean;
    slug: string; // Added slug for potential linking
}

// --- Interfaces for Component Props (mapping from API) ---
interface NavBarUserProps {
    id: string;
    username: string;
    email?: string;
    profile_picture_url?: string;
}

interface WorldCardData {
    id: string;
    name: string;
    tag: string; // Maps to difficulty
    imageSrc: string;
    description: string;
    progressPercentage: number;
    buttonText: string;
    buttonActionLink?: string;
}

// Define the interface for the component's props, even if empty for a page component
interface CoursesPageProps {}

const CoursesPage: React.FC<CoursesPageProps> = () => {
    const [userProfile, setUserProfile] = useState<NavBarUserProps | undefined>(undefined);
    const [worlds, setWorlds] = useState<WorldCardData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchPageData = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            // Fetch User Profile for NavBar
            if (token) {
                try {
                    const userResponse = await fetch('/api/users/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (userResponse.ok) {
                        const backendProfile: UserProfileResponse = await userResponse.json();
                        setUserProfile({
                            id: backendProfile.id,
                            username: `${backendProfile.first_name} ${backendProfile.last_name}`,
                            profile_picture_url: backendProfile.avatar_url,
                            email: '', // Email not directly from /me, leaving empty
                        });
                    } else if (userResponse.status === 401) {
                        // Token expired or invalid
                        localStorage.removeItem('token');
                        setUserProfile(undefined);
                        // Optionally navigate to login, but for a public page, just show logged out state
                    } else {
                        console.error('Failed to fetch user profile:', userResponse.status, userResponse.statusText);
                    }
                } catch (err) {
                    console.error('Error fetching user profile:', err);
                }
            }

            // Fetch Course Worlds
            try {
                const worldsResponse = await fetch('/api/courses/worlds', {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` }), // Include token if available
                    },
                });

                if (worldsResponse.ok) {
                    const backendWorlds: WorldApiResponse[] = await worldsResponse.json();
                    const mappedWorlds: WorldCardData[] = backendWorlds.map(world => ({
                        id: world.id,
                        name: world.title,
                        tag: world.difficulty,
                        imageSrc: world.image_url,
                        description: world.description,
                        progressPercentage: world.progress_percentage,
                        buttonText: world.is_locked ? 'Unlock World' : 'View Course',
                        buttonActionLink: world.is_locked ? '/pricing' : `/courses/${world.slug}`, // Link to pricing or a course detail page
                    }));
                    setWorlds(mappedWorlds);
                } else {
                    setError('Failed to fetch courses.');
                    console.error('Failed to fetch courses:', worldsResponse.status, worldsResponse.statusText);
                }
            } catch (err) {
                setError('Network error or failed to parse response.');
                console.error('Error fetching courses:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPageData();
    }, []); // Empty dependency array means this runs once on mount

    const filteredWorlds = worlds.filter(world => {
        if (activeFilter === 'All') {
            return true;
        }
        return world.tag === activeFilter;
    });

    const handleWorldCardClick = (link?: string) => {
        if (link) {
            navigate(link);
        }
    };

    return (
        <div className="bg-mambo-dark text-white font-sans min-h-screen">
            <NavBar user={userProfile} />

            <div className="bg-mambo-panel border-b border-gray-800 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <h1 className="text-4xl font-bold mb-4">Explore Worlds</h1>
                    <p className="text-gray-400 mb-8 max-w-2xl">Follow the path. Master the foundation before you unlock the flair.</p>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={activeFilter === 'All' ? 'primary' : 'outline'}
                            onClick={() => setActiveFilter('All')}
                            className="px-4 py-2 text-sm font-bold"
                        >
                            All Courses
                        </Button>
                        <Button
                            variant={activeFilter === 'Beginner' ? 'primary' : 'outline'}
                            onClick={() => setActiveFilter('Beginner')}
                            className="px-4 py-2 text-sm font-medium border border-gray-700"
                        >
                            Beginner
                        </Button>
                        <Button
                            variant={activeFilter === 'Intermediate' ? 'primary' : 'outline'}
                            onClick={() => setActiveFilter('Intermediate')}
                            className="px-4 py-2 text-sm font-medium border border-gray-700"
                        >
                            Intermediate
                        </Button>
                        <Button
                            variant={activeFilter === 'Advanced' ? 'primary' : 'outline'}
                            onClick={() => setActiveFilter('Advanced')}
                            className="px-4 py-2 text-sm font-medium border border-gray-700"
                        >
                            Advanced
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {loading && (
                    <div className="text-center text-gray-400">Loading courses...</div>
                )}
                {error && (
                    <div className="text-center text-red-500">{error}</div>
                )}
                {!loading && !error && filteredWorlds.length === 0 && (
                    <div className="text-center text-gray-400">No courses found for this filter.</div>
                )}
                {!loading && !error && filteredWorlds.length > 0 && (
                    <div className="grid md:grid-cols-3 gap-8">
                        {filteredWorlds.map(world => (
                            <div key={world.id} onClick={() => handleWorldCardClick(world.buttonActionLink)}>
                                <WorldCard world={world} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default CoursesPage;