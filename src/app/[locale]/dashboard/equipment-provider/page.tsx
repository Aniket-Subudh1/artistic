'use client';

import React, { useState, useEffect } from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStatsGrid } from '@/components/dashboard/DashboardStatsGrid';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EquipmentService } from '@/services/equipment.service';
import { EquipmentProviderService } from '@/services/equipment-provider.service';
import { AddEquipmentModal } from '@/components/equipment-provider';
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
  Clock
} from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function EquipmentProviderDashboard() {
  const { user, isLoading } = useAuthLogic();
  const [stats, setStats] = useState({
    totalEquipment: 0,
    totalPackages: 0,
    totalBookingsThisMonth: 0,
    totalRevenue: 0,
    availableEquipment: 0,
  });
  const [recentEquipment, setRecentEquipment] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

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

      // Use real provider booking analytics
      const analytics = await EquipmentProviderService.getBookingAnalytics();

      setStats({
        totalEquipment: analytics.overview.totalEquipment,
        totalPackages: analytics.overview.totalPackages,
        totalBookingsThisMonth: analytics.overview.totalBookingsThisMonth,
        totalRevenue: analytics.overview.totalRevenue,
        availableEquipment: equipmentData.filter((item: any) => item.quantity > 0).length,
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
      title: 'Equipment Packages',
      description: 'Create and manage equipment packages',
      icon: Package,
      href: '/dashboard/equipment-provider/packages',
      color: 'blue' as const
    },
    {
      title: 'Bookings',
      description: 'Manage equipment and package bookings',
      icon: Calendar,
      href: '/dashboard/equipment-provider/bookings',
      color: 'green' as const
    },
    {
      title: 'Manage Equipment',
      description: 'View and edit your equipment listings',
      icon: Package,
      href: '/dashboard/equipment-provider/equipment-management',
      color: 'purple' as const
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

        {/* Stats Cards using real analytics */}
        <DashboardStatsGrid
          stats={[
            {
              title: 'Total Equipment',
              value: stats.totalEquipment,
              icon: Package,
              iconColor: 'text-blue-600',
              iconBgColor: 'bg-blue-100',
            },
            {
              title: 'Active Packages',
              value: stats.totalPackages,
              icon: Package,
              iconColor: 'text-orange-600',
              iconBgColor: 'bg-orange-100',
            },
            {
              title: 'Bookings (This Month)',
              value: stats.totalBookingsThisMonth,
              icon: Calendar,
              iconColor: 'text-purple-600',
              iconBgColor: 'bg-purple-100',
            },
            {
              title: 'Total Revenue',
              value: `$${Number(stats.totalRevenue).toFixed(2)}`,
              icon: DollarSign,
              iconColor: 'text-yellow-600',
              iconBgColor: 'bg-yellow-100',
            },
          ]}
        />

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left group"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Plus className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Add Equipment</h4>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Add new equipment to your inventory</p>
                </button>

                <Link
                  href="/dashboard/equipment-provider/equipment-management"
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left group"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Manage Equipment</h4>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">View and edit your equipment listings</p>
                </Link>

                {quickActions.map((action) => {
                  const Icon = action.icon;
                  const colorClasses = {
                    blue: 'hover:border-blue-300 hover:bg-blue-50',
                    green: 'hover:border-green-300 hover:bg-green-50',
                    purple: 'hover:border-purple-300 hover:bg-purple-50',
                    orange: 'hover:border-orange-300 hover:bg-orange-50',
                  };
                  const iconClasses = {
                    blue: 'text-blue-600 bg-blue-100 group-hover:bg-blue-200',
                    green: 'text-green-600 bg-green-100 group-hover:bg-green-200',
                    purple: 'text-purple-600 bg-purple-100 group-hover:bg-purple-200',
                    orange: 'text-orange-600 bg-orange-100 group-hover:bg-orange-200',
                  };

                  return (
                    <Link
                      key={action.title}
                      href={action.href}
                      className={`p-4 border border-gray-200 rounded-lg ${colorClasses[action.color]} transition-colors text-left block group`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${iconClasses[action.color]}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{action.title}</h4>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Recent Equipment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Equipment List */}
              <DashboardCard title="Recent Equipment">
                <div className="flex justify-between items-center mb-4">
                  <div></div>
                  <Link
                    href="/dashboard/equipment-provider/equipment-management"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All →
                  </Link>
                </div>
                {isLoadingData ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  </div>
                ) : recentEquipment.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No equipment yet</h4>
                    <p className="text-gray-600 mb-4">Start by adding your first equipment item</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Equipment
                    </button>
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
                          <p className="font-medium text-gray-900">{item.pricePerDay} KWD/day</p>
                          <p className="text-sm text-gray-500">{item.quantity} available</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DashboardCard>

              {/* Removed mock performance card */}
            </div>
            {/* Removed tips and mock system status sections */}
        {/* Add Equipment Modal */}
        <AddEquipmentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            loadDashboardData();
            setShowAddModal(false);
          }}
        />
      </div>
    </RoleBasedRoute>
  );
}