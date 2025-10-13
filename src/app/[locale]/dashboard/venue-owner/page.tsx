'use client';

import React from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MapPin, Calendar, Settings } from 'lucide-react';

export default function VenueOwnerDashboard() {
  const { user, isLoading } = useAuthLogic();

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading venue owner dashboard..." />;
  }

  const quickActions = [
    {
      title: 'My Venues',
      description: 'Manage your venue listings',
      icon: MapPin,
      href: '/dashboard/venue-owner/venues',
      color: 'blue' as const
    },
    {
      title: 'Bookings',
      description: 'View venue bookings',
      icon: Calendar,
      href: '/dashboard/venue-owner/bookings',
      color: 'green' as const
    },
    {
      title: 'Calendar',
      description: 'Manage availability',
      icon: Settings,
      href: '/dashboard/venue-owner/calendar',
      color: 'orange' as const
    }
  ];

  return (
    <RoleBasedRoute allowedRoles={['venue_owner']} userRole={user.role}>
      <div className="space-y-6">
        <DashboardHeader
          title="Venue Owner Dashboard"
          subtitle={`Welcome back, ${user.firstName}!`}
          user={user}
          userBadgeColor="bg-orange-100"
          userBadgeText="Venue Owner"
        />
        
        <QuickActions actions={quickActions} />
      </div>
    </RoleBasedRoute>
  );
}