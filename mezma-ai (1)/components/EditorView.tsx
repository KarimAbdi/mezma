import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Media, Filter, Draft } from '../types';
import { videoEffects } from '../types';
import { generateCartoonImage, swapFaces, enhanceImage, removeObjectFromVideo, replaceBackgroundInVideo, cartoonifyVideo, removeBackgroundFromVideo } from '../services/geminiService';
import { Loader } from './Loader';
import { Toolbar } from './editor/Toolbar';
import { FilterPanel } from './editor/FilterPanel';
import { AIPanel } from './editor/AIPanel';
import { AudioPanel } from './editor/AudioPanel';
import { getFilterClass } from '../../utils/filterUtils';
import { VideoFXPanel } from './editor/VideoFXPanel';

type ActivePanel = 'filters' | 'ai' | 'audio' | 'video-fx' | null;

const DRAFT_STORAGE_KEY = 'mezma-ai-draft';

const mergeAudioAndVideo = (videoUrl: string, audioUrl: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.src = videoUrl;
        video.crossOrigin = 'anonymous';
        video.muted = true;

        const audio = document.createElement('audio');
        audio.src = audioUrl;
        audio.crossOrigin = 'anonymous';

        let videoReady = false;
        let audioReady = false;

        const startProcessing = () => {
            if (!videoReady || !audioReady) return;

            try {
                const videoStream = (video as any).captureStream();
                const audioStream = (audio as any).captureStream();
                const combinedStream = new MediaStream([
                    videoStream.getVideoTracks()[0],
                    audioStream.getAudioTracks()[0],
                ]);

                const recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
                const chunks: Blob[] = [];

                recorder.ondataavailable = (e) => chunks.push(e.data);
                recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
                recorder.onerror = (e) => reject(new Error('MediaRecorder failed during merge.'));

                video.onended = () => {
                    recorder.stop();
                    video.remove();
                    audio.remove();
                };
                
                recorder.start();
                video.play();
                audio.play();
            } catch (err) {
                 reject(err instanceof Error ? err : new Error('Failed to capture streams for merging.'));
            }
        };

        video.oncanplaythrough = () => { videoReady = true; startProcessing(); };
        audio.oncanplaythrough = () => { audioReady = true; startProcessing(); };

        video.onerror = () => reject(new Error('Failed to load video for merging.'));
        audio.onerror = () => reject(new Error('Failed to load audio for merging.'));
    });
};


