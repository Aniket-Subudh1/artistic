'use client';

import React from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AdminDashboard() {
  const { user, isLoading } = useAuthLogic();

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading admin dashboard..." />;
  }

  return (
    <RoleBasedRoute allowedRoles={['super_admin', 'admin']} userRole={user.role}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Admin-specific content */}
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">User Management</h3>
            <p className="text-gray-600">Manage all platform users</p>
          </div>
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">Content Moderation</h3>
            <p className="text-gray-600">Review and moderate content</p>
          </div>
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">Analytics</h3>
            <p className="text-gray-600">View platform analytics</p>
          </div>
        </div>
      </div>
    </RoleBasedRoute>
  );
}