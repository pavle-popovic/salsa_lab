import React from 'react';

// Inferring SubmissionResponse based on the HTML content
interface SubmissionResponse {
    id: string; // Assuming an ID for unique identification
    studentName: string;
    timeAgo: string;
    challengeTitle: string;
}

interface SubmissionCardProps {
    submission: SubmissionResponse;
    onSelect: () => void;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({ submission, onSelect }) => {
    return (
        <div
            className="p-4 bg-gray-800 border-l-4 border-mambo-blue cursor-pointer"
            onClick={onSelect}
        >
            <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm">{submission.studentName}</span>
                <span className="text-xs text-gray-400">{submission.timeAgo}</span>
            </div>
            <div className="text-xs text-gray-300">{submission.challengeTitle}</div>
        </div>
    );
};

export default SubmissionCard;