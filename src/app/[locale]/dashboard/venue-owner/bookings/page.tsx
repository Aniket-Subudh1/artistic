'use client';

import React from 'react';
import VenueOwnerMyBookings from '@/components/venue-owner/VenueOwnerMyBookings';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';

export default function VenueOwnerBookingsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading bookings..." />;
  }

  return (
    <RoleBasedRoute allowedRoles={['venue_owner']} userRole={user.role}>
      <VenueOwnerMyBookings />
    </RoleBasedRoute>
  );
}
