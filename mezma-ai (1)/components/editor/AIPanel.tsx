import React, { useRef, useState } from 'react';
import type { MediaType } from '../../types';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: () => void;
  onFaceSwap: (referenceFaceUrl: string) => void;
  onEnhance: () => void;
  onRemoveObject: (prompt: string) => void;
  onReplaceBackground: (prompt: string) => void;
  onRemoveBackground: (prompt: string) => void;
  onCartoonifyVideo: () => void;
  isLoading: boolean;
  mediaType: MediaType;
}

export const AIPanel: React.FC<AIPanelProps> = ({ 
    isOpen, 
    onClose, 
    onGenerate, 
    onFaceSwap, 
    onEnhance, 
    onRemoveObject,
    onReplaceBackground,
    onRemoveBackground,
    onCartoonifyVideo,
    isLoading, 
    mediaType 
}) => {
    const [referenceFaceUrl, setReferenceFaceUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [objectPrompt, setObjectPrompt] = useState('');
    const [backgroundPrompt, setBackgroundPrompt] = useState('');
    const [removeBgPrompt, setRemoveBgPrompt] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setReferenceFaceUrl(e.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSwapClick = () => {
        if (referenceFaceUrl) {
            onFaceSwap(referenceFaceUrl);
        } else {
            alert("Please upload a reference face first.");
        }
    };

    const handleRemoveObjectClick = () => {
        if (objectPrompt.trim()) {
            onRemoveObject(objectPrompt);
        } else {
            alert("Please describe the object you want to remove.");
        }
    };
    
    const handleReplaceBackgroundClick = () => {
        if (backgroundPrompt.trim()) {
            onReplaceBackground(backgroundPrompt);
        } else {
            alert("Please describe the new background.");
        }
    };

    const handleRemoveBackgroundClick = () => {
        if (removeBgPrompt.trim()) {
            onRemoveBackground(removeBgPrompt);
        } else {
            alert("Please describe the desired background.");
        }
    };

    const renderImageTools = () => (
        <>
            {/* AI Enhance Section */}
            <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-semibold text-cyan-400 mb-2">AI Enhance</h4>
                <p className="text-gray-400 text-sm mb-3">Use AI to subtly improve lighting, color, and sharpness for a professional look.</p>
                <button onClick={onEnhance} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition disabled:bg-gray-500 w-full text-lg">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 01-1.414 1.414L10 6.414l-2.293 2.293a1 1 0 01-1.414-1.414L10 2l2.293 2.293zm-3.879 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L6.414 14l-2.293-2.293a1 1 0 011.414-1.414L10 14.586l2.293-2.293a1 1 0 011.414 1.414L10 17.586l-2.293-2.293zM17 3l2.293 2.293a1 1 0 01-1.414 1.414L14 6.414l-2.293 2.293a1 1 0 01-1.414-1.414L14 2l2.293 2.293zm-3.879 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L10.414 14l-2.293-2.293a1 1 0 011.414-1.414L14 14.586l2.293-2.293a1 1 0 011.414 1.414L14 17.586l-2.293-2.293z" />
                    </svg>
                    Enhance with AI
                </button>
            </div>

            {/* Cartoonify Section */}
            <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-semibold text-cyan-400 mb-2">Cartoonify</h4>
                <p className="text-gray-400 text-sm mb-3">Transform your photo into a cartoon.</p>
                <button onClick={onGenerate} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition disabled:bg-gray-500 w-full text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    Cartoonify Image
                </button>
            </div>
            
            {/* Face Swap Section */}
            <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-semibold text-cyan-400 mb-2">Face Swap</h4>
                <p className="text-gray-400 text-sm mb-3">Upload a photo to swap the face into your current image.</p>
                <div className="flex items-center space-x-4 mb-4">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-shrink-0 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        Upload Face
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    {referenceFaceUrl ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-cyan-400">
                            <img src={referenceFaceUrl} alt="Reference face" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-800 flex items-center justify-center">
                            <span className="text-xs text-gray-500 text-center">Preview</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleSwapClick}
                    disabled={isLoading || !referenceFaceUrl}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition disabled:bg-gray-500 w-full text-lg"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Swap Faces
                </button>
            </div>
        </>
    );

    const renderVideoTools = () => (
         <>
            {/* Cartoonify Video Section */}
            <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-semibold text-cyan-400 mb-2">Cartoonify Video</h4>
                <p className="text-gray-400 text-sm mb-3">Transform your entire video into an animation. This may take a few moments.</p>
                <button onClick={onCartoonifyVideo} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition disabled:bg-gray-500 w-full text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    Cartoonify Video
                </button>
            </div>
            {/* AI Object Removal */}
            <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-semibold text-cyan-400 mb-2">AI Object Removal</h4>
                <p className="text-gray-400 text-sm mb-3">Describe an object to remove from the video.</p>
                 <input
                    type="text"
                    value={objectPrompt}
                    onChange={(e) => setObjectPrompt(e.target.value)}
                    placeholder="e.g., the red car"
                    className="w-full p-3 bg-gray-900 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-3"
                />
                <button onClick={handleRemoveObjectClick} disabled={isLoading} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition disabled:bg-gray-500 w-full text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove Object
                </button>
            </div>
            {/* AI Background Removal */}
            <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-semibold text-cyan-400 mb-2">AI Background Removal</h4>
                <p className="text-gray-400 text-sm mb-3">Describe a new background to add after removing the current one.</p>
                 <input
                    type="text"
                    value={removeBgPrompt}
                    onChange={(e) => setRemoveBgPrompt(e.target.value)}
                    placeholder="e.g., a tropical beach"
                    className="w-full p-3 bg-gray-900 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-3"
                />
                <button onClick={handleRemoveBackgroundClick} disabled={isLoading} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition disabled:bg-gray-500 w-full text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                    </svg>
                    Remove & Replace
                </button>
            </div>
            {/* AI Background Replacement */}
             <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-semibold text-cyan-400 mb-2">AI Background Replacement</h4>
                <p className="text-gray-400 text-sm mb-3">Describe the new background for the video.</p>
                 <input
                    type="text"
                    value={backgroundPrompt}
                    onChange={(e) => setBackgroundPrompt(e.target.value)}
                    placeholder="e.g., a futuristic cityscape"
                    className="w-full p-3 bg-gray-900 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-3"
                />
                <button onClick={handleReplaceBackgroundClick} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition disabled:bg-gray-500 w-full text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Replace Background
                </button>
            </div>
        </>
    );

    return (
        <div className={`absolute bottom-20 left-0 right-0 z-30 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="bg-gray-800/90 backdrop-blur-sm p-4 rounded-t-2xl max-w-lg mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-200">AI Tools</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="space-y-6 p-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {mediaType === 'image' && renderImageTools()}
                    {mediaType === 'video' && renderVideoTools()}
                </div>
            </div>
        </div>
    );
};