import React from 'react';

interface StreakDisplayProps {
    days: number;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ days }) => {
    return (
        <div className="bg-mambo-panel border border-gray-800 px-4 py-2 rounded-lg flex items-center gap-3">
            <i className="fa-solid fa-fire text-orange-500"></i>
            <div>
                <div className="text-xs text-gray-500 uppercase font-bold">Streak</div>
                <div className="font-bold">{days} Days</div>
            </div>
        </div>
    );
};

export default StreakDisplay;