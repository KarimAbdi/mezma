import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { MediaType, Filter } from '../types';
import { Loader } from './Loader';
import { CameraFilterPanel } from './CameraFilterPanel';
import { getFilterClass } from '../utils/filterUtils';

interface CameraViewProps {
  mode: 'photo' | 'video';
  onCapture: (dataUrl: string, type: MediaType) => void;
  onModeChange: (mode: 'capture-photo' | 'capture-video') => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ mode, onCapture, onModeChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const animationFrameRef = useRef<number>(0);
  
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [processedStream, setProcessedStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<Filter>('none');

  const setupCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 },
        audio: true, // Always request audio to add to canvas stream
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err instanceof Error && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")) {
          setError("Camera access was denied. Please allow camera permissions in your browser settings.");
      } else {
          setError("Could not access camera. Please check permissions and ensure it's not in use by another app.");
      }
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setupCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
      processedStream?.getTracks().forEach(track => track.stop());
      cancelAnimationFrame(animationFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupCamera]);
  
  // Effect to process video stream with filters via canvas
  useEffect(() => {
      if (mode !== 'video' || !stream || !videoRef.current || activeFilter === 'none') {
          setProcessedStream(stream); // Use original stream if no filter or not in video mode
          return;
      }

      const videoElement = videoRef.current;
      const canvasElement = document.createElement('canvas');
      const context = canvasElement.getContext('2d', { willReadFrequently: true });
      if (!context) return;

      const draw = () => {
          if (videoElement.paused || videoElement.ended) {
              animationFrameRef.current = requestAnimationFrame(draw);
              return;
          }
          if (canvasElement.width !== videoElement.videoWidth) {
              canvasElement.width = videoElement.videoWidth;
              canvasElement.height = videoElement.videoHeight;
          }
          const filterStyle = getFilterClass(activeFilter, true);
          context.filter = filterStyle;
          context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
          animationFrameRef.current = requestAnimationFrame(draw);
      };

      videoElement.onloadedmetadata = () => {
          draw();
          const canvasStream = canvasElement.captureStream(30); // 30 FPS
          const audioTracks = stream.getAudioTracks();
          if (audioTracks.length > 0) {
              canvasStream.addTrack(audioTracks[0]);
          }
          setProcessedStream(canvasStream);
      };

      return () => {
          cancelAnimationFrame(animationFrameRef.current);
          processedStream?.getTracks().forEach(track => track.stop());
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream, activeFilter, mode]);


  const handleCapture = () => {
    if (mode === 'photo' && videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        const filterStyle = getFilterClass(activeFilter, true);
        if (filterStyle) context.filter = filterStyle;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        onCapture(canvas.toDataURL('image/png'), 'image');
      }
    } else if (mode === 'video') {
      const streamToRecord = (activeFilter !== 'none' && processedStream) ? processedStream : stream;
      if (!streamToRecord) return;
      
      if (isRecording) {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
      } else {
        setIsRecording(true);
        mediaRecorderRef.current = new MediaRecorder(streamToRecord);
        const chunks: Blob[] = [];
        mediaRecorderRef.current.ondataavailable = (event) => chunks.push(event.data);
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const reader = new FileReader();
          reader.onload = () => onCapture(reader.result as string, 'video');
          reader.readAsDataURL(blob);
        };
        mediaRecorderRef.current.start();
      }
    }
  };
  
  const filterClass = getFilterClass(activeFilter, false);

  return (
    <div className="relative w-full h-full bg-black flex flex-col justify-between items-center">
      {isLoading && <div className="absolute inset-0 flex justify-center items-center bg-black/50"><Loader /></div>}
      {error && <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/80 text-red-400 p-4 text-center">
        <p className="font-semibold">Camera Error</p>
        <p>{error}</p>
        <button onClick={setupCamera} className="mt-4 px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-700">Try Again</button>
      </div>}
      <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${isLoading || error ? 'hidden' : 'block'} ${filterClass}`} />
      
      {!isLoading && !error && (
        <CameraFilterPanel activeFilter={activeFilter} onSetFilter={setActiveFilter} />
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-center items-center z-30 space-y-4">
        <button
          onClick={handleCapture}
          disabled={isLoading || !!error}
          className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-transparent'}`}
        >
          <div className={`w-16 h-16 bg-white rounded-full transition-all duration-200 ease-in-out transform hover:scale-90 active:scale-75 ${mode === 'video' && isRecording ? 'scale-50 rounded-md' : ''}`}></div>
        </button>
        <div className="flex space-x-6">
            <button 
                onClick={() => onModeChange('capture-photo')}
                className={`font-semibold text-lg transition ${mode === 'photo' ? 'text-white' : 'text-gray-500'}`}
            >
                Photo
            </button>
            <button 
                onClick={() => onModeChange('capture-video')}
                className={`font-semibold text-lg transition ${mode === 'video' ? 'text-white' : 'text-gray-500'}`}
            >
                Video
            </button>
        </div>
      </div>
    </div>
  );
};