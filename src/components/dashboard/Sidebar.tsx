'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  const sidebarScrollRef = useRef<HTMLDivElement>(null);

  const sidebarItems = filterSidebarItems(getSidebarItems(), user.role);

  // Effect to ensure dropdown scrolling works properly on mount
  useEffect(() => {
    if (sidebarScrollRef.current) {
      sidebarScrollRef.current.style.scrollBehavior = 'smooth';
    }
  }, []);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const isCurrentlyExpanded = prev.includes(itemId);
      const newExpanded = isCurrentlyExpanded 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
      
      // If we're expanding an item, scroll it into view after a brief delay
      if (!isCurrentlyExpanded) {
        // Try multiple timing approaches to ensure it works
        setTimeout(() => scrollToExpandedItem(itemId), 50);
        setTimeout(() => scrollToExpandedItem(itemId), 150);
        setTimeout(() => scrollToExpandedItem(itemId), 300);
      }
      
      return newExpanded;
    });
  };

  const scrollToExpandedItem = (itemId: string) => {
    if (!sidebarScrollRef.current) return;
    
    const expandedButton = document.querySelector(`[data-item-id="${itemId}"]`);
    const dropdownContent = document.querySelector(`[data-dropdown-content="${itemId}"]`);
    
    if (expandedButton && dropdownContent) {
      const sidebarContainer = sidebarScrollRef.current;
      
      // Wait for dropdown to render, then calculate its actual height
      setTimeout(() => {
        const buttonRect = expandedButton.getBoundingClientRect();
        const dropdownRect = dropdownContent.getBoundingClientRect();
        const containerRect = sidebarContainer.getBoundingClientRect();
        
        const dropdownHeight = dropdownRect.height;
        const buttonTopInContainer = buttonRect.top - containerRect.top;
        const buttonBottomInContainer = buttonRect.bottom - containerRect.top;
        
        // Calculate where the dropdown will end
        const dropdownEndPosition = buttonBottomInContainer + dropdownHeight;
        const containerHeight = containerRect.height;
        
        // If dropdown extends beyond the visible area
        if (dropdownEndPosition > containerHeight) {
          // Calculate how much we need to scroll
          const overflowAmount = dropdownEndPosition - containerHeight;
          const currentScrollTop = sidebarContainer.scrollTop;
          const newScrollTop = currentScrollTop + overflowAmount + 20; // 20px padding
          
          sidebarContainer.scrollTo({
            top: Math.max(0, newScrollTop),
            behavior: 'smooth'
          });
        }
        // If the button itself is not visible (too high), scroll up to show it
        else if (buttonTopInContainer < 0) {
          const currentScrollTop = sidebarContainer.scrollTop;
          const newScrollTop = currentScrollTop + buttonTopInContainer - 20; // 20px padding
          
          sidebarContainer.scrollTo({
            top: Math.max(0, newScrollTop),
            behavior: 'smooth'
          });
        }
      }, 150); // Wait for CSS transition to start
    } else {
      // Fallback: simple scroll into view
      setTimeout(() => {
        const button = document.querySelector(`[data-item-id="${itemId}"]`);
        if (button) {
          button.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest',
            inline: 'nearest'
          });
        }
      }, 200);
    }
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
      flex items-center w-full rounded-lg transition-colors duration-200 overflow-hidden sidebar-item
      ${isCollapsed && level === 0 
        ? 'justify-center px-3 py-3' 
        : level > 0 
        ? 'ml-4 pl-4 border-l-2 border-slate-200 px-3 py-2 text-xs max-w-full truncate' 
        : 'px-4 py-3 text-sm'
      }
      ${level > 0 ? 'text-xs' : 'text-sm'}
      ${itemIsActive 
        ? level > 0 
          ? 'bg-[#391C71] text-white font-medium border-l-[#391C71]' 
          : 'bg-[#391C71] text-white font-medium'
        : hasActiveChild
        ? 'bg-[#391C71]/10 text-[#391C71] font-medium'
        : level > 0 
        ? 'text-slate-600 hover:bg-[#391C71] hover:text-white font-normal'
        : 'text-slate-700 hover:bg-[#391C71] hover:text-white font-normal'
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
                <span className="ml-2 px-3 py-1.5 text-xs bg-red-500 text-white rounded-full font-medium flex-shrink-0">
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
          data-item-id={item.id}
        >
          {getIcon(item.icon, iconSize)}
          {!isCollapsed && (
            <>
              <span className="ml-2 flex-1 text-left rtl:text-right truncate">
                {locale === 'ar' ? item.labelAr : item.label}
              </span>
              {item.badge && (
                <span className="ml-2 px-3 py-1.5 text-xs bg-red-500 text-white rounded-full font-medium flex-shrink-0">
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
          <div 
            className="mt-1 space-y-1 overflow-hidden max-w-full transition-all duration-300 ease-in-out"
            data-dropdown-content={item.id}
          >
            {item.children.map((child: any) => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full sidebar-layout">
      <div 
        ref={sidebarScrollRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-1 sidebar-scroll-container"
      >
        {sidebarItems.map(item => renderSidebarItem(item))}
      </div>

      <div className="flex-shrink-0 p-2 border-t border-slate-200/50 bg-white">
        <div className="flex justify-center">
          <button 
            onClick={onLogout}
            className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-3 text-sm text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors duration-200 font-medium border border-red-200 hover:border-red-600 ${
              isCollapsed ? 'justify-center px-3' : ''
            }`}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span>{locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>}
          </button>
        </div>
      </div>

      <div className="flex-shrink-0 p-3 border-t border-slate-200/50 bg-white">
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