import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Import components
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import PricingCard from '../../components/PricingCard';

// --- Interfaces for API Responses ---
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

// --- Interfaces for Component Props (mapping from API) ---
interface NavBarUserProps {
    id: string;
    username: string;
    email?: string;
    profile_picture_url?: string;
}

// Define the interface for the component's props, even if empty for a page component
interface PricingPageProps {}

const PricingPage: React.FC<PricingPageProps> = () => {
    const [userProfile, setUserProfile] = useState<NavBarUserProps | undefined>(undefined);
    const [loadingUser, setLoadingUser] = useState<boolean>(true);
    const [errorUser, setErrorUser] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoadingUser(true);
            setErrorUser(null);
            const token = localStorage.getItem('token');

            if (!token) {
                setLoadingUser(false);
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
                    setUserProfile({
                        id: backendProfile.id,
                        username: `${backendProfile.first_name} ${backendProfile.last_name}`,
                        profile_picture_url: backendProfile.avatar_url,
                        email: '', // Email not directly from /me, leaving empty
                    });
                } else if (response.status === 401) {
                    localStorage.removeItem('token');
                    setUserProfile(undefined);
                } else {
                    console.error('Failed to fetch user profile:', response.status, response.statusText);
                    setErrorUser('Failed to load user data.');
                }
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setErrorUser('Network error or failed to parse response.');
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUserProfile();
    }, []);

    // Hardcoded pricing data as no API endpoint for pricing tiers was specified
    const pricingTiers = [
        {
            tier: 'Rookie',
            price: '0',
            features: [
                'Access to World 1',
                'Basic step tutorials',
                'Community forum access',
                'Limited XP gain',
            ],
            isPopular: false,
        },
        {
            tier: 'Social Dancer',
            price: '29',
            features: [
                'All Rookie features',
                'Access to all Worlds',
                'Unlimited XP gain',
                'Boss Battle submissions',
                'Instructor feedback',
                'Exclusive workshops',
            ],
            isPopular: true,
        },
        {
            tier: 'Performer',
            price: '49',
            features: [
                'All Social Dancer features',
                'Priority instructor feedback',
                '1-on-1 coaching session (monthly)',
                'Advanced styling courses',
                'Performance opportunities',
                'Early access to new content',
            ],
            isPopular: false,
        },
    ];

    return (
        <div className="bg-mambo-dark text-white font-sans min-h-screen">
            <NavBar user={userProfile} />

            <div className="max-w-7xl mx-auto px-6 py-16 text-center">
                <h1 className="text-5xl font-extrabold mb-4">Choose Your Player Mode</h1>
                <p className="text-xl text-gray-400 mb-16 max-w-2xl mx-auto">Start with the basics or unlock the full academy. Cancel anytime.</p>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {pricingTiers.map((tier, index) => (
                        <PricingCard
                            key={index}
                            tier={tier.tier}
                            price={tier.price}
                            features={tier.features}
                            isPopular={tier.isPopular}
                        />
                    ))}
                </div>
                
                <div className="mt-16 text-gray-500 text-sm">
                    <p>Secure payment powered by Stripe. <br/>Questions? Email support@mambolab.com</p>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default PricingPage;