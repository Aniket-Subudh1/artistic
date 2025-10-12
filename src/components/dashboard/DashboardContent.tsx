'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { User, UserRole, DashboardStats, BookingHistory } from '@/types/dashboard';
import { 
  Calendar,
  Users,
  Package,
  MapPin,
  TrendingUp,
  DollarSign,
  Star,
  Download,
  Heart,
  BarChart3,
  Clock,
  Activity,
  Award,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight
} from 'lucide-react';

interface DashboardContentProps {
  user: User;
}

// Mock data - replace with actual API calls
const getDashboardStats = (role: UserRole): DashboardStats => {
  const baseStats = {
    totalBookings: 20,
    totalEvents: 15,
    totalArtists: 8,
    totalEquipment: 12,
    totalRevenue: 5420,
    totalUsers: 1250,
    totalVenues: 25,
    pendingApprovals: 3
  };

  switch (role) {
    case 'super_admin':
    case 'admin':
      return baseStats;
    case 'artist':
      return {
        totalBookings: 12,
        totalEvents: 8,
        totalRevenue: 2840
      };
    case 'equipment_provider':
      return {
        totalBookings: 18,
        totalEquipment: 15,
        totalRevenue: 3600,
        pendingApprovals: 2
      };
    case 'venue_owner':
      return {
        totalBookings: 25,
        totalEvents: 20,
        totalVenues: 3,
        totalRevenue: 4200,
        pendingApprovals: 5
      };
    default:
      return {
        totalBookings: 5,
        totalEvents: 3
      };
  }
};

const getRecentBookings = (role: UserRole): BookingHistory[] => {
  const baseBookings: BookingHistory[] = [
    {
      id: '1',
      title: 'Rock Concert 2024',
      date: 'June 1, 2024',
      amount: 120,
      status: 'past',
      type: 'event',
      reference: 'BOK-2024-001'
    },
    {
      id: '2',
      title: 'Dance Workshop',
      date: 'July 15, 2024',
      amount: 85,
      status: 'upcoming',
      type: 'event',
      reference: 'BOK-2024-002'
    },
    {
      id: '3',
      title: 'Photo Equipment Rental',
      date: 'August 10, 2024',
      amount: 200,
      status: 'upcoming',
      type: 'equipment',
      reference: 'BOK-2024-003'
    }
  ];

  return baseBookings.slice(0, role === 'user' ? 2 : 3);
};

