'use client';

import React from 'react';
import { UnifiedDashboard } from '@/components/dashboard/UnifiedDashboard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuthLogic();

  if (isLoading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <RoleBasedRoute allowedRoles={['super_admin', 'admin']} userRole={user.role}>
      <div className="space-y-6">
        <DashboardHeader
          title="Admin Dashboard"
          subtitle={`Welcome back, ${user.firstName}!`}
          user={user}
          userBadgeColor="bg-blue-100"
          userBadgeText={user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
        />
        <UnifiedDashboard user={user} />
      </div>
    </RoleBasedRoute>
  );
}