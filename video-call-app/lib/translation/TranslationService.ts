// Translation Service using free translation APIs

import { Language } from '@/types';

export interface TranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
}

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  service: 'libretranslate' | 'mymemory' | 'fallback';
}

export class TranslationService {
  private libreTranslateEndpoint: string;
  private myMemoryEndpoint: string;

  constructor(
    libreTranslateEndpoint: string = 'https://libretranslate.com/translate',
    myMemoryEndpoint: string = 'https://api.mymemory.translated.net/get'
  ) {
    this.libreTranslateEndpoint = libreTranslateEndpoint;
    this.myMemoryEndpoint = myMemoryEndpoint;
  }

  /**
   * Translate text from source language to target language
   */
  async translate(
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<TranslationResult> {
    // Check if translation is needed
    if (!this.needsTranslation(sourceLang, targetLang)) {
      return {
        translatedText: text,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        service: 'fallback',
      };
    }

    // Try LibreTranslate first
    try {
      const result = await this.translateWithLibreTranslate(text, sourceLang, targetLang);
      return {
        translatedText: result,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        service: 'libretranslate',
      };
    } catch (error) {
      console.warn('LibreTranslate failed, trying MyMemory:', error);
    }

    // Fallback to MyMemory
    try {
      const result = await this.translateWithMyMemory(text, sourceLang, targetLang);
      return {
        translatedText: result,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        service: 'mymemory',
      };
    } catch (error) {
      console.error('MyMemory translation failed:', error);
    }

    // Final fallback: return original text
    console.warn('All translation services failed, returning original text');
    return {
      translatedText: text,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      service: 'fallback',
    };
  }

  /**
   * Translate using LibreTranslate API
   */
  private async translateWithLibreTranslate(
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<string> {
    const response = await fetch(this.libreTranslateEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: this.normalizeLanguageCode(sourceLang),
        target: this.normalizeLanguageCode(targetLang),
        format: 'text',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LibreTranslate API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.translatedText;
  }

  /**
   * Translate using MyMemory API
   */
  private async translateWithMyMemory(
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<string> {
    const langPair = `${this.normalizeLanguageCode(sourceLang)}|${this.normalizeLanguageCode(targetLang)}`;
    const url = `${this.myMemoryEndpoint}?q=${encodeURIComponent(text)}&langpair=${langPair}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.responseStatus !== 200) {
      throw new Error(`MyMemory API error: ${data.responseStatus} - ${data.responseDetails}`);
    }

    return data.responseData.translatedText;
  }

  /**
   * Check if translation is needed
   */
  needsTranslation(sourceLang: string, targetLang: string): boolean {
    const normalizedSource = this.normalizeLanguageCode(sourceLang);
    const normalizedTarget = this.normalizeLanguageCode(targetLang);
    return normalizedSource !== normalizedTarget;
  }

  /**
   * Normalize language codes (e.g., 'en-US' -> 'en')
   */
  private normalizeLanguageCode(langCode: string): string {
    return langCode.split('-')[0].toLowerCase();
  }

  /**
   * Get list of supported languages
   */
  getSupportedLanguages(): Language[] {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' },
      { code: 'nl', name: 'Dutch' },
      { code: 'pl', name: 'Polish' },
      { code: 'tr', name: 'Turkish' },
    ];
  }

  /**
   * Check if a language is supported
   */
  isLanguageSupported(langCode: string): boolean {
    const normalized = this.normalizeLanguageCode(langCode);
    return this.getSupportedLanguages().some(lang => lang.code === normalized);
  }
}
