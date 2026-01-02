import React from 'react';

// Assuming a basic structure for CommentResponse, as it's not provided
// This interface would typically be defined in a shared types file or a backend schema.
interface CommentResponse {
    id: string;
    author: string;
    content: string;
    timestamp: string;
    // Add other relevant fields like userId, replies, etc. as needed
}

interface CommentSectionProps {
    comments: CommentResponse[];
    lessonId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, lessonId }) => {
    // The comments and lessonId props are provided in the interface but not directly
    // used in the current HTML snippet, which only defines the tab navigation.
    // In a full implementation, these would be used to fetch/display comments.

    // For now, we'll just render the tab structure as per the provided HTML.
    // We can add state for active tab and handlers later if needed.

    return (
        <div className="border-b border-gray-800 mb-6">
            <div className="flex gap-8">
                <button className="pb-3 border-b-2 border-white font-bold text-sm">Description</button>
                <button className="pb-3 border-b-2 border-transparent text-gray-400 hover:text-white font-bold text-sm transition">Discussion ({comments.length})</button>
                <button className="pb-3 border-b-2 border-transparent text-gray-400 hover:text-white font-bold text-sm transition">Resources</button>
            </div>
        </div>
    );
};

export default CommentSection;