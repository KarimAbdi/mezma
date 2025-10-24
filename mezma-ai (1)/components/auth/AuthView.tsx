import React, { useState } from 'react';
import type { User } from '../../types';
import { LoginView } from './LoginView';
import { SignupView } from './SignupView';
import { Logo } from '../Logo';

interface AuthViewProps {
    onLoginSuccess: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
    const [isLoginView, setIsLoginView] = useState(true);

    return (
        <div className="w-full h-full flex flex-col justify-center items-center bg-gray-900 p-8">
            <header className="text-center mb-8 flex flex-col items-center">
                <Logo className="w-20 h-20 mb-4" />
                <h1 className="text-4xl font-bold tracking-wider text-cyan-400">MEZMA AI</h1>
                <p className="text-gray-400 mt-2">Your AI-Powered Creative Suite</p>
            </header>
            
            <div className="w-full max-w-sm">
                {isLoginView ? (
                    <LoginView onLoginSuccess={onLoginSuccess} />
                ) : (
                    <SignupView onLoginSuccess={onLoginSuccess} />
                )}

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => setIsLoginView(!isLoginView)} 
                        className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline"
                    >
                        {isLoginView 
                            ? "Don't have an account? Sign Up" 
                            : "Already have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};
