// Caption Manager to coordinate speech recognition and translation

import { SpeechRecognitionService, RecognitionResult } from '../speech/SpeechRecognitionService';
import { TranslationService } from '../translation/TranslationService';
import { Caption } from '@/types';

export type CaptionEventType = 'caption' | 'error';
type CaptionCallback = (data: Caption | Error) => void;

export interface CaptionManagerOptions {
  targetLanguage?: string;
  sourceLanguage?: string;
}

export class CaptionManager {
  private speechService: SpeechRecognitionService;
  private translationService: TranslationService;
  private targetLanguage: string;
  private sourceLanguage: string;
  private eventHandlers: Map<CaptionEventType, CaptionCallback[]> = new Map();
  private captionQueue: Caption[] = [];
  private isMuted: boolean = false;

  constructor(
    speechService: SpeechRecognitionService,
    translationService: TranslationService,
    options: CaptionManagerOptions = {}
  ) {
    this.speechService = speechService;
    this.translationService = translationService;
    this.targetLanguage = options.targetLanguage || 'en';
    this.sourceLanguage = options.sourceLanguage || 'en';

    // Set up speech recognition event handlers
    this.setupSpeechRecognitionHandlers();
  }

  /**
   * Set up event handlers for speech recognition
   */
  private setupSpeechRecognitionHandlers(): void {
    this.speechService.on('result', (data) => {
      if (this.isMuted) {
        return; // Don't process captions when muted
      }

      const result = data as RecognitionResult;
      this.handleSpeechResult(result);
    });

    this.speechService.on('error', (data) => {
      const error = data as Error;
      this.emit('error', error);
    });
  }

  /**
   * Handle speech recognition results
   */
  private async handleSpeechResult(result: RecognitionResult): Promise<void> {
    try {
      // Create caption from speech result
      const caption = await this.createCaptionFromSpeech(result);
      
      // Add to queue
      this.captionQueue.push(caption);
      
      // Emit caption event
      this.emit('caption', caption);
    } catch (error) {
      console.error('Error handling speech result:', error);
      this.emit('error', error as Error);
    }
  }

  /**
   * Create a caption from speech recognition result
   */
  private async createCaptionFromSpeech(result: RecognitionResult): Promise<Caption> {
    const originalText = result.text;
    let translatedText = originalText;
    let isTranslated = false;

    // Translate if target language is different from source
    if (this.translationService.needsTranslation(this.sourceLanguage, this.targetLanguage)) {
      try {
        const translationResult = await this.translationService.translate(
          originalText,
          this.sourceLanguage,
          this.targetLanguage
        );
        translatedText = translationResult.translatedText;
        isTranslated = true;
      } catch (error) {
        console.error('Translation failed, using original text:', error);
        // Keep original text as fallback
      }
    }

    const caption: Caption = {
      id: this.generateCaptionId(),
      text: translatedText,
      originalText: originalText,
      speaker: 'local',
      timestamp: Date.now(),
      language: this.targetLanguage,
      isTranslated: isTranslated,
    };

    return caption;
  }

  /**
   * Start captioning for local user
   */
  startLocalCaptions(targetLanguage?: string): void {
    if (targetLanguage) {
      this.targetLanguage = targetLanguage;
    }

    if (!this.isMuted) {
      this.speechService.start();
    }
  }

  /**
   * Stop local captions
   */
  stopLocalCaptions(): void {
    this.speechService.stop();
  }

  /**
   * Process remote caption from peer
   */
  async processRemoteCaption(remoteCaption: Omit<Caption, 'id' | 'timestamp'>): Promise<void> {
    try {
      let translatedText = remoteCaption.text;
      let isTranslated = remoteCaption.isTranslated;

      // If remote caption is in English and we need a different language, translate it
      if (
        remoteCaption.originalText &&
        this.translationService.needsTranslation(this.sourceLanguage, this.targetLanguage)
      ) {
        try {
          const translationResult = await this.translationService.translate(
            remoteCaption.originalText,
            this.sourceLanguage,
            this.targetLanguage
          );
          translatedText = translationResult.translatedText;
          isTranslated = true;
        } catch (error) {
          console.error('Translation failed for remote caption:', error);
          // Keep original text as fallback
        }
      }

      const caption: Caption = {
        id: this.generateCaptionId(),
        text: translatedText,
        originalText: remoteCaption.originalText,
        speaker: 'remote',
        timestamp: Date.now(),
        language: this.targetLanguage,
        isTranslated: isTranslated,
      };

      this.captionQueue.push(caption);
      this.emit('caption', caption);
    } catch (error) {
      console.error('Error processing remote caption:', error);
      this.emit('error', error as Error);
    }
  }

  /**
   * Change target language for captions
   */
  setTargetLanguage(language: string): void {
    this.targetLanguage = language;
  }

  /**
   * Get current target language
   */
  getTargetLanguage(): string {
    return this.targetLanguage;
  }

  /**
   * Set source language
   */
  setSourceLanguage(language: string): void {
    this.sourceLanguage = language;
    this.speechService.setLanguage(language);
  }

  /**
   * Get current source language
   */
  getSourceLanguage(): string {
    return this.sourceLanguage;
  }

  /**
   * Set mute state - pauses caption generation when muted
   */
  setMuted(muted: boolean): void {
    const wasMuted = this.isMuted;
    this.isMuted = muted;

    if (muted && !wasMuted) {
      // Just muted - stop speech recognition
      this.speechService.stop();
    } else if (!muted && wasMuted) {
      // Just unmuted - restart speech recognition
      this.speechService.start();
    }
  }

  /**
   * Get mute state
   */
  isCaptionMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Get all captions in chronological order
   */
  getCaptions(): Caption[] {
    return [...this.captionQueue].sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Clear caption queue
   */
  clearCaptions(): void {
    this.captionQueue = [];
  }

  /**
   * Register event handler
   */
  on(event: CaptionEventType, callback: CaptionCallback): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(callback);
  }

  /**
   * Remove event handler
   */
  off(event: CaptionEventType, callback: CaptionCallback): void {
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
  private emit(event: CaptionEventType, data: Caption | Error): void {
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
   * Generate unique caption ID
   */
  private generateCaptionId(): string {
    return `caption-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.speechService.stop();
    this.eventHandlers.clear();
    this.captionQueue = [];
  }
}
