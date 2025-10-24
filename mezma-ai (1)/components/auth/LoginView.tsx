import React, { useState, useEffect } from 'react';
import type { User } from '../../types';

interface LoginViewProps {
    onLoginSuccess: (user: User) => void;
}

const REMEMBERED_USER_KEY = 'mezma-ai-remembered-user';

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
        <path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.845 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        try {
            const rememberedEmail = localStorage.getItem(REMEMBERED_USER_KEY);
            if (rememberedEmail) {
                setEmail(rememberedEmail);
                setRememberMe(true);
            }
        } catch (error) {
            console.error("Failed to read remembered user from localStorage", error);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const usersJSON = localStorage.getItem('mezma-ai-users-db');
            const allUsers: User[] = usersJSON ? JSON.parse(usersJSON) : [];
            const foundUser = allUsers.find(u => u.username.toLowerCase() === email.split('@')[0].toLowerCase());

            if (foundUser) {
                try {
                    if (rememberMe) {
                        localStorage.setItem(REMEMBERED_USER_KEY, email);
                    } else {
                        localStorage.removeItem(REMEMBERED_USER_KEY);
                    }
                } catch (error) {
                    console.error("Failed to save remembered user to localStorage", error);
                }
                onLoginSuccess(foundUser);
            } else {
                alert("Login failed: User not found. Please sign up first.");
            }
        } catch {
             alert("An error occurred during login.");
        }
    };

    const handleGoogleLogin = () => {
        try {
            const usersJSON = localStorage.getItem('mezma-ai-users-db');
            const allUsers: User[] = usersJSON ? JSON.parse(usersJSON) : [];
            let googleUser = allUsers.find(u => u.username === 'GoogleUser');

            if (!googleUser) {
                googleUser = {
                    id: `user-google-${Date.now()}`,
                    username: 'GoogleUser',
                    profilePicture: 'https://i.pravatar.cc/150?u=google'
                };
            }
            onLoginSuccess(googleUser);
        } catch {
            alert("An error occurred during Google login.");
        }
    };

    return (
        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full">
            <h2 className="text-2xl font-bold text-center text-white mb-6">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email or Username</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="you@example.com"
                    />
                </div>
                <div>
                    <label htmlFor="password_login" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                    <input
                        type="password"
                        id="password_login"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="••••••••"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded bg-gray-900"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                            Remember me
                        </label>
                    </div>

                    <div className="text-sm">
                        <a href="#" className="font-medium text-cyan-500 hover:text-cyan-400">
                            Forgot password?
                        </a>
                    </div>
                </div>

                <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition-transform transform hover:scale-105">
                    Login
                </button>
            </form>

            <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-600"></div>
            </div>

            <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center bg-white text-gray-700 font-semibold py-3 rounded-lg transition-transform transform hover:scale-105">
                <GoogleIcon />
                Sign in with Google
            </button>
        </div>
    );
};