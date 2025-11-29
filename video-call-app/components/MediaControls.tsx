'use client';

interface MediaControlsProps {
  audioEnabled: boolean;
  videoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
}

export default function MediaControls({
  audioEnabled,
  videoEnabled,
  onToggleAudio,
  onToggleVideo,
}: MediaControlsProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Audio Toggle Button */}
      <button
        onClick={onToggleAudio}
        className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
          audioEnabled
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
        aria-label={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        title={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
      >
        {audioEnabled ? (
          // Microphone icon (on)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        ) : (
          // Microphone off icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
            />
          </svg>
        )}
      </button>

      {/* Video Toggle Button */}
      <button
        onClick={onToggleVideo}
        className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
          videoEnabled
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
        aria-label={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
        title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
      >
        {videoEnabled ? (
          // Video camera icon (on)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        ) : (
          // Video camera off icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        )}
      </button>

      {/* Status Text */}
      <div className="text-sm text-gray-400">
        <span className={audioEnabled ? 'text-green-400' : 'text-red-400'}>
          {audioEnabled ? 'Mic On' : 'Mic Off'}
        </span>
        {' • '}
        <span className={videoEnabled ? 'text-green-400' : 'text-red-400'}>
          {videoEnabled ? 'Camera On' : 'Camera Off'}
        </span>
      </div>
    </div>
  );
}
