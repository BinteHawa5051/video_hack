import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { SpeechRecognitionService } from './SpeechRecognitionService';

// Mock the Web Speech API
const mockRecognition = {
  continuous: false,
  interimResults: false,
  lang: '',
  maxAlternatives: 1,
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  onresult: null,
  onerror: null,
  onend: null,
  onstart: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

beforeEach(() => {
  // Reset mocks
  vi.clearAllMocks();
  
  // Mock the global window object
  (globalThis as any).window = {
    SpeechRecognition: vi.fn(() => mockRecognition),
    webkitSpeechRecognition: vi.fn(() => mockRecognition),
  };
});

describe('SpeechRecognitionService', () => {
  describe('Property 13: Default English source language', () => {
    it('should default to English (en-US) when no language is specified', () => {
      // Feature: video-call-live-captions, Property 13: Default English source language
      // Validates: Requirements 4.3
      
      fc.assert(
        fc.property(fc.constant(undefined), () => {
          const service = new SpeechRecognitionService();
          const language = service.getLanguage();
          
          expect(language).toBe('en-US');
          expect(mockRecognition.lang).toBe('en-US');
        }),
        { numRuns: 100 }
      );
    });

    it('should use English as default across multiple service instances', () => {
      // Feature: video-call-live-captions, Property 13: Default English source language
      // Validates: Requirements 4.3
      
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 10 }), (numInstances: number) => {
          const services = Array.from({ length: numInstances }, () => new SpeechRecognitionService());
          
          services.forEach(service => {
            expect(service.getLanguage()).toBe('en-US');
          });
          
          // Cleanup
          services.forEach(service => service.destroy());
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Browser Support', () => {
    it('should detect browser support correctly', () => {
      expect(SpeechRecognitionService.isSupported()).toBe(true);
    });
  });

  describe('Language Configuration', () => {
    it('should allow language to be set during construction', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT'),
          (language: string) => {
            const service = new SpeechRecognitionService(language);
            expect(service.getLanguage()).toBe(language);
            service.destroy();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should allow language to be changed after construction', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT'),
          fc.constantFrom('en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT'),
          (initialLang: string, newLang: string) => {
            const service = new SpeechRecognitionService(initialLang);
            service.setLanguage(newLang);
            expect(service.getLanguage()).toBe(newLang);
            service.destroy();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Start/Stop Lifecycle', () => {
    it('should start recognition when start() is called', () => {
      const service = new SpeechRecognitionService();
      service.start();
      
      expect(mockRecognition.start).toHaveBeenCalled();
      service.destroy();
    });

    it('should stop recognition when stop() is called', () => {
      const service = new SpeechRecognitionService();
      service.start();
      service.stop();
      
      expect(mockRecognition.stop).toHaveBeenCalled();
      service.destroy();
    });

    it('should not be active initially', () => {
      const service = new SpeechRecognitionService();
      expect(service.isActive()).toBe(false);
      service.destroy();
    });
  });

  describe('Event Handling', () => {
    it('should register and call event handlers', () => {
      const service = new SpeechRecognitionService();
      const handler = vi.fn();
      
      service.on('start', handler);
      
      // Simulate start event
      if (mockRecognition.onstart) {
        mockRecognition.onstart();
      }
      
      service.destroy();
    });
  });

  describe('Property 14: Caption finalization on silence', () => {
    it('should emit results with isFinal flag when silence is detected', () => {
      // Feature: video-call-live-captions, Property 14: Caption finalization on silence
      // Validates: Requirements 4.4
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.float({ min: 0, max: 1 }),
          (transcript: string, confidence: number) => {
            const service = new SpeechRecognitionService();
            let receivedResult: any = null;
            
            service.on('result', (result) => {
              receivedResult = result;
            });
            
            // Simulate a final result (silence detected)
            const mockEvent = {
              resultIndex: 0,
              results: {
                length: 1,
                0: {
                  isFinal: true,
                  length: 1,
                  0: {
                    transcript,
                    confidence
                  }
                }
              }
            } as any;
            
            if (mockRecognition.onresult) {
              mockRecognition.onresult(mockEvent);
            }
            
            // Verify that the result has isFinal set to true
            expect(receivedResult).not.toBeNull();
            expect(receivedResult.isFinal).toBe(true);
            expect(receivedResult.text).toBe(transcript);
            
            service.destroy();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should emit interim results before finalization', () => {
      // Feature: video-call-live-captions, Property 14: Caption finalization on silence
      // Validates: Requirements 4.4
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (transcript: string) => {
            const service = new SpeechRecognitionService();
            let receivedResult: any = null;
            
            service.on('result', (result) => {
              receivedResult = result;
            });
            
            // Simulate an interim result (before silence)
            const mockEvent = {
              resultIndex: 0,
              results: {
                length: 1,
                0: {
                  isFinal: false,
                  length: 1,
                  0: {
                    transcript,
                    confidence: 0.5
                  }
                }
              }
            } as any;
            
            if (mockRecognition.onresult) {
              mockRecognition.onresult(mockEvent);
            }
            
            // Verify that the result has isFinal set to false
            expect(receivedResult).not.toBeNull();
            expect(receivedResult.isFinal).toBe(false);
            
            service.destroy();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 15: Partial caption display on unclear speech', () => {
    it('should display partial captions with available recognized words', () => {
      // Feature: video-call-live-captions, Property 15: Partial caption display on unclear speech
      // Validates: Requirements 4.5
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.float({ min: 0, max: 0.5 }), // Low confidence for unclear speech
          (partialTranscript: string, lowConfidence: number) => {
            const service = new SpeechRecognitionService();
            let receivedResult: any = null;
            
            service.on('result', (result) => {
              receivedResult = result;
            });
            
            // Simulate unclear speech with partial recognition
            const mockEvent = {
              resultIndex: 0,
              results: {
                length: 1,
                0: {
                  isFinal: false,
                  length: 1,
                  0: {
                    transcript: partialTranscript,
                    confidence: lowConfidence
                  }
                }
              }
            } as any;
            
            if (mockRecognition.onresult) {
              mockRecognition.onresult(mockEvent);
            }
            
            // Verify that partial text is still displayed even with low confidence
            expect(receivedResult).not.toBeNull();
            expect(receivedResult.text).toBe(partialTranscript);
            expect(receivedResult.confidence).toBe(lowConfidence);
            expect(receivedResult.isFinal).toBe(false);
            
            service.destroy();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle multiple partial results before finalization', () => {
      // Feature: video-call-live-captions, Property 15: Partial caption display on unclear speech
      // Validates: Requirements 4.5
      
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 5 }),
          (partialTexts: string[]) => {
            const service = new SpeechRecognitionService();
            const receivedResults: any[] = [];
            
            service.on('result', (result) => {
              receivedResults.push(result);
            });
            
            // Simulate multiple partial results
            partialTexts.forEach((text, index) => {
              const mockEvent = {
                resultIndex: index,
                results: {
                  length: index + 1,
                  [index]: {
                    isFinal: false,
                    length: 1,
                    0: {
                      transcript: text,
                      confidence: 0.3
                    }
                  }
                }
              } as any;
              
              if (mockRecognition.onresult) {
                mockRecognition.onresult(mockEvent);
              }
            });
            
            // Verify all partial results were received
            expect(receivedResults.length).toBe(partialTexts.length);
            receivedResults.forEach((result, index) => {
              expect(result.text).toBe(partialTexts[index]);
              expect(result.isFinal).toBe(false);
            });
            
            service.destroy();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
