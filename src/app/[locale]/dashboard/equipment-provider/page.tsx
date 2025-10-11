'use client';

import React, { useState, useEffect } from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EquipmentService } from '@/services/equipment.service';
import { 
  Package, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Settings,
  Eye,
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function EquipmentProviderDashboard() {
  const { user, isLoading } = useAuthLogic();
  const [stats, setStats] = useState({
    totalEquipment: 0,
    availableEquipment: 0,
    totalBookings: 0,
    monthlyRevenue: 0,
    pendingRequests: 0
  });
  const [recentEquipment, setRecentEquipment] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setIsLoadingData(true);
    try {
      const equipmentData = await EquipmentService.getMyEquipment();
      setRecentEquipment(equipmentData.slice(0, 5));
      
      setStats({
        totalEquipment: equipmentData.length,
        availableEquipment: equipmentData.filter(item => item.quantity > 0).length,
        totalBookings: 0, // This would come from bookings API
        monthlyRevenue: 0, // This would come from analytics API
        pendingRequests: 0 // This would come from bookings API
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  const quickActions = [
    {
      title: 'Add Equipment',
      description: 'Add new equipment to your inventory',
      icon: Plus,
      href: '/dashboard/equipment/add',
      color: 'green'
    },
    {
      title: 'View Equipment',
      description: 'Manage your equipment listings',
      icon: Package,
      href: '/dashboard/equipment',
      color: 'blue'
    },
    {
      title: 'Settings',
      description: 'Manage account settings and preferences',
      icon: Settings,
      href: '/dashboard/equipment-provider/settings',
      color: 'purple'
    },
    {
      title: 'Analytics',
      description: 'View performance and revenue analytics',
      icon: BarChart3,
      href: '/dashboard/equipment-provider/analytics',
      color: 'orange'
    }
  ];

  return (
    <RoleBasedRoute allowedRoles={['equipment_provider']} userRole={user.role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Equipment Provider Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.firstName}!</p>
          </div>
          
          {/* User Badge */}
          <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.firstName.charAt(0)}
              </span>
            </div>
            <span className="font-medium text-green-800">Equipment Provider</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEquipment}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+2 this month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.availableEquipment}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Ready for rental</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">All time</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.monthlyRevenue}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">This month</span>
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
                green: 'hover:border-green-300 hover:bg-green-50',
                blue: 'hover:border-blue-300 hover:bg-blue-50',
                purple: 'hover:border-purple-300 hover:bg-purple-50',
                orange: 'hover:border-orange-300 hover:bg-orange-50'
              };

              const iconClasses = {
                green: 'text-green-600',
                blue: 'text-blue-600',
                purple: 'text-purple-600',
                orange: 'text-orange-600'
              };

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className={`p-4 border border-gray-200 rounded-lg ${colorClasses[action.color as keyof typeof colorClasses]} transition-colors text-left block`}
                >
                  <Icon className={`w-8 h-8 ${iconClasses[action.color as keyof typeof iconClasses]} mb-2`} />
                  <h4 className="font-medium text-gray-900">{action.title}</h4>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Equipment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Equipment List */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Equipment</h3>
                <Link href="/dashboard/equipment" className="text-green-600 hover:text-green-700 text-sm font-medium">
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {isLoadingData ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                </div>
              ) : recentEquipment.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No equipment yet</h4>
                  <p className="text-gray-600 mb-4">Start by adding your first equipment item</p>
                  <Link
                    href="/dashboard/equipment/add"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Equipment
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentEquipment.map((item) => (
                    <div key={item._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${item.pricePerDay}/day</p>
                        <p className="text-sm text-gray-500">{item.quantity} available</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Performance Overview */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Equipment Views</p>
                      <p className="text-sm text-gray-500">Total profile views</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">0</p>
                    <p className="text-sm text-green-600">+0% this week</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Booking Rate</p>
                      <p className="text-sm text-gray-500">Conversion rate</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">0%</p>
                    <p className="text-sm text-gray-500">No data yet</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Response Time</p>
                      <p className="text-sm text-gray-500">Avg. response to inquiries</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">-</p>
                    <p className="text-sm text-gray-500">No data yet</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips for Success */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tips for Success</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• <strong>Add detailed descriptions:</strong> Include specifications, features, and what's included with your equipment</p>
                <p>• <strong>Upload high-quality images:</strong> Clear photos help customers make booking decisions</p>
                <p>• <strong>Set competitive prices:</strong> Research market rates to price your equipment competitively</p>
                <p>• <strong>Keep availability updated:</strong> Regularly update quantities to avoid overbooking</p>
                <p>• <strong>Respond quickly:</strong> Fast responses to inquiries lead to more bookings</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Account</span>
              </div>
              <span className="text-green-600 text-sm">Active</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Verification</span>
              </div>
              <span className="text-green-600 text-sm">Verified</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Equipment</span>
              </div>
              <span className="text-green-600 text-sm">{stats.totalEquipment} Listed</span>
            </div>
          </div>
        </div>
      </div>
    </RoleBasedRoute>
  );
}