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
  onEditProfilePicture?: () => void;
}

export function DashboardLayout({ user, children, onLogout, onEditProfilePicture }: DashboardLayoutProps) {
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
    
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 z-50 h-screen
        transform transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isRTL ? 'right-0' : 'left-0'}
        ${isSidebarCollapsed ? 'w-20' : 'w-72'}
      `}>
        <div className={`
          bg-gradient-to-b from-slate-50 to-white h-full flex flex-col shadow-lg
          border-t border-b border-slate-300/40
          ${isRTL 
            ? 'border-r border-slate-300/40 rounded-tr-3xl rounded-br-3xl' 
            : 'border-l border-slate-300/40 rounded-tl-3xl rounded-bl-3xl'
          }
        `}>
          
          <div className="p-2 border-b border-slate-200/30 flex-shrink-0 bg-gradient-to-r from-slate-50/80 via-white/80 to-slate-50/80 backdrop-blur-sm overflow-hidden">
            <UserProfile 
              user={user} 
              isCollapsed={isSidebarCollapsed} 
              onLogout={onLogout}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              onEditProfilePicture={onEditProfilePicture}
            />
          </div>

          <div className="flex-1 flex flex-col bg-gradient-to-b from-white/90 to-slate-50/90 backdrop-blur-sm min-h-0">
            {!isSidebarCollapsed && (
              <div className="flex-shrink-0 p-3 border-b border-slate-200/30 bg-white/60 backdrop-blur-sm">
                <h3 className="text-xs text-center font-bold text-slate-500 uppercase tracking-wider">
                  {locale === 'ar' ? 'التنقل' : 'Navigation'}
                </h3>
                <div className="mt-2 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
              <Sidebar 
                user={user}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                onLogout={onLogout}
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className={`
          lg:hidden fixed top-4 z-50 p-3 rounded-xl bg-white shadow-lg border border-slate-200 
          text-slate-600 hover:bg-slate-50 transition-all duration-200 hover:shadow-xl
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
          ? (isSidebarCollapsed ? 'mr-20 lg:mr-20' : 'mr-0 lg:mr-72')
          : (isSidebarCollapsed ? 'ml-20 lg:ml-20' : 'ml-0 lg:ml-72')
        }
      `}>
        <main className="min-h-screen overflow-auto bg-gray-50">
          <div className="p-6 md:p-8">
            <div className="min-h-[calc(100vh-3rem)] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 h-full">
                {children}
              </div>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}