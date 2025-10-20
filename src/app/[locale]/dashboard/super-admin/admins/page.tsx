'use client';

import React from 'react';
import { AdminManagement } from '@/components/admin';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function SuperAdminAdminsPage() {
  const { user, isLoading } = useAuthLogic();

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading admin management..." />;
  }

  return (
    <RoleBasedRoute allowedRoles={['super_admin']} userRole={user.role}>
      <AdminManagement />
    </RoleBasedRoute>
  );
}