'use client';

import React from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { EnhancedUnifiedUserBookingsDashboard } from '@/components/booking/EnhancedUnifiedUserBookingsDashboard';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function UserBookingsPage() {
  const { user, isLoading } = useAuthLogic();

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <LoadingSpinner text="Loading bookings dashboard..." />
      </div>
    );
  }

  return (
    <RoleBasedRoute allowedRoles={['user']} userRole={user.role}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <EnhancedUnifiedUserBookingsDashboard />
        </div>
      </div>
    </RoleBasedRoute>
  );
}
