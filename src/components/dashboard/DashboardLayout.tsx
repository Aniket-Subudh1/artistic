// src/components/dashboard/DashboardLayout.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { User } from '@/types/dashboard';
import { UserProfile } from './UserProfile';
import { Sidebar } from './Sidebar';
import { Menu, X, Bell, Search, LogOut, Languages } from 'lucide-react';

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
  const [notifications, setNotifications] = useState(3);

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

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    router.replace('/', { locale: newLocale });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${locale === 'ar' ? 'right-0 left-auto' : 'left-0'}
      `}>
        <Sidebar 
          user={user}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Side - Mobile Menu & Search */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {isMobileSidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

              {/* Search Bar */}
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={locale === 'ar' ? 'البحث...' : 'Search...'}
                  className="pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-64"
                />
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title={locale === 'ar' ? 'English' : 'العربية'}
              >
                <Languages className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="hidden md:block text-left rtl:text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user.role.replace('_', ' ')}
                    </p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <a href="/dashboard/settings/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <span className="mr-2 rtl:mr-0 rtl:ml-2">👤</span>
                      {locale === 'ar' ? 'الملف الشخصي' : 'Profile'}
                    </a>
                    <a href="/dashboard/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <span className="mr-2 rtl:mr-0 rtl:ml-2">⚙️</span>
                      {locale === 'ar' ? 'الإعدادات' : 'Settings'}
                    </a>
                    <hr className="my-2" />
                    <button 
                      onClick={onLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                      {locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* User Profile Section */}
          <div className="p-6 pb-0">
            <UserProfile user={user} />
          </div>

          {/* Page Content */}
          <div className="flex-1">
            {children}
          </div>
        </main>

        {/* Footer */}
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