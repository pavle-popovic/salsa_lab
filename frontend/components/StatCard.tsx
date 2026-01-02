import React from 'react';

interface StatCardProps {
    icon: string;
    label: string;
    value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => {
    return (
        <div className="bg-mambo-panel border border-gray-800 px-4 py-2 rounded-lg flex items-center gap-3">
            <i className={`${icon} text-mambo-gold`}></i>
            <div>
                <div className="text-xs text-gray-500 uppercase font-bold">{label}</div>
                <div className="font-bold">{value}</div>
            </div>
        </div>
    );
};

export default StatCard;