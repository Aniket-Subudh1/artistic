'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { 
  Home, 
  Mic, 
  Package, 
  Plus,
  X,
  ExternalLink
} from 'lucide-react';

export function DashboardFloatingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const navigationItems = [
    {
      href: '/',
      label: isRTL ? 'الرئيسية' : 'Home',
      icon: Home,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      href: '/artists',
      label: isRTL ? 'الفنانين' : 'Artists',
      icon: Mic,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      href: '/packages',
      label: isRTL ? 'الباقات' : 'Packages',
      icon: Package,
      color: 'bg-green-500 hover:bg-green-600'
    }
  ];

  return (
    <div className={`
      fixed top-1/2 transform -translate-y-1/2 z-40
      ${isRTL ? 'left-4' : 'right-4'}
    `}>
      {/* Navigation Items */}
      <div className={`
        mb-2 space-y-2 transition-all duration-300 transform
        ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-2 pointer-events-none'}
      `}>
        {navigationItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.href}
              className={`
                transition-all duration-200 delay-${index * 30}
                ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
              `}
            >
              <Link
                href={item.href}
                className={`
                  flex items-center justify-center w-8 h-8 rounded-lg shadow-md
                  text-white transition-all duration-200 hover:scale-105
                  group relative ${item.color}
                `}
                onClick={() => setIsOpen(false)}
              >
                <IconComponent className="w-4 h-4" />
                
                {/* Tooltip */}
                <div className={`
                  absolute ${isRTL ? 'right-full mr-2' : 'left-full ml-2'} top-1/2 transform -translate-y-1/2
                  bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200
                  pointer-events-none z-50
                `}>
                  {item.label}
                  <div className={`
                    absolute top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-gray-900 rotate-45
                    ${isRTL ? 'left-full -ml-0.5' : 'right-full -mr-0.5'}
                  `} />
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-10 h-10 rounded-lg shadow-md transition-all duration-200
          flex items-center justify-center text-white
          ${isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-600 hover:bg-blue-700'
          }
        `}
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
      >
        {isOpen ? (
          <X className="w-4 h-4" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}