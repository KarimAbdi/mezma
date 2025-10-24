import React from 'react';
import { filters, videoEffects } from '../../types';
import type { Filter, MediaType } from '../../types';
import { getFilterClass } from '../../utils/filterUtils';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilter: Filter;
  onSetFilter: (filter: Filter) => void;
  mediaUrl: string;
  mediaType: MediaType;
}

const FilterList: React.FC<{
    filterList: { name: string; value: Filter }[];
    activeFilter: Filter;
    onSetFilter: (filter: Filter) => void;
    mediaUrl: string;
    mediaType: MediaType;
}> = ({ filterList, activeFilter, onSetFilter, mediaUrl, mediaType }) => (
    <div className="flex space-x-4 overflow-x-auto pb-3 px-2 custom-scrollbar">
        {filterList.map(f => {
            const filterClass = getFilterClass(f.value, false);
            const isActive = activeFilter === f.value;
            return (
                <button
                    key={f.value}
                    onClick={() => onSetFilter(f.value)}
                    className="flex-shrink-0 flex flex-col items-center space-y-1 group w-24"
                >
                    <div className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition ${isActive ? 'border-cyan-400' : 'border-transparent group-hover:border-gray-500'}`}>
                        {mediaType === 'image' ? (
                            <img src={mediaUrl} className={`w-full h-full object-cover ${filterClass}`} alt={`Filter preview for ${f.name}`} crossOrigin="anonymous"/>
                        ) : (
                            <video src={mediaUrl + '#t=1'} muted className={`w-full h-full object-cover ${filterClass}`} />
                        )}
                    </div>
                    <span className={`text-xs font-medium transition text-center ${isActive ? 'text-cyan-400' : 'text-gray-300'}`}>{f.name}</span>
                </button>
            )
        })}
    </div>
);

export const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, activeFilter, onSetFilter, mediaUrl, mediaType }) => {
  const standardFilters = filters.filter(f => !videoEffects.some(af => af.value === f.value) || f.value === 'none');

  return (
    <div className={`absolute bottom-20 left-0 right-0 z-30 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-gray-800/90 backdrop-blur-sm p-4 rounded-t-2xl max-w-lg mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-200">Filters</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                 <div>
                    <h4 className="text-md font-semibold text-gray-300 border-b border-gray-600 pb-2 mb-3 ml-2">
                        Standard Filters
                    </h4>
                     <FilterList 
                        filterList={standardFilters}
                        activeFilter={activeFilter}
                        onSetFilter={onSetFilter}
                        mediaUrl={mediaUrl}
                        mediaType={mediaType}
                    />
                </div>
            </div>
        </div>
    </div>
  );
};