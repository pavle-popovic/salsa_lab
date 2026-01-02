import React from 'react';

interface WorldResponse {
    id: string;
    name: string;
    tag: string;
    imageSrc: string;
    description: string;
    progressPercentage: number;
    buttonText: string;
    buttonActionLink?: string;
}

interface WorldCardProps {
    world: WorldResponse;
}

const WorldCard: React.FC<WorldCardProps> = ({ world }) => {
    return (
        <div className="bg-mambo-panel border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition group cursor-pointer">
            <div className="h-48 relative overflow-hidden">
                <img src={world.imageSrc} alt={world.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur px-2 py-1 rounded text-xs font-bold text-white">{world.tag}</div>
            </div>
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg group-hover:text-mambo-blue transition">{world.name}</h3>
                    <i className="fa-solid fa-play-circle text-mambo-blue text-xl"></i>
                </div>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{world.description}</p>
                
                <div className="flex items-center gap-3 text-xs font-semibold text-gray-400 mb-2">
                    <div className="flex-1 bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full" style={{ width: `${world.progressPercentage}%` }}></div>
                    </div>
                    <span>{world.progressPercentage}%</span>
                </div>
                <button className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-bold text-white transition mt-2">
                    {world.buttonText}
                </button>
            </div>
        </div>
    );
};

export default WorldCard;