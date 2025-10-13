'use client';

import React, { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  const { user, isLoading } = useAuthLogic();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect users to their role-specific dashboard
      switch (user.role) {
        case 'equipment_provider':
          router.push('/dashboard/equipment-provider');
          break;
        case 'artist':
          router.push('/dashboard/artist');
          break;
        case 'admin':
        case 'super_admin':
          router.push('/dashboard/admin');
          break;
        case 'venue_owner':
          router.push('/dashboard/venue-owner');
          break;
        case 'user':
          router.push('/dashboard/user');
          break;
        default:
          // For any unhandled roles, stay on this page and show a message
          break;
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  if (!user) {
    return null;
  }

  // Fallback content for unknown roles
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user.firstName}! Your role ({user.role}) doesn't have a specific dashboard yet.
        </p>
      </div>
    </div>
  );
}