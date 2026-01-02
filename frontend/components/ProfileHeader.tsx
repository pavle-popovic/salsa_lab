import React from 'react';

// Extending UserProfileResponse based on the needs of ProfileHeader
// This interface would ideally be in a shared types file.
interface UserProfileResponse {
    id: string;
    username: string;
    email: string;
    profile_picture_url?: string;
    level: number; // e.g., 3
    title: string; // e.g., "Mambo Engineer"
    memberSince: number; // e.g., 2024
    // Add other profile-specific fields as needed, e.g., stats
}

interface ProfileHeaderProps {
    profile: UserProfileResponse;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
    const defaultProfilePic = "https://i.pravatar.cc/300?img=68"; // Default avatar if none provided

    return (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
            <div className="relative">
                <img
                    src={profile.profile_picture_url || defaultProfilePic}
                    alt={`${profile.username}'s profile`}
                    className="w-32 h-32 rounded-full border-4 border-mambo-panel shadow-2xl"
                />
                <div className="absolute bottom-1 right-1 bg-mambo-gold text-black text-xs font-bold px-2 py-1 rounded-full border border-black">
                    Lvl {profile.level}
                </div>
            </div>

            <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold mb-2">{profile.username}</h1>
                <p className="text-gray-400 mb-6">{profile.title} • Member since {profile.memberSince}</p>

                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    {/* Stats go here */}
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;