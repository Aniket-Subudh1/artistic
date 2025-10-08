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
  const isRTL = locale === 'ar';

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
    <div className="min-h-screen bg-gray-50 flex" dir={isRTL ? 'rtl' : 'ltr'}>
    
      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 z-50 h-screen
        transform transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isRTL ? 'right-0' : 'left-0'}
        ${isSidebarCollapsed ? 'w-20' : 'w-80'}
      `}>
        <div className="bg-white h-full flex flex-col shadow-lg border-gray-200" 
             style={{ 
               borderRightWidth: isRTL ? '0' : '1px',
               borderLeftWidth: isRTL ? '1px' : '0'
             }}>
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

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className={`
          lg:hidden fixed top-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-gray-200 
          text-gray-600 hover:bg-gray-100 transition-colors
          ${isRTL ? 'right-4' : 'left-4'}
        `}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileSidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Main content */}
      <div className={`
        min-h-screen w-full transition-all duration-300
        ${isRTL 
          ? (isSidebarCollapsed ? 'mr-20 lg:mr-20' : 'mr-0 lg:mr-80')
          : (isSidebarCollapsed ? 'ml-20 lg:ml-20' : 'ml-0 lg:ml-80')
        }
      `}>
        <main className="min-h-screen overflow-auto bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}