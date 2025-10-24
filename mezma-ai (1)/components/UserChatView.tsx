import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Conversation, ChatMessage, User } from '../types';

const USERS_DB_KEY = 'mezma-ai-users-db';
const CONVERSATIONS_DB_KEY = 'mezma-ai-conversations-db';

// --- Helper Functions ---
const getConversationId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('_');
};

const getAllUsers = (): User[] => {
  try {
    const data = localStorage.getItem(USERS_DB_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
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


// --- Icon Components ---
const VoiceCallIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);
const VideoCallIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);
const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
const VideoIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
);
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
);
const NewChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);


export const UserChatView: React.FC<{ currentUser: User; onStartVideoCall: (partner: User) => void; }> = ({ currentUser, onStartVideoCall }) => {
  const [view, setView] = useState<'lobby' | 'newChat' | 'conversation'>('lobby');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const otherParticipant = activeConversation ? allUsers.find(u => u.id === activeConversation.participantIds.find(id => id !== currentUser.id)) : null;

  useEffect(() => {
    setAllUsers(getAllUsers());
    setConversations(getAllConversations());

    const intervalId = setInterval(() => {
      const latestConversations = getAllConversations();
      setConversations(latestConversations);
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !activeConversationId) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      text: userInput.trim(),
      senderId: currentUser.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const allConvos = getAllConversations();
    const convoIndex = allConvos.findIndex(c => c.id === activeConversationId);

    if (convoIndex > -1) {
      allConvos[convoIndex].messages.push(newMessage);
      saveAllConversations(allConvos);
      setConversations(allConvos); // Immediately update local state
    }
    setUserInput('');
  };

  const handleStartChat = (otherUser: User) => {
    const convoId = getConversationId(currentUser.id, otherUser.id);
    let allConvos = getAllConversations();
    let existingConvo = allConvos.find(c => c.id === convoId);

    if (!existingConvo) {
      existingConvo = {
        id: convoId,
        participantIds: [currentUser.id, otherUser.id],
        messages: [],
      };
      allConvos.push(existingConvo);
      saveAllConversations(allConvos);
    }
    
    setConversations(allConvos);
    setActiveConversationId(convoId);
    setView('conversation');
  };
  
  const handleBackToLobby = () => {
    setActiveConversationId(null);
    setView('lobby');
  };
  
  const handleInitiateCall = (type: 'voice' | 'video') => {
    if (otherParticipant) {
      if (type === 'video') {
        onStartVideoCall(otherParticipant);
      } else {
        alert(`Starting ${type} call with ${otherParticipant.username}... (Feature not implemented)`);
      }
    }
  };


  const renderLobby = () => {
    const myConversations = conversations
      .filter(c => c.participantIds.includes(currentUser.id))
      .map(c => {
          const otherUserId = c.participantIds.find(id => id !== currentUser.id);
          const otherUser = allUsers.find(u => u.id === otherUserId);
          const lastMessage = c.messages[c.messages.length - 1];
          return { ...c, otherUser, lastMessage };
      })
      .filter(c => c.otherUser && c.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
          if (!a.lastMessage) return 1;
          if (!b.lastMessage) return -1;
          // A proper implementation would parse timestamps
          return b.lastMessage.id.localeCompare(a.lastMessage.id);
      });

    return (
      <div className="relative w-full h-full flex flex-col">
        <div className="p-3 border-b border-gray-700 flex-shrink-0">
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-700 text-white rounded-full px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none placeholder-gray-400" />
        </div>
        <div className="flex-grow overflow-y-auto">
          {myConversations.length > 0 ? (
            myConversations.map(({ id, otherUser, lastMessage }) => (
              <div key={id} onClick={() => { setActiveConversationId(id); setView('conversation'); }} className="flex items-center p-3 border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer transition">
                <div className="relative flex-shrink-0 mr-4">
                  <img src={otherUser?.profilePicture || 'https://i.pravatar.cc/150'} alt={otherUser?.username} className="w-12 h-12 rounded-full" />
                </div>
                <div className="flex-grow overflow-hidden">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-white truncate">{otherUser?.username}</p>
                    <p className="text-xs text-gray-400 flex-shrink-0 ml-2">{lastMessage?.timestamp}</p>
                  </div>
                  <p className="text-sm text-gray-400 truncate">{lastMessage?.text || 'No messages yet'}</p>
                </div>
              </div>
            ))
          ) : (
             <div className="text-center text-gray-500 p-8"><p>No conversations found.</p></div>
          )}
        </div>
        <button
          onClick={() => setView('newChat')}
          className="absolute bottom-6 right-6 bg-cyan-500 hover:bg-cyan-600 text-white p-4 rounded-full shadow-lg transition-transform transform hover:scale-110 z-10"
          aria-label="Start new chat"
        >
          <NewChatIcon />
        </button>
      </div>
    )
  };

  const renderNewChat = () => (
     <>
        <header className="flex-shrink-0 flex items-center p-4 bg-gray-800 border-b border-gray-700">
          <button onClick={() => setView('lobby')} className="p-2 rounded-full hover:bg-gray-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
          <h2 className="text-xl font-bold mx-auto">Start New Chat</h2>
        </header>
        <div className="flex-grow overflow-y-auto">
          {allUsers.filter(u => u.id !== currentUser.id).map(user => (
            <div key={user.id} onClick={() => handleStartChat(user)} className="flex items-center p-3 border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer transition">
              <img src={user.profilePicture || 'https://i.pravatar.cc/150'} alt={user.username} className="w-12 h-12 rounded-full mr-4" />
              <p className="font-semibold text-white truncate">{user.username}</p>
            </div>
          ))}
        </div>
     </>
  );

  const renderConversation = () => {
    if (!activeConversation || !otherParticipant) return null;
    return (
    <>
      <header className="flex-shrink-0 flex items-center p-3 bg-gray-800 border-b border-gray-700">
        <button onClick={handleBackToLobby} className="p-2 rounded-full hover:bg-gray-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
        <img src={otherParticipant.profilePicture || 'https://i.pravatar.cc/150'} alt={otherParticipant.username} className="w-10 h-10 rounded-full mx-3" />
        <div className="flex-grow"><h2 className="text-lg font-bold">{otherParticipant.username}</h2></div>
        <div className="flex items-center space-x-2">
            <button onClick={() => handleInitiateCall('voice')} className="p-2 text-gray-300 hover:text-cyan-400 hover:bg-gray-700 rounded-full transition"><VoiceCallIcon /></button>
            <button onClick={() => handleInitiateCall('video')} className="p-2 text-gray-300 hover:text-cyan-400 hover:bg-gray-700 rounded-full transition"><VideoCallIcon /></button>
        </div>
      </header>
      <div className="flex-grow p-4 overflow-y-auto flex flex-col space-y-4">
        {activeConversation.messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.senderId === currentUser.id ? 'bg-cyan-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
              <p className="text-white whitespace-pre-wrap font-sans text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <footer className="flex-shrink-0 p-2 bg-gray-800 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
           <button type="button" className="p-2 text-gray-300 hover:text-cyan-400 rounded-full transition"><ImageIcon /></button>
           <button type="button" className="p-2 text-gray-300 hover:text-cyan-400 rounded-full transition"><VideoIcon /></button>
          <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Type a message..." className="flex-grow p-3 bg-gray-700 rounded-full focus:ring-2 focus:ring-cyan-500 focus:outline-none px-4" />
          <button type="submit" disabled={!userInput.trim()} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold p-3 rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed transition flex-shrink-0"><SendIcon /></button>
        </form>
      </footer>
    </>
  )};

  const renderContent = () => {
    switch (view) {
        case 'newChat': return renderNewChat();
        case 'conversation': return renderConversation();
        case 'lobby':
        default: return renderLobby();
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 text-white">
      {renderContent()}
    </div>
  );
};