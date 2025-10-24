import React, { useEffect, useRef, useState } from 'react';
import type { User } from '../types';

interface VideoCallViewProps {
  currentUser: User;
  otherUser: User;
  onHangup: () => void;
}

const MuteIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

const UnmuteIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
);

const HangupIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);


export const VideoCallView: React.FC<VideoCallViewProps> = ({ otherUser, onHangup }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState('Connecting...');

  useEffect(() => {
    const startCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // --- WebRTC Setup ---
        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] // Using a public STUN server
        });
        peerConnectionRef.current = peerConnection;

        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

        peerConnection.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setCallStatus(`In call with ${otherUser.username}`);
          }
        };

        // This is a simplified example without a signaling server.
        // We'll create a loopback call to demonstrate the UI and media flow.
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        // In a real app, this `offer` would be sent to the other user via a server.
        // The other user would create an `answer`, send it back, and both would set remote descriptions.
        // For this demo, we set the remote description with the same offer to create a loopback.
        await peerConnection.setRemoteDescription(offer);

        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            // In a real app, candidates are sent to the other peer.
            // For loopback, we add the candidate back to the same connection.
             peerConnection.addIceCandidate(event.candidate);
          }
        };
        
        peerConnection.onconnectionstatechange = () => {
            if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
                setCallStatus('Call failed or disconnected.');
            }
        };


      } catch (err) {
        console.error('Error starting video call:', err);
        setCallStatus('Failed to start call. Check camera/mic permissions.');
      }
    };

    startCall();

    return () => {
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      peerConnectionRef.current?.close();
    };
  }, [otherUser.username]);

  const handleToggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(prev => !prev);
    }
  };

  return (
    <div className="w-full h-full bg-black text-white flex flex-col relative">
      {/* Remote Video */}
      <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
      
      {/* Local Video */}
      <video ref={localVideoRef} autoPlay playsInline muted className="absolute top-4 right-4 w-1/4 max-w-xs h-auto rounded-lg shadow-lg border-2 border-gray-600"></video>
      
      {/* Call Info */}
      <div className="absolute top-4 left-4 bg-black/50 p-2 rounded-lg">
        <p className="font-semibold">{callStatus}</p>
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex justify-center items-center space-x-6">
        <button 
          onClick={handleToggleMute} 
          className={`p-4 rounded-full transition ${isMuted ? 'bg-white text-black' : 'bg-gray-700 hover:bg-gray-600'}`}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <UnmuteIcon /> : <MuteIcon />}
        </button>
        <button 
          onClick={onHangup} 
          className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-transform transform hover:scale-110"
          aria-label="Hang up call"
        >
          <HangupIcon />
        </button>
      </div>
    </div>
  );
};
