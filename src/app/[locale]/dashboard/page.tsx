'use client';

import React from 'react';
import { UnifiedDashboard } from '@/components/dashboard/UnifiedDashboard';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  const { user, isLoading } = useAuthLogic();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <UnifiedDashboard user={user} />
    </>
  );
}