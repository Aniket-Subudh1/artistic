'use client';

import React from 'react';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Navbar } from '@/components/main/Navbar';

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
      <DashboardContent user={user} />
    </>
  );
}