import React, { useState, useEffect } from 'react';

// Import components - Corrected relative paths
import NavBar from '../../components/NavBar';
import HeroSection from '../../components/HeroSection';
import FeatureGrid from '../../components/FeatureGrid';
import Footer from '../../components/Footer';

// Define the UserProfileResponse interface as expected by NavBar
interface UserProfileForNavBar {
    id: string;
    username: string;
    email?: string; // Optional, as it's not directly available from /api/users/me
    profile_picture_url?: string;
}

// Backend's UserProfileResponse structure (as per architecture_plan.md)
interface BackendUserProfileResponse {
    id: string;
    first_name: string;
    last_name: string;
    xp: number;
    level: number;
    streak_count: number;
    tier: string;
    avatar_url?: string;
}

const LandingPage: React.FC = () => {
    const [userProfile, setUserProfile] = useState<UserProfileForNavBar | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
            if (!token) {
                setLoading(false);
                return; // No token, user is not logged in
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
                    // Map backend profile to NavBar's expected profile structure
                    const mappedProfile: UserProfileForNavBar = {
                        id: backendProfile.id,
                        username: `${backendProfile.first_name} ${backendProfile.last_name}`,
                        profile_picture_url: backendProfile.avatar_url,
                        email: '', // Email is not directly in BackendUserProfileResponse, providing empty string
                    };
                    setUserProfile(mappedProfile);
                } else if (response.status === 401) {
                    // Token expired or invalid, user is effectively logged out
                    localStorage.removeItem('token');
                    setUserProfile(undefined);
                } else {
                    setError('Failed to fetch user profile.');
                    console.error('Failed to fetch user profile:', response.status, response.statusText);
                }
            } catch (err) {
                setError('Network error or failed to parse response.');
                console.error('Error fetching user profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();

        // Initialize AOS after component mounts
        // Check if AOS is available globally (e.g., loaded via a script in index.html)
        // The prompt's skeleton included this script, so we assume AOS is loaded globally.
        if (typeof AOS !== 'undefined') {
            AOS.init({
                once: true, // Animation happens only once
                offset: 100, // Offset (in px) from the original trigger point
            });
        } else {
            console.warn("AOS library not found. Ensure it's loaded.");
        }
    }, []); // Empty dependency array means this runs once on mount

    return (
        <div className="bg-mambo-dark text-white font-sans overflow-x-hidden">
            <NavBar user={userProfile} />
            <HeroSection
                ctaPrimaryLink="/courses" // Link to courses page
                ctaSecondaryLink="#about" // Link to FeatureGrid section
            />
            <FeatureGrid />
            <Footer />
        </div>
    );
};

export default LandingPage;