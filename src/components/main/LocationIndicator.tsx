'use client';

import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { locationService, LocationInfo } from '@/services/location.service';
import { FlagImage } from '@/components/ui/FlagImage';

interface LocationIndicatorProps {
  isScrolled: boolean;
}

export function LocationIndicator({ isScrolled }: LocationIndicatorProps) {
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setIsLoading(true);
        const locationData = await locationService.getLocation();
        setLocation(locationData);
      } catch (error) {
        console.error('Failed to get location:', error);
        // Use fallback location
        setLocation({
          country: 'Kuwait',
          countryCode: 'KW',
          flag: '🇰🇼',
          city: 'Kuwait City',
          region: 'Kuwait'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocation();
  }, []);

  if (isLoading) {
    return (
      <div 
        className={`flex items-center space-x-1 px-3 py-2 rounded-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/10 backdrop-blur-sm border border-white/20'
            : 'bg-purple-50/60 border border-purple-100'
        }`}
      >
        <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
        <div className="w-16 h-3 bg-gray-300 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!location) return null;

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 group hover:scale-105 ${
          isScrolled
            ? 'bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40'
            : 'bg-purple-50/60 hover:bg-purple-100/80 border border-purple-100 hover:border-purple-200'
        }`}
        disabled
      >
        {/* Country indicator with flag and code */}
        <div className="flex items-center space-x-2">
          {/* Flag image */}
          <FlagImage 
            countryCode={location.countryCode} 
            size="sm"
            className="rounded-sm"
          />
          
          {/* Country code */}
          <span className={`text-xs font-semibold ${
            isScrolled 
              ? 'text-white/90' 
              : 'text-gray-700'
          }`}>
            {location.countryCode}
          </span>
        </div>
        
        {/* Location dot indicator */}
        <div className="relative">
          <div className={`w-2 h-2 rounded-full ${
            isScrolled 
              ? 'bg-green-400' 
              : 'bg-green-500'
          }`}>
            {/* Pulsing animation */}
            <div className={`absolute inset-0 w-2 h-2 rounded-full animate-ping ${
              isScrolled 
                ? 'bg-green-400' 
                : 'bg-green-500'
            } opacity-75`}></div>
          </div>
        </div>

        {/* Location icon */}
        <MapPin className={`w-3 h-3 ${
          isScrolled 
            ? 'text-white/70' 
            : 'text-gray-500'
        }`} />
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-[100]">
          <div className={`px-3 py-2 rounded-lg shadow-lg border backdrop-blur-sm ${
            isScrolled
              ? 'bg-white/90 border-white/30 text-gray-800'
              : 'bg-white/95 border-gray-200 text-gray-700'
          }`}>
            <div className="text-xs whitespace-nowrap">
              <div className="flex items-center space-x-2 mb-1">
                <FlagImage 
                  countryCode={location.countryCode} 
                  size="md"
                  className="rounded"
                />
                <span className="font-semibold">{location.country}</span>
              </div>
              {location.city && (
                <div className="flex items-center space-x-1 text-gray-600">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {location.city}
                    {location.region && location.region !== location.city && (
                      <span>, {location.region}</span>
                    )}
                  </span>
                </div>
              )}
              <div className="text-gray-500 mt-1">
                Detected location
              </div>
            </div>
            {/* Tooltip arrow */}
            <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
              isScrolled
                ? 'border-t-white/90'
                : 'border-t-white/95'
            }`}></div>
          </div>
        </div>
      )}
    </div>
  );
}