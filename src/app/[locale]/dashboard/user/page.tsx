'use client';

import React from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Calendar, Heart, Star, Package } from 'lucide-react';

export default function UserDashboard() {
  const { user, isLoading } = useAuthLogic();

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading user dashboard..." />;
  }

  const quickActions = [
    {
      title: 'My Bookings',
      description: 'View your event bookings',
      icon: Calendar,
      href: '/dashboard/user/bookings',
      color: 'blue' as const
    },
    {
      title: 'Equipment Packages',
      description: 'Browse and book equipment packages',
      icon: Package,
      href: '/equipment-packages',
      color: 'blue' as const
    },
    {
      title: 'Favorites',
      description: 'Your saved events and artists',
      icon: Heart,
      href: '/dashboard/user/favorites',
      color: 'red' as const
    },
    {
      title: 'Recommendations',
      description: 'Personalized recommendations',
      icon: Star,
      href: '/dashboard/user/recommendations',
      color: 'yellow' as const
    }
  ];

  return (
    <RoleBasedRoute allowedRoles={['user']} userRole={user.role}>
      <div className="space-y-6">
        <DashboardHeader
          title="User Dashboard"
          subtitle={`Welcome back, ${user.firstName}!`}
          user={user}
          userBadgeColor="bg-gray-100"
          userBadgeText="User"
        />
        
        <QuickActions actions={quickActions} />
      </div>
    </RoleBasedRoute>
  );
}