export function DashboardContent({ user }: DashboardContentProps) {
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const stats = getDashboardStats(user.role);
  const recentBookings = getRecentBookings(user.role);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 12) {
      greeting = locale === 'ar' ? 'صباح الخير' : 'Good morning';
    } else if (hour < 18) {
      greeting = locale === 'ar' ? 'مساء الخير' : 'Good afternoon';
    } else {
      greeting = locale === 'ar' ? 'مساء الخير' : 'Good evening';
    }
    
    return `${greeting}, ${user.firstName}!`;
  };

  const getStatsCards = () => {
    const cards = [];

    if (stats.totalBookings !== undefined) {
      cards.push({
        title: locale === 'ar' ? 'إجمالي الحجوزات' : 'Total Bookings',
        value: stats.totalBookings,
        icon: Calendar,
        color: 'bg-blue-500',
        bgColor: 'bg-blue-50'
      });
    }

    if (stats.totalEvents !== undefined) {
      cards.push({
        title: locale === 'ar' ? 'إجمالي الفعاليات' : 'Total Events',
        value: stats.totalEvents,
        icon: Calendar,
        color: 'bg-purple-500',
        bgColor: 'bg-purple-50'
      });
    }

    if (stats.totalArtists !== undefined) {
      cards.push({
        title: locale === 'ar' ? 'إجمالي الفنانين' : 'Total Artists',
        value: stats.totalArtists,
        icon: Users,
        color: 'bg-pink-500',
        bgColor: 'bg-pink-50'
      });
    }

    if (stats.totalEquipment !== undefined) {
      cards.push({
        title: locale === 'ar' ? 'إجمالي المعدات' : 'Total Equipment',
        value: stats.totalEquipment,
        icon: Package,
        color: 'bg-green-500',
        bgColor: 'bg-green-50'
      });
    }

    if (stats.totalVenues !== undefined) {
      cards.push({
        title: locale === 'ar' ? 'إجمالي الأماكن' : 'Total Venues',
        value: stats.totalVenues,
        icon: MapPin,
        color: 'bg-orange-500',
        bgColor: 'bg-orange-50'
      });
    }

    if (stats.totalRevenue !== undefined) {
      cards.push({
        title: locale === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue',
        value: `$${stats.totalRevenue.toLocaleString()}`,
        icon: DollarSign,
        color: 'bg-emerald-500',
        bgColor: 'bg-emerald-50'
      });
    }

    if (stats.totalUsers !== undefined) {
      cards.push({
        title: locale === 'ar' ? 'إجمالي المستخدمين' : 'Total Users',
        value: stats.totalUsers,
        icon: Users,
        color: 'bg-indigo-500',
        bgColor: 'bg-indigo-50'
      });
    }

    if (stats.pendingApprovals !== undefined) {
      cards.push({
        title: locale === 'ar' ? 'الموافقات المعلقة' : 'Pending Approvals',
        value: stats.pendingApprovals,
        icon: TrendingUp,
        color: 'bg-yellow-500',
        bgColor: 'bg-yellow-50'
      });
    }

    return cards;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      past: {
        label: locale === 'ar' ? 'منتهي' : 'Past',
        classes: 'bg-slate-100 text-slate-700 border border-slate-200'
      },
      upcoming: {
        label: locale === 'ar' ? 'قادم' : 'Upcoming',
        classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200'
      },
      cancelled: {
        label: locale === 'ar' ? 'ملغي' : 'Cancelled',
        classes: 'bg-red-100 text-red-700 border border-red-200'
      },
      pending: {
        label: locale === 'ar' ? 'معلق' : 'Pending',
        classes: 'bg-amber-100 text-amber-700 border border-amber-200'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-lg ${config.classes}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header with Welcome Message and Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {getWelcomeMessage()}
          </h1>
          <p className="text-slate-600">
            {locale === 'ar' 
              ? `مرحباً بك في لوحة التحكم. لديك ${stats.totalBookings || 0} حجز نشط.`
              : `Welcome to your dashboard. You have ${stats.totalBookings || 0} active bookings.`
            }
          </p>
        </div>
        
        <div className="flex space-x-3 rtl:space-x-reverse">
          <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors flex items-center space-x-2 rtl:space-x-reverse">
            <Download className="w-4 h-4" />
            <span>{locale === 'ar' ? 'تصدير' : 'Export'}</span>
          </button>
          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center space-x-2 rtl:space-x-reverse">
            <Calendar className="w-4 h-4" />
            <span>{locale === 'ar' ? 'حجز جديد' : 'New Booking'}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStatsCards().map((card, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">
                  {card.title}
                </h3>
                <p className="text-3xl font-bold text-slate-900 mb-1">
                  {card.value}
                </p>
                <div className="flex items-center space-x-1 text-sm">
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 font-medium">+12%</span>
                  <span className="text-slate-500">{locale === 'ar' ? 'هذا الشهر' : 'this month'}</span>
                </div>
              </div>
              <div className={`${card.color} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-200`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Booking History */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {locale === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
            </h2>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center space-x-1 rtl:space-x-reverse">
              <span>{locale === 'ar' ? 'عرض الكل' : 'View All'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 rtl:space-x-reverse mb-6 bg-slate-100 rounded-xl p-1">
            {['All', 'Upcoming', 'Past', 'Cancelled'].map((filter) => (
              <button
                key={filter}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'All'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {locale === 'ar' 
                  ? { All: 'الكل', Upcoming: 'قادم', Past: 'منتهي', Cancelled: 'ملغي' }[filter]
                  : filter
                }
              </button>
            ))}
          </div>

          {/* Booking List */}
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{booking.title}</h3>
                    <p className="text-sm text-slate-500">{booking.date}</p>
                    <p className="text-xs text-slate-400">Ref: {booking.reference}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="text-right rtl:text-left">
                    <p className="font-bold text-slate-900">${booking.amount}</p>
                    {getStatusBadge(booking.status)}
                  </div>
                  
                  <div className="flex space-x-2 rtl:space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Quick Stats & Actions */}
        <div className="space-y-6">
          
          {/* Performance Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {locale === 'ar' ? 'الأداء' : 'Performance'}
              </h3>
              <BarChart3 className="w-5 h-5 text-slate-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{locale === 'ar' ? 'هذا الشهر' : 'This Month'}</span>
                <span className="text-sm font-semibold text-slate-900">+24%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{locale === 'ar' ? 'هذا الأسبوع' : 'This Week'}</span>
                <span className="text-sm font-semibold text-slate-900">+18%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full" style={{width: '60%'}}></div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {locale === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
            </h3>
            
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-left rtl:text-right">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-slate-900">
                  {locale === 'ar' ? 'إنشاء حدث جديد' : 'Create New Event'}
                </span>
              </button>
              
              <button className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-left rtl:text-right">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-slate-900">
                  {locale === 'ar' ? 'إدارة الفريق' : 'Manage Team'}
                </span>
              </button>
              
              <button className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-left rtl:text-right">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-slate-900">
                  {locale === 'ar' ? 'عرض التقارير' : 'View Reports'}
                </span>
              </button>
            </div>
          </div>

          {/* Achievement Badge */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">
                  {locale === 'ar' ? 'إنجاز جديد!' : 'New Achievement!'}
                </h3>
                <p className="text-xs text-amber-700">
                  {locale === 'ar' ? 'وصلت إلى 100 حجز' : 'Reached 100 bookings'}
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}