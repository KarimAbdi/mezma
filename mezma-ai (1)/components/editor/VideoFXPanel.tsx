import React from 'react';
import { videoEffects } from '../../types';
import type { Filter } from '../../types';
import { getFilterClass } from '../../utils/filterUtils';

interface VideoFXPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilter: Filter;
  onSetFilter: (filter: Filter) => void;
  mediaUrl: string;
}

const EffectList: React.FC<{
    effectList: { name: string; value: Filter }[];
    activeFilter: Filter;
    onSetFilter: (filter: Filter) => void;
    mediaUrl: string;
}> = ({ effectList, activeFilter, onSetFilter, mediaUrl }) => (
    <div className="grid grid-cols-4 gap-4 px-2">
        {effectList.map(f => {
            const filterClass = getFilterClass(f.value, false);
            const isActive = activeFilter === f.value;
            return (
                <button
                    key={f.value}
                    onClick={() => onSetFilter(f.value)}
                    className="flex-shrink-0 flex flex-col items-center space-y-1 group"
                >
                    <div className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition ${isActive ? 'border-cyan-400' : 'border-transparent group-hover:border-gray-500'}`}>
                        <video src={mediaUrl + '#t=1'} muted className={`w-full h-full object-cover ${filterClass}`} />
                    </div>
                    <span className={`text-xs font-medium transition text-center ${isActive ? 'text-cyan-400' : 'text-gray-300'}`}>{f.name}</span>
                </button>
            )
        })}
    </div>
);

export const VideoFXPanel: React.FC<VideoFXPanelProps> = ({ isOpen, onClose, activeFilter, onSetFilter, mediaUrl }) => {
  return (
    <div className={`absolute bottom-20 left-0 right-0 z-30 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-gray-800/90 backdrop-blur-sm p-4 rounded-t-2xl max-w-lg mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-200">Video Effects</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <EffectList 
                    effectList={videoEffects}
                    activeFilter={activeFilter}
                    onSetFilter={onSetFilter}
                    mediaUrl={mediaUrl}
                />
            </div>
        </div>
    </div>
  );
};