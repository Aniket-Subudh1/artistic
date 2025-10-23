"use client";

import React from 'react';
import { VenueManagementOrchestrator } from '@/components/admin';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function VenueLayoutsPage() {
  const { user, isLoading } = useAuthLogic();

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading..." />;
  }

  return (
    <RoleBasedRoute allowedRoles={["admin", "super_admin"]} userRole={user.role}>
      <div className="w-full max-w-full overflow-hidden h-full">
        <VenueManagementOrchestrator />
      </div>
    </RoleBasedRoute>
  );
}
