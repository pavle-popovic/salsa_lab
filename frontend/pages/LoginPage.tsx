import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Define the interface for the component's props, even if empty for a page component
interface LoginPageProps {}

// Define the interface for the API response token
interface TokenResponse {
    access_token: string;
    token_type: string;
}

const LoginPage: React.FC<LoginPageProps> = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch('/api/auth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data: TokenResponse = await response.json();
                localStorage.setItem('token', data.access_token);
                // Redirect to a dashboard or courses page after successful login
                navigate('/courses'); // Or '/profile', depending on desired post-login destination
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-black font-sans h-screen w-full relative flex items-center justify-center overflow-hidden">
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-40">
                <source src="background.mp4" type="video/mp4" />
            </video>
            
            <div className="relative z-10 w-full max-w-md bg-black/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
                    <p className="text-gray-400 text-sm">Ready to level up?</p>
                </div>

                <form className="space-y-4" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    {error && (
                        <div className="text-red-500 text-sm text-center">{error}</div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-blue-600/20"
                        disabled={loading}
                    >
                        {loading ? 'Logging In...' : 'Log In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <Link to="/register" className="hover:text-white transition">Create new account</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;