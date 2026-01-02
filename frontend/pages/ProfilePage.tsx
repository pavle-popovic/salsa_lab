import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Import Components
import NavBar from '../../components/NavBar';
import ProfileHeader from '../../components/ProfileHeader';
import StatCard from '../../components/StatCard';
import StreakDisplay from '../../components/StreakDisplay';
import ActivityFeed from '../../components/ActivityFeed';
import BadgeGrid from '../../components/BadgeGrid';
// Button is not directly used in the ProfilePage, but the 'Continue Learning' card has a play icon which implies navigation.

// --- Interfaces for API Responses ---
interface BackendUserProfileResponse {
    id: string;
    first_name: string;
    last_name: string;
    xp: number;
    level: number;
    streak_count: number;
    tier: string; // e.g., "rookie", "social_dancer", "performer"
    avatar_url?: string;
    badges?: { emoji: string; title: string; description: string; }[];
    // Assuming progress data for 'Continue Learning' is part of user profile or a separate endpoint
    // For now, let's assume a simplified structure for the 'Continue Learning' card
    current_world_progress?: {
        world_id: string;
        world_title: string;
        next_lesson_title: string;
        progress_percentage: number;
        world_image_url: string;
        world_slug: string;
    };
}

// --- Interfaces for Component Props (mapping from API) ---
interface NavBarUserProps {
    id: string;
    username: string;
    email?: string;
    profile_picture_url?: string;
}

interface ProfileHeaderProfileProps {
    id: string;
    username: string;
    email?: string;
    profile_picture_url?: string;
    level: number;
    title: string;
    memberSince: number;
}

interface Badge {
    emoji: string;
    title: string;
    description: string;
}

interface ActivityItem {
    id: string;
    initials: string;
    initialsBgColor: string; // e.g., "bg-purple-500"
    userName: string;
    action: string;
    timeAgo: string;
}

// Define the interface for the component's props, even if empty for a page component
interface ProfilePageProps {}

const ProfilePage: React.FC<ProfilePageProps> = () => {
    const [userProfile, setUserProfile] = useState<BackendUserProfileResponse | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login'); // Redirect to login if not authenticated
                return;
            }

            try {
                const response = await fetch('/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const backendProfile: BackendUserProfileResponse = await response.json();
                    setUserProfile(backendProfile);
                } else if (response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    console.error('Failed to fetch user profile:', response.status, response.statusText);
                    setError('Failed to load profile data.');
                }
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError('Network error or failed to parse response.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [navigate]);

    if (loading) {
        return (
            <div className="bg-mambo-dark text-white font-sans min-h-screen flex items-center justify-center">
                <p>Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-mambo-dark text-white font-sans min-h-screen flex items-center justify-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (!userProfile) {
        // This case should ideally be handled by the navigate('/login') above,
        // but as a fallback, or if the userProfile is null after loading.
        return (
            <div className="bg-mambo-dark text-white font-sans min-h-screen flex items-center justify-center">
                <p>Profile data not available.</p>
            </div>
        );
    }

    // Map backend profile to NavBar props
    const navBarUser: NavBarUserProps = {
        id: userProfile.id,
        username: `${userProfile.first_name} ${userProfile.last_name}`,
        profile_picture_url: userProfile.avatar_url,
    };

    // Map backend profile to ProfileHeader props
    const profileHeaderData: ProfileHeaderProfileProps = {
        id: userProfile.id,
        username: `${userProfile.first_name} ${userProfile.last_name}`,
        profile_picture_url: userProfile.avatar_url,
        level: userProfile.level,
        title: userProfile.tier.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()), // Capitalize and replace underscores
        memberSince: new Date().getFullYear(), // Placeholder, ideally from user.created_at
    };

    // Mock data for ActivityFeed as no specific API is defined
    const mockActivities: ActivityItem[] = [
        { id: '1', initials: 'JD', initialsBgColor: 'bg-blue-500', userName: 'John Doe', action: 'completed "The Basic Step"', timeAgo: '2 hours ago' },
        { id: '2', initials: 'AS', initialsBgColor: 'bg-green-500', userName: 'Alice Smith', action: 'earned "Beginner Badge"', timeAgo: '1 day ago' },
        { id: '3', initials: 'MJ', initialsBgColor: 'bg-purple-500', userName: 'Maria Jones', action: 'submitted "Cross Body Lead" boss battle', timeAgo: '3 days ago' },
        { id: '4', initials: 'RW', initialsBgColor: 'bg-red-500', userName: 'Robert White', action: 'leveled up to Lvl 5', timeAgo: '5 days ago' },
    ];

    // Map badges from userProfile, or provide an empty array
    const userBadges: Badge[] = userProfile.badges || [];

    // Placeholder for 'Continue Learning' card data
    const continueLearningData = userProfile.current_world_progress || {
        world_id: 'mock-world-1',
        world_title: 'World 1: The Foundation',
        next_lesson_title: 'The Cross Body Lead',
        progress_percentage: 45,
        world_image_url: 'https://images.unsplash.com/photo-1504609773096-104ff10587a2?auto=format&fit=crop&w=400&q=80',
        world_slug: 'world-1-foundation',
    };

    return (
        <div className="bg-mambo-dark text-white font-sans min-h-screen">
            <NavBar user={navBarUser} />

            <div className="max-w-5xl mx-auto px-6 py-10">
                
                <ProfileHeader profile={profileHeaderData} />

                {/* Stats are rendered here, outside ProfileHeader, but visually grouped. */}
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-12 -mt-8 md:-mt-10">
                    <StatCard icon="fa-solid fa-bolt" label="XP" value={userProfile.xp} />
                    <StatCard icon="fa-solid fa-star" label="Level" value={userProfile.level} />
                    <StreakDisplay days={userProfile.streak_count} />
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    
                    <div className="md:col-span-2">
                        <h2 className="text-xl font-bold mb-4">Continue Learning</h2>
                        
                        <Link to={`/courses/${continueLearningData.world_slug}`} className="bg-mambo-panel border border-gray-800 rounded-xl p-6 flex gap-6 items-center group cursor-pointer hover:border-gray-600 transition">
                            <div className="w-32 h-20 bg-gray-800 rounded-lg overflow-hidden shrink-0">
                                <img src={continueLearningData.world_image_url} className="w-full h-full object-cover" alt={continueLearningData.world_title} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <h3 className="font-bold text-lg">{continueLearningData.world_title}</h3>
                                    <span className="text-xs font-bold text-green-500">IN PROGRESS</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-3">Next Lesson: {continueLearningData.next_lesson_title}</p>
                                <div className="w-full bg-gray-800 h-1.5 rounded-full">
                                    <div className="bg-mambo-blue h-full" style={{ width: `${continueLearningData.progress_percentage}%` }}></div>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-mambo-blue flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition">
                                <i className="fa-solid fa-play"></i>
                            </div>
                        </Link>

                        <h2 className="text-xl font-bold mb-4 mt-10">Recent Achievements</h2>
                        <BadgeGrid badges={userBadges} />
                    </div>

                    <div className="md:col-span-1">
                        <h2 className="text-xl font-bold mb-4">Squad Activity</h2>
                        <ActivityFeed activities={mockActivities} />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;