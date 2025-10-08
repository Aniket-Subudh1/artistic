'use client';

import React from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ArtistDashboard() {
  const { user, isLoading } = useAuthLogic();

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading artist dashboard..." />;
  }

  return (
    <RoleBasedRoute allowedRoles={['artist']} userRole={user.role}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Artist Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Artist-specific content */}
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">My Profile</h3>
            <p className="text-gray-600">Manage your artist profile</p>
          </div>
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">Portfolio</h3>
            <p className="text-gray-600">Showcase your work</p>
          </div>
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">Bookings</h3>
            <p className="text-gray-600">View your bookings</p>
          </div>
        </div>
      </div>
    </RoleBasedRoute>
  );
}