import React from 'react';

interface Badge {
    emoji: string;
    title: string;
    description: string;
}

interface BadgeGridProps {
    badges: Badge[];
}

const BadgeGrid: React.FC<BadgeGridProps> = ({ badges }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {badges.map((badge, index) => (
                <div key={index} className="bg-mambo-panel p-4 rounded-xl text-center border border-gray-800">
                    <div className="text-3xl mb-2">{badge.emoji}</div>
                    <div className="text-sm font-bold">{badge.title}</div>
                    <div className="text-xs text-gray-500">{badge.description}</div>
                </div>
            ))}
        </div>
    );
};

export default BadgeGrid;