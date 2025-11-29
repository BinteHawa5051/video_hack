// Speech Recognition Service using Web Speech API
/// <reference path="./speech-recognition.d.ts" />

export interface RecognitionResult {
  text: string;
  isFinal: boolean;
  confidence: number;
}

export type RecognitionEventType = 'result' | 'error' | 'end' | 'start';

type RecognitionCallback = (data: RecognitionResult | Error | void) => void;

export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private language: string;
  private isRunning: boolean = false;
  private eventHandlers: Map<RecognitionEventType, RecognitionCallback[]> = new Map();

  constructor(language: string = 'en-US') {
    this.language = language;
    this.initializeRecognition();
  }

  private initializeRecognition(): void {
    if (!SpeechRecognitionService.isSupported()) {
      console.warn('Speech Recognition API is not supported in this browser');
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognitionAPI();

    if (this.recognition) {
      // Configure recognition for continuous mode
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.language;
      this.recognition.maxAlternatives = 1;

      // Set up event handlers
      this.recognition.onresult = this.handleResult.bind(this);
      this.recognition.onerror = this.handleError.bind(this);
      this.recognition.onend = this.handleEnd.bind(this);
      this.recognition.onstart = this.handleStart.bind(this);
    }
  }

  private handleResult(event: SpeechRecognitionEvent): void {
    const results = event.results;
    const lastResult = results[results.length - 1];
    
    if (lastResult) {
      const transcript = lastResult[0].transcript;
      const confidence = lastResult[0].confidence;
      const isFinal = lastResult.isFinal;

      const result: RecognitionResult = {
        text: transcript,
        isFinal,
        confidence
      };

      this.emit('result', result);
    }
  }

  private handleError(event: SpeechRecognitionErrorEvent): void {
    console.error('Speech recognition error:', event.error);
    const error = new Error(`Speech recognition error: ${event.error}`);
    this.emit('error', error);
  }

  private handleEnd(): void {
    this.isRunning = false;
    this.emit('end', undefined);
    
    // Auto-restart if it was running (for continuous recognition)
    if (this.recognition && this.isRunning) {
      try {
        this.recognition.start();
      } catch (error) {
        console.error('Failed to restart recognition:', error);
      }
    }
  }

  private handleStart(): void {
    this.isRunning = true;
    this.emit('start', undefined);
  }

  /**
   * Start continuous speech recognition
   */
  start(): void {
    if (!this.recognition) {
      throw new Error('Speech Recognition is not supported in this browser');
    }

    if (this.isRunning) {
      console.warn('Speech recognition is already running');
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      throw error;
    }
  }

  /**
   * Stop speech recognition
   */
  stop(): void {
    if (!this.recognition) {
      return;
    }

    if (!this.isRunning) {
      console.warn('Speech recognition is not running');
      return;
    }

    try {
      this.isRunning = false;
      this.recognition.stop();
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    }
  }

  /**
   * Change the recognition language
   */
  setLanguage(language: string): void {
    this.language = language;
    
    if (this.recognition) {
      const wasRunning = this.isRunning;
      
      if (wasRunning) {
        this.stop();
      }
      
      this.recognition.lang = language;
      
      if (wasRunning) {
        this.start();
      }
    }
  }

  /**
   * Get the current language
   */
  getLanguage(): string {
    return this.language;
  }

  /**
   * Check if recognition is currently running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Register event handler
   */
  on(event: RecognitionEventType, callback: RecognitionCallback): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(callback);
  }

  /**
   * Remove event handler
   */
  off(event: RecognitionEventType, callback: RecognitionCallback): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(callback);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all registered handlers
   */
  private emit(event: RecognitionEventType, data: RecognitionResult | Error | void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }

  /**
   * Check if Speech Recognition API is supported in the browser
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 
           ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
    this.eventHandlers.clear();
    this.recognition = null;
  }
}
