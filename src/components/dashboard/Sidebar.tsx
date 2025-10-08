'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { 
  ChevronDown, 
  ChevronRight,
  LayoutDashboard,
  Calendar,
  CalendarDays,
  CalendarRange,
  Clock,
  CalendarPlus,
  Plus,
  Mic,
  User,
  Image,
  Users,
  FileText,
  Settings,
  Package,
  Package2,
  MapPin,
  Building,
  Map,
  UserCheck,
  Shield,
  Lock,
  BarChart3,
  TrendingUp,
  DollarSign,
  LineChart,
  CreditCard,
  Receipt,
  Wallet,
  ArrowLeftRight,
  Bell,
  UserCog,
  Cog
} from 'lucide-react';
import { User as UserType } from '@/types/dashboard';
import { getSidebarItems, filterSidebarItems } from '@/lib/permissions';

interface SidebarProps {
  user: UserType;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const iconMap = {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  CalendarRange,
  Clock,
  CalendarPlus,
  Plus,
  Mic,
  User,
  Image,
  Users,
  FileText,
  Settings,
  Package,
  Package2,
  MapPin,
  Building,
  Map,
  UserCheck,
  Shield,
  Lock,
  BarChart3,
  TrendingUp,
  DollarSign,
  LineChart,
  CreditCard,
  Receipt,
  Wallet,
  ArrowLeftRight,
  Bell,
  UserCog,
  Cog
};

export function Sidebar({ user, isCollapsed, onToggleCollapse }: SidebarProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const sidebarItems = filterSidebarItems(getSidebarItems(), user.role);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const getIcon = (iconName: string, className: string = "w-5 h-5") => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent className={className} /> : null;
  };

  const renderSidebarItem = (item: any, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const itemIsActive = isActive(item.href);
    const hasActiveChild = hasChildren && item.children.some((child: any) => isActive(child.href));

    const itemClasses = `
      flex items-center w-full px-3 py-2.5 text-sm rounded-lg transition-all duration-200
      ${level > 0 ? 'ml-6 pl-6 border-l border-gray-200' : ''}
      ${itemIsActive 
        ? 'bg-purple-100 text-purple-700 font-medium shadow-sm' 
        : hasActiveChild
        ? 'bg-purple-50 text-purple-600'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }
      ${isCollapsed && level === 0 ? 'justify-center' : ''}
    `;

    if (item.href && !hasChildren) {
      return (
        <Link
          key={item.id}
          href={item.href}
          className={itemClasses}
        >
          {getIcon(item.icon)}
          {!isCollapsed && (
            <>
              <span className="ml-3 flex-1 text-left rtl:text-right">
                {locale === 'ar' ? item.labelAr : item.label}
              </span>
              {item.badge && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {item.badge === 'new' ? (locale === 'ar' ? 'جديد' : 'New') : item.badge}
                </span>
              )}
            </>
          )}
        </Link>
      );
    }

    return (
      <div key={item.id}>
        <button
          onClick={() => hasChildren && toggleExpanded(item.id)}
          className={itemClasses}
        >
          {getIcon(item.icon)}
          {!isCollapsed && (
            <>
              <span className="ml-3 flex-1 text-left rtl:text-right">
                {locale === 'ar' ? item.labelAr : item.label}
              </span>
              {item.badge && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {item.badge === 'new' ? (locale === 'ar' ? 'جديد' : 'New') : item.badge}
                </span>
              )}
              {hasChildren && (
                <div className="ml-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              )}
            </>
          )}
        </button>

        {/* Submenu */}
        {hasChildren && (isExpanded || isCollapsed) && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children.map((child: any) => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`
      bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-full
      ${isCollapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-gray-900">
              {locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
            </span>
          </div>
        )}
        
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg 
            className={`w-4 h-4 text-gray-500 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map(item => renderSidebarItem(item))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed ? (
          <div className="text-xs text-gray-500 text-center">
            {locale === 'ar' ? 'منصة Artistic' : 'Artistic Platform'}
            <br />
            <span className="text-gray-400">v2.0</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        )}
      </div>
    </aside>
  );
}