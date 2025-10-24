import React, { useState } from 'react';
import { CameraView } from './components/CameraView';
import { EditorView } from './components/EditorView';
import { UserChatView } from './components/UserChatView';
import { AuthView } from './components/auth/AuthView';
import { ProfileView } from './components/ProfileView';
import { TabBar } from './components/TabBar';
import { AskAIView } from './components/AskAIView';
import { PreviewView } from './components/PreviewView';
import { ShareModal } from './components/ShareModal';
import type { AppMode, Media, MediaType, User, Draft, Conversation, ChatMessage } from './types';
import { MEZMA_ASSISTANT_USER } from './types';
import { Logo } from './components/Logo';
import { VideoCallView } from './components/VideoCallView';

const USER_SESSION_KEY = 'mezma-ai-user-session';
const USERS_DB_KEY = 'mezma-ai-users-db';
const DRAFT_STORAGE_KEY = 'mezma-ai-draft';
const CONVERSATIONS_DB_KEY = 'mezma-ai-conversations-db';


const getConversationId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('_');
};

const getAllConversations = (): Conversation[] => {
  try {
    const data = localStorage.getItem(CONVERSATIONS_DB_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

const saveAllConversations = (conversations: Conversation[]) => {
  try {
    localStorage.setItem(CONVERSATIONS_DB_KEY, JSON.stringify(conversations));
  } catch (e) {
    console.error("Failed to save conversations", e);
  }
};


const getAllUsers = (): User[] => {
  try {
    const usersStr = localStorage.getItem(USERS_DB_KEY);
    let users: User[] = usersStr ? JSON.parse(usersStr) : [];
    // Ensure Mezma Assistant always exists
    if (!users.some(u => u.id === MEZMA_ASSISTANT_USER.id)) {
      users.push(MEZMA_ASSISTANT_USER);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    }
    return users;
  } catch {
    // If parsing fails, start fresh with the assistant
    const users = [MEZMA_ASSISTANT_USER];
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    return users;
  }
};

const getInitialUser = (): User | null => {
  try {
    const savedUserId = localStorage.getItem(USER_SESSION_KEY);
    if (!savedUserId) return null;
    
    const allUsers = getAllUsers();
    return allUsers.find(u => u.id === savedUserId) || null;

  } catch (error) {
    console.error("Failed to parse user from localStorage", error);
    return null;
  }
};

const getInitialDraft = (): Draft | null => {
  try {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    return savedDraft ? JSON.parse(savedDraft) : null;
  } catch (error) {
    console.error("Failed to parse draft from localStorage", error);
    return null;
  }
};

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('capture-photo');
  const [media, setMedia] = useState<Media | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(getInitialUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!currentUser);
  const [draft, setDraft] = useState<Draft | null>(getInitialDraft());
  const [showPreview, setShowPreview] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [mediaToShare, setMediaToShare] = useState<Media | null>(null);
  const [callPartner, setCallPartner] = useState<User | null>(null);

  const handleLoginSuccess = (user: User) => {
    try {
        const allUsers = getAllUsers();
        const userExists = allUsers.some(u => u.id === user.id);

        if (!userExists) {
            const updatedUsers = [...allUsers, user];
            localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedUsers));

            // Create a welcome conversation for the new user
            const allConvos = getAllConversations();
            const convoId = getConversationId(user.id, MEZMA_ASSISTANT_USER.id);
            const welcomeMessage: ChatMessage = {
                id: `msg-${Date.now()}`,
                text: `Hi ${user.username}, welcome to Mezma AI! I'm your personal assistant. Feel free to ask me anything in the 'Ask AI' tab or start creating!`,
                senderId: MEZMA_ASSISTANT_USER.id,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            const newConversation: Conversation = {
                id: convoId,
                participantIds: [user.id, MEZMA_ASSISTANT_USER.id],
                messages: [welcomeMessage],
            };
            allConvos.push(newConversation);
            saveAllConversations(allConvos);
        }
        localStorage.setItem(USER_SESSION_KEY, user.id);
    } catch (error) {
        console.error("Failed to save user session", error);
    }
    setCurrentUser(user);
    setIsAuthenticated(true);
    setMode('capture-photo');
  };
  
  const handleUpdateUser = (updatedUser: User) => {
    try {
        const allUsers = getAllUsers();
        const userIndex = allUsers.findIndex(u => u.id === updatedUser.id);
        if (userIndex > -1) {
            allUsers[userIndex] = updatedUser;
            localStorage.setItem(USERS_DB_KEY, JSON.stringify(allUsers));
        }
    } catch (error) {
        console.error("Failed to update user in localStorage", error);
    }
    setCurrentUser(updatedUser);
  };

  const handleLogout = () => {
    try {
        localStorage.removeItem(USER_SESSION_KEY);
    } catch (error) {
        console.error("Failed to remove user from localStorage", error);
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    setMedia(null);
    setShowPreview(false);
    setMode('capture-photo');
  };

  const handleMediaCaptured = (dataUrl: string, type: MediaType) => {
    setMedia({ url: dataUrl, type });
    setShowPreview(true);
  };

  const handleExitEditor = () => {
    setMedia(null);
    setShowPreview(false);
    setDraft(getInitialDraft());
  };

  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDraft(null);
  };
  
  const handleSaveRaw = (mediaToSave: Media) => {
    const link = document.createElement('a');
    link.href = mediaToSave.url;
    link.download = `mezma-ai-creation-raw.${mediaToSave.type === 'image' ? 'png' : 'webm'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = (media: Media) => {
    setMediaToShare(media);
    setShowShareModal(true);
  };

  const handleStartVideoCall = (partner: User) => {
    setCallPartner(partner);
    setMode('video-call');
  };

  const handleEndVideoCall = () => {
    setCallPartner(null);
    setMode('user-chat');
  };

  const renderHeader = () => {
    const titleMap: Partial<Record<AppMode, string>> = {
        'user-chat': 'Messages',
        'profile': 'Profile',
        'ask-ai': 'Ask AI'
    };
    const title = titleMap[mode];
    if (title) {
        return (
             <header className="p-3 bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 flex-shrink-0 flex items-center justify-between z-20">
                <Logo className="w-8 h-8" />
                <h1 className="text-xl font-bold tracking-wider text-cyan-400 absolute left-1/2 -translate-x-1/2">
                    {title}
                </h1>
                <div className="w-8"></div>
            </header>
        )
    }
    return null;
  }

  const renderContent = () => {
    switch (mode) {
      case 'capture-video':
        return <CameraView mode="video" onCapture={handleMediaCaptured} onModeChange={setMode} />;
      case 'user-chat':
        if (currentUser) {
            return <UserChatView currentUser={currentUser} onStartVideoCall={handleStartVideoCall} />;
        }
        handleLogout();
        return null;
      case 'profile':
        if (currentUser) {
          return <ProfileView currentUser={currentUser} onUpdate={handleUpdateUser} />;
        }
        handleLogout();
        return null;
      case 'ask-ai':
        return <AskAIView />;
      case 'capture-photo':
      default:
        return <CameraView mode="photo" onCapture={handleMediaCaptured} onModeChange={setMode} />;
    }
  };
  
  const renderAppContent = () => {
    if (!isAuthenticated) {
        return <AuthView onLoginSuccess={handleLoginSuccess} />;
    }
    
    if (mode === 'video-call' && currentUser && callPartner) {
        return <VideoCallView currentUser={currentUser} otherUser={callPartner} onHangup={handleEndVideoCall} />;
    }

    if (media && showPreview) {
        return <PreviewView 
                   media={media}
                   onRetake={() => { setMedia(null); setShowPreview(false); }}
                   onSave={() => handleSaveRaw(media)}
                   onShare={() => handleShare(media)}
                   onEdit={() => setShowPreview(false)}
               />
    }

    if (media && !showPreview) {
        return <EditorView 
                   media={media} 
                   onBack={handleExitEditor}
                   onShare={handleShare}
                   initialDraft={draft}
                   onClearDraft={handleClearDraft}
               />;
    }

    return (
        <>
            {renderHeader()}
            <main className="relative flex-grow overflow-hidden">
              {renderContent()}
            </main>
            <TabBar activeMode={mode} setMode={setMode} />
        </>
    );
  };

  return (
    <div className="h-screen bg-gray-900 text-white font-sans flex flex-col items-center justify-center">
      <div className="w-full max-w-lg h-full sm:h-auto sm:max-h-[95vh] mx-auto bg-gray-800 sm:rounded-2xl shadow-2xl overflow-hidden relative flex flex-col">
        {renderAppContent()}
        {showShareModal && mediaToShare && <ShareModal media={mediaToShare} onClose={() => {
            if(mediaToShare.url.startsWith('blob:')) URL.revokeObjectURL(mediaToShare.url);
            setShowShareModal(false);
            setMediaToShare(null);
        }}/>}
      </div>
    </div>
  );
};

export default App;