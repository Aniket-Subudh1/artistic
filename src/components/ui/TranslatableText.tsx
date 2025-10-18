'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface TranslatableTextProps {
  children: string;
  className?: string;
  fallback?: string;
  /**
   * Whether to show loading state during translation
   */
  showLoading?: boolean;
  /**
   * Custom loading text/component
   */
  loadingText?: string | React.ReactNode;
}

/**
 * Component that automatically translates text when language is switched to Arabic
 * Works for both authenticated and public content
 * Falls back to original text if translation fails
 * Usage: <TranslatableText>Hello World</TranslatableText>
 */
export const TranslatableText: React.FC<TranslatableTextProps> = ({
  children,
  className,
  fallback,
  showLoading = false,
  loadingText = '...',
}) => {
  const { translateText, isTranslating, isTranslationEnabled, error } = useTranslation();
  const [translatedText, setTranslatedText] = useState<string>(children);

  useEffect(() => {
    let isMounted = true;

    const performTranslation = async () => {
      if (!isTranslationEnabled) {
        setTranslatedText(children);
        return;
      }

      try {
        const result = await translateText(children);
        if (isMounted) {
          setTranslatedText(result);
        }
      } catch (err) {
        console.error('Translation component error:', err);
        if (isMounted) {
          setTranslatedText(fallback || children);
        }
      }
    };

    performTranslation();

    return () => {
      isMounted = false;
    };
  }, [children, translateText, isTranslationEnabled, fallback]);

  // Show loading state if requested and currently translating
  if (showLoading && isTranslating) {
    return <span className={className}>{loadingText}</span>;
  }

  // Show error fallback if there's an error
  if (error && !translatedText) {
    return <span className={className}>{fallback || children}</span>;
  }

  return <span className={className}>{translatedText}</span>;
};

/**
 * Higher-order component for translating entire components
 */
export const withTranslation = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { isTranslationEnabled } = useTranslation();
    
    // You can add translation logic here if needed
    // For now, just render the component normally
    return <Component {...props} />;
  };
};