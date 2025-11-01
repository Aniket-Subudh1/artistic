'use client';

import React from 'react';
import EventManagement from '@/components/admin/EventManagement';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AdminEventsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner text="Loading events..." />;
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  return <EventManagement userRole="admin" />;
}




