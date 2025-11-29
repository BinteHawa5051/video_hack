'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { WebRTCManager } from '@/lib/webrtc/WebRTCManager';

export default function CallPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const managerRef = useRef<WebRTCManager | null>(null);

  useEffect(() => {
    let mounted = true;

    const initCall = async () => {
      try {
        if (!mounted) return;

        const manager = new WebRTCManager();
        managerRef.current = manager;

        // Set up event listeners
        manager.on('local-stream', (stream: MediaStream) => {
          console.log('✅ Local stream received');
          if (localVideoRef.current && mounted) {
            localVideoRef.current.srcObject = stream;
          }
        });

        manager.on('remote-stream', (stream: MediaStream) => {
          console.log('✅ Remote stream received');
          if (remoteVideoRef.current && mounted) {
            remoteVideoRef.current.srcObject = stream;
          }
          if (mounted) {
            setIsConnected(true);
            setIsConnecting(false);
          }
        });

        manager.on('connected', () => {
          console.log('✅ Connected to peer');
          if (mounted) {
            setIsConnected(true);
            setIsConnecting(false);
          }
        });

        manager.on('disconnected', () => {
          console.log('❌ Disconnected from peer');
          if (mounted) {
            setIsConnected(false);
          }
        });

        // Ultra-simple approach: The session ID IS the host's peer ID
        // Host creates with this ID, guest joins with this ID
        console.log('🔗 Session/Peer ID:', sessionId);
        
        // Try to create first (become host)
        try {
          console.log('👑 Attempting to create session as HOST...');
          await manager.createSession(sessionId);
          console.log('✅ SUCCESS! I am the HOST');
          console.log('📢 Share this URL with someone to join');
        } catch (error: any) {
          // If creation fails, we join instead (become guest)
          console.log('👤 Session exists, joining as GUEST...');
          
          // Wait a moment for the host to be ready
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          try {
            await manager.joinSession(sessionId);
            console.log('✅ SUCCESS! Connected as GUEST');
          } catch (joinError: any) {
            console.error('❌ Failed to join:', joinError);
            throw new Error('Could not connect to the call. The host may have left.');
          }
        }

        if (mounted) {
          setIsConnecting(false);
        }

      } catch (err: any) {
        console.error('❌ Call initialization error:', err);
        if (mounted) {
          let errorMessage = 'Failed to initialize call.';
          
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            errorMessage = 'Camera/microphone access denied. Please allow permissions and refresh.';
          } else if (err.name === 'NotFoundError') {
            errorMessage = 'No camera or microphone found. Please connect a device.';
          } else if (err.message) {
            errorMessage = err.message;
          }
          
          setError(errorMessage);
          setIsConnecting(false);
        }
      }
    };

    initCall();

    // Cleanup on unmount
    return () => {
      mounted = false;
      if (managerRef.current) {
        managerRef.current.disconnect();
      }
    };
  }, [sessionId]);

  const toggleAudio = () => {
    if (managerRef.current) {
      const newState = !audioEnabled;
      managerRef.current.toggleAudio(newState);
      setAudioEnabled(newState);
    }
  };

  const toggleVideo = () => {
    if (managerRef.current) {
      const newState = !videoEnabled;
      managerRef.current.toggleVideo(newState);
      setVideoEnabled(newState);
    }
  };

  const endCall = () => {
    if (managerRef.current) {
      managerRef.current.disconnect();
    }
    router.push('/');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Video Call</h1>
            <p className="text-sm text-gray-400">Session: {sessionId.slice(0, 8)}...</p>
          </div>
          <div className="flex items-center gap-2">
            {isConnecting && (
              <span className="text-yellow-400 text-sm flex items-center gap-2">
                <span className="animate-pulse">●</span> Connecting...
              </span>
            )}
            {isConnected && (
              <span className="text-green-400 text-sm flex items-center gap-2">
                <span className="animate-pulse">●</span> Connected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Local Video */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white text-sm">
            You {!videoEnabled && '(Camera Off)'}
          </div>
        </div>

        {/* Remote Video */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
          {isConnected ? (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white text-sm">
                Remote User
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-6xl mb-4">👤</div>
                <p className="text-lg">Waiting for other participant...</p>
                <p className="text-sm mt-2">Share the session ID to invite someone</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-colors ${
              audioEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={audioEnabled ? 'Mute' : 'Unmute'}
          >
            {audioEnabled ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${
              videoEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {videoEnabled ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {/* End Call */}
          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
            title="End call"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </button>
        </div>

        <div className="text-center mt-2 text-xs text-gray-500">
          <button
            onClick={() => {
              window.sessionStorage.clear();
              window.location.reload();
            }}
            className="hover:text-gray-300 underline"
          >
            Having issues? Clear session and refresh
          </button>
        </div>

        <div className="text-center mt-4 text-sm text-gray-400">
          <p>💡 Captions and translation features coming soon!</p>
        </div>
      </div>
    </div>
  );
}
