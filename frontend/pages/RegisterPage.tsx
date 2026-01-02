import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button'; // Assuming Button is in components

// Define the interface for the component's props, even if empty for a page component
interface RegisterPageProps {}

// Define the interface for the API request body for registration
interface RegisterRequest {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
}

// Define the interface for the API response token (assuming registration logs in directly)
interface TokenResponse {
    access_token: string;
    token_type: string;
}

const RegisterPage: React.FC<RegisterPageProps> = () => {
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const registerData: RegisterRequest = {
                first_name: firstName,
                last_name: lastName,
                email: email,
                password: password,
            };

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerData),
            });

            if (response.ok) {
                const data: TokenResponse = await response.json(); // Assuming it returns a token
                localStorage.setItem('token', data.access_token);
                navigate('/courses'); // Redirect to courses page after successful registration and login
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Registration failed. Please try again.');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-black font-sans h-screen w-full relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32" className="w-full h-full object-cover opacity-30" alt="Background dancers" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
            </div>

            <div className="relative z-10 w-full max-w-md bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
                    <p className="text-gray-400 text-sm">Join 10,000+ dancers worldwide.</p>
                </div>

                <form className="space-y-4" onSubmit={handleRegister}>
                    {/* Form Fields */}
                    <div>
                        <label htmlFor="firstName" className="block text-xs font-bold text-gray-500 uppercase mb-1">First Name</label>
                        <input
                            type="text"
                            id="firstName"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-xs font-bold text-gray-500 uppercase mb-1">Last Name</label>
                        <input
                            type="text"
                            id="lastName"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>
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

                    <Button
                        variant="primary"
                        className="w-full mt-2" // Apply the specific button styles from the skeleton
                        onClick={() => {}} // onClick is handled by form onSubmit
                        type="submit" // Important for form submission
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Start My Journey'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Already have an account? <Link to="/login" className="text-white hover:underline">Log in</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;