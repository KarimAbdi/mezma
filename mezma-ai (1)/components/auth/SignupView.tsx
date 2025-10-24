import React, { useState } from 'react';
import type { User } from '../../types';

interface SignupViewProps {
    onLoginSuccess: (user: User) => void;
}

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
        <path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.845 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);

export const SignupView: React.FC<SignupViewProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        const newUserId = `user-${Date.now()}`;
        onLoginSuccess({
            id: newUserId,
            username, 
            profilePicture: `https://i.pravatar.cc/150?u=${newUserId}`
        });
    };
    
    const handleGoogleSignup = () => {
        const googleUserId = `user-google-${Date.now()}`;
        onLoginSuccess({ 
            id: googleUserId,
            username: 'GoogleUser', 
            profilePicture: 'https://i.pravatar.cc/150?u=google' 
        });
    };


    return (
        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full">
            <h2 className="text-2xl font-bold text-center text-white mb-6">Create Account</h2>
            <form onSubmit={handleSignup} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="your_username"
                    />
                </div>
                <div>
                    <label htmlFor="email_signup" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <input
                        type="email"
                        id="email_signup"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="you@example.com"
                    />
                </div>
                <div>
                    <label htmlFor="password_signup" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                    <input
                        type="password"
                        id="password_signup"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="••••••••"
                    />
                </div>
                <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition-transform transform hover:scale-105">
                    Sign Up
                </button>
            </form>

            <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-600"></div>
            </div>

            <button onClick={handleGoogleSignup} className="w-full flex items-center justify-center bg-white text-gray-700 font-semibold py-3 rounded-lg transition-transform transform hover:scale-105">
                <GoogleIcon />
                Sign up with Google
            </button>
        </div>
    );
};
