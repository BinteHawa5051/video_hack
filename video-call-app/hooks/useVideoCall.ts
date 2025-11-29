import { useState, useEffect, useRef, useCallback } from 'react';
import { WebRTCManager } from '@/lib/webrtc/WebRTCManager';
import { SpeechRecognitionService } from '@/lib/speech/SpeechRecognitionService';
import { TranslationService } from '@/lib/translation/TranslationService';
import { CaptionManager } from '@/lib/captions/CaptionManager';
import { Caption, ConnectionState, Language } from '@/types';

interface UseVideoCallOptions {
  sessionId: string;
  onError?: (error: string) => void;
}

interface UseVideoCallReturn {
  // Connection state
  connectionState: ConnectionState;
  isConnected: boolean;
  
  // Media streams
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  
  // Media controls
  audioEnabled: boolean;
  videoEnabled: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  
  // Captions
  captions: Caption[];
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  supportedLanguages: Language[];
  
  // Call controls
  startCall: () => Promise<void>;
  endCall: () => void;
}

export function useVideoCall({ sessionId, onError }: UseVideoCallOptions): UseVideoCallReturn {
  // Connection state
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  // Media state
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  
  // Caption state
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  
  // Service instances
  const webrtcManagerRef = useRef<WebRTCManager | null>(null);
  const speechServiceRef = useRef<SpeechRecognitionService | null>(null);
  const translationServiceRef = useRef<TranslationService | null>(null);
  const captionManagerRef = useRef<CaptionManager | null>(null);
  const supportedLanguagesRef = useRef<Language[]>([]);

  // Initialize services
  useEffect(() => {
    // Initialize translation service
    const translationService = new TranslationService();
    translationServiceRef.current = translationService;
    supportedLanguagesRef.current = translationService.getSupportedLanguages();

    // Initialize speech recognition service
    if (SpeechRecognitionService.isSupported()) {
      const speechService = new SpeechRecognitionService();
      speechServiceRef.current = speechService;

      // Initialize caption manager
      const captionManager = new CaptionManager(speechService, translationService);
      captionManagerRef.current = captionManager;

      // Listen for new captions
      captionManager.on('caption', (data: Caption | Error) => {
        if (data instanceof Error) {
          console.error('Caption error:', data);
        } else {
          setCaptions((prev) => [...prev, data]);
        }
      });
    } else {
      console.warn('Speech recognition not supported in this browser');
    }

    return () => {
      // Cleanup on unmount
      if (speechServiceRef.current) {
        speechServiceRef.current.stop();
      }
    };
  }, []);

  // Start call
  const startCall = useCallback(async () => {
    try {
      setConnectionState('connecting');

      // Initialize WebRTC manager
      const webrtcManager = new WebRTCManager();
      webrtcManagerRef.current = webrtcManager;

      // Set up WebRTC event listeners
      webrtcManager.on('local-stream', (stream: MediaStream) => {
        console.log('✅ Local stream received');
        setLocalStream(stream);
      });

      webrtcManager.on('remote-stream', (stream: MediaStream) => {
        console.log('✅ Remote stream received');
        setRemoteStream(stream);
        setConnectionState('connected');
      });

      webrtcManager.on('connected', () => {
        console.log('✅ Connected to peer');
        setConnectionState('connected');
      });

      webrtcManager.on('disconnected', () => {
        console.log('❌ Disconnected from peer');
        setConnectionState('disconnected');
      });

      // Handle incoming caption data from peer
      webrtcManager.on('data', (data: any) => {
        if (data.type === 'caption' && captionManagerRef.current) {
          captionManagerRef.current.processRemoteCaption(data.caption);
        }
      });

      // Try to create session (become host)
      try {
        console.log('👑 Attempting to create session as HOST...');
        await webrtcManager.createSession(sessionId);
        console.log('✅ SUCCESS! I am the HOST');
      } catch (error: any) {
        // If creation fails, join instead (become guest)
        console.log('👤 Session exists, joining as GUEST...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        await webrtcManager.joinSession(sessionId);
        console.log('✅ SUCCESS! Connected as GUEST');
      }

      // Start caption generation
      if (captionManagerRef.current) {
        captionManagerRef.current.startLocalCaptions(selectedLanguage);
        
        // Send local captions to remote peer
        captionManagerRef.current.on('caption', (data: Caption | Error) => {
          if (!(data instanceof Error) && data.speaker === 'local' && webrtcManager) {
            webrtcManager.sendData({
              type: 'caption',
              caption: data,
            });
          }
        });
      }

      setConnectionState('connected');
    } catch (error: any) {
      console.error('❌ Call initialization error:', error);
      setConnectionState('disconnected');
      
      let errorMessage = 'Failed to initialize call.';
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Camera/microphone access denied. Please allow permissions and refresh.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera or microphone found. Please connect a device.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [sessionId, selectedLanguage, onError]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (webrtcManagerRef.current) {
      const newState = !audioEnabled;
      webrtcManagerRef.current.toggleAudio(newState);
      setAudioEnabled(newState);
      
      // Update caption manager mute state
      if (captionManagerRef.current) {
        captionManagerRef.current.setMuted(!newState);
      }
    }
  }, [audioEnabled]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (webrtcManagerRef.current) {
      const newState = !videoEnabled;
      webrtcManagerRef.current.toggleVideo(newState);
      setVideoEnabled(newState);
    }
  }, [videoEnabled]);

  // End call
  const endCall = useCallback(() => {
    if (webrtcManagerRef.current) {
      webrtcManagerRef.current.disconnect();
    }
    if (speechServiceRef.current) {
      speechServiceRef.current.stop();
    }
    setConnectionState('disconnected');
  }, []);

  // Update caption language when changed
  useEffect(() => {
    if (captionManagerRef.current) {
      captionManagerRef.current.setTargetLanguage(selectedLanguage);
    }
  }, [selectedLanguage]);

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    localStream,
    remoteStream,
    audioEnabled,
    videoEnabled,
    toggleAudio,
    toggleVideo,
    captions,
    selectedLanguage,
    setSelectedLanguage,
    supportedLanguages: supportedLanguagesRef.current,
    startCall,
    endCall,
  };
}
