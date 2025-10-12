'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { 
  User, 
  UserRole, 
  DashboardStats, 
  DashboardActivity, 
  QuickAction,
  DashboardCard 
} from '@/types/dashboard';
import { DashboardService } from '@/services/dashboard.service';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
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
  ChevronRight,
  Mic,
  Camera,
  Edit,
  FileText,
  Settings,
  AlertTriangle,
  UserCheck,
  Shield
} from 'lucide-react';
import Link from 'next/link';

interface UnifiedDashboardProps {
  user: User;
}

// Icon mapping for dynamic rendering
const iconMap = {
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
  ChevronRight,
  Mic,
  Camera,
  Edit,
  FileText,
  Settings,
  AlertTriangle,
  UserCheck,
  Shield
};

export function UnifiedDashboard({ user }: UnifiedDashboardProps) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const [stats, setStats] = useState<DashboardStats>({});
  const [recentActivity, setRecentActivity] = useState<DashboardActivity[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (user && !isDataLoaded) {
      loadDashboardData();
    }
  }, [user, isDataLoaded]);

  // Reset data loaded flag when user changes
  useEffect(() => {
    setIsDataLoaded(false);
  }, [user?.id]);

  const loadDashboardData = async () => {
    // Prevent multiple simultaneous calls
    if (isLoading && isDataLoaded) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Load role-specific stats
      let dashboardStats: DashboardStats = {};
      
      switch (user.role) {
        case 'super_admin':
        case 'admin':
          dashboardStats = await DashboardService.getAdminStats();
          break;
        case 'artist':
          dashboardStats = await DashboardService.getArtistStats();
          break;
        case 'equipment_provider':
          dashboardStats = await DashboardService.getEquipmentProviderStats();
          break;
        default:
          dashboardStats = {};
      }

      // Load recent activity and quick actions
      const [activity, actions] = await Promise.all([
        DashboardService.getRecentActivity(user.role),
        Promise.resolve(DashboardService.getQuickActions(user.role))
      ]);

      setStats(dashboardStats);
      setRecentActivity(activity);
      setQuickActions(actions);
      setIsDataLoaded(true);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDashboardCards = (stats: DashboardStats, role: UserRole): DashboardCard[] => {
    const cards: DashboardCard[] = [];

    // Role-specific cards configuration
    const roleCardConfigs = {
      admin: [
        { key: 'totalUsers', title: 'Total Users', icon: Users, color: 'bg-blue-500', bgColor: 'bg-blue-50' },
        { key: 'totalArtists', title: 'Total Artists', icon: Mic, color: 'bg-purple-500', bgColor: 'bg-purple-50' },
        { key: 'totalApplications', title: 'Total Applications', icon: FileText, color: 'bg-green-500', bgColor: 'bg-green-50' },
        { key: 'pendingApplications', title: 'Pending Applications', icon: Clock, color: 'bg-yellow-500', bgColor: 'bg-yellow-50' },
        { key: 'totalEquipment', title: 'Total Equipment', icon: Package, color: 'bg-indigo-500', bgColor: 'bg-indigo-50' },
      ],
      artist: [
        { key: 'likeCount', title: 'Total Likes', icon: Heart, color: 'bg-pink-500', bgColor: 'bg-pink-50' },
        { key: 'viewCount', title: 'Profile Views', icon: Eye, color: 'bg-blue-500', bgColor: 'bg-blue-50' },
        { key: 'portfolioItems', title: 'Portfolio Items', icon: Camera, color: 'bg-purple-500', bgColor: 'bg-purple-50' },
        { key: 'totalBookings', title: 'Total Bookings', icon: Calendar, color: 'bg-green-500', bgColor: 'bg-green-50' },
        { key: 'totalEarnings', title: 'Total Earnings', icon: DollarSign, color: 'bg-emerald-500', bgColor: 'bg-emerald-50' },
      ],
      equipment_provider: [
        { key: 'totalEquipment', title: 'Total Equipment', icon: Package, color: 'bg-blue-500', bgColor: 'bg-blue-50' },
        { key: 'totalBookings', title: 'Total Bookings', icon: Calendar, color: 'bg-green-500', bgColor: 'bg-green-50' },
        { key: 'activeBookings', title: 'Active Bookings', icon: Activity, color: 'bg-orange-500', bgColor: 'bg-orange-50' },
        { key: 'totalRevenue', title: 'Total Revenue', icon: DollarSign, color: 'bg-emerald-500', bgColor: 'bg-emerald-50' },
      ],
      venue_owner: [
        { key: 'totalVenues', title: 'Total Venues', icon: MapPin, color: 'bg-blue-500', bgColor: 'bg-blue-50' },
        { key: 'totalEvents', title: 'Total Events', icon: Calendar, color: 'bg-purple-500', bgColor: 'bg-purple-50' },
        { key: 'totalBookings', title: 'Total Bookings', icon: Users, color: 'bg-green-500', bgColor: 'bg-green-50' },
        { key: 'totalRevenue', title: 'Total Revenue', icon: DollarSign, color: 'bg-emerald-500', bgColor: 'bg-emerald-50' },
      ],
    };

    const configKey = role === 'super_admin' ? 'admin' : role;
    const configs = roleCardConfigs[configKey as keyof typeof roleCardConfigs] || [];

    configs.forEach(config => {
      const value = stats[config.key as keyof DashboardStats];
      if (value !== undefined) {
        cards.push({
          title: locale === 'ar' ? getArabicTitle(config.title) : config.title,
          value: config.key === 'totalEarnings' || config.key === 'totalRevenue' 
            ? `$${Number(value).toLocaleString()}` 
            : value,
          icon: config.icon,
          color: config.color,
          bgColor: config.bgColor,
        });
      }
    });

    return cards;
  };

  const getArabicTitle = (englishTitle: string): string => {
    const arabicTitles: Record<string, string> = {
      'Total Users': 'إجمالي المستخدمين',
      'Total Artists': 'إجمالي الفنانين',
      'Total Applications': 'إجمالي الطلبات',
      'Pending Applications': 'الطلبات المعلقة',
      'Total Equipment': 'إجمالي المعدات',
      'Total Likes': 'إجمالي الإعجابات',
      'Profile Views': 'مشاهدات الملف الشخصي',
      'Portfolio Items': 'عناصر المعرض',
      'Total Bookings': 'إجمالي الحجوزات',
      'Total Earnings': 'إجمالي الأرباح',
      'Active Bookings': 'الحجوزات النشطة',
      'Total Revenue': 'إجمالي الإيرادات',
      'Total Venues': 'إجمالي الأماكن',
      'Total Events': 'إجمالي الأحداث',
    };
    return arabicTitles[englishTitle] || englishTitle;
  };

  const getRoleDisplayName = (role: UserRole): { en: string; ar: string } => {
    const roleNames = {
      super_admin: { en: 'Super Admin', ar: 'مدير عام' },
      admin: { en: 'Admin', ar: 'مدير' },
      artist: { en: 'Artist', ar: 'فنان' },
      equipment_provider: { en: 'Equipment Provider', ar: 'مزود المعدات' },
      venue_owner: { en: 'Venue Owner', ar: 'مالك المكان' },
      user: { en: 'User', ar: 'مستخدم' },
    };
    return roleNames[role] || { en: 'User', ar: 'مستخدم' };
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const dashboardCards = generateDashboardCards(stats, user.role);
  const roleDisplay = getRoleDisplayName(user.role);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
          </h1>
          <p className="text-slate-600 mt-1">
            {locale === 'ar' 
              ? `مرحباً ${user.firstName}، مرحباً بك في لوحة تحكم ${roleDisplay.ar}`
              : `Welcome back, ${user.firstName}. Here's your ${roleDisplay.en} dashboard overview.`
            }
          </p>
        </div>
        <div className="mt-4 lg:mt-0">
          <button 
            onClick={() => {
              if (!isLoading) {
                setIsDataLoaded(false);
                loadDashboardData();
              }
            }}
            disabled={isLoading}
            className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg transition-colors ${
              isLoading 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Activity className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">
              {locale === 'ar' ? 'تحديث' : 'Refresh'}
            </span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {dashboardCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dashboardCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div key={index} className={`${card.bgColor} rounded-2xl border border-slate-200 p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {card.value}
                    </p>
                  </div>
                  <div className={`${card.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                {locale === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
              </h3>
              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                {locale === 'ar' ? 'عرض الكل' : 'View All'}
              </button>
            </div>
            
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 rtl:space-x-reverse p-3 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(activity.date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                      activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {activity.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">
                    {locale === 'ar' ? 'لا توجد أنشطة حديثة' : 'No recent activity'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {locale === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
            </h3>
            
            <div className="space-y-3">
              {quickActions.map((action) => {
                const IconComponent = iconMap[action.icon as keyof typeof iconMap] || Settings;
                return (
                  <Link
                    key={action.id}
                    href={action.href}
                    className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-left rtl:text-right"
                  >
                    <div className={`${action.color} w-8 h-8 rounded-lg flex items-center justify-center`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-900 block">
                        {locale === 'ar' ? getArabicTitle(action.title) : action.title}
                      </span>
                      <span className="text-xs text-slate-600">
                        {locale === 'ar' ? getArabicTitle(action.description) : action.description}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Welcome Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-100 border border-indigo-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900">
                  {locale === 'ar' ? 'مرحباً بك!' : 'Welcome!'}
                </h3>
                <p className="text-xs text-indigo-700">
                  {locale === 'ar' 
                    ? `أنت مسجل كـ ${roleDisplay.ar}`
                    : `You're logged in as ${roleDisplay.en}`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}