'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { User } from '@/types/dashboard';
import { UserProfile } from './UserProfile';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  user: User;
  children: React.ReactNode;
  onLogout: () => void;
}

export function DashboardLayout({ user, children, onLogout }: DashboardLayoutProps) {
  const locale = useLocale();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(false);
        setIsMobileSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 h-screen
        transform transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${locale === 'ar' ? 'right-0 left-auto' : 'left-0'}
        ${isSidebarCollapsed ? 'w-20' : 'w-80'}
      `}>
        <div className="bg-white border-r border-gray-200 h-full flex flex-col">
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <UserProfile user={user} isCollapsed={isSidebarCollapsed} onLogout={onLogout} />
          </div>

          <div className="flex-1 overflow-y-auto">
            <Sidebar 
              user={user}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              onLogout={onLogout}
            />
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileSidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      <div className={`min-h-screen ${isSidebarCollapsed ? 'ml-20' : 'ml-80'} w-full transition-all duration-300`}>
        <main className="min-h-screen overflow-auto  bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div className="mb-2 md:mb-0">
              © 2025 Artistic Platform. {locale === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
            </div>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a href="/privacy" className="hover:text-gray-700 transition-colors">
                {locale === 'ar' ? 'الخصوصية' : 'Privacy'}
              </a>
              <a href="/terms" className="hover:text-gray-700 transition-colors">
                {locale === 'ar' ? 'الشروط' : 'Terms'}
              </a>
              <a href="/support" className="hover:text-gray-700 transition-colors">
                {locale === 'ar' ? 'الدعم' : 'Support'}
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}