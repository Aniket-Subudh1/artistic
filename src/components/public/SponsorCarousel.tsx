'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Sponsor } from '@/services/sponsor.service';
import { useLocale } from 'next-intl';
import { ExternalLink, Award, Star } from 'lucide-react';
import { useActiveSponsors } from '@/hooks/useHomePageData';

interface SponsorCarouselProps {
  className?: string;
  autoScroll?: boolean;
  scrollSpeed?: number;
  showTierBadges?: boolean;
}

export default function SponsorCarousel({
  className = '',
  autoScroll = true,
  scrollSpeed = 30,
  showTierBadges = true,
}: SponsorCarouselProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [isHovered, setIsHovered] = useState(false);

  // Fetch sponsors with React Query caching
  const { data: sponsors = [], isLoading } = useActiveSponsors();

  // Double the sponsors array for seamless infinite scroll
  const displaySponsors = [...sponsors, ...sponsors];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return 'bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 text-gray-800';
      case 'gold':
        return 'bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 text-yellow-900';
      case 'silver':
        return 'bg-gradient-to-r from-gray-400 via-gray-200 to-gray-400 text-gray-700';
      case 'bronze':
        return 'bg-gradient-to-r from-orange-400 via-orange-200 to-orange-400 text-orange-900';
      default:
        return 'bg-gradient-to-r from-purple-400 via-purple-200 to-purple-400 text-purple-900';
    }
  };

  const getTierIcon = (tier: string) => {
    if (tier === 'platinum' || tier === 'gold') {
      return <Award className="w-3 h-3" />;
    }
    return <Star className="w-3 h-3" />;
  };

  if (isLoading) {
    return (
      <div className={`py-8 md:py-12 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-3 md:gap-4 overflow-x-hidden">
            <div className="w-24 h-12 md:w-32 md:h-16 bg-gray-200 animate-pulse rounded-lg flex-shrink-0"></div>
            <div className="w-24 h-12 md:w-32 md:h-16 bg-gray-200 animate-pulse rounded-lg flex-shrink-0"></div>
            <div className="hidden sm:block w-24 h-12 md:w-32 md:h-16 bg-gray-200 animate-pulse rounded-lg flex-shrink-0"></div>
            <div className="hidden md:block w-32 h-16 bg-gray-200 animate-pulse rounded-lg flex-shrink-0"></div>
          </div>
        </div>
      </div>
    );
  }

  if (sponsors.length === 0) {
    return null;
  }

  return (
    <section className={`py-12 md:py-16 lg:py-20 relative overflow-hidden ${className}`}>
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-purple-50 to-gray-50" />
      
      {/* Decorative elements - hidden on mobile for performance */}
      <div className="absolute inset-0 opacity-5 hidden md:block">
        <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
            {isRTL ? 'شركاؤنا' : 'Our Partners'}
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto px-4">
            {isRTL
              ? 'نفخر بالشراكة مع العلامات التجارية الرائدة في الصناعة'
              : 'Proudly partnered with industry-leading brands'}
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Gradient overlays for fade effect */}
          <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} top-0 bottom-0 w-16 md:w-24 lg:w-32 bg-gradient-to-${isRTL ? 'l' : 'r'} from-gray-50 via-purple-50/80 to-transparent z-10 pointer-events-none`}></div>
          <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-0 bottom-0 w-16 md:w-24 lg:w-32 bg-gradient-to-${isRTL ? 'r' : 'l'} from-gray-50 via-purple-50/80 to-transparent z-10 pointer-events-none`}></div>

          {/* Scrolling Container */}
          <div className="overflow-hidden">
            <div
              className={`flex gap-4 sm:gap-6 md:gap-8 ${autoScroll && !isHovered ? 'animate-scroll' : ''}`}
              style={{
                animationDuration: `${scrollSpeed}s`,
                animationDirection: isRTL ? 'reverse' : 'normal',
              }}
            >
              {displaySponsors.map((sponsor, index) => (
                <div
                  key={`${sponsor._id}-${index}`}
                  className="flex-shrink-0 group"
                >
                  <a
                    href={sponsor.website || '#'}
                    target={sponsor.website ? '_blank' : '_self'}
                    rel={sponsor.website ? 'noopener noreferrer' : ''}
                    className="block"
                    onClick={(e) => !sponsor.website && e.preventDefault()}
                  >
                    <div className="relative bg-white rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200 hover:scale-105 md:group-hover:scale-110 w-32 h-20 sm:w-40 sm:h-24 md:w-48 md:h-32 flex items-center justify-center">
                      {/* Tier Badge */}
                      {showTierBadges && sponsor.tier !== 'partner' && (
                        <div
                          className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} md:top-3 md:${isRTL ? 'left-3' : 'right-3'} px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-[10px] md:text-xs font-bold ${getTierColor(sponsor.tier)} flex items-center gap-0.5 md:gap-1 shadow-md`}
                        >
                          {getTierIcon(sponsor.tier)}
                          <span className="uppercase hidden sm:inline">{sponsor.tier}</span>
                        </div>
                      )}

                      {/* Logo */}
                      <div className="relative w-full h-full flex items-center justify-center p-1">
                        {sponsor.logo?.startsWith('http') ? (
                          <img
                            src={sponsor.logo}
                            alt={sponsor.altText || sponsor.name}
                            className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="text-center px-2">
                            <div className="text-sm sm:text-lg md:text-2xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300 line-clamp-2">
                              {sponsor.name}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Hover overlay with link icon */}
                      {sponsor.website && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#391C71]/0 to-[#5B2C87]/0 group-hover:from-[#391C71]/10 group-hover:to-[#5B2C87]/10 rounded-xl md:rounded-2xl transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <ExternalLink className="w-4 h-4 md:w-6 md:h-6 text-[#391C71]" />
                        </div>
                      )}
                    </div>

                    {/* Sponsor description on hover - hidden on mobile */}
                    {sponsor.description && (
                      <div className="hidden md:block mt-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-w-[192px]">
                        <p className="text-sm text-gray-600 font-medium line-clamp-2">
                          {sponsor.description}
                        </p>
                      </div>
                    )}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll linear infinite;
          will-change: transform;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-scroll {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
