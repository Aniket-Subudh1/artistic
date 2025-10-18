'use client';

import React from 'react';
import { useTranslatedData } from '../../hooks/useTranslatedData';
import { Loader2 } from 'lucide-react';

interface TranslatedDataWrapperProps<T> {
  data: T;
  children: (translatedData: T, isTranslating: boolean) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  translateFields?: string[];
  preserveFields?: string[];
  showLoadingOverlay?: boolean;
  className?: string;
}

/**
 * Wrapper component that automatically translates API data for its children
 * Useful for wrapping entire sections that display API content
 */
export function TranslatedDataWrapper<T extends Record<string, any> | Array<Record<string, any>>>({
  data,
  children,
  loadingComponent,
  translateFields,
  preserveFields,
  showLoadingOverlay = false,
  className = ''
}: TranslatedDataWrapperProps<T>) {
  const { 
    data: translatedData, 
    isTranslating, 
    error,
    isArabic 
  } = useTranslatedData(data, {
    translateFields,
    preserveFields,
    deep: true,
    useCache: true
  });

  // Show custom loading component if provided and translating
  if (loadingComponent && isTranslating && isArabic) {
    return <>{loadingComponent}</>;
  }

  const content = children(translatedData || data, isTranslating);

  // Show loading overlay if requested
  if (showLoadingOverlay && isTranslating && isArabic) {
    return (
      <div className={`relative ${className}`}>
        {content}
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-sm">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600">Translating to Arabic...</span>
          </div>
        </div>
      </div>
    );
  }

  return <div className={className}>{content}</div>;
}

/**
 * Higher-order component that wraps a component with automatic translation
 */
export function withTranslation<P extends { data: any }>(
  Component: React.ComponentType<P>,
  config?: {
    translateFields?: string[];
    preserveFields?: string[];
    loadingComponent?: React.ReactNode;
  }
) {
  return function TranslatedComponent(props: P) {
    return (
      <TranslatedDataWrapper
        data={props.data}
        translateFields={config?.translateFields}
        preserveFields={config?.preserveFields}
        loadingComponent={config?.loadingComponent}
      >
        {(translatedData, isTranslating) => (
          <Component {...props} data={translatedData} />
        )}
      </TranslatedDataWrapper>
    );
  };
}