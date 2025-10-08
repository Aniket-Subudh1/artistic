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
  Heart
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
        classes: 'bg-gray-100 text-gray-800'
      },
      upcoming: {
        label: locale === 'ar' ? 'قادم' : 'Upcoming',
        classes: 'bg-blue-100 text-blue-800'
      },
      cancelled: {
        label: locale === 'ar' ? 'ملغي' : 'Cancelled',
        classes: 'bg-red-100 text-red-800'
      },
      pending: {
        label: locale === 'ar' ? 'معلق' : 'Pending',
        classes: 'bg-yellow-100 text-yellow-800'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.classes}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          {locale === 'ar' ? 'لوحة تحكم المستخدم' : 'User Dashboard'}
        </h1>
        <p className="text-purple-100 text-lg">
          {getWelcomeMessage()}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStatsCards().map((card, index) => (
          <div key={index} className={`${card.bgColor} rounded-2xl p-6 border border-gray-100`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  {card.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {card.value}
                </p>
              </div>
              <div className={`${card.color} p-3 rounded-xl`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking History */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {locale === 'ar' ? 'تاريخ الحجوزات' : 'Booking History'}
          </h2>
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            {locale === 'ar' ? 'عرض الكل' : 'View All'}
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 rtl:space-x-reverse mb-6 bg-gray-100 rounded-lg p-1">
          {['All', 'Upcoming', 'Past', 'Cancelled'].map((filter) => (
            <button
              key={filter}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === 'All'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
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
            <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{booking.title}</h3>
                  <p className="text-sm text-gray-500">{booking.date}</p>
                  <p className="text-xs text-gray-400">Ref: {booking.reference}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="text-right rtl:text-left">
                  <p className="font-bold text-gray-900">${booking.amount}</p>
                  {getStatusBadge(booking.status)}
                </div>
                
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-white transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}