import React from 'react';
import type { MediaType } from '../../types';

type ActivePanel = 'filters' | 'ai' | 'audio' | 'video-fx' | null;

interface ToolbarProps {
  onBack: () => void;
  onSave: () => void;
  onShare: () => void;
  onPanelToggle: (panel: ActivePanel) => void;
  mediaType: MediaType;
}

const ToolbarButton: React.FC<{ onClick: () => void; children: React.ReactNode; label: string }> = ({ onClick, children, label }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center text-gray-300 hover:text-cyan-400 transition-colors space-y-1 w-16 text-center">
    {children}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
);

const VideoFXIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 8.5l-1 1 1 1-1 1 1 1" />
    </svg>
);


export const Toolbar: React.FC<ToolbarProps> = ({ onBack, onSave, onShare, onPanelToggle, mediaType }) => {
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 p-2">
        <div className="w-full max-w-lg mx-auto flex justify-around items-center h-16">
            <ToolbarButton onClick={onBack} label="Back">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </ToolbarButton>

            <ToolbarButton onClick={() => onPanelToggle('filters')} label="Filters">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 16v-2m0-8v-2m-6 2H4m16 0h-2m-8 8H4m16 0h-2m-8-8a4 4 0 100-8 4 4 0 000 8z" /></svg>
            </ToolbarButton>
            
            {mediaType === 'video' && (
                <ToolbarButton onClick={() => onPanelToggle('video-fx')} label="Video FX">
                    <VideoFXIcon />
                </ToolbarButton>
            )}

            <ToolbarButton onClick={() => onPanelToggle('ai')} label="AI Tools">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            </ToolbarButton>

            <ToolbarButton onClick={() => onPanelToggle('audio')} label="Audio">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </ToolbarButton>

            <div className="flex items-center space-x-2 pl-2 border-l border-gray-700">
                <button onClick={onSave} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-5 rounded-lg text-md transition-transform transform hover:scale-105 h-10 flex items-center">
                    Save
                </button>
                 <button onClick={onShare} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-5 rounded-lg text-md transition-transform transform hover:scale-105 h-10 flex items-center space-x-2">
                    <ShareIcon />
                    <span>Share</span>
                </button>
            </div>
        </div>
    </div>
  );
};