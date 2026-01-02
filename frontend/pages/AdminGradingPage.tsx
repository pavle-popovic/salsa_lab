import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Import Components
import AdminSidebar from '../../components/AdminSidebar';
import SubmissionCard from '../../components/SubmissionCard';
import GradingPanel from '../../components/GradingPanel';
import Button from '../../components/Button'; // Assuming Button might be used for navigation or actions

// --- Interfaces for API Responses and Component Props ---

// Detailed Submission Response for the frontend, combining info from multiple backend models
interface SubmissionResponse {
    id: string;
    studentId: string;
    studentName: string;
    studentAvatarUrl?: string;
    lessonId: string;
    lessonTitle: string;
    worldId: string;
    worldTitle: string;
    worldSlug: string;
    submittedAt: string; // ISO date string
    videoUrl: string;
    studentNote?: string; // Assuming this can be part of the submission or derived
    attemptNumber: number; // Assuming this is tracked or derived
    status: 'pending' | 'approved' | 'rejected';
    instructorFeedback?: string;
    instructorVideoUrl?: string;
}

// Request body for grading a submission
interface GradeSubmissionRequest {
    submissionId: string;
    feedback: string;
    action: 'approve' | 'request_redo'; // Maps to 'approved' or 'rejected' status
    // instructorVideoUrl?: string; // Optional, if we implement video replies
}

// Define the interface for the component's props
interface AdminGradingPageProps {}

const AdminGradingPage: React.FC<AdminGradingPageProps> = () => {
    const [pendingSubmissions, setPendingSubmissions] = useState<SubmissionResponse[]>([]);
    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionResponse | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Helper to format time ago
    const timeAgo = (dateString: string): string => {
        const now = new Date();
        const submitted = new Date(dateString);
        const seconds = Math.floor((now.getTime() - submitted.getTime()) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    // Fetch pending submissions on component mount
    useEffect(() => {
        const fetchPendingSubmissions = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login'); // Redirect to login if not authenticated
                return;
            }

            try {
                const response = await fetch('/api/admin/submissions', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data: SubmissionResponse[] = await response.json();
                    setPendingSubmissions(data.filter(sub => sub.status === 'pending')); // Filter for pending
                    if (data.length > 0) {
                        // Automatically select the first pending submission
                        setSelectedSubmission(data[0]);
                    }
                } else if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    console.error('Failed to fetch pending submissions:', response.status, response.statusText);
                    setError('Failed to load pending submissions.');
                }
            } catch (err) {
                console.error('Error fetching pending submissions:', err);
                setError('Network error or failed to parse response.');
            }
            setLoading(false);
        };

        fetchPendingSubmissions();
    }, [navigate]);

    const handleSelectSubmission = (submission: SubmissionResponse) => {
        setSelectedSubmission(submission);
    };

    const handleGradeSubmission = async (gradeData: GradeSubmissionRequest) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`/api/admin/submissions/${gradeData.submissionId}/grade`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: gradeData.action === 'approve' ? 'approved' : 'rejected',
                    feedback_text: gradeData.feedback,
                    // feedback_video_url: gradeData.instructorVideoUrl, // Uncomment if video replies are implemented
                }),
            });

            if (response.ok) {
                // Remove the graded submission from the pending list
                setPendingSubmissions(prev => prev.filter(sub => sub.id !== gradeData.submissionId));
                setSelectedSubmission(undefined); // Clear selected submission

                // If there are other pending submissions, select the next one
                if (pendingSubmissions.length > 1) {
                    setSelectedSubmission(pendingSubmissions[1]); // Select the next one in the original list
                } else {
                    setSelectedSubmission(undefined); // No more pending submissions
                }

            } else if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                const errorData = await response.json();
                console.error('Failed to grade submission:', response.status, errorData);
                setError(errorData.detail || 'Failed to grade submission.');
            }
        } catch (err) {
            console.error('Error grading submission:', err);
            setError('Network error during submission grading.');
        }
    };

    if (loading) {
        return (
            <div className="bg-mambo-dark text-white font-sans h-screen flex items-center justify-center">
                <p>Loading submissions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-mambo-dark text-white font-sans h-screen flex items-center justify-center">
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }

    return (
        <body className="bg-mambo-dark text-white font-sans flex h-screen overflow-hidden">

            <AdminSidebar activeRoute={location.pathname} />

            <main className="flex-1 flex overflow-hidden">
                
                <div className="w-80 border-r border-gray-800 bg-black flex flex-col">
                    <div className="p-5 border-b border-gray-800">
                        <h2 className="font-bold">Pending Queue ({pendingSubmissions.length})</h2>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {pendingSubmissions.length === 0 ? (
                            <p className="p-5 text-gray-500 text-sm">No pending submissions.</p>
                        ) : (
                            pendingSubmissions.map(submission => (
                                <SubmissionCard
                                    key={submission.id}
                                    submission={{
                                        id: submission.id,
                                        studentName: submission.studentName,
                                        timeAgo: timeAgo(submission.submittedAt),
                                        challengeTitle: `${submission.worldTitle} Boss Battle (${submission.lessonTitle})`,
                                    }}
                                    onSelect={() => handleSelectSubmission(submission)}
                                />
                            ))
                        )}
                    </div>
                </div>

                <div className="flex-1 flex flex-col p-8 overflow-y-auto">
                    {selectedSubmission ? (
                        <>
                            <header className="flex justify-between items-center mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold">Reviewing: {selectedSubmission.studentName}</h1>
                                    <div className="text-sm text-gray-400">Submission for: <span className="text-mambo-blue">{selectedSubmission.worldTitle} Boss Battle ({selectedSubmission.lessonTitle})</span></div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="text-xs bg-gray-800 px-3 py-1 rounded text-gray-400">Attempt #{selectedSubmission.attemptNumber}</div>
                                </div>
                            </header>

                            <div className="grid grid-cols-2 gap-8 h-full">
                                
                                <div className="bg-black rounded-xl overflow-hidden border border-gray-800 relative">
                                    {/* This should be a VideoPlayer component, but the skeleton uses an img and a play icon. */} 
                                    {/* For now, I'll use the skeleton's structure, but ideally it would be <VideoPlayer url={selectedSubmission.videoUrl} /> */}
                                    <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32" className="w-full h-full object-cover opacity-60" alt="Submission Video Thumbnail"/>
                                    <button className="absolute inset-0 flex items-center justify-center">
                                        <i className="fa-solid fa-play-circle text-6xl text-white opacity-80 hover:opacity-100 hover:scale-110 transition"></i>
                                    </button>
                                    {selectedSubmission.studentNote && (
                                        <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-xs">
                                            Student Note: "{selectedSubmission.studentNote}"
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <GradingPanel submission={selectedSubmission} onGrade={handleGradeSubmission} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
                            Select a submission from the queue to start grading.
                        </div>
                    )}
                </div>
            </main>
        </body>
    );
};

export default AdminGradingPage;