'use client';

import React from 'react';
import EventManagement from '@/components/admin/EventManagement';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function MyEventsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner text="Loading events..." />;
  }

  const role = (user?.role || '').toString().toUpperCase();
  const isAllowed = role === 'VENUE_OWNER' || role === 'ADMIN' || role === 'SUPER_ADMIN';

  if (!user || !isAllowed) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  const emRole: 'admin' | 'venue_owner' = (role === 'ADMIN' || role === 'SUPER_ADMIN') ? 'admin' : 'venue_owner';
  return <EventManagement userRole={emRole} />;
}




