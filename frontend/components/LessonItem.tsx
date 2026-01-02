import React from 'react';

interface LessonResponse {
    id: string;
    title: string;
    duration: string; // e.g., "10 min"
    xp: string;       // e.g., "50 XP"
}

interface LessonItemProps {
    lesson: LessonResponse;
    isActive: boolean;
}

const LessonItem: React.FC<LessonItemProps> = ({ lesson, isActive }) => {
    const itemClasses = `p-3 rounded-lg cursor-pointer flex gap-3 items-center transition ${
        isActive
            ? 'bg-blue-900/20 border border-blue-500/30'
            : 'hover:bg-gray-800 border border-transparent' // Inactive state, transparent border to maintain size
    }`;

    const iconContainerClasses = `w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
        isActive ? 'bg-mambo-blue' : 'bg-gray-700' // Using bg-gray-700 for inactive icon as seen in QuestLogSidebar
    }`;

    const titleClasses = `text-sm font-bold ${isActive ? 'text-blue-200' : 'text-gray-400'}`; // Using text-gray-400 for inactive title
    const detailsClasses = `text-[10px] ${isActive ? 'text-blue-400' : 'text-gray-500'}`; // Using text-gray-500 for inactive details

    return (
        <div className={itemClasses}>
            <div className={iconContainerClasses}>
                <i className="fa-solid fa-play"></i>
            </div>
            <div className="flex-1">
                <div className={titleClasses}>{lesson.title}</div>
                <div className={detailsClasses}>{lesson.duration} • {lesson.xp}</div>
            </div>
        </div>
    );
};

export default LessonItem;