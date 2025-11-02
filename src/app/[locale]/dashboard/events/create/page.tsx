'use client';

import React from 'react';
import EventManagement from '@/components/admin/EventManagement';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function CreateEventPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner text="Loading..." />;
  }

  if (!user || !['admin', 'ADMIN', 'super_admin', 'SUPER_ADMIN', 'venue_owner', 'VENUE_OWNER'].includes(user.role)) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to create events.</p>
      </div>
    );
  }

  const userRole = user.role.toUpperCase() as 'admin' | 'venue_owner';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-gray-600 mt-2">Fill in the details below to create a new event.</p>
      </div>
      <EventManagement userRole={userRole} />
    </div>
  );
}




