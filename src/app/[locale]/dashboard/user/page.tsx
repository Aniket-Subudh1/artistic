'use client';

import React from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function UserDashboard() {
  const { user, isLoading } = useAuthLogic();

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading user dashboard..." />;
  }

  return (
    <RoleBasedRoute allowedRoles={['user']} userRole={user.role}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">User Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User-specific content */}
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">My Bookings</h3>
            <p className="text-gray-600">View your event bookings</p>
          </div>
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">Favorites</h3>
            <p className="text-gray-600">Your saved events and artists</p>
          </div>
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">Recommendations</h3>
            <p className="text-gray-600">Personalized recommendations</p>
          </div>
        </div>
      </div>
    </RoleBasedRoute>
  );
}