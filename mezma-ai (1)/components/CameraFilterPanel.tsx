import React from 'react';
import { filters } from '../types';
import type { Filter } from '../types';
import { getFilterClass } from '../utils/filterUtils';

interface CameraFilterPanelProps {
  activeFilter: Filter;
  onSetFilter: (filter: Filter) => void;
}

const PLACEHOLDER_IMAGE_URL = 'https://picsum.photos/id/1015/100/100';

export const CameraFilterPanel: React.FC<CameraFilterPanelProps> = ({ activeFilter, onSetFilter }) => {
  return (
    <div className="absolute bottom-28 left-0 right-0 z-20">
        <div className="flex space-x-4 overflow-x-auto pb-3 px-4 custom-scrollbar">
            {filters.map(f => {
                const filterClass = getFilterClass(f.value, false);
                const isActive = activeFilter === f.value;
                return (
                    <button
                        key={f.value}
                        onClick={() => onSetFilter(f.value)}
                        className="flex-shrink-0 flex flex-col items-center space-y-1 group"
                        aria-label={`Select ${f.name} filter`}
                    >
                        <div className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${isActive ? 'border-cyan-400' : 'border-transparent group-hover:border-gray-500'}`}>
                            <img src={PLACEHOLDER_IMAGE_URL} className={`w-full h-full object-cover ${filterClass}`} alt={`Filter preview for ${f.name}`} />
                        </div>
                        <span className={`text-xs font-medium transition ${isActive ? 'text-cyan-400' : 'text-gray-300'}`}>{f.name}</span>
                    </button>
                )
            })}
        </div>
    </div>
  );
};
