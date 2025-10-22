'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { 
  Home, 
  Mic, 
  Package, 
  ArrowLeft,
  ExternalLink
} from 'lucide-react';

export function DashboardTopNavigation() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const isRTL = locale === 'ar';

  const navigationItems = [
    {
      href: '/',
      label: isRTL ? 'الصفحة الرئيسية' : 'Home',
      icon: Home,
      description: isRTL ? 'العودة إلى الصفحة الرئيسية' : 'Go to main homepage'
    },
    {
      href: '/artists',
      label: isRTL ? 'الفنانين' : 'Artists',
      icon: Mic,
      description: isRTL ? 'تصفح الفنانين' : 'Browse available artists'
    },
    {
      href: '/packages',
      label: isRTL ? 'الباقات' : 'Equipment Packages',
      icon: Package,
      description: isRTL ? 'تصفح باقات المعدات' : 'Browse equipment packages'
    }
  ];

  return (
    <div className={`
      bg-gradient-to-r from-blue-50 via-white to-blue-50 
      border border-blue-100 rounded-xl shadow-sm mb-6 p-4
      ${isRTL ? 'text-right' : 'text-left'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <ExternalLink className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2 text-blue-600" />
          {isRTL ? 'التنقل السريع' : 'Quick Navigation'}
        </h3>
        <Link
          href="/dashboard"
          className="
            text-sm text-gray-500 hover:text-blue-600 transition-colors
            flex items-center
          "
        >
          <ArrowLeft className={`
            w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1
            ${isRTL ? 'rotate-180' : ''}
          `} />
          {isRTL ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
        </Link>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="
                group p-4 bg-white border border-gray-200 rounded-lg 
                hover:border-blue-300 hover:shadow-md transition-all duration-200
                hover:bg-blue-50/50
              "
            >
              <div className="flex items-start">
                <div className="
                  p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 
                  transition-colors duration-200
                ">
                  <IconComponent className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3 rtl:ml-0 rtl:mr-3 flex-1">
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-700">
                    {item.label}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.description}
                  </p>
                </div>
                <ExternalLink className="
                  w-4 h-4 text-gray-400 group-hover:text-blue-500 
                  transition-colors duration-200 mt-1
                " />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Current Location Indicator */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {isRTL ? 'الموقع الحالي:' : 'Current location:'} 
            <span className="font-medium text-gray-700 ml-1 rtl:ml-0 rtl:mr-1">
              {isRTL ? 'لوحة التحكم' : 'Dashboard'}
            </span>
          </span>
          <div className="text-xs text-gray-400">
            {pathname}
          </div>
        </div>
      </div>
    </div>
  );
}