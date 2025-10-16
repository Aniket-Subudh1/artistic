'use client';

import React from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { UserBookingsDashboard } from '@/components/booking/UserBookingsDashboard';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function UserBookingsPage() {
  const { user, isLoading } = useAuthLogic();

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading bookings dashboard..." />;
  }

  return (
    <RoleBasedRoute allowedRoles={['user']} userRole={user.role}>
      <div className="min-h-screen bg-gray-50">
        <UserBookingsDashboard />
      </div>
    </RoleBasedRoute>
  );
}
