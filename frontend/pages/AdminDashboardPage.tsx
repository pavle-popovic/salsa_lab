import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Import Components
import AdminSidebar from '../../components/AdminSidebar';
import StatOverview from '../../components/StatOverview';

// --- Interfaces for API Responses ---

// For /api/admin/stats
interface AdminStatsApiResponse {
    total_users: number;
    new_users_today: number;
    total_courses: number;
    total_submissions_pending: number;
    // Add more as needed, e.g., revenue, active subscriptions
    // For simplicity, let's assume these are the core stats for now.
    // Adding some mock change data for StatOverview component
    users_change_percent: number;
    courses_change_percent: number;
    submissions_change_percent: number;
}

// For /api/admin/users (simplified for the table)
interface AdminUserApiResponse {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    created_at: string; // ISO date string
    subscription_tier: 'rookie' | 'social_dancer' | 'performer';
    subscription_status: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing';
}

// --- Interfaces for Component Props (mapping from API) ---

// Stat for StatOverview component
interface Stat {
    label: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
}

// Recent Signup for the table
interface RecentSignup {
    id: string;
    user: string;
    plan: string;
    status: 'Active' | 'Inactive' | 'Trialing' | 'Canceled';
    date: string;
}

// Define the interface for the component's props
interface AdminDashboardPageProps {}

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = () => {
    const [adminStats, setAdminStats] = useState<Stat[]>([]);
    const [recentSignups, setRecentSignups] = useState<RecentSignup[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        const fetchAdminData = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            if (!token) {
                // Redirect to login if not authenticated or not admin
                // For now, assume /admin route is protected by a higher-level router guard
                // or the backend will return 401/403.
                setError('Authentication required. Please log in as an administrator.');
                setLoading(false);
                return;
            }

            try {
                // Fetch Admin Stats
                const statsResponse = await fetch('/api/admin/stats', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (statsResponse.ok) {
                    const statsData: AdminStatsApiResponse = await statsResponse.json();
                    const mappedStats: Stat[] = [
                        {
                            label: 'Total Users',
                            value: statsData.total_users,
                            change: `${Math.abs(statsData.users_change_percent)}% ${statsData.users_change_percent >= 0 ? 'increase' : 'decrease'} vs last month`,
                            changeType: statsData.users_change_percent >= 0 ? 'positive' : 'negative',
                        },
                        {
                            label: 'New Users Today',
                            value: statsData.new_users_today,
                            change: '', // No change data for daily new users in this mock
                            changeType: 'neutral',
                        },
                        {
                            label: 'Total Courses',
                            value: statsData.total_courses,
                            change: `${Math.abs(statsData.courses_change_percent)}% ${statsData.courses_change_percent >= 0 ? 'increase' : 'decrease'} vs last month`,
                            changeType: statsData.courses_change_percent >= 0 ? 'positive' : 'negative',
                        },
                        {
                            label: 'Pending Submissions',
                            value: statsData.total_submissions_pending,
                            change: `${Math.abs(statsData.submissions_change_percent)}% ${statsData.submissions_change_percent >= 0 ? 'increase' : 'decrease'} vs last month`,
                            changeType: statsData.submissions_change_percent >= 0 ? 'positive' : 'negative',
                        },
                    ];
                    setAdminStats(mappedStats);
                } else if (statsResponse.status === 401 || statsResponse.status === 403) {
                    setError('Unauthorized access. Please ensure you are logged in as an administrator.');
                    localStorage.removeItem('token'); // Clear invalid token
                    // Optionally redirect to login page
                } else {
                    console.error('Failed to fetch admin stats:', statsResponse.status, statsResponse.statusText);
                    setError('Failed to load dashboard statistics.');
                }

                // Fetch Recent Signups
                const usersResponse = await fetch('/api/admin/users?limit=5&sort_by=created_at&order=desc', { // Assuming an endpoint for recent users
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (usersResponse.ok) {
                    const usersData: AdminUserApiResponse[] = await usersResponse.json();
                    const mappedSignups: RecentSignup[] = usersData.map(user => ({
                        id: user.id,
                        user: `${user.first_name} ${user.last_name}`,
                        plan: user.subscription_tier.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()), // Format 'social_dancer' to 'Social Dancer'
                        status: user.subscription_status === 'active' ? 'Active' : user.subscription_status === 'trialing' ? 'Trialing' : 'Inactive', // Simplified status
                        date: new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), // Format date
                    }));
                    setRecentSignups(mappedSignups);
                } else if (usersResponse.status === 401 || usersResponse.status === 403) {
                    setError('Unauthorized access for user data. Please ensure you are logged in as an administrator.');
                    localStorage.removeItem('token');
                } else {
                    console.error('Failed to fetch recent signups:', usersResponse.status, usersResponse.statusText);
                    setError('Failed to load recent signups.');
                }

            } catch (err) {
                console.error('Error fetching admin data:', err);
                setError('Network error or failed to parse response.');
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    if (loading) {
        return (
            <div className="bg-mambo-dark text-white font-sans h-screen flex items-center justify-center">
                <p>Loading admin dashboard...</p>
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

            <main className="flex-1 overflow-y-auto p-8">
                
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
                        <p className="text-gray-400 text-sm">Welcome back, Instructor.</p>
                    </div>
                    <button className="bg-mambo-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition">
                        <i className="fa-solid fa-plus mr-2"></i> New Announcement
                    </button>
                </header>

                <StatOverview stats={adminStats} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    <div className="lg:col-span-2 bg-mambo-panel border border-gray-800 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                            <h3 className="font-bold">Recent Signups</h3>
                            <Link to="/admin/users" className="text-xs text-mambo-blue hover:underline">View All</Link>
                        </div>
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-black/20 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Plan</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {recentSignups.length > 0 ? (
                                    recentSignups.map(signup => (
                                        <tr key={signup.id} className="hover:bg-gray-800/50">
                                            <td className="px-6 py-4 font-medium text-white">{signup.user}</td>
                                            <td className="px-6 py-4">{signup.plan}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${signup.status === 'Active' ? 'bg-green-500/10 text-green-500' : signup.status === 'Trialing' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {signup.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{signup.date}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No recent signups.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-mambo-panel border border-gray-800 rounded-xl p-6">
                        <h3 className="font-bold mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link to="/admin/builder" className="block p-4 border border-dashed border-gray-700 rounded-lg hover:border-mambo-blue hover:bg-gray-800 transition text-center group">
                                <i className="fa-solid fa-video text-2xl text-gray-500 mb-2 group-hover:text-mambo-blue"></i>
                                <div className="text-sm font-bold">Upload New Lesson</div>
                            </Link>
                            <Link to="/admin/grading" className="block p-4 border border-dashed border-gray-700 rounded-lg hover:border-yellow-500 hover:bg-gray-800 transition text-center group">
                                <i className="fa-solid fa-check-double text-2xl text-gray-500 mb-2 group-hover:text-yellow-500"></i>
                                <div className="text-sm font-bold">Grade Submissions ({adminStats.find(s => s.label === 'Pending Submissions')?.value || 0})</div>
                            </Link>
                        </div>
                    </div>

                </div>
            </main>
        </body>
    );
};

export default AdminDashboardPage;