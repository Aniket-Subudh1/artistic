'use client';

import React, { useState } from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { UserBookingsDashboard } from '@/components/booking/UserBookingsDashboard';
import { UserEquipmentPackageBookingsDashboard } from '@/components/booking/UserEquipmentPackageBookingsDashboard';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Calendar, Package, User, Settings } from 'lucide-react';

type BookingTab = 'artists' | 'packages';

export default function UserBookingsPage() {
  const { user, isLoading } = useAuthLogic();
  const [activeTab, setActiveTab] = useState<BookingTab>('artists');

  const tabs = [
    {
      id: 'artists' as BookingTab,
      label: 'Artist Bookings',
      icon: User,
      description: 'Your artist and event bookings'
    },
    {
      id: 'packages' as BookingTab,
      label: 'Equipment Packages',
      icon: Package,
      description: 'Your equipment package bookings'
    }
  ];

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading bookings dashboard..." />;
  }

  return (
    <RoleBasedRoute allowedRoles={['user']} userRole={user.role}>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader 
          title="My Bookings" 
          subtitle="Manage all your bookings in one place"
          user={user}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Tab Navigation */}
          <div className="mb-6 sm:mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex flex-col sm:flex-row gap-2 sm:gap-0 sm:space-x-8">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group py-3 sm:py-4 px-3 sm:px-1 border-b-2 sm:border-b-2 font-medium text-sm flex items-center gap-3 sm:gap-2 rounded-t-lg sm:rounded-none transition-colors ${
                        activeTab === tab.id
                          ? 'border-purple-500 text-purple-600 bg-purple-50 sm:bg-transparent'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 sm:hover:bg-transparent'
                      }`}
                    >
                      <IconComponent className="h-5 w-5 flex-shrink-0" />
                      <div className="text-left flex-1">
                        <div className="font-medium">{tab.label}</div>
                        <div className="text-xs text-gray-400 group-hover:text-gray-500 hidden sm:block">
                          {tab.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6">
              {activeTab === 'artists' && (
                <UserBookingsDashboard />
              )}
              
              {activeTab === 'packages' && (
                <UserEquipmentPackageBookingsDashboard userType="customer" />
              )}
            </div>
          </div>
        </div>
      </div>
    </RoleBasedRoute>
  );
}
