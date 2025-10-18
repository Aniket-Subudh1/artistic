'use client';

import React from 'react';
import { useTranslatedData } from '../../hooks/useTranslatedData';
import { Loader2, Languages } from 'lucide-react';

interface AutoTranslateProps<T> {
  data: T;
  children: React.ReactElement;
  config?: {
    translateFields?: string[];
    preserveFields?: string[];
    showIndicator?: boolean;
  };
}

/**
 * Simple wrapper that automatically translates data for any component
 * Just wrap your component and it will receive translated data when Arabic is selected
 */
export function AutoTranslate<T extends Record<string, any> | Array<Record<string, any>>>({
  data,
  children,
  config = {}
}: AutoTranslateProps<T>) {
  const { 
    data: translatedData, 
    isTranslating, 
    isArabic 
  } = useTranslatedData(data, {
    translateFields: config.translateFields,
    preserveFields: config.preserveFields,
    deep: true,
    useCache: true
  });

  // Clone the child element and pass translated data as props
  const childWithTranslatedData = React.cloneElement(children, {
    ...(children.props as any),
    data: translatedData || data,
    originalData: data,
    isTranslating,
    isArabic
  });

  return (
    <div className="relative">
      {childWithTranslatedData}
      
      {/* Translation indicator (optional) */}
      {config.showIndicator && isTranslating && isArabic && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1 shadow-lg">
          <Loader2 className="w-3 h-3 animate-spin" />
          Translating...
        </div>
      )}
      
      {config.showIndicator && isArabic && !isTranslating && (
        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1 shadow-lg">
          <Languages className="w-3 h-3" />
          AR
        </div>
      )}
    </div>
  );
}