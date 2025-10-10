'use client';

import React, { useState, useEffect } from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { UserService } from '@/services/user.service';
import { ArtistService } from '@/services/artist.service';
import { ApplicationService } from '@/services/application.service';
import { EquipmentService } from '@/services/equipment.service';
import { 
  Users, 
  Mic, 
  Calendar, 
  Settings, 
  BarChart3, 
  AlertTriangle,
  TrendingUp,
  UserCheck,
  Clock,
  FileText,
  Package,
  Shield
} from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function AdminDashboard() {
  const { user, isLoading } = useAuthLogic();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArtists: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalEquipment: 0,
    recentActivity: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentArtists, setRecentArtists] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setIsLoadingStats(true);
    try {
      const [usersData, artistsData, equipmentData] = await Promise.all([
        UserService.getAllUsers(),
        ArtistService.getPrivateArtists(),
        EquipmentService.getAllEquipment()
      ]);
      
      let applicationsData: any[] = [];
      try {
        applicationsData = await ApplicationService.getAllApplications();
      } catch (error) {
        console.log('Applications endpoint not available yet');
      }
      
      setRecentUsers(usersData.slice(0, 5));
      setRecentArtists(artistsData.slice(0, 5));
      setStats({
        totalUsers: usersData.length,
        totalArtists: artistsData.length,
        totalApplications: applicationsData.length,
        pendingApplications: applicationsData.filter((app: any) => app.status === 'pending').length,
        totalEquipment: equipmentData.length,
        recentActivity: 12 // This would come from backend
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading admin dashboard..." />;
  }

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage all system users',
      icon: Users,
      href: '/dashboard/admin/users',
      color: 'blue',
      count: stats.totalUsers
    },
    {
      title: 'Manage Artists',
      description: 'Add, edit, and manage artist profiles',
      icon: Mic,
      href: '/dashboard/admin/artists',
      color: 'purple',
      count: stats.totalArtists
    },
    {
      title: 'Review Applications',
      description: 'Review pending artist applications',
      icon: FileText,
      href: '/dashboard/admin/applications',
      color: 'yellow',
      count: stats.pendingApplications,
      badge: stats.pendingApplications > 0
    },
    {
      title: 'Equipment Management',
      description: 'Manage equipment and providers',
      icon: Package,
      href: '/dashboard/admin/equipment',
      color: 'green',
      count: stats.totalEquipment
    }
  ];

  return (
    <RoleBasedRoute allowedRoles={['super_admin', 'admin']} userRole={user.role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.firstName}!</p>
          </div>
          
          {/* User Badge */}
          <div className="flex items-center space-x-2 bg-purple-100 px-4 py-2 rounded-full">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.firstName.charAt(0)}
              </span>
            </div>
            <span className="font-medium text-purple-800">{user.role.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Artists</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalArtists}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Mic className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+8%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {stats.pendingApplications > 0 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-yellow-600">Needs attention</span>
                </>
              ) : (
                <span className="text-gray-500">All caught up!</span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEquipment}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Available for rent</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const colorClasses = {
                blue: 'hover:border-blue-300 hover:bg-blue-50',
                purple: 'hover:border-purple-300 hover:bg-purple-50',
                yellow: 'hover:border-yellow-300 hover:bg-yellow-50',
                green: 'hover:border-green-300 hover:bg-green-50'
              };

              const iconClasses = {
                blue: 'text-blue-600',
                purple: 'text-purple-600',
                yellow: 'text-yellow-600',
                green: 'text-green-600'
              };

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className={`relative p-4 border border-gray-200 rounded-lg ${colorClasses[action.color as keyof typeof colorClasses]} transition-colors text-left block`}
                >
                  <Icon className={`w-8 h-8 ${iconClasses[action.color as keyof typeof iconClasses]} mb-2`} />
                  <h4 className="font-medium text-gray-900">{action.title}</h4>
                  <p className="text-sm text-gray-500 mb-2">{action.description}</p>
                  <div className="text-sm font-medium text-gray-700">
                    {action.count} items
                  </div>
                  {action.badge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      {action.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
                <Link href="/dashboard/admin/users" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentUsers.map((user: any) => (
                  <div key={user._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'ARTIST' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Artists */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Artists</h3>
                <Link href="/dashboard/admin/artists" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentArtists.map((artist: any) => (
                  <div key={artist._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {artist.user.firstName.charAt(0)}{artist.user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{artist.stageName}</p>
                        <p className="text-sm text-gray-500">{artist.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${artist.pricePerHour}/hr</p>
                      <p className="text-sm text-gray-500">{artist.yearsOfExperience} years exp</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Database</span>
              </div>
              <span className="text-green-600 text-sm">Connected</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Storage</span>
              </div>
              <span className="text-green-600 text-sm">Active</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-900">API</span>
              </div>
              <span className="text-green-600 text-sm">Healthy</span>
            </div>
          </div>
        </div>
      </div>
    </RoleBasedRoute>
  );
}