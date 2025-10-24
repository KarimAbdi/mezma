import React, { useState } from 'react';
import type { Media } from '../types';

interface ShareModalProps {
  media: Media;
  onClose: () => void;
}

const CopyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);
const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);


export const ShareModal: React.FC<ShareModalProps> = ({ media, onClose }) => {
    const [isCopied, setIsCopied] = useState(false);
    const mockUrl = `https://mezma.ai/c/${new Date().getTime().toString(36)}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(mockUrl).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy link.');
        });
    };
    
    const handleSocialShare = (platform: string) => {
        alert(`Sharing to ${platform} is not implemented in this demo.`);
    };

    return (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
            <div 
                className="bg-gray-800 rounded-2xl shadow-2xl p-6 text-center flex flex-col items-center gap-4 m-4 w-full max-w-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-full flex justify-between items-center">
                    <h2 className="text-xl font-bold text-cyan-400">Share your Creation</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close share modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="w-full h-48 bg-black rounded-lg flex items-center justify-center overflow-hidden my-2">
                    {media.type === 'image' ? (
                        <img src={media.url} alt="Final creation" className="max-w-full max-h-full object-contain" />
                    ) : (
                        <video src={media.url} controls loop className="max-w-full max-h-full" />
                    )}
                </div>
                
                <div className="w-full flex items-center space-x-2">
                    <input 
                        type="text" 
                        readOnly 
                        value={mockUrl}
                        className="flex-grow p-2 bg-gray-700 text-gray-300 rounded-lg text-sm border border-gray-600"
                    />
                    <button 
                        onClick={handleCopy}
                        className={`flex-shrink-0 font-semibold py-2 px-4 rounded-lg transition flex items-center ${isCopied ? 'bg-green-600' : 'bg-cyan-600 hover:bg-cyan-700'}`}
                    >
                        {isCopied ? <CheckIcon /> : <CopyIcon />}
                        {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                </div>

                <div className="w-full border-t border-gray-700 my-2"></div>
                
                <p className="text-gray-400 text-sm">Share directly to:</p>
                <div className="flex justify-center space-x-4">
                    <button onClick={() => handleSocialShare('Instagram')} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-transform transform hover:scale-110">IG</button>
                    <button onClick={() => handleSocialShare('TikTok')} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-transform transform hover:scale-110">TT</button>
                    <button onClick={() => handleSocialShare('Facebook')} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-transform transform hover:scale-110">FB</button>
                    <button onClick={() => handleSocialShare('Twitter')} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-transform transform hover:scale-110">X</button>
                </div>
            </div>
        </div>
    );
};
