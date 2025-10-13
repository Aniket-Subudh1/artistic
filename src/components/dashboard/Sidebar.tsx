'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { 
  ChevronDown, 
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  LayoutDashboard,
  Calendar,
  CalendarDays,
  CalendarRange,
  Clock,
  CalendarPlus,
  Plus,
  Mic,
  User,
  Users,
  LogOut,
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
  Cog,
  Bookmark,
  Receipt as ReceiptIcon,
  BellRing
} from 'lucide-react';
import { User as UserType } from '@/types/dashboard';
import { getSidebarItems, filterSidebarItems } from '@/lib/permissions';

interface SidebarProps {
  user: UserType;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
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



export function Sidebar({ user, isCollapsed, onToggleCollapse, onLogout }: SidebarProps) {
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
    
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    
    if (href === '/dashboard/admin') {
      return pathname === '/dashboard/admin';
    }
    
    return pathname === href || (pathname.startsWith(href + '/') && href !== '/dashboard');
  };

  const getIcon = (iconName: string, className: string = "w-5 h-5") => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || 
                          (iconName === 'Bookmark' ? Bookmark : 
                           iconName === 'BellRing' ? BellRing : LayoutDashboard);
    return <IconComponent className={className} />;
  };

  const renderSidebarItem = (item: any, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const itemIsActive = isActive(item.href);
    const hasActiveChild = hasChildren && item.children.some((child: any) => isActive(child.href));

    const iconSize = isCollapsed && level === 0 ? "w-6 h-6" : level > 0 ? "w-4 h-4" : "w-4 h-4";

    const itemClasses = `
      flex items-center w-full rounded-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden sidebar-item
      ${isCollapsed && level === 0 
        ? 'justify-center px-3 py-3' 
        : level > 0 
        ? 'ml-4 pl-4 border-l-2 border-slate-200 px-3 py-2 text-xs max-w-full truncate' 
        : 'px-4 py-3 text-sm'
      }
      ${level > 0 ? 'text-xs' : 'text-sm'}
      ${itemIsActive 
        ? level > 0 
          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-semibold border-l-indigo-400 shadow-md' 
          : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white font-bold shadow-xl hover:shadow-2xl'
        : hasActiveChild
        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-semibold shadow-sm'
        : level > 0 
        ? 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:text-slate-800 font-medium hover:shadow-sm'
        : 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 hover:text-slate-900 font-medium hover:shadow-md'
      }
    `;

    if (item.href && !hasChildren) {
      return (
        <Link
          key={item.id}
          href={item.href}
          className={itemClasses}
        >
          {getIcon(item.icon, iconSize)}
          {!isCollapsed && (
            <>
              <span className="ml-2 flex-1 text-left rtl:text-right truncate">
                {locale === 'ar' ? item.labelAr : item.label}
              </span>
              {item.badge && (
                <span className="ml-2 px-3 py-1.5 text-xs bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white rounded-full font-bold shadow-lg animate-pulse flex-shrink-0">
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
          {getIcon(item.icon, iconSize)}
          {!isCollapsed && (
            <>
              <span className="ml-2 flex-1 text-left rtl:text-right truncate">
                {locale === 'ar' ? item.labelAr : item.label}
              </span>
              {item.badge && (
                <span className="ml-2 px-3 py-1.5 text-xs bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white rounded-full font-bold shadow-lg animate-pulse flex-shrink-0">
                  {item.badge === 'new' ? (locale === 'ar' ? 'جديد' : 'New') : item.badge}
                </span>
              )}
              {hasChildren && (
                <div className="ml-2 flex-shrink-0">
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

        {hasChildren && (isExpanded || isCollapsed) && !isCollapsed && (
          <div className="mt-1 space-y-1 overflow-hidden max-w-full">
            {item.children.map((child: any) => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full sidebar-layout">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-1 smooth-scroll">
        {sidebarItems.map(item => renderSidebarItem(item))}
      </div>

      <div className="flex-shrink-0 p-2 border-t border-slate-200/50 bg-gradient-to-r from-white/80 to-slate-50/80 backdrop-blur-sm">
        <div className="flex justify-center">
          <button 
            onClick={onLogout}
            className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300 font-medium shadow-sm hover:shadow-md border border-red-100 hover:border-red-200 ${
              isCollapsed ? 'justify-center px-3' : ''
            }`}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span>{locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>}
          </button>
        </div>
      </div>

      <div className="flex-shrink-0 p-3 border-t border-slate-200/50 bg-gradient-to-r from-slate-50/80 to-white/80 backdrop-blur-sm">
        {!isCollapsed ? (
          <div className="flex items-center justify-center text-xs text-slate-500">
            <Image
              src="/logo-main.webp"
              alt="Fima Logo"
              height={20}
              width={70}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center text-xs text-slate-500">
            <Image
              src="/Logo.svg"
              alt="Fima Logo"
              height={20}
              width={20}
            />
          </div>
        )}
      </div>
    </div>
  );
}