export const EditorView: React.FC<{ 
    media: Media; 
    onBack: () => void; 
    initialDraft: Draft | null;
    onClearDraft: () => void;
    onShare: (media: Media) => void;
}> = ({ media, onBack, initialDraft, onClearDraft, onShare }) => {
  const [currentMediaUrl, setCurrentMediaUrl] = useState(media.url);
  const [activeFilter, setActiveFilter] = useState<Filter>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isAudioLooping, setIsAudioLooping] = useState(true);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  const isVideoEffectActive = media.type === 'video' && videoEffects.some(f => f.value === activeFilter);

  useEffect(() => {
    if (initialDraft) {
        // The media object is already correct from App state
        setCurrentMediaUrl(initialDraft.currentMediaUrl);
        setActiveFilter(initialDraft.activeFilter);
        setAudioSrc(initialDraft.audioSrc);
        setIsAudioLooping(initialDraft.isAudioLooping);
        onClearDraft(); // Consume the draft after loading
    } else {
        // Reset state for new media
        setCurrentMediaUrl(media.url);
        setActiveFilter('none');
        setAudioSrc(null);
        setActivePanel(null);
    }
  }, [media.url, initialDraft, onClearDraft]);

  // Optimized real-time canvas rendering for Video FX
  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;

    // Abort if the effect isn't active or elements aren't ready
    if (!isVideoEffectActive || !videoElement || !canvasElement) {
        cancelAnimationFrame(animationFrameRef.current);
        if (canvasElement) {
            const context = canvasElement.getContext('2d');
            context?.clearRect(0, 0, canvasElement.width, canvasElement.height);
        }
        return;
    }

    const context = canvasElement.getContext('2d');
    if (!context) return;

    const renderLoop = () => {
        // If elements are gone, stop the loop
        if (!videoRef.current || !canvasRef.current) return;

        context.clearRect(0, 0, canvasElement.width, canvasElement.height);
        
        // Apply the selected effect
        switch(activeFilter) {
            case 'glitch':
                context.filter = 'none'; // Manual effect, not a CSS filter
                context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
                for (let i = 0; i < 5; i++) {
                    const y = Math.random() * canvasElement.height;
                    const h = Math.random() * 20 + 5;
                    const xOffset = (Math.random() - 0.5) * 40;
                    context.drawImage(videoElement, 0, y, canvasElement.width, h, xOffset, y, canvasElement.width, h);
                }
                break;
            case 'scanlines':
                context.filter = 'none'; // Manual effect
                context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
                context.fillStyle = 'rgba(0, 0, 0, 0.2)';
                for (let y = 0; y < canvasElement.height; y += 4) {
                    context.fillRect(0, y, canvasElement.width, 2);
                }
                break;
            default: // AI-style filters use the canvas filter property
                context.filter = getFilterClass(activeFilter, true);
                context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
                break;
        }

        animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    // Sizes the canvas to match the video dimensions
    const handleMetadataLoaded = () => {
        if (canvasElement) {
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
        }
    };
    
    // Starts the rendering loop
    const startLoop = () => {
        cancelAnimationFrame(animationFrameRef.current); // Prevent duplicate loops
        animationFrameRef.current = requestAnimationFrame(renderLoop);
    };
    
    // Stops the rendering loop
    const stopLoop = () => {
        cancelAnimationFrame(animationFrameRef.current);
    };

    // Setup event listeners
    videoElement.addEventListener('loadedmetadata', handleMetadataLoaded);
    videoElement.addEventListener('play', startLoop);
    videoElement.addEventListener('playing', startLoop);
    videoElement.addEventListener('pause', stopLoop);
    videoElement.addEventListener('ended', stopLoop);
    
    // Initial setup in case video is already ready/playing
    if (videoElement.readyState >= 1) {
        handleMetadataLoaded();
    }
    if (!videoElement.paused) {
        startLoop();
    }

    // Cleanup listeners and animation frame on unmount or when effect changes
    return () => {
        videoElement.removeEventListener('loadedmetadata', handleMetadataLoaded);
        videoElement.removeEventListener('play', startLoop);
        videoElement.removeEventListener('playing', startLoop);
        videoElement.removeEventListener('pause', stopLoop);
        videoElement.removeEventListener('ended', stopLoop);
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isVideoEffectActive, activeFilter]);
  
  // Synchronize audio playback with video
  useEffect(() => {
    const videoElement = videoRef.current;
    const audioElement = audioRef.current;

    if (media.type !== 'video' || !videoElement || !audioElement || !audioSrc) {
        return;
    }

    let syncRequest: number;
    const SYNC_THRESHOLD = 0.15; // seconds

    const syncLoop = () => {
      if (!videoElement || !audioElement || videoElement.paused || videoElement.ended) {
        return; // Stop the loop if video is not playing
      }

      // Correct time drift
      const drift = videoElement.currentTime - audioElement.currentTime;
      if (Math.abs(drift) > SYNC_THRESHOLD) {
        console.warn(`Correcting audio drift of ${drift.toFixed(2)}s`);
        audioElement.currentTime = videoElement.currentTime;
      }
      
      syncRequest = requestAnimationFrame(syncLoop);
    };
    
    const handlePlay = () => {
      audioElement.play().catch(e => console.error("Audio play failed", e));
      cancelAnimationFrame(syncRequest); // Ensure no multiple loops
      syncRequest = requestAnimationFrame(syncLoop);
    };

    const handlePauseOrEnded = () => {
      if (audioElement && !audioElement.paused) {
        audioElement.pause();
      }
      cancelAnimationFrame(syncRequest);
    };
    
    const handleSeek = () => {
      if (audioElement) {
        audioElement.currentTime = videoElement.currentTime;
      }
    };

    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePauseOrEnded);
    videoElement.addEventListener('ended', handlePauseOrEnded);
    videoElement.addEventListener('seeking', handleSeek);

    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePauseOrEnded);
      videoElement.removeEventListener('ended', handlePauseOrEnded);
      videoElement.removeEventListener('seeking', handleSeek);
      cancelAnimationFrame(syncRequest);
    };
  }, [media.type, audioSrc]);

  const handleBack = () => {
    const hasChanges = activeFilter !== 'none' || audioSrc !== null || currentMediaUrl !== media.url;
    if (hasChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to exit? Your changes will be discarded.")) {
        onBack();
      }
    } else {
      onBack();
    }
  };
  
  const handleSaveDraft = () => {
      const draft: Draft = {
        media,
        currentMediaUrl,
        activeFilter,
        audioSrc,
        isAudioLooping,
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      alert("Draft saved!");
      onBack();
  }

  const handleGenerateCartoon = async () => {
    if (media.type !== 'image' || !imageRef.current) return;
    setIsLoading(true);
    setLoadingMessage('Generating your cartoon...');
    setError(null);
    try {
      const base64Data = currentMediaUrl.split(',')[1];
      const newImageUrl = await generateCartoonImage(base64Data);
      setCurrentMediaUrl(newImageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCartoonifyVideo = async () => {
    if (media.type !== 'video') return;
    setIsLoading(true);
    setProgress(0);
    setLoadingMessage('Preparing to cartoonify...');
    setError(null);
    try {
        const onProgress = ({ percent, message }: { percent: number; message: string }) => {
            setProgress(percent);
            setLoadingMessage(message);
        };
        const newVideoUrl = await cartoonifyVideo(currentMediaUrl, onProgress);
        setCurrentMediaUrl(newVideoUrl);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to cartoonify video.');
    } finally {
        setIsLoading(false);
        setProgress(0);
    }
  };
  
  const handleFaceSwap = async (referenceFaceUrl: string) => {
      if (media.type !== 'image') return;
      setIsLoading(true);
      setLoadingMessage('Performing face swap...');
      setError(null);
      try {
          const sourceBase64 = currentMediaUrl.split(',')[1];
          const referenceBase64 = referenceFaceUrl.split(',')[1];
          const newImageUrl = await swapFaces(sourceBase64, referenceBase64);
          setCurrentMediaUrl(newImageUrl);
      } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
          setIsLoading(false);
      }
  };

  const handleEnhanceImage = async () => {
    if (media.type !== 'image') return;
    setIsLoading(true);
    setLoadingMessage('Enhancing your photo...');
    setError(null);
    try {
      const base64Data = currentMediaUrl.split(',')[1];
      const newImageUrl = await enhanceImage(base64Data);
      setCurrentMediaUrl(newImageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemoveObject = async (prompt: string) => {
    if (media.type !== 'video') return;
    setIsLoading(true);
    setLoadingMessage('AI is removing the object...');
    setError(null);
    try {
        const newVideoUrl = await removeObjectFromVideo(currentMediaUrl, prompt);
        setCurrentMediaUrl(newVideoUrl);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove object.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleReplaceBackground = async (prompt: string) => {
    if (media.type !== 'video') return;
    setIsLoading(true);
    setLoadingMessage('AI is replacing the background...');
    setError(null);
    try {
        const newVideoUrl = await replaceBackgroundInVideo(currentMediaUrl, prompt);
        setCurrentMediaUrl(newVideoUrl);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to replace background.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleRemoveBackground = async (prompt: string) => {
    if (media.type !== 'video') return;
    setIsLoading(true);
    setLoadingMessage('AI is removing the background...');
    setError(null);
    try {
        const newVideoUrl = await removeBackgroundFromVideo(currentMediaUrl, prompt);
        setCurrentMediaUrl(newVideoUrl);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove background.');
    } finally {
        setIsLoading(false);
    }
  };


  const togglePanel = (panel: ActivePanel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };
  
  const processMedia = useCallback(async (): Promise<string> => {
      setLoadingMessage('Processing your masterpiece...');
      setIsLoading(true);

      const element = media.type === 'image' ? imageRef.current : videoRef.current;
      if (!element) throw new Error("Media element not found");

      let finalMediaUrl = currentMediaUrl;

      // Apply filter via canvas for a consistent output
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not create canvas context");
      
      canvas.width = media.type === 'image' ? (element as HTMLImageElement).naturalWidth : (element as HTMLVideoElement).videoWidth;
      canvas.height = media.type === 'image' ? (element as HTMLImageElement).naturalHeight : (element as HTMLVideoElement).videoHeight;
      ctx.filter = getFilterClass(activeFilter, true);

      if (media.type === 'image') {
          ctx.drawImage(element, 0, 0);
          finalMediaUrl = canvas.toDataURL('image/png');
      } else {
           // For video, we'd need a more complex frame-by-frame processing.
           // For simplicity in this demo, we'll assume the real-time preview is sufficient for now.
           // The most complex filters are already rendered via canvas.
      }
      
      // Merge audio if it exists for video
      if (media.type === 'video' && audioSrc) {
          setLoadingMessage('Mixing audio track...');
          const mergedBlob = await mergeAudioAndVideo(finalMediaUrl, audioSrc);
          finalMediaUrl = URL.createObjectURL(mergedBlob);
      }

      setIsLoading(false);
      return finalMediaUrl;
  }, [currentMediaUrl, activeFilter, audioSrc, media.type]);


  const handleSave = useCallback(async () => {
    try {
        const finalUrl = await processMedia();
        const link = document.createElement('a');
        link.href = finalUrl;
        link.download = `mezma-ai-creation.${media.type === 'image' ? 'png' : 'webm'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Revoke blob URL after a short delay
        if (finalUrl.startsWith('blob:')) {
            setTimeout(() => URL.revokeObjectURL(finalUrl), 1000);
        }
    } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to process and save media.");
        setIsLoading(false);
    }
  }, [processMedia, media.type]);
  
  const handleShare = useCallback(async () => {
      try {
        const finalUrl = await processMedia();
        onShare({ url: finalUrl, type: media.type });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to process media for sharing.");
        setIsLoading(false);
      }
  }, [processMedia, media.type, onShare]);
  

  const filterClass = getFilterClass(activeFilter, false);

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-between relative">
      {(isLoading || error) && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col justify-center items-center z-50">
          {isLoading && (
            <>
              <Loader />
              <p className="mt-4 text-lg text-cyan-300 text-center px-4">{loadingMessage}</p>
              {progress > 0 && (
                <div className="w-64 mt-4 bg-gray-700 rounded-full h-2.5">
                    <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${progress * 100}%` }}></div>
                </div>
              )}
            </>
          )}
          {error && (
            <div className="text-center p-4">
              <p className="text-red-400 font-semibold mb-2">An Error Occurred</p>
              <p className="text-red-400">{error}</p>
              <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-700">
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="w-full flex-grow flex items-center justify-center overflow-hidden relative">
         {media.type === 'image' ? (
            <img ref={imageRef} src={currentMediaUrl} alt="Editable media" className={`max-w-full max-h-full object-contain ${filterClass}`} crossOrigin="anonymous"/>
         ) : (
            <>
              <video ref={videoRef} src={currentMediaUrl} controls loop={isAudioLooping && !audioSrc} muted={!!audioSrc} playsInline className={`max-w-full max-h-full object-contain ${isVideoEffectActive ? 'invisible' : filterClass}`} />
              <canvas ref={canvasRef} className={`max-w-full max-h-full object-contain ${isVideoEffectActive ? '' : 'hidden'}`} />
              {audioSrc && <audio ref={audioRef} src={audioSrc} loop={isAudioLooping} />}
            </>
         )}
      </div>

      <FilterPanel isOpen={activePanel === 'filters'} onClose={() => setActivePanel(null)} activeFilter={activeFilter} onSetFilter={setActiveFilter} mediaUrl={currentMediaUrl} mediaType={media.type} />
      <VideoFXPanel isOpen={activePanel === 'video-fx'} onClose={() => setActivePanel(null)} activeFilter={activeFilter} onSetFilter={setActiveFilter} mediaUrl={currentMediaUrl} />
      <AIPanel isOpen={activePanel === 'ai'} onClose={() => setActivePanel(null)} onGenerate={handleGenerateCartoon} onFaceSwap={handleFaceSwap} onEnhance={handleEnhanceImage} onRemoveObject={handleRemoveObject} onReplaceBackground={handleReplaceBackground} onCartoonifyVideo={handleCartoonifyVideo} onRemoveBackground={handleRemoveBackground} isLoading={isLoading} mediaType={media.type} />
      <AudioPanel isOpen={activePanel === 'audio'} onClose={() => setActivePanel(null)} audioSrc={audioSrc} setAudioSrc={setAudioSrc} mediaType={media.type} isAudioLooping={isAudioLooping} setIsAudioLooping={setIsAudioLooping} />
      
      <Toolbar onBack={handleBack} onSave={handleSave} onShare={handleShare} onPanelToggle={togglePanel} mediaType={media.type} />
    </div>
  );
};