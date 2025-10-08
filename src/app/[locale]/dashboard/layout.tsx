'use client';

import React from 'react';
import { useRouter } from '@/i18n/routing';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthLogic } from '@/hooks/useAuth';

export default function DashboardLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuthLogic();

 

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading dashboard..." />;
  }

  if (!user) {
    return <LoadingSpinner fullScreen text="Redirecting to login..." />;
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      {children}
    </DashboardLayout>
  );
}