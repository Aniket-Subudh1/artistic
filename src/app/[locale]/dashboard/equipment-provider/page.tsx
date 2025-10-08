'use client';

import React from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function EquipmentProviderDashboard() {
  const { user, isLoading } = useAuthLogic();

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading equipment provider dashboard..." />;
  }

  return (
    <RoleBasedRoute allowedRoles={['equipment_provider']} userRole={user.role}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Equipment Provider Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Equipment Provider-specific content */}
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">My Equipment</h3>
            <p className="text-gray-600">Manage your equipment listings</p>
          </div>
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">Rental Requests</h3>
            <p className="text-gray-600">Handle rental requests</p>
          </div>
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">Revenue</h3>
            <p className="text-gray-600">Track your earnings</p>
          </div>
        </div>
      </div>
    </RoleBasedRoute>
  );
}