import { useState, useCallback, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { translationService } from '../services/translation.service';

interface UseTranslationReturn {
  translateText: (text: string) => Promise<string>;
  isTranslating: boolean;
  isTranslationEnabled: boolean;
  error: string | null;
  clearCache: () => void;
  preloadCommonTexts: (texts: string[]) => Promise<void>;
}

/**
 * Hook for handling real-time translation when switching between English and Arabic
 * Integrates with your existing i18n system and navbar language toggle
 */
export const useTranslation = (): UseTranslationReturn => {
  const locale = useLocale();
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Translation is enabled when current locale is Arabic
  const isTranslationEnabled = locale === 'ar';

  const translateText = useCallback(async (text: string): Promise<string> => {
    // If not in Arabic mode, return original text
    if (!isTranslationEnabled) {
      return text;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const translatedText = await translationService.translateForUI(text);
      return translatedText;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      console.error('Translation error:', err);
      // Return original text as fallback
      return text;
    } finally {
      setIsTranslating(false);
    }
  }, [isTranslationEnabled]);

  const clearCache = useCallback(() => {
    translationService.clearCache();
  }, []);

  const preloadCommonTexts = useCallback(async (texts: string[]) => {
    if (!isTranslationEnabled) return;

    setIsTranslating(true);
    try {
      await translationService.preloadCommonTranslations(texts);
    } catch (err) {
      console.error('Failed to preload translations:', err);
    } finally {
      setIsTranslating(false);
    }
  }, [isTranslationEnabled]);

  // Clear cache when switching back to English
  useEffect(() => {
    if (!isTranslationEnabled) {
      clearCache();
    }
  }, [isTranslationEnabled, clearCache]);

  return {
    translateText,
    isTranslating,
    isTranslationEnabled,
    error,
    clearCache,
    preloadCommonTexts,
  };
};