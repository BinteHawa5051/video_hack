'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useVideoCall } from '@/hooks/useVideoCall';
import VideoDisplay from '@/components/VideoDisplay';
import CaptionDisplay from '@/components/CaptionDisplay';
import LanguageSelector from '@/components/LanguageSelector';
import MediaControls from '@/components/MediaControls';
import ConnectionStatus from '@/components/ConnectionStatus';

export default function CallPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const [error, setError] = useState<string | null>(null);

  const {
    connectionState,
    localStream,
    remoteStream,
    audioEnabled,
    videoEnabled,
    toggleAudio,
    toggleVideo,
    captions,
    selectedLanguage,
    setSelectedLanguage,
    supportedLanguages,
    startCall,
    endCall,
  } = useVideoCall({
    sessionId,
    onError: setError,
  });

  // Start call on mount
  useEffect(() => {
    startCall();
  }, [startCall]);

  const handleEndCall = () => {
    endCall();
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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Video Call with Live Captions</h1>
            <p className="text-sm text-gray-400">Session: {sessionId.slice(0, 8)}...</p>
          </div>
          <div className="flex items-center gap-4">
            <ConnectionStatus status={connectionState} />
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onChange={setSelectedLanguage}
              supportedLanguages={supportedLanguages}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Video Section */}
        <div className="lg:col-span-2 space-y-4">
          <VideoDisplay localStream={localStream} remoteStream={remoteStream} />
          
          {/* Media Controls */}
          <div className="flex justify-center">
            <MediaControls
              audioEnabled={audioEnabled}
              videoEnabled={videoEnabled}
              onToggleAudio={toggleAudio}
              onToggleVideo={toggleVideo}
            />
          </div>
        </div>

        {/* Captions Section */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-3">Live Captions</h2>
            <CaptionDisplay captions={captions} maxCaptions={10} />
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleEndCall}
            className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            End Call
          </button>
        </div>
      </div>
    </div>
  );
}
