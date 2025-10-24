import React from 'react';
import type { Media } from '../types';

interface PreviewViewProps {
  media: Media;
  onRetake: () => void;
  onSave: () => void;
  onShare: () => void;
  onEdit: () => void;
}

const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
);

export const PreviewView: React.FC<PreviewViewProps> = ({ media, onRetake, onSave, onShare, onEdit }) => {
  return (
    <div className="relative w-full h-full bg-black flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-3 bg-gray-900/50 backdrop-blur-sm z-10 flex-shrink-0">
        <button onClick={onRetake} className="flex items-center text-white text-lg hover:text-gray-300 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Retake
        </button>
        <button onClick={onEdit} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-5 rounded-lg text-md transition-transform transform hover:scale-105">
            Edit
        </button>
      </header>

      {/* Media Display */}
      <main className="flex-grow flex items-center justify-center overflow-hidden relative">
        {media.type === 'image' ? (
          <img src={media.url} alt="Preview" className="max-w-full max-h-full object-contain" />
        ) : (
          <video src={media.url} controls autoPlay loop className="max-w-full max-h-full" />
        )}
      </main>

      {/* Action Buttons Footer */}
      <footer className="flex justify-around items-center p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 flex-shrink-0">
        <button onClick={onSave} className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 w-40">
          <SaveIcon />
          Save
        </button>
        <button onClick={onShare} className="flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 w-40">
          <ShareIcon />
          Share
        </button>
      </footer>
    </div>
  );
};
