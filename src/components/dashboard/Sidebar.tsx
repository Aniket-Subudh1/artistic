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

    const iconSize = isCollapsed && level === 0 ? "w-8 h-8" : "w-5 h-5";

    const itemClasses = `
      flex items-center w-full rounded-lg transition-all duration-200
      ${isCollapsed && level === 0 
        ? 'justify-center px-2 py-4' 
        : level > 0 
        ? 'ml-6 pl-6 border-l border-gray-200 px-3 py-2.5' 
        : 'px-3 py-2.5'
      }
      text-sm
      ${itemIsActive 
        ? 'bg-purple-100 text-purple-700 font-medium shadow-sm' 
        : hasActiveChild
        ? 'bg-purple-50 text-purple-600'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
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
          {getIcon(item.icon, iconSize)}
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

        {hasChildren && (isExpanded || isCollapsed) && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children.map((child: any) => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col  h-full">
      <div className="hidden lg:flex justify-end  border-b border-gray-200">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {sidebarItems.map(item => renderSidebarItem(item))}
      </div>

      <div className="p-1  border-t border-gray-200">
        <button 
          onClick={onLogout}
          className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span>{locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>}
        </button>
      </div>

      <div className="p-2 border-t border-gray-200">
        {!isCollapsed ? (
          <div className="flex items-center justify-center text-xs text-gray-500">
  <Image
    src="/logo-main.webp"
    alt="Fima Logo"
    height={24}
    width={80}
  />
</div>

        ) : (
          <div className="flex items-center justify-center text-xs text-gray-500">
  <Image
    src="/Logo.svg"
    alt="Fima Logo"
    height={24}
    width={20}
  />
</div>
        )}
      </div>
    </div>
  );
}