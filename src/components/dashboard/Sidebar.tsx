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
    return pathname === href || pathname.startsWith(href + '/');
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
      flex items-center w-full rounded-lg transition-all duration-200
      ${isCollapsed && level === 0 
        ? 'justify-center px-2 py-2.5' 
        : level > 0 
        ? 'ml-4 pl-3 border-l border-slate-200 px-2 py-1.5 text-xs max-w-full' 
        : 'px-3 py-2 text-sm'
      }
      ${level > 0 ? 'text-xs' : 'text-sm'}
      ${itemIsActive 
        ? level > 0 
          ? 'bg-indigo-50 text-indigo-700 font-medium border-l-indigo-300' 
          : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold'
        : hasActiveChild
        ? 'bg-indigo-50 text-indigo-700 font-medium'
        : level > 0 
        ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-normal'
        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
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
              <span className="ml-2 flex-1 text-left rtl:text-right">
                {locale === 'ar' ? item.labelAr : item.label}
              </span>
              {item.badge && (
                <span className="ml-2 px-2.5 py-1 text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-semibold shadow-sm">
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
              <span className="ml-2 flex-1 text-left rtl:text-right">
                {locale === 'ar' ? item.labelAr : item.label}
              </span>
              {item.badge && (
                <span className="ml-2 px-2.5 py-1 text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-semibold shadow-sm">
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

        {hasChildren && (isExpanded || isCollapsed) && !isCollapsed && (
          <div className="mt-1 space-y-1 overflow-hidden">
            {item.children.map((child: any) => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {sidebarItems.map(item => renderSidebarItem(item))}
      </div>

      <div className="p-2 border-t border-slate-100">
        <div className="flex justify-center">
          <button 
            onClick={onLogout}
            className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span>{locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>}
          </button>
        </div>
      </div>

      <div className="p-2 border-t border-slate-100 bg-slate-50">
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