
'use client';

import React from 'react';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  const { user, isLoading } = useAuthLogic();

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return <DashboardContent user={user} />;
}