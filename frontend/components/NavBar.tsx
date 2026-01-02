import React from 'react';

interface UserProfileResponse {
    id: string;
    username: string;
    email: string;
    profile_picture_url?: string; // Optional profile picture URL
}

interface NavBarProps {
    user?: UserProfileResponse;
}

const NavBar: React.FC<NavBarProps> = ({ user }) => {
    return (
        <nav className="border-b border-gray-800 bg-mambo-dark sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <a href="/" className="text-lg font-bold flex items-center gap-2">
                    <i className="fa-solid fa-flask text-mambo-blue"></i> THE SALSA LAB
                </a>
                <div className="flex items-center gap-4">
                    {user ? (
                        // Logged In State
                        <>
                            <img
                                src={user.profile_picture_url || "https://i.pravatar.cc/150?img=68"}
                                alt={user.username || "User Profile"}
                                className="w-8 h-8 rounded-full border border-gray-600"
                            />
                            <a href="/profile" className="text-sm font-semibold hover:text-mambo-blue">My Profile</a>
                        </>
                    ) : (
                        // Logged Out State
                        <a href="/login" className="px-5 py-2 text-sm font-semibold hover:text-white text-gray-300">Log In</a>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;