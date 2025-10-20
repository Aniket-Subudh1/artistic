'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface Country {
  code: string;
  flag: string;
  name: string;
}

interface CountryCodeDropdownProps {
  selectedCountry: Country;
  onCountrySelect: (country: Country) => void;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
}

export function CountryCodeDropdown({
  selectedCountry,
  onCountrySelect,
  disabled = false,
  className = '',
  buttonClassName = '',
  dropdownClassName = ''
}: CountryCodeDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const tCountries = useTranslations('auth.countries');

  const countries: Country[] = [
    { code: '+965', flag: '🇰🇼', name: tCountries('kuwait') },
    { code: '+1', flag: '🇺🇸', name: tCountries('unitedStates') },
    { code: '+44', flag: '🇬🇧', name: tCountries('unitedKingdom') },
    { code: '+971', flag: '🇦🇪', name: tCountries('uae') },
    { code: '+966', flag: '🇸🇦', name: tCountries('saudiArabia') },
    { code: '+974', flag: '🇶🇦', name: tCountries('qatar') },
    { code: '+973', flag: '🇧🇭', name: tCountries('bahrain') },
    { code: '+968', flag: '🇴🇲', name: tCountries('oman') },
    { code: '+91', flag: '🇮🇳', name: tCountries('india') }
  ];

  const handleCountrySelect = (country: Country) => {
    onCountrySelect(country);
    setShowDropdown(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center px-3 py-2 bg-white border border-gray-300 rounded-l-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${buttonClassName}`}
        disabled={disabled}
      >
        <span className="mr-1">{selectedCountry.flag}</span>
        <span className="mr-1">{selectedCountry.code}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>
      
      {showDropdown && (
        <div className={`absolute top-full left-0 mt-1 w-60 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto ${dropdownClassName}`}>
          {countries.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => handleCountrySelect(country)}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors text-left"
            >
              <span className="mr-2">{country.flag}</span>
              <span className="mr-2 font-medium">{country.code}</span>
              <span className="text-gray-600 truncate">{country.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to get default country (Kuwait)
export function getDefaultCountry(): Country {
  return { code: '+965', flag: '🇰🇼', name: 'Kuwait' };
}

// Helper function to extract phone number without country code
export function extractPhoneNumber(fullPhoneNumber: string, countryCode: string): string {
  if (fullPhoneNumber.startsWith(countryCode)) {
    return fullPhoneNumber.slice(countryCode.length);
  }
  return fullPhoneNumber;
}

// Helper function to format full phone number
export function formatPhoneNumber(phoneNumber: string, countryCode: string): string {
  // Remove any existing country code first
  const cleanNumber = phoneNumber.replace(/^\+?\d{1,4}/, '');
  return countryCode + cleanNumber;
}