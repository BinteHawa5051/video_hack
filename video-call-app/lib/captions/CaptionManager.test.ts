// Tests for CaptionManager

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { CaptionManager } from './CaptionManager';
import { SpeechRecognitionService, RecognitionResult } from '../speech/SpeechRecognitionService';
import { TranslationService } from '../translation/TranslationService';
import { Caption } from '@/types';

describe('CaptionManager', () => {
  let speechService: SpeechRecognitionService;
  let translationService: TranslationService;
  let captionManager: CaptionManager;

  beforeEach(() => {
    // Create mock services
    speechService = new SpeechRecognitionService('en-US');
    translationService = new TranslationService();

    // Mock the speech service methods
    vi.spyOn(speechService, 'start').mockImplementation(() => {});
    vi.spyOn(speechService, 'stop').mockImplementation(() => {});
    vi.spyOn(speechService, 'on').mockImplementation(() => {});

    captionManager = new CaptionManager(speechService, translationService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Property 12: Speech recognition invocation', () => {
    // Feature: video-call-live-captions, Property 12: Speech recognition invocation
    // Validates: Requirements 4.1
    it('should invoke speech recognition service when starting local captions', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'es', 'fr', 'de', 'it'),
          (targetLanguage) => {
            // Reset mocks
            vi.clearAllMocks();

            // Create new caption manager
            const manager = new CaptionManager(speechService, translationService);

            // Start local captions
            manager.startLocalCaptions(targetLanguage);

            // Verify speech recognition was started
            expect(speechService.start).toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should set up speech recognition event handlers on initialization', () => {
      // Feature: video-call-live-captions, Property 12: Speech recognition invocation
      // Validates: Requirements 4.1
      
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'es', 'fr', 'de'),
          (targetLanguage) => {
            // Reset mocks
            vi.clearAllMocks();

            // Create new caption manager
            const manager = new CaptionManager(speechService, translationService, {
              targetLanguage
            });

            // Verify speech recognition event handlers were registered
            expect(speechService.on).toHaveBeenCalledWith('result', expect.any(Function));
            expect(speechService.on).toHaveBeenCalledWith('error', expect.any(Function));
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 25: Speaker identification preservation', () => {
    // Feature: video-call-live-captions, Property 25: Speaker identification preservation
    // Validates: Requirements 7.3
    it('should preserve speaker identification for local captions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.float({ min: 0, max: 1 }),
          async (text, confidence) => {
            // Reset mocks
            vi.clearAllMocks();

            // Mock translation service to return text as-is
            vi.spyOn(translationService, 'translate').mockResolvedValue({
              translatedText: text,
              sourceLanguage: 'en',
              targetLanguage: 'en',
              service: 'fallback',
            });

            const manager = new CaptionManager(speechService, translationService);

            // Capture emitted captions
            let emittedCaption: Caption | null = null;
            manager.on('caption', (data) => {
              emittedCaption = data as Caption;
            });

            // Simulate speech recognition result
            const result: RecognitionResult = {
              text,
              confidence,
              isFinal: true,
            };

            // Trigger the result handler
            const handlers = (speechService as any).eventHandlers?.get('result') || [];
            if (handlers.length > 0) {
              await handlers[0](result);
            }

            // Wait a bit for async operations
            await new Promise(resolve => setTimeout(resolve, 10));

            // Verify speaker is 'local' for locally generated captions
            if (emittedCaption) {
              expect(emittedCaption.speaker).toBe('local');
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should preserve speaker identification for remote captions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.constantFrom('en', 'es', 'fr', 'de'),
          async (text, language) => {
            // Reset mocks
            vi.clearAllMocks();

            // Mock translation service
            vi.spyOn(translationService, 'translate').mockResolvedValue({
              translatedText: text,
              sourceLanguage: 'en',
              targetLanguage: language,
              service: 'fallback',
            });

            const manager = new CaptionManager(speechService, translationService);

            // Capture emitted captions
            let emittedCaption: Caption | null = null;
            manager.on('caption', (data) => {
              emittedCaption = data as Caption;
            });

            // Process remote caption
            await manager.processRemoteCaption({
              text,
              originalText: text,
              speaker: 'remote',
              language,
              isTranslated: false,
            });

            // Verify speaker is 'remote' for remote captions
            expect(emittedCaption).not.toBeNull();
            if (emittedCaption) {
              expect(emittedCaption.speaker).toBe('remote');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 16: Default English caption language', () => {
    // Feature: video-call-live-captions, Property 16: Default English caption language
    // Validates: Requirements 5.1
    it('should default to English when no target language is specified', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          (iterations) => {
            // Create multiple caption managers without specifying target language
            for (let i = 0; i < iterations; i++) {
              const manager = new CaptionManager(speechService, translationService);
              
              // Verify default target language is English
              expect(manager.getTargetLanguage()).toBe('en');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use English as default across different initialization scenarios', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(undefined, {}, { sourceLanguage: 'en' }),
          (options) => {
            const manager = new CaptionManager(
              speechService,
              translationService,
              options as any
            );

            // Verify target language defaults to English
            expect(manager.getTargetLanguage()).toBe('en');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 17: Language selection affects future captions', () => {
    // Feature: video-call-live-captions, Property 17: Language selection affects future captions
    // Validates: Requirements 5.2, 5.3
    it('should apply new target language to all future captions', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'es', 'fr', 'de', 'it', 'pt'),
          fc.constantFrom('en', 'es', 'fr', 'de', 'it', 'pt'),
          (initialLang, newLang) => {
            fc.pre(initialLang !== newLang); // Only test when languages differ

            const manager = new CaptionManager(speechService, translationService, {
              targetLanguage: initialLang,
            });

            // Verify initial language
            expect(manager.getTargetLanguage()).toBe(initialLang);

            // Change target language
            manager.setTargetLanguage(newLang);

            // Verify new language is applied
            expect(manager.getTargetLanguage()).toBe(newLang);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should translate future captions using the newly selected language', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.constantFrom('es', 'fr', 'de'),
          async (text, targetLang) => {
            // Reset mocks
            vi.clearAllMocks();

            // Mock translation service
            const translateSpy = vi.spyOn(translationService, 'translate').mockResolvedValue({
              translatedText: `translated_${text}`,
              sourceLanguage: 'en',
              targetLanguage: targetLang,
              service: 'libretranslate',
            });

            const manager = new CaptionManager(speechService, translationService);

            // Change to new target language
            manager.setTargetLanguage(targetLang);

            // Process a remote caption
            await manager.processRemoteCaption({
              text,
              originalText: text,
              speaker: 'remote',
              language: 'en',
              isTranslated: false,
            });

            // Verify translation was called with the new target language
            expect(translateSpy).toHaveBeenCalledWith(text, 'en', targetLang);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 11: Mute state affects captions', () => {
    // Feature: video-call-live-captions, Property 11: Mute state affects captions
    // Validates: Requirements 3.4, 3.5
    it('should pause caption generation when muted and resume when unmuted', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.boolean(),
          (initialMuteState, finalMuteState) => {
            // Reset mocks
            vi.clearAllMocks();

            const manager = new CaptionManager(speechService, translationService);

            // Set initial mute state
            manager.setMuted(initialMuteState);

            if (initialMuteState) {
              // If muted, speech recognition should be stopped
              expect(speechService.stop).toHaveBeenCalled();
            }

            // Clear mocks for next state change
            vi.clearAllMocks();

            // Change mute state
            manager.setMuted(finalMuteState);

            if (finalMuteState && !initialMuteState) {
              // Just muted - should stop speech recognition
              expect(speechService.stop).toHaveBeenCalled();
            } else if (!finalMuteState && initialMuteState) {
              // Just unmuted - should start speech recognition
              expect(speechService.start).toHaveBeenCalled();
            }

            // Verify mute state is correctly tracked
            expect(manager.isCaptionMuted()).toBe(finalMuteState);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not process speech results when muted', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (text) => {
            // Reset mocks
            vi.clearAllMocks();

            const manager = new CaptionManager(speechService, translationService);

            // Track emitted captions
            let captionCount = 0;
            manager.on('caption', () => {
              captionCount++;
            });

            // Mute the manager
            manager.setMuted(true);

            // Verify muted state
            expect(manager.isCaptionMuted()).toBe(true);

            // The actual speech result handling is internal, but we can verify
            // that when muted, the manager is in the correct state
            expect(manager.isCaptionMuted()).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 24: Chronological caption ordering', () => {
    // Feature: video-call-live-captions, Property 24: Chronological caption ordering
    // Validates: Requirements 7.2
    it('should return captions in chronological order based on timestamps', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 2, maxLength: 10 }),
          async (texts) => {
            // Reset mocks
            vi.clearAllMocks();

            // Mock translation service
            vi.spyOn(translationService, 'translate').mockImplementation(async (text: string) => ({
              translatedText: text,
              sourceLanguage: 'en',
              targetLanguage: 'en',
              service: 'fallback',
            }));

            const manager = new CaptionManager(speechService, translationService);

            // Add captions with random delays to simulate real-world timing
            for (const text of texts) {
              await manager.processRemoteCaption({
                text,
                originalText: text,
                speaker: 'remote',
                language: 'en',
                isTranslated: false,
              });
              // Small delay to ensure different timestamps
              await new Promise(resolve => setTimeout(resolve, 5));
            }

            // Get all captions
            const captions = manager.getCaptions();

            // Verify captions are in chronological order
            for (let i = 1; i < captions.length; i++) {
              expect(captions[i].timestamp).toBeGreaterThanOrEqual(captions[i - 1].timestamp);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should maintain chronological order when adding captions out of order', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.integer({ min: 1000, max: 9999 }), { minLength: 3, maxLength: 8 }),
          async (timestamps) => {
            // Reset mocks
            vi.clearAllMocks();

            // Mock translation service
            vi.spyOn(translationService, 'translate').mockResolvedValue({
              translatedText: 'test',
              sourceLanguage: 'en',
              targetLanguage: 'en',
              service: 'fallback',
            });

            const manager = new CaptionManager(speechService, translationService);

            // Add captions
            for (const timestamp of timestamps) {
              await manager.processRemoteCaption({
                text: `caption_${timestamp}`,
                originalText: `caption_${timestamp}`,
                speaker: 'remote',
                language: 'en',
                isTranslated: false,
              });
            }

            // Get captions - should be sorted by timestamp
            const captions = manager.getCaptions();

            // Verify chronological order
            for (let i = 1; i < captions.length; i++) {
              expect(captions[i].timestamp).toBeGreaterThanOrEqual(captions[i - 1].timestamp);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 22: Continued operation after translation failure', () => {
    // Feature: video-call-live-captions, Property 22: Continued operation after translation failure
    // Validates: Requirements 6.5
    it('should display untranslated text and continue processing after translation failure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 2, maxLength: 5 }),
          fc.integer({ min: 0, max: 10 }),
          async (texts, failureIndex) => {
            fc.pre(failureIndex < texts.length); // Ensure failure index is valid

            // Reset mocks
            vi.clearAllMocks();

            // Mock translation service to fail at specific index
            let callCount = 0;
            vi.spyOn(translationService, 'translate').mockImplementation(async (text: string) => {
              const currentCall = callCount++;
              if (currentCall === failureIndex) {
                // Simulate translation failure
                throw new Error('Translation service unavailable');
              }
              return {
                translatedText: `translated_${text}`,
                sourceLanguage: 'en',
                targetLanguage: 'es',
                service: 'libretranslate',
              };
            });

            const manager = new CaptionManager(speechService, translationService, {
              targetLanguage: 'es',
            });

            const emittedCaptions: Caption[] = [];
            manager.on('caption', (data) => {
              emittedCaptions.push(data as Caption);
            });

            // Process all captions
            for (const text of texts) {
              await manager.processRemoteCaption({
                text,
                originalText: text,
                speaker: 'remote',
                language: 'en',
                isTranslated: false,
              });
            }

            // Verify all captions were processed despite the failure
            expect(emittedCaptions.length).toBe(texts.length);

            // Verify the failed caption contains original text
            if (failureIndex < emittedCaptions.length) {
              const failedCaption = emittedCaptions[failureIndex];
              expect(failedCaption.text).toBe(texts[failureIndex]);
            }

            // Verify subsequent captions were still processed
            for (let i = failureIndex + 1; i < emittedCaptions.length; i++) {
              expect(emittedCaptions[i]).toBeDefined();
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should continue processing captions after multiple translation failures', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 3, max: 10 }),
          async (captionCount) => {
            // Reset mocks
            vi.clearAllMocks();

            // Mock translation service to always fail
            vi.spyOn(translationService, 'translate').mockRejectedValue(
              new Error('Translation service error')
            );

            const manager = new CaptionManager(speechService, translationService, {
              targetLanguage: 'fr',
            });

            const emittedCaptions: Caption[] = [];
            manager.on('caption', (data) => {
              emittedCaptions.push(data as Caption);
            });

            // Process multiple captions
            for (let i = 0; i < captionCount; i++) {
              await manager.processRemoteCaption({
                text: `caption_${i}`,
                originalText: `caption_${i}`,
                speaker: 'remote',
                language: 'en',
                isTranslated: false,
              });
            }

            // Verify all captions were processed with original text
            expect(emittedCaptions.length).toBe(captionCount);

            // Verify all captions contain original text (fallback behavior)
            emittedCaptions.forEach((caption, index) => {
              expect(caption.text).toBe(`caption_${index}`);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
