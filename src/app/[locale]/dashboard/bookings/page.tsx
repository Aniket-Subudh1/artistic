'use client';

import React from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MyBookings } from '@/components/equipment-provider';
import ArtistMyBookings from '@/components/artist/ArtistMyBookings';

export default function GeneralBookingsPage() {
  const { user, isLoading } = useAuthLogic();

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading bookings..." />;
  }

  const renderBookingsComponent = () => {
    switch (user.role) {
      case 'equipment_provider':
        return (
          <div className="min-h-screen bg-gray-50">
            <DashboardHeader 
              title="My Equipment Bookings"
              subtitle="Manage your equipment and package bookings"
              user={user}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <MyBookings />
            </div>
          </div>
        );
      case 'artist':
        return <ArtistMyBookings />;
      case 'venue_owner':
        return (
          <div className="min-h-screen bg-gray-50">
            <DashboardHeader 
              title="My Venue Bookings"
              subtitle="Manage bookings for your venues"
              user={user}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Venue Bookings</h3>
                <p className="text-gray-600">Venue booking management component coming soon...</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
                <p className="text-gray-600">You don't have permission to view bookings.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <RoleBasedRoute allowedRoles={['artist', 'equipment_provider', 'venue_owner']} userRole={user.role}>
      {renderBookingsComponent()}
    </RoleBasedRoute>
  );
}