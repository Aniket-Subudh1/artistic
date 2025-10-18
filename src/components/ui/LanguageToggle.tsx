'use client';

import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Globe, Languages, Loader2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface LanguageToggleProps {
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
  variant?: 'button' | 'dropdown' | 'switch';
}

/**
 * Language Toggle Component for Navbar
 * Switches between English and Arabic with real-time translation
 */
export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className = '',
  showIcon = true,
  showText = true,
  variant = 'button',
}) => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { isTranslating, preloadCommonTexts } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);

  // Common UI texts to preload when switching to Arabic
  const commonUITexts = [
    'Home', 'Explore', 'Book Artist', 'Book Equipment', 'Sign In', 'Join Us',
    'Dashboard', 'Profile', 'Settings', 'Logout', 'Search', 'Filter',
    'Book Now', 'View Details', 'Cancel', 'Confirm', 'Save', 'Edit',
    'Delete', 'Upload', 'Download', 'Next', 'Previous', 'Back',
  ];

  const handleLanguageChange = async (newLocale: 'en' | 'ar') => {
    if (newLocale === locale || isChanging) return;

    setIsChanging(true);

    try {
      // If switching to Arabic, preload common translations
      if (newLocale === 'ar') {
        await preloadCommonTexts(commonUITexts);
      }

      // Navigate to the same page with new locale
      router.replace(pathname, { locale: newLocale });
    } catch (error) {
      console.error('Error changing language:', error);
      // Still navigate even if preloading fails
      router.replace(pathname, { locale: newLocale });
    } finally {
      setIsChanging(false);
    }
  };

  const currentLanguage = locale === 'ar' ? 'العربية' : 'English';
  const oppositeLanguage = locale === 'ar' ? 'English' : 'العربية';
  const oppositeLocale = locale === 'ar' ? 'en' : 'ar';

  if (variant === 'switch') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm font-medium">EN</span>
        <button
          onClick={() => handleLanguageChange(oppositeLocale)}
          disabled={isChanging || isTranslating}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            locale === 'ar'
              ? 'bg-blue-600'
              : 'bg-gray-200 dark:bg-gray-700'
          } ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              locale === 'ar' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="text-sm font-medium">AR</span>
        {(isChanging || isTranslating) && (
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        )}
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => handleLanguageChange(oppositeLocale)}
          disabled={isChanging || isTranslating}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
            isChanging ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {showIcon && <Globe className="h-4 w-4" />}
          {showText && <span>{currentLanguage}</span>}
          {(isChanging || isTranslating) && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </button>
      </div>
    );
  }

  // Default button variant
  return (
    <button
      onClick={() => handleLanguageChange(oppositeLocale)}
      disabled={isChanging || isTranslating}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        isChanging ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      title={`Switch to ${oppositeLanguage}`}
    >
      {showIcon && (
        <Languages className={`h-4 w-4 ${locale === 'ar' ? 'text-blue-600' : 'text-gray-600'}`} />
      )}
      {showText && (
        <span className={locale === 'ar' ? 'text-blue-600 font-semibold' : 'text-gray-700 dark:text-gray-300'}>
          {locale === 'ar' ? 'EN' : 'عر'}
        </span>
      )}
      {(isChanging || isTranslating) && (
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      )}
    </button>
  );
};