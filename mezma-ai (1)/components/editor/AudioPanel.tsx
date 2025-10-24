import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { MediaType, SampleAudio } from '../../types';
import { sampleAudioTracks } from '../../types';
import { Loader } from '../Loader';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { createPcmBlob } from '../../utils/audioUtils';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });


interface AudioPanelProps {
    isOpen: boolean;
    onClose: () => void;
    audioSrc: string | null;
    setAudioSrc: (src: string | null) => void;
    mediaType: MediaType;
    isAudioLooping: boolean;
    setIsAudioLooping: (looping: boolean) => void;
}

const PlayIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
);

const PauseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);


export const AudioPanel: React.FC<AudioPanelProps> = ({ isOpen, onClose, audioSrc, setAudioSrc, mediaType, isAudioLooping, setIsAudioLooping }) => {
    const audioInputRef = useRef<HTMLInputElement>(null);
    const previewAudioRef = useRef(new Audio());

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SampleAudio[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [previewAudio, setPreviewAudio] = useState<{ url: string; isPlaying: boolean } | null>(null);

    // Mic Transcription state
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const microphoneStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

    // File Transcription state
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isFileTranscribing, setIsFileTranscribing] = useState(false);
    const [fileTranscription, setFileTranscription] = useState('');
    const [fileTranscriptionError, setFileTranscriptionError] = useState<string | null>(null);


    const stopTranscription = useCallback(() => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then((session: any) => session.close());
            sessionPromiseRef.current = null;
        }
        if (microphoneStreamRef.current) {
            microphoneStreamRef.current.getTracks().forEach(track => track.stop());
            microphoneStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
        setIsTranscribing(false);
    }, []);

    const startTranscription = useCallback(async () => {
        setIsTranscribing(true);
        setTranscription('');
        setTranscriptionError(null);

        if (inputAudioContextRef.current?.state === 'running') {
            await inputAudioContextRef.current.close();
        }
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

        try {
            microphoneStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO], // Required, even if we ignore the audio output
                    inputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        const source = inputAudioContextRef.current!.createMediaStreamSource(microphoneStreamRef.current!);
                        const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createPcmBlob(inputData);
                            if (sessionPromiseRef.current) {
                                sessionPromiseRef.current.then((session: any) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            }
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            setTranscription(prev => prev + message.serverContent.inputTranscription.text);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live API Error:', e);
                        setTranscriptionError('Transcription failed. Please check your connection and try again.');
                        stopTranscription();
                    },
                    onclose: () => {
                        // Cleanup is handled by stopTranscription
                    },
                },
            });

        } catch (err) {
            console.error('Failed to get user media for transcription:', err);
            if (err instanceof Error && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")) {
                setTranscriptionError("Microphone access denied.");
            } else {
                setTranscriptionError("Could not access microphone.");
            }
            setIsTranscribing(false);
        }
    }, [stopTranscription]);

    const handleToggleTranscription = useCallback(() => {
        if (isTranscribing) {
            stopTranscription();
        } else {
            startTranscription();
        }
    }, [isTranscribing, startTranscription, stopTranscription]);

    const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (audioSrc && audioSrc.startsWith('blob:')) {
                URL.revokeObjectURL(audioSrc);
            }
            const url = URL.createObjectURL(file);
            setAudioSrc(url);
            setUploadedFile(file);
            setFileTranscription('');
            setFileTranscriptionError(null);
        }
    };

    const handleTranscribeFile = useCallback(async () => {
        if (!uploadedFile) return;
    
        setIsFileTranscribing(true);
        setFileTranscription('');
        setFileTranscriptionError(null);
    
        try {
            const arrayBuffer = await uploadedFile.arrayBuffer();
            
            const decodeAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const originalBuffer = await decodeAudioContext.decodeAudioData(arrayBuffer);
            await decodeAudioContext.close();
    
            const targetSampleRate = 16000;
            let bufferToProcess = originalBuffer;
    
            if (originalBuffer.sampleRate !== targetSampleRate) {
                const offlineContext = new OfflineAudioContext(
                    originalBuffer.numberOfChannels,
                    originalBuffer.duration * targetSampleRate,
                    targetSampleRate
                );
                const source = offlineContext.createBufferSource();
                source.buffer = originalBuffer;
                source.connect(offlineContext.destination);
                source.start(0);
                bufferToProcess = await offlineContext.startRendering();
            }
    
            const pcmData = bufferToProcess.getChannelData(0);
    
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                },
                callbacks: {
                    onopen: async () => {
                        const session = await sessionPromise;
                        const chunkSize = 4096;
                        for (let i = 0; i < pcmData.length; i += chunkSize) {
                            const chunk = pcmData.slice(i, i + chunkSize);
                            if (chunk.length > 0) {
                                session.sendRealtimeInput({ media: createPcmBlob(chunk) });
                            }
                        }
                        session.close();
                    },
                    onmessage: (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            setFileTranscription(prev => prev + message.serverContent.inputTranscription.text);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('File Transcription Error:', e);
                        setFileTranscriptionError('Transcription failed. Please check the network or file.');
                        setIsFileTranscribing(false);
                    },
                    onclose: () => {
                        setIsFileTranscribing(false);
                    },
                },
            });
            
        } catch (err) {
            console.error('Error transcribing file:', err);
            setFileTranscriptionError('Failed to process audio file. It might be in an unsupported format.');
            setIsFileTranscribing(false);
        }
    }, [uploadedFile]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        setSearchResults([]);
        await new Promise(resolve => setTimeout(resolve, 800));
        const query = searchQuery.toLowerCase().trim();
        const fakeResults: SampleAudio[] = [
            { name: `Upbeat ${query.charAt(0).toUpperCase() + query.slice(1)} Mix`, url: sampleAudioTracks[0].url },
            { name: `${query.charAt(0).toUpperCase() + query.slice(1)} Vibe`, url: sampleAudioTracks[1].url },
            { name: `Cinematic ${query.charAt(0).toUpperCase() + query.slice(1)}`, url: sampleAudioTracks[2].url }
        ];
        const realMatches = sampleAudioTracks.filter(track => 
            track.name.toLowerCase().includes(query) && 
            !fakeResults.some(fr => fr.name === track.name)
        );
        setSearchResults([...fakeResults, ...realMatches]);
        setIsSearching(false);
    };

    const handlePreviewToggle = (track: SampleAudio) => {
        const previewAudioEl = previewAudioRef.current;
        if (previewAudio?.url === track.url && previewAudio.isPlaying) {
            previewAudioEl.pause();
            setPreviewAudio({ url: track.url, isPlaying: false });
        } else {
            if (previewAudioEl.src && !previewAudioEl.paused) {
                previewAudioEl.pause();
            }
            previewAudioEl.src = track.url;
            previewAudioEl.play().catch(e => console.error("Audio playback failed:", e));
            setPreviewAudio({ url: track.url, isPlaying: true });
        }
    };
    
    const handleSelectTrack = (track: SampleAudio) => {
        const previewAudioEl = previewAudioRef.current;
        if (!previewAudioEl.paused) {
            previewAudioEl.pause();
            previewAudioEl.src = '';
        }
        setPreviewAudio(null);
        setAudioSrc(track.url);
        setUploadedFile(null); // Clear uploaded file when selecting from library
    };

    // Cleanup effect for component unmount
    useEffect(() => {
        return () => {
            stopTranscription();
        };
    }, [stopTranscription]);

    useEffect(() => {
        const audioEl = previewAudioRef.current;
        audioEl.crossOrigin = 'anonymous';
        const handleEnded = () => setPreviewAudio(prev => prev ? { ...prev, isPlaying: false } : null);
        audioEl.addEventListener('ended', handleEnded);
        return () => {
            audioEl.removeEventListener('ended', handleEnded);
            audioEl.pause();
        };
    }, []);
    
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setSearchResults([]);
            setIsSearching(false);
            const previewAudioEl = previewAudioRef.current;
            if (!previewAudioEl.paused) {
                previewAudioEl.pause();
                previewAudioEl.src = '';
            }
            setPreviewAudio(null);
            
            if (isTranscribing) {
                stopTranscription();
            }
            setUploadedFile(null);
            setFileTranscription('');
            setFileTranscriptionError(null);
            setIsFileTranscribing(false);
        }
    }, [isOpen, isTranscribing, stopTranscription]);

    const renderTrackList = (tracks: SampleAudio[]) => (
        tracks.map((track) => {
            const isSelected = audioSrc === track.url;
            const isPreviewing = previewAudio?.url === track.url && previewAudio.isPlaying;

            return (
                 <div key={track.name} className={`flex items-center justify-between p-2 rounded-lg transition-colors duration-200 ${isSelected ? 'bg-cyan-600/30' : 'bg-gray-700'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <button onClick={() => handlePreviewToggle(track)} className="text-cyan-400 hover:text-cyan-300 transition-colors flex-shrink-0">
                            {isPreviewing ? <PauseIcon /> : <PlayIcon />}
                        </button>
                        <span className="truncate text-white font-medium text-sm">{track.name}</span>
                    </div>
                    {isSelected ? (
                        <button onClick={() => setAudioSrc(null)} className="text-sm bg-pink-600 hover:bg-pink-700 text-white font-semibold py-1 px-3 rounded-md transition flex-shrink-0">
                            Remove
                        </button>
                    ) : (
                        <button onClick={() => handleSelectTrack(track)} className="text-sm bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-1 px-3 rounded-md transition flex-shrink-0">
                            Add
                        </button>
                    )}
                </div>
            )
        })
    );

    return (
        <div className={`absolute bottom-20 left-0 right-0 z-30 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="bg-gray-800/90 backdrop-blur-sm p-4 rounded-t-2xl max-w-lg mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-200">Add Audio</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="flex flex-col p-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSearch} className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for any song, artist, or genre..."
                            className="flex-grow bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none placeholder-gray-400"
                        />
                        <button type="submit" disabled={isSearching || !searchQuery.trim()} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold p-2 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center w-12 h-10 transition">
                            {isSearching ? <div className="w-5 h-5 border-2 border-t-2 border-gray-200 border-t-white rounded-full animate-spin"></div> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>}
                        </button>
                    </form>
                    
                    <div className="space-y-2 min-h-[10rem] max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {isSearching ? (
                            <div className="flex justify-center items-center h-full">
                                <p className="text-gray-400">Searching for music...</p>
                            </div>
                        ) : searchResults.length > 0 ? (
                            renderTrackList(searchResults)
                        ) : searchQuery && !isSearching ? (
                            <div className="flex justify-center items-center h-full">
                                <p className="text-gray-400 text-center">No results found for "{searchQuery}".</p>
                            </div>
                        ) : (
                             <>
                                <h4 className="text-md font-semibold text-gray-300 border-b border-gray-600 pb-2">
                                    Suggestions for you
                                </h4>
                                {renderTrackList(sampleAudioTracks)}
                            </>
                        )}
                    </div>

                    {mediaType === 'video' && audioSrc && (
                        <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
                            <span className="text-white font-medium text-sm">Loop Audio</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={isAudioLooping} 
                                    onChange={(e) => setIsAudioLooping(e.target.checked)} 
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                            </label>
                        </div>
                    )}
                    
                    <h4 className="text-md font-semibold text-gray-300 border-b border-gray-600 pb-2 pt-2">
                        Or Upload Your Own
                    </h4>
                     <button onClick={() => audioInputRef.current?.click()} className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition w-full text-lg">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload from Device
                    </button>
                    <input type="file" ref={audioInputRef} onChange={handleAudioFileChange} accept="audio/*" className="hidden" />

                    {uploadedFile && audioSrc && (
                        <div className="bg-gray-700/50 p-3 rounded-lg mt-2 space-y-2">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-300 truncate pr-2">
                                   File: <span className="font-medium text-white">{uploadedFile.name}</span>
                                </p>
                                <button onClick={() => { setAudioSrc(null); setUploadedFile(null); setFileTranscription(''); setFileTranscriptionError(null);}} className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-2 rounded-md transition flex-shrink-0">
                                    Remove
                                </button>
                            </div>
                            <button onClick={handleTranscribeFile} disabled={isFileTranscribing} className="w-full text-sm bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition disabled:bg-gray-500">
                                {isFileTranscribing ? <><Loader /> <span className="ml-2">Transcribing...</span></> : 'Transcribe Audio'}
                            </button>
                            {fileTranscriptionError && <p className="text-red-400 text-sm mt-2 text-center">{fileTranscriptionError}</p>}
                            {fileTranscription && (
                                <div className="bg-gray-900 p-3 rounded-lg mt-2 max-h-24 overflow-y-auto custom-scrollbar">
                                    <p className="text-white whitespace-pre-wrap text-sm">{fileTranscription}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <h4 className="text-md font-semibold text-gray-300 border-b border-gray-600 pb-2 pt-2">
                        Or Transcribe from Mic
                    </h4>
                     <button onClick={handleToggleTranscription} className={`font-bold py-3 px-6 rounded-lg flex items-center justify-center transition w-full text-lg ${isTranscribing ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}`}>
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        {isTranscribing ? 'Stop Transcribing' : 'Start Transcribing'}
                    </button>
                    {transcriptionError && <p className="text-red-400 text-sm mt-2 text-center">{transcriptionError}</p>}
                    {isTranscribing && !transcription && !transcriptionError && <p className="text-gray-400 text-sm mt-2 text-center">Listening...</p>}
                    {transcription && (
                        <div className="bg-gray-900 p-3 rounded-lg mt-2 max-h-24 overflow-y-auto custom-scrollbar">
                            <p className="text-white whitespace-pre-wrap text-sm">{transcription}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};