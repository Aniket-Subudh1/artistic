import { API_CONFIG, apiRequest } from '../lib/api-config';

export interface TranslateRequest {
  text: string;
  sourceLanguage?: string;
  targetLanguage?: string;
}

export interface TranslateResponse {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslationServiceHealth {
  status: 'healthy' | 'unhealthy';
  service: string;
  timestamp: string;
}

class TranslationService {
  /**
   * Translate single text from English to Arabic
   * Note: This endpoint is public and doesn't require authentication
   * to support translation on public pages like homepage
   */
  async translateText(request: TranslateRequest): Promise<TranslateResponse> {
    try {
      return await apiRequest<TranslateResponse>(
        API_CONFIG.ENDPOINTS.TRANSLATION.TRANSLATE,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: request.text,
            sourceLanguage: request.sourceLanguage || 'en',
            targetLanguage: request.targetLanguage || 'ar',
          }),
        },
        false // Translation doesn't require auth - it's available for public content
      );
    } catch (error) {
      console.error('Translation service error:', error);
      throw new Error(`Failed to translate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Translate multiple texts in bulk from English to Arabic
   */
  async translateBulkText(texts: string[]): Promise<TranslateResponse[]> {
    try {
      return await apiRequest<TranslateResponse[]>(
        API_CONFIG.ENDPOINTS.TRANSLATION.TRANSLATE_BULK,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(texts),
        },
        false // Translation doesn't require auth - it's available for public content
      );
    } catch (error) {
      console.error('Bulk translation service error:', error);
      throw new Error(`Failed to translate texts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if translation service is healthy
   */
  async checkHealth(): Promise<TranslationServiceHealth> {
    try {
      return await apiRequest<TranslationServiceHealth>(
        API_CONFIG.ENDPOINTS.TRANSLATION.HEALTH,
        {
          method: 'GET',
        },
        false // Health check doesn't require auth
      );
    } catch (error) {
      console.error('Translation health check error:', error);
      return {
        status: 'unhealthy',
        service: 'AWS Translate',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Translate UI elements for navbar language toggle
   * This caches translations to avoid repeated API calls
   */
  private translationCache = new Map<string, string>();

  async translateForUI(text: string): Promise<string> {
    // Check cache first
    if (this.translationCache.has(text)) {
      return this.translationCache.get(text)!;
    }

    try {
      const result = await this.translateText({ text });
      
      // Cache the result
      this.translationCache.set(text, result.translatedText);
      
      return result.translatedText;
    } catch (error) {
      console.error(`UI translation failed for "${text}":`, error);
      // Return original text as fallback
      return text;
    }
  }

  /**
   * Clear translation cache (useful when switching back to English)
   */
  clearCache(): void {
    this.translationCache.clear();
  }

  /**
   * Pre-translate common UI elements
   */
  async preloadCommonTranslations(commonTexts: string[]): Promise<void> {
    try {
      const results = await this.translateBulkText(commonTexts);
      
      // Cache all results
      results.forEach((result) => {
        this.translationCache.set(result.originalText, result.translatedText);
      });
    } catch (error) {
      console.error('Failed to preload translations:', error);
    }
  }
}

export const translationService = new TranslationService();