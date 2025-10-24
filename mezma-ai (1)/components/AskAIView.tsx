import React, { useState, useRef, useEffect } from 'react';
import type { AIChatMessage } from '../types';
import { askComplexQuestion } from '../services/geminiService';
import { Loader } from './Loader';

const SendIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
);

export const AskAIView: React.FC = () => {
    const [messages, setMessages] = useState<AIChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = userInput.trim();
        if (!trimmedInput || isLoading) return;

        const userMessage: AIChatMessage = {
            id: Date.now(),
            text: trimmedInput,
            isUser: true,
        };
        
        const loadingMessage: AIChatMessage = {
            id: Date.now() + 1,
            text: '',
            isUser: false,
            isLoading: true,
        };

        setMessages(prev => [...prev, userMessage, loadingMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const responseText = await askComplexQuestion(trimmedInput);
            const aiMessage: AIChatMessage = {
                id: Date.now() + 1,
                text: responseText,
                isUser: false,
            };
            setMessages(prev => [...prev.slice(0, -1), aiMessage]);
        } catch (error) {
            const errorMessage: AIChatMessage = {
                id: Date.now() + 1,
                text: error instanceof Error ? error.message : "Sorry, something went wrong.",
                isUser: false,
            };
             setMessages(prev => [...prev.slice(0, -1), errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-gray-900 text-white">
            <div className="flex-grow p-4 overflow-y-auto flex flex-col space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${msg.isUser ? 'bg-cyan-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                           {msg.isLoading ? (
                               <div className="flex items-center space-x-2">
                                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                               </div>
                           ) : (
                               <p className="text-white whitespace-pre-wrap font-sans text-sm">{msg.text}</p>
                           )}
                        </div>
                    </div>
                ))}
                 {messages.length === 0 && (
                    <div className="flex-grow flex flex-col justify-center items-center text-center text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <p>Ask me anything!</p>
                        <p className="text-xs">e.g., "Write a python script to sort a list"</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <footer className="flex-shrink-0 p-2 bg-gray-800 border-t border-gray-700">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Ask a complex question..." className="flex-grow p-3 bg-gray-700 rounded-full focus:ring-2 focus:ring-cyan-500 focus:outline-none px-4" />
                    <button type="submit" disabled={!userInput.trim() || isLoading} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold p-3 rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed transition flex-shrink-0">
                        {isLoading ? <div className="w-6 h-6"><Loader /></div> : <SendIcon />}
                    </button>
                </form>
            </footer>
        </div>
    );
};
