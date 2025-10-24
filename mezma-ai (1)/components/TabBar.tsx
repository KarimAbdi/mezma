import React from 'react';
import type { AppMode } from '../types';

interface TabBarProps {
  activeMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const NavButton: React.FC<{
  label: string;
  mode: AppMode;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
      active ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
    }`}
  >
    {children}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

const MessageIcon: React.FC<{ active: boolean }> = ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-1" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const CameraIcon: React.FC<{ active: boolean }> = ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-1" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const ProfileIcon: React.FC<{ active: boolean }> = ({ active }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-1" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const AskAIIcon: React.FC<{ active: boolean }> = ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-1" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 01-1.414 1.414L10 6.414l-2.293 2.293a1 1 0 01-1.414-1.414L10 2l2.293 2.293zm-3.879 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L6.414 14l-2.293-2.293a1 1 0 011.414-1.414L10 14.586l2.293-2.293a1 1 0 011.414 1.414L10 17.586l-2.293-2.293zM17 3l2.293 2.293a1 1 0 01-1.414 1.414L14 6.414l-2.293 2.293a1 1 0 01-1.414-1.414L14 2l2.293 2.293zm-3.879 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L10.414 14l-2.293-2.293a1 1 0 011.414-1.414L14 14.586l2.293-2.293a1 1 0 011.414 1.414L14 17.586l-2.293-2.293z" />
    </svg>
);


export const TabBar: React.FC<TabBarProps> = ({ activeMode, setMode }) => {
    const isCameraActive = activeMode === 'capture-photo' || activeMode === 'capture-video';
    
    return (
        <div className="flex-shrink-0 h-20 bg-gray-900/90 backdrop-blur-sm border-t border-gray-700 flex justify-around items-stretch z-40">
            <NavButton
                label="Messages"
                mode="user-chat"
                active={activeMode === 'user-chat'}
                onClick={() => setMode('user-chat')}
            >
                <MessageIcon active={activeMode === 'user-chat'} />
            </NavButton>

             <NavButton
                label="Camera"
                mode="capture-photo"
                active={isCameraActive}
                onClick={() => setMode('capture-photo')}
            >
                <CameraIcon active={isCameraActive} />
            </NavButton>
            
            <NavButton
                label="Ask AI"
                mode="ask-ai"
                active={activeMode === 'ask-ai'}
                onClick={() => setMode('ask-ai')}
            >
                <AskAIIcon active={activeMode === 'ask-ai'} />
            </NavButton>

             <NavButton
                label="Profile"
                mode="profile"
                active={activeMode === 'profile'}
                onClick={() => setMode('profile')}
            >
                <ProfileIcon active={activeMode === 'profile'} />
            </NavButton>
        </div>
    );
};
