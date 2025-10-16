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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                        activeTab === tab.id
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <div className="text-left">
                        <div>{tab.label}</div>
                        <div className="text-xs text-gray-400 group-hover:text-gray-500">
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
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6">
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
