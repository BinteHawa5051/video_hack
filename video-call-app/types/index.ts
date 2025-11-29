// Core type definitions for the video call application

export interface Caption {
  id: string;
  text: string;
  originalText: string;
  speaker: 'local' | 'remote';
  timestamp: number;
  language: string;
  isTranslated: boolean;
}

export interface CallSession {
  sessionId: string;
  participants: number;
  createdAt: number;
  status: 'waiting' | 'active' | 'ended';
}

export interface MediaState {
  audioEnabled: boolean;
  videoEnabled: boolean;
  stream: MediaStream | null;
}

export interface Language {
  code: string;
  name: string;
}

export type ConnectionState = 'connecting' | 'connected' | 'disconnected';

export interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}
