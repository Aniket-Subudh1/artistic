'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { 
  Home, 
  Mic, 
  Package, 
  Calendar,
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
      href: '/events',
      label: isRTL ? 'استكشاف الأحداث' : 'Explore Events',
      icon: Calendar,
      description: isRTL ? 'تصفح الأحداث المتاحة' : 'Browse available events'
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="
                group relative overflow-hidden rounded-xl p-4 bg-white/80 
                border border-transparent shadow-sm ring-1 ring-slate-200
                hover:shadow-lg hover:ring-2 hover:ring-indigo-300 
                hover:bg-gradient-to-br from-indigo-50/80 to-purple-50/60
                transform hover:-translate-y-0.5 transition-all duration-200
              "
            >
              <div className="flex items-start">
                <div className="
                  p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500
                  group-hover:from-indigo-600 group-hover:to-purple-600
                  transition-colors duration-200 shadow-sm
                ">
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3 rtl:ml-0 rtl:mr-3 flex-1">
                  <h4 className="font-medium text-slate-900 group-hover:text-indigo-700">
                    {item.label}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">
                    {item.description}
                  </p>
                </div>
                <ExternalLink className="
                  w-4 h-4 text-slate-400 group-hover:text-indigo-500 
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