import React, { useState } from 'react';

// Inferred basic structure for SubmissionResponse
interface SubmissionResponse {
    id: string;
    studentId: string;
    studentName: string;
    lessonId: string;
    lessonTitle: string;
    submissionContentUrl?: string; // URL to video or other submission content
    writtenSubmission?: string; // Text-based submission
    status: 'pending' | 'graded' | 'redo_requested';
    submittedAt: string; // ISO date string
}

// Inferred basic structure for GradeSubmissionRequest
interface GradeSubmissionRequest {
    submissionId: string;
    feedback: string;
    action: 'approve' | 'request_redo';
    // Potentially add a grade or score if applicable
}

interface GradingPanelProps {
    submission: SubmissionResponse;
    onGrade: (data: GradeSubmissionRequest) => void;
}

const GradingPanel: React.FC<GradingPanelProps> = ({ submission, onGrade }) => {
    const [feedback, setFeedback] = useState<string>('');

    const handleGradeAction = (action: 'approve' | 'request_redo') => {
        onGrade({
            submissionId: submission.id,
            feedback: feedback,
            action: action,
        });
        // Optionally clear feedback after submission
        setFeedback('');
    };

    return (
        <div className="bg-mambo-panel border border-gray-800 rounded-xl p-6 flex-1 flex flex-col">
            <h3 className="font-bold mb-4">Instructor Feedback</h3>

            <div className="flex-1 mb-6">
                <label htmlFor="written-feedback" className="block text-xs font-bold text-gray-500 uppercase mb-2">Written Feedback</label>
                <textarea
                    id="written-feedback"
                    className="w-full h-full bg-black border border-gray-700 rounded-lg p-4 text-white focus:border-blue-500 outline-none resize-none"
                    placeholder="Great job Maria! Your timing is solid. Watch your left arm on the turn..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                ></textarea>
            </div>

            <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Or Record Video Reply</label>
                <button className="w-full py-3 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-400 transition flex items-center justify-center gap-2">
                    <i className="fa-solid fa-video"></i> Record with Camera
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-auto">
                <button
                    className="py-3 bg-red-900/30 text-red-500 border border-red-900 hover:bg-red-900/50 rounded-lg font-bold transition"
                    onClick={() => handleGradeAction('request_redo')}
                >
                    <i className="fa-solid fa-xmark mr-2"></i> Request Re-do
                </button>
                <button
                    className="py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition shadow-lg shadow-green-900/20"
                    onClick={() => handleGradeAction('approve')}
                >
                    <i className="fa-solid fa-check mr-2"></i> Approve & Unlock
                </button>
            </div>
        </div>
    );
};

export default GradingPanel;