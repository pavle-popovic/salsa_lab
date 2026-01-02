import React from 'react';

interface BossBattleUploaderProps {
    lessonId: string;
    onUploadComplete: (url: string) => void;
}

const BossBattleUploader: React.FC<BossBattleUploaderProps> = ({ lessonId, onUploadComplete }) => {
    // The current HTML snippet is purely presentational and doesn't include upload logic.
    // In a full implementation, this component would include an input type="file",
    // state for file selection, an upload button, and a handler to call onUploadComplete
    // after a successful upload to a service (e.g., S3).
    // For now, we strictly adhere to the provided HTML structure.

    return (
        <div className="mt-4 p-3 border border-red-900/50 bg-red-900/10 rounded-lg flex gap-3 items-center">
            <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-[10px] text-white"><i className="fa-solid fa-skull"></i></div>
            <div className="flex-1">
                <div className="text-sm font-bold text-red-200">BOSS BATTLE: Tempo</div>
                <div className="text-[10px] text-red-400">Submit Video • 500 XP</div>
            </div>
        </div>
    );
};

export default BossBattleUploader;