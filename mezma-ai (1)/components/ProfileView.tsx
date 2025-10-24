import React, { useState, useRef } from 'react';
import type { User } from '../types';

interface ProfileViewProps {
  currentUser: User;
  onUpdate: (user: User) => void;
}

const DEFAULT_AVATAR = 'https://i.pravatar.cc/150';

export const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, onUpdate }) => {
  const [username, setUsername] = useState(currentUser.username);
  const [newAvatarUrl, setNewAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setNewAvatarUrl(e.target.result as string);
          setHasChanges(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setUsername(e.target.value);
      setHasChanges(true);
  }

  const handleSave = () => {
    const updatedUser: User = {
      ...currentUser,
      username,
      profilePicture: newAvatarUrl || currentUser.profilePicture,
    };
    onUpdate(updatedUser);
    setHasChanges(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 text-white">
      <div className="flex-grow p-8 overflow-y-auto flex flex-col items-center">
        <div className="relative mb-6">
          <img
            src={newAvatarUrl || currentUser.profilePicture || DEFAULT_AVATAR}
            alt="Profile Avatar"
            className="w-32 h-32 rounded-full object-cover border-4 border-cyan-500"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-gray-700 hover:bg-gray-600 rounded-full p-2 border-2 border-gray-900"
            aria-label="Change profile picture"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            className="hidden"
            accept="image/*"
          />
        </div>

        <div className="w-full max-w-sm space-y-4">
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                Username
                </label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={handleUsernameChange}
                    className="w-full p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
            </div>
            <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`w-full font-bold py-3 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed ${isSaved ? 'bg-green-600' : 'bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600'}`}
            >
                {isSaved ? 'Saved!' : 'Save Changes'}
            </button>
        </div>
      </div>
    </div>
  );
};