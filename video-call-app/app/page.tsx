'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [sessionId, setSessionId] = useState('');
  const [joinId, setJoinId] = useState('');
  const [showCreated, setShowCreated] = useState(false);

  const handleCreateCall = () => {
    // Generate a simple session ID for demo
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
    setShowCreated(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sessionId);
    alert('Session ID copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Video Call with Live Captions
          </h1>
          <p className="text-xl text-gray-600">
            Real-time video calling with speech-to-text and translation
          </p>
          <p className="text-sm text-gray-500 mt-2">
            100% Free • No Sign-up Required • Peer-to-Peer
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Create Call Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Create a Call</h2>
            <p className="text-gray-600">
              Start a new video call and share the session ID with someone
            </p>
            <button
              onClick={handleCreateCall}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              🎥 Create New Call
            </button>

            {showCreated && sessionId && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-2">
                  ✅ Call Created! Share this Session ID:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sessionId}
                    readOnly
                    className="flex-1 px-4 py-2 bg-white border border-green-300 rounded-lg font-mono text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    📋 Copy
                  </button>
                </div>
                <Link
                  href={`/call/${sessionId}`}
                  className="mt-3 block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Start Your Call →
                </Link>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
            </div>
          </div>

          {/* Join Call Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Join a Call</h2>
            <p className="text-gray-600">
              Enter the session ID shared with you
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                placeholder="Enter Session ID"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <Link
                href={joinId ? `/call/${joinId}` : '#'}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  joinId
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={(e) => {
                  if (!joinId) e.preventDefault();
                }}
              >
                Join Call
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white/50 backdrop-blur rounded-lg p-4">
            <div className="text-3xl mb-2">🎥</div>
            <div className="font-semibold text-gray-800">HD Video Calls</div>
            <div className="text-sm text-gray-600">Peer-to-peer WebRTC</div>
          </div>
          <div className="bg-white/50 backdrop-blur rounded-lg p-4">
            <div className="text-3xl mb-2">💬</div>
            <div className="font-semibold text-gray-800">Live Captions</div>
            <div className="text-sm text-gray-600">Real-time speech-to-text</div>
          </div>
          <div className="bg-white/50 backdrop-blur rounded-lg p-4">
            <div className="text-3xl mb-2">🌍</div>
            <div className="font-semibold text-gray-800">Translation</div>
            <div className="text-sm text-gray-600">Multi-language support</div>
          </div>
        </div>

        {/* Tech Stack Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="mb-2">Built with Next.js, WebRTC, Web Speech API & LibreTranslate</p>
          <p className="text-xs text-gray-500">
            Works best in Chrome, Edge, or Safari • Requires camera & microphone permissions
          </p>
        </div>
      </div>
    </div>
  );
}
