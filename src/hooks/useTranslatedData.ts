import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocale } from 'next-intl';
import { translationService } from '../services/translation.service';

const TRANSLATABLE_FIELDS = [
  // Artist related
  'description', 'bio', 'specialization', 'skills', 'experience', 
  'about', 'services', 'genre', 'style', 'expertise',
  
  'specifications', 'features', 'details', 'summary', 'overview',
  'condition', 'notes', 'instructions', 'requirements',
  
  'title', 'content', 'message', 'status_message', 'review', 'comment',
  'feedback', 'testimonial', 'category', 'type', 'tag'
];

const PRESERVE_FIELDS = [
  'name', 'email', 'phone', 'address', 'location', 'city', 'country',
  'price', 'currency', 'amount', 'quantity', 'id', '_id', 'uuid',
  'createdAt', 'updatedAt', 'url', 'image', 'avatar', 'logo',
  'coordinates', 'latitude', 'longitude', 'zip', 'postal_code',
  'items', 'equipmentId', 'userId', 'artistId', 'bookingId'
];

interface TranslationConfig {
  // Specific fields to translate (overrides default detection)
  translateFields?: string[];
  // Fields to never translate (in addition to PRESERVE_FIELDS)
  preserveFields?: string[];
  // Whether to translate nested objects
  deep?: boolean;
  // Cache translations for this session
  useCache?: boolean;
}

/**
 * Hook that automatically translates API response data when language is Arabic
 */
export const useTranslatedData = <T extends Record<string, any>>(
  data: T | T[] | null | undefined,
  config: TranslationConfig = {}
) => {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  
  const [translatedData, setTranslatedData] = useState<T | T[] | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to track if we're currently translating to prevent duplicate calls
  const isTranslatingRef = useRef(false);

  // Memoize the configuration to prevent unnecessary re-renders
  const memoizedConfig = useMemo(() => {
    // If translateFields are explicitly provided, use them; otherwise use defaults
    const translateFields = config.translateFields || TRANSLATABLE_FIELDS;
    
    // For preserve fields, only add global ones if they're not explicitly overridden by translateFields
    const preserveFields = config.preserveFields || [];
    const globalPreserveFields = PRESERVE_FIELDS.filter(field => 
      !translateFields.some(translateField => 
        translateField.toLowerCase().includes(field.toLowerCase()) ||
        field.toLowerCase().includes(translateField.toLowerCase())
      )
    );
    
    return {
      translateFields,
      preserveFields: [...globalPreserveFields, ...preserveFields],
      deep: config.deep !== undefined ? config.deep : true,
      useCache: config.useCache !== undefined ? config.useCache : true
    };
  }, [config.translateFields, config.preserveFields, config.deep, config.useCache]);

  const shouldTranslateField = useCallback((key: string, fullPath?: string): boolean => {
    const checkPath = fullPath || key;
    
    // FIRST: Check if explicitly included in translateFields (highest priority)
    if (memoizedConfig.translateFields.some((field: string) => 
        field === checkPath || 
        checkPath.includes(field.toLowerCase()) ||
        key.toLowerCase().includes(field.toLowerCase())
      )) return true;
    
    // SECOND: Don't translate if it's in preserve list (support nested paths)
    if (memoizedConfig.preserveFields.some(field => 
        field === checkPath || 
        checkPath.includes(field) || 
        key.toLowerCase() === field.toLowerCase()
      )) return false;
    
    return false;
  }, [memoizedConfig.preserveFields, memoizedConfig.translateFields]);

  const translateObject = useCallback(async (obj: any, pathPrefix = ''): Promise<any> => {
    if (!obj || typeof obj !== 'object') return obj;

    const result = { ...obj };
    const translationPromises: Promise<void>[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key;
      
      if (typeof value === 'string' && value.trim() && shouldTranslateField(key, currentPath)) {
        // Only translate non-empty strings in translatable fields
        const promise = translationService.translateForUI(value)
          .then(translated => {
            result[key] = translated;
          })
          .catch(err => {
            console.warn(`Failed to translate field '${key}' at path '${currentPath}':`, err);
            result[key] = value; // Keep original on error
          });
        
        translationPromises.push(promise);
      } else if (memoizedConfig.deep && Array.isArray(value)) {
        // Handle arrays - translate each item based on type
        const promise = Promise.all(
          value.map(async (item, index) => {
            if (typeof item === 'object' && item !== null) {
              return translateObject(item, `${currentPath}[${index}]`);
            } else if (typeof item === 'string' && item.trim() && shouldTranslateField(key, currentPath)) {
              // Translate string array items if the field should be translated
              try {
                const translated = await translationService.translateForUI(item);
                return translated;
              } catch (error) {
                console.warn(`Failed to translate array item '${item}' in field '${key}':`, error);
                return item;
              }
            }
            return item;
          })
        ).then(translatedArray => {
          result[key] = translatedArray;
        });
        translationPromises.push(promise);
      } else if (memoizedConfig.deep && typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Recursively translate nested objects
        const promise = translateObject(value, currentPath).then(translated => {
          result[key] = translated;
        });
        translationPromises.push(promise);
      } else {
        // Preserve other values
        result[key] = value;
      }
    }

    await Promise.all(translationPromises);
    return result;
  }, [shouldTranslateField, memoizedConfig.deep]);

  // Function to manually retry translation if needed
  const retryTranslation = useCallback(async () => {
    if (!data || !isArabic || isTranslatingRef.current) return;
    
    isTranslatingRef.current = true;
    setIsTranslating(true);
    setError(null);

    try {
      let result: any;

      if (Array.isArray(data)) {
        const translationPromises = data.map((item, index) => translateObject(item, `[${index}]`));
        result = await Promise.all(translationPromises);
      } else {
        result = await translateObject(data, '');
      }

      setTranslatedData(result);
    } catch (err) {
      console.error('Translation error:', err);
      setError(err instanceof Error ? err.message : 'Translation failed');
      setTranslatedData(data || null);
    } finally {
      setIsTranslating(false);
      isTranslatingRef.current = false;
    }
  }, [data, isArabic, translateObject]);

  // Use a more stable effect that only triggers when necessary
  useEffect(() => {
    if (!isArabic) {
      // Clear translations when switching back to English
      setTranslatedData(data || null);
      setError(null);
      return;
    }

    // Only translate if we have data and we're not already translating
    if (data && !isTranslatingRef.current) {
      // Call translate function directly to avoid dependency issues
      const performTranslation = async () => {
        if (isTranslatingRef.current) return;
        
        isTranslatingRef.current = true;
        setIsTranslating(true);
        setError(null);

        try {
          let result: any;

          if (Array.isArray(data)) {
            const translationPromises = data.map((item, index) => translateObject(item, `[${index}]`));
            result = await Promise.all(translationPromises);
          } else {
            result = await translateObject(data, '');
          }

          setTranslatedData(result);
        } catch (err) {
          console.error('Translation error:', err);
          setError(err instanceof Error ? err.message : 'Translation failed');
          setTranslatedData(data || null);
        } finally {
          setIsTranslating(false);
          isTranslatingRef.current = false;
        }
      };

      performTranslation();
    }
  }, [data, isArabic, translateObject]);

  return {
    data: translatedData,
    originalData: data,
    isTranslating,
    error,
    isArabic,
    retryTranslation
  };
};