'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { 
  Home, 
  Mic, 
  Package, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

export function DashboardNavigation() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const isRTL = locale === 'ar';

  const navigationItems = [
    {
      href: '/',
      label: isRTL ? 'الصفحة الرئيسية' : 'Home',
      icon: Home,
      isActive: pathname === `/${locale}`
    },
    {
      href: '/artists',
      label: isRTL ? 'الفنانين' : 'Artists',
      icon: Mic,
      isActive: pathname.includes('/artists')
    },
    {
      href: '/packages',
      label: isRTL ? 'الباقات' : 'Equipment Packages',
      icon: Package,
      isActive: pathname.includes('/packages')
    }
  ];

  return (
    <div className={`
      bg-white border-b border-gray-200 shadow-sm mb-6 -mx-6 -mt-6 px-6 py-4 md:-mx-8 md:-mt-8 md:px-8
      ${isRTL ? 'text-right' : 'text-left'}
    `}>
      <div className="flex items-center justify-between">
        {/* Main Navigation */}
        <nav className="flex items-center space-x-1 rtl:space-x-reverse">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <React.Fragment key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${item.isActive 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                  {item.label}
                </Link>
                {index < navigationItems.length - 1 && (
                  <ChevronRight className={`
                    w-4 h-4 text-gray-400 mx-1
                    ${isRTL ? 'rotate-180' : ''}
                  `} />
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Back to Dashboard Button */}
        <div className="flex items-center">
          <Link
            href="/dashboard"
            className="
              flex items-center px-4 py-2 text-sm font-medium text-gray-600 
              hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200
              border border-gray-200 hover:border-blue-200
            "
          >
            <ArrowLeft className={`
              w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2
              ${isRTL ? 'rotate-180' : ''}
            `} />
            {isRTL ? 'لوحة التحكم' : 'Dashboard'}
          </Link>
        </div>
      </div>

      {/* Breadcrumb for current location */}
      <div className="mt-3 text-xs text-gray-500">
        <span className="flex items-center">
          <Home className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
          {isRTL ? 'أنت في:' : 'You are in:'} 
          <span className="ml-2 rtl:ml-0 rtl:mr-2 font-medium text-gray-700">
            {isRTL ? 'لوحة التحكم' : 'Dashboard'}
          </span>
        </span>
      </div>
    </div>
  );
}