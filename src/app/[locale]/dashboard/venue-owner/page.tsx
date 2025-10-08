'use client';

import React from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function VenueOwnerDashboard() {
  const { user, isLoading } = useAuthLogic();

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading venue owner dashboard..." />;
  }

  return (
    <RoleBasedRoute allowedRoles={['venue_owner']} userRole={user.role}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Venue Owner Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">My Venues</h3>
            <p className="text-gray-600">Manage your venue listings</p>
          </div>
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">Bookings</h3>
            <p className="text-gray-600">View venue bookings</p>
          </div>
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">Calendar</h3>
            <p className="text-gray-600">Manage availability</p>
          </div>
        </div>
      </div>
    </RoleBasedRoute>
  );
}