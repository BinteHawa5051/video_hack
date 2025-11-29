import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { TranslationService } from './TranslationService';

// Mock fetch globally
globalThis.fetch = vi.fn() as any;

describe('TranslationService', () => {
  let service: TranslationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TranslationService();
  });

  describe('Property 19: Translation service invocation for non-English targets', () => {
    it('should invoke translation service when target language is not English', async () => {
      // Feature: video-call-live-captions, Property 19: Translation service invocation for non-English targets
      // Validates: Requirements 5.5, 6.1

      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.constantFrom('es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'),
          async (text: string, targetLang: string) => {
            // Mock successful translation
            (globalThis.fetch as any).mockResolvedValueOnce({
              ok: true,
              json: async () => ({ translatedText: `translated_${text}` }),
            });

            const result = await service.translate(text, 'en', targetLang);

            // Verify translation service was called
            expect(globalThis.fetch).toHaveBeenCalled();
            expect(result.sourceLanguage).toBe('en');
            expect(result.targetLanguage).toBe(targetLang);
            expect(result.service).not.toBe('fallback');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should invoke translation for any non-matching source and target languages', async () => {
      // Feature: video-call-live-captions, Property 19: Translation service invocation for non-English targets
      // Validates: Requirements 5.5, 6.1

      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.constantFrom('en', 'es', 'fr', 'de'),
          fc.constantFrom('en', 'es', 'fr', 'de'),
          async (text: string, sourceLang: string, targetLang: string) => {
            fc.pre(sourceLang !== targetLang); // Only test when languages differ

            // Mock successful translation
            (globalThis.fetch as any).mockResolvedValueOnce({
              ok: true,
              json: async () => ({ translatedText: `translated_${text}` }),
            });

            const result = await service.translate(text, sourceLang, targetLang);

            // Verify translation service was invoked
            expect(globalThis.fetch).toHaveBeenCalled();
            expect(result.service).not.toBe('fallback');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 18: No translation for matching source and target', () => {
    it('should not invoke translation service when source equals target language', async () => {
      // Feature: video-call-live-captions, Property 18: No translation for matching source and target
      // Validates: Requirements 5.4

      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.constantFrom('en', 'es', 'fr', 'de', 'it'),
          async (text: string, language: string) => {
            const result = await service.translate(text, language, language);

            // Verify translation service was NOT called
            expect(globalThis.fetch).not.toHaveBeenCalled();
            expect(result.translatedText).toBe(text);
            expect(result.service).toBe('fallback');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle language codes with region variants', async () => {
      // Feature: video-call-live-captions, Property 18: No translation for matching source and target
      // Validates: Requirements 5.4

      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          async (text: string) => {
            // Test en-US vs en-GB (should be treated as same language)
            const result = await service.translate(text, 'en-US', 'en-GB');

            expect(globalThis.fetch).not.toHaveBeenCalled();
            expect(result.translatedText).toBe(text);
            expect(result.service).toBe('fallback');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 20: Translation fallback on service failure', () => {
    it('should return original text when all translation services fail', async () => {
      // Feature: video-call-live-captions, Property 20: Translation fallback on service failure
      // Validates: Requirements 6.3

      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.constantFrom('es', 'fr', 'de', 'it'),
          async (text: string, targetLang: string) => {
            // Mock both services failing
            (globalThis.fetch as any)
              .mockRejectedValueOnce(new Error('LibreTranslate failed'))
              .mockRejectedValueOnce(new Error('MyMemory failed'));

            const result = await service.translate(text, 'en', targetLang);

            // Verify fallback to original text
            expect(result.translatedText).toBe(text);
            expect(result.service).toBe('fallback');
            expect(result.sourceLanguage).toBe('en');
            expect(result.targetLanguage).toBe(targetLang);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should fallback when API returns error status', async () => {
      // Feature: video-call-live-captions, Property 20: Translation fallback on service failure
      // Validates: Requirements 6.3

      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          async (text: string) => {
            // Mock API error responses
            (globalThis.fetch as any)
              .mockResolvedValueOnce({
                ok: false,
                status: 500,
                text: async () => 'Server Error',
              })
              .mockResolvedValueOnce({
                ok: false,
                status: 503,
              });

            const result = await service.translate(text, 'en', 'es');

            // Verify fallback behavior
            expect(result.translatedText).toBe(text);
            expect(result.service).toBe('fallback');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 27: Rate limit error handling', () => {
    it('should handle rate limit errors gracefully', async () => {
      // Feature: video-call-live-captions, Property 27: Rate limit error handling
      // Validates: Requirements 8.5

      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          async (text: string) => {
            // Mock rate limit error (429 Too Many Requests)
            (globalThis.fetch as any)
              .mockResolvedValueOnce({
                ok: false,
                status: 429,
                text: async () => 'Rate limit exceeded',
              })
              .mockResolvedValueOnce({
                ok: false,
                status: 429,
              });

            const result = await service.translate(text, 'en', 'es');

            // Should fallback to original text
            expect(result.translatedText).toBe(text);
            expect(result.service).toBe('fallback');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Language Support', () => {
    it('should provide a list of supported languages', () => {
      const languages = service.getSupportedLanguages();

      expect(languages).toBeInstanceOf(Array);
      expect(languages.length).toBeGreaterThan(0);
      expect(languages[0]).toHaveProperty('code');
      expect(languages[0]).toHaveProperty('name');
    });

    it('should check if a language is supported', () => {
      expect(service.isLanguageSupported('en')).toBe(true);
      expect(service.isLanguageSupported('es')).toBe(true);
      expect(service.isLanguageSupported('xyz')).toBe(false);
    });

    it('should normalize language codes correctly', () => {
      expect(service.needsTranslation('en-US', 'en-GB')).toBe(false);
      expect(service.needsTranslation('en-US', 'es-ES')).toBe(true);
    });
  });

  describe('Translation Flow', () => {
    it('should try LibreTranslate first, then MyMemory on failure', async () => {
      const text = 'Hello world';

      // Mock LibreTranslate failure, MyMemory success
      (globalThis.fetch as any)
        .mockRejectedValueOnce(new Error('LibreTranslate failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            responseStatus: 200,
            responseData: { translatedText: 'Hola mundo' },
          }),
        });

      const result = await service.translate(text, 'en', 'es');

      expect(result.translatedText).toBe('Hola mundo');
      expect(result.service).toBe('mymemory');
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });

    it('should use LibreTranslate when available', async () => {
      const text = 'Hello';

      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ translatedText: 'Hola' }),
      });

      const result = await service.translate(text, 'en', 'es');

      expect(result.translatedText).toBe('Hola');
      expect(result.service).toBe('libretranslate');
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
