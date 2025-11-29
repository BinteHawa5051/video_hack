'use client';

import { useEffect, useState } from 'react';
import { SpeechRecognitionService } from '@/lib/speech/SpeechRecognitionService';
import { TranslationService } from '@/lib/translation/TranslationService';
import { CaptionManager } from '@/lib/captions/CaptionManager';
import { Caption } from '@/types';

export default function TestCaptionsPage() {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [captionManager, setCaptionManager] = useState<CaptionManager | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check browser support
    if (!SpeechRecognitionService.isSupported()) {
      setIsSupported(false);
      setError('Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Initialize services
    const speechService = new SpeechRecognitionService('en-US');
    const translationService = new TranslationService();
    const manager = new CaptionManager(speechService, translationService, {
      targetLanguage: 'en'
    });

    // Listen for captions
    manager.on('caption', (data) => {
      const caption = data as Caption;
      setCaptions(prev => [...prev, caption]);
    });

    manager.on('error', (data) => {
      const err = data as Error;
      console.error('Caption error:', err);
      setError(err.message);
    });

    setCaptionManager(manager);

    return () => {
      manager.destroy();
    };
  }, []);

  const toggleListening = () => {
    if (!captionManager) return;

    if (isListening) {
      captionManager.stopLocalCaptions();
      setIsListening(false);
    } else {
      captionManager.startLocalCaptions(targetLanguage);
      setIsListening(true);
      setError(null);
    }
  };

  const changeLanguage = (lang: string) => {
    setTargetLanguage(lang);
    if (captionManager) {
      captionManager.setTargetLanguage(lang);
    }
  };

  const clearCaptions = () => {
    setCaptions([]);
    if (captionManager) {
      captionManager.clearCaptions();
    }
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Caption Test Page</h1>
          <div className="bg-red-900 border border-red-700 rounded-lg p-4">
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Caption Test Page</h1>

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={toggleListening}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isListening ? '🛑 Stop Listening' : '🎤 Start Listening'}
            </button>

            <select
              value={targetLanguage}
              onChange={(e) => changeLanguage(e.target.value)}
              className="px-4 py-3 bg-gray-700 rounded-lg border border-gray-600"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
              <option value="zh">Chinese</option>
            </select>

            <button
              onClick={clearCaptions}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
            >
              🗑️ Clear
            </button>

            <div className="ml-auto">
              <span className="text-gray-400">
                Status: {isListening ? '🟢 Listening' : '⚪ Stopped'}
              </span>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-900 border border-red-700 rounded-lg p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-6">
          <h2 className="font-semibold mb-2">📝 Instructions:</h2>
          <ul className="text-sm text-blue-200 space-y-1">
            <li>1. Click "Start Listening" to begin speech recognition</li>
            <li>2. Speak into your microphone</li>
            <li>3. Watch captions appear below in real-time</li>
            <li>4. Change the language to see automatic translation</li>
            <li>5. Note: Translation requires internet connection</li>
          </ul>
        </div>

        {/* Captions Display */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Captions ({captions.length})
          </h2>
          
          {captions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No captions yet. Start listening to see captions appear here.
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {captions.map((caption) => (
                <div
                  key={caption.id}
                  className={`p-4 rounded-lg ${
                    caption.speaker === 'local'
                      ? 'bg-blue-900 border-l-4 border-blue-500'
                      : 'bg-green-900 border-l-4 border-green-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-semibold uppercase text-gray-400">
                      {caption.speaker === 'local' ? '👤 You' : '👥 Remote'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(caption.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-white">{caption.text}</p>
                  {caption.isTranslated && (
                    <p className="text-xs text-gray-400 mt-2">
                      Original: {caption.originalText}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                      {caption.language.toUpperCase()}
                    </span>
                    {caption.isTranslated && (
                      <span className="text-xs bg-purple-700 px-2 py-1 rounded">
                        Translated
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Debug Info */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <details className="text-sm">
            <summary className="cursor-pointer font-semibold text-gray-400 hover:text-white">
              🔧 Debug Info
            </summary>
            <div className="mt-3 space-y-2 text-gray-300">
              <p>Browser: {navigator.userAgent}</p>
              <p>Speech Recognition: {SpeechRecognitionService.isSupported() ? '✅ Supported' : '❌ Not Supported'}</p>
              <p>Target Language: {targetLanguage}</p>
              <p>Total Captions: {captions.length}</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
