'use client';

import { useEffect, useRef } from 'react';

interface VideoDisplayProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

export default function VideoDisplay({ localStream, remoteStream }: VideoDisplayProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      {/* Remote video (larger, primary view) */}
      <div className="flex-1 relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Waiting for remote participant...</p>
          </div>
        )}
      </div>

      {/* Local video (smaller, picture-in-picture style) */}
      <div className="w-full md:w-64 relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
        {localStream ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            <p>No local video</p>
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-xs text-white">
          You
        </div>
      </div>
    </div>
  );
}
