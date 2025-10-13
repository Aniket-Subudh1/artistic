'use client';

import React, { useState, useEffect } from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStatsGrid } from '@/components/dashboard/DashboardStatsGrid';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
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
      href: '/dashboard/equipment-provider/add',
      color: 'green' as const
    },
    {
      title: 'View Equipment',
      description: 'Manage your equipment listings',
      icon: Package,
      href: '/dashboard/equipment-provider',
      color: 'blue' as const
    },
    {
      title: 'Settings',
      description: 'Manage account settings and preferences',
      icon: Settings,
      href: '/dashboard/equipment-provider/settings',
      color: 'purple' as const
    },
    {
      title: 'Analytics',
      description: 'View performance and revenue analytics',
      icon: BarChart3,
      href: '/dashboard/equipment-provider/analytics',
      color: 'orange' as const
    }
  ];

  return (
    <RoleBasedRoute allowedRoles={['equipment_provider']} userRole={user.role}>
      <div className="space-y-6">
        {/* Header */}
        <DashboardHeader
          title="Equipment Provider Dashboard"
          subtitle={`Welcome back, ${user.firstName}!`}
          user={user}
          userBadgeColor="bg-green-100"
          userBadgeText="Equipment Provider"
        />

        {/* Stats Cards */}
        <DashboardStatsGrid stats={[
          {
            title: 'Total Equipment',
            value: stats.totalEquipment,
            icon: Package,
            iconColor: 'text-blue-600',
            iconBgColor: 'bg-blue-100',
            change: {
              value: '+2 this month',
              type: 'increase',
              icon: TrendingUp
            }
          },
          {
            title: 'Available Items',
            value: stats.availableEquipment,
            icon: CheckCircle,
            iconColor: 'text-green-600',
            iconBgColor: 'bg-green-100',
            subtitle: 'Ready for rental'
          },
          {
            title: 'Total Bookings',
            value: stats.totalBookings,
            icon: Calendar,
            iconColor: 'text-purple-600',
            iconBgColor: 'bg-purple-100',
            subtitle: 'All time'
          },
          {
            title: 'Monthly Revenue',
            value: `$${stats.monthlyRevenue}`,
            icon: DollarSign,
            iconColor: 'text-yellow-600',
            iconBgColor: 'bg-yellow-100',
            subtitle: 'This month'
          }
        ]} />

        {/* Quick Actions */}
        <QuickActions actions={quickActions} />

        {/* Recent Equipment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Equipment List */}
          <DashboardCard 
            title="Recent Equipment"
            headerAction={{
              text: 'View All',
              href: '/dashboard/equipment-provider'
            }}
          >
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
                  href="/dashboard/equipment-provider/add"
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
          </DashboardCard>

          {/* Performance Overview */}
          <DashboardCard title="Performance Overview">
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
          </DashboardCard>
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