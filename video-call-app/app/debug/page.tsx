'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [checks, setChecks] = useState({
    webrtc: false,
    speech: false,
    camera: false,
    microphone: false,
    peerjs: false,
  });

  useEffect(() => {
    runChecks();
  }, []);

  const runChecks = async () => {
    // Check WebRTC
    const hasWebRTC = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    
    // Check Speech Recognition
    const hasSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    
    // Check Camera/Mic
    let hasCamera = false;
    let hasMic = false;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      hasCamera = devices.some(d => d.kind === 'videoinput');
      hasMic = devices.some(d => d.kind === 'audioinput');
    } catch (e) {
      console.error('Device check failed:', e);
    }

    // Check PeerJS
    const hasPeerJS = typeof window !== 'undefined';

    setChecks({
      webrtc: hasWebRTC,
      speech: hasSpeech,
      camera: hasCamera,
      microphone: hasMic,
      peerjs: hasPeerJS,
    });
  };

  const testConnection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      alert('✅ Camera and microphone access granted!');
      stream.getTracks().forEach(track => track.stop());
    } catch (error: any) {
      alert('❌ Failed to access camera/microphone: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">System Diagnostics</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Feature Support</h2>
          
          <div className="space-y-3">
            <CheckItem 
              label="WebRTC Support" 
              status={checks.webrtc}
              description="Required for video calls"
            />
            <CheckItem 
              label="Speech Recognition" 
              status={checks.speech}
              description="Required for live captions"
            />
            <CheckItem 
              label="Camera Detected" 
              status={checks.camera}
              description="Video input device"
            />
            <CheckItem 
              label="Microphone Detected" 
              status={checks.microphone}
              description="Audio input device"
            />
            <CheckItem 
              label="PeerJS Available" 
              status={checks.peerjs}
              description="Signaling service"
            />
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <button
              onClick={testConnection}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Test Camera & Microphone Access
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            <p><strong>Browser:</strong> {navigator.userAgent}</p>
            <p className="mt-2"><strong>Platform:</strong> {navigator.platform}</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

function CheckItem({ label, status, description }: { label: string; status: boolean; description: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
      <div>
        <div className="font-medium text-white">{label}</div>
        <div className="text-sm text-gray-400">{description}</div>
      </div>
      <div className={`text-2xl ${status ? 'text-green-400' : 'text-red-400'}`}>
        {status ? '✅' : '❌'}
      </div>
    </div>
  );
}
