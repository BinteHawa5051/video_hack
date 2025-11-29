'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Caption } from '@/types';

interface CaptionDisplayProps {
  captions: Caption[];
  maxCaptions?: number;
}

export default function CaptionDisplay({ captions, maxCaptions = 10 }: CaptionDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Limit the number of visible captions
  const visibleCaptions = useMemo(() => {
    if (captions.length <= maxCaptions) {
      return captions;
    }
    // Keep only the most recent captions (slice from the end)
    return captions.slice(captions.length - maxCaptions);
  }, [captions, maxCaptions]);

  // Auto-scroll to newest captions
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleCaptions]);

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="w-full bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto" ref={containerRef}>
      <div className="space-y-3">
        {visibleCaptions.length === 0 ? (
          <p className="text-gray-500 text-center">Captions will appear here...</p>
        ) : (
          visibleCaptions.map((caption) => (
            <div
              key={caption.id}
              className={`flex flex-col gap-1 p-3 rounded-lg ${
                caption.speaker === 'local'
                  ? 'bg-blue-900 bg-opacity-30 border-l-4 border-blue-500'
                  : 'bg-green-900 bg-opacity-30 border-l-4 border-green-500'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`font-semibold ${
                    caption.speaker === 'local' ? 'text-blue-400' : 'text-green-400'
                  }`}
                >
                  {caption.speaker === 'local' ? 'You' : 'Remote'}
                </span>
                <span className="text-gray-400">{formatTimestamp(caption.timestamp)}</span>
              </div>
              <p className="text-white text-sm leading-relaxed">{caption.text}</p>
              {caption.isTranslated && (
                <p className="text-gray-400 text-xs italic">
                  Original: {caption.originalText}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
