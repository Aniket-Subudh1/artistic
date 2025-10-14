'use client';

import React, { useState } from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EquipmentManagement, AddEquipmentModal } from '@/components/equipment-provider';
import { Plus, Package, CheckCircle } from 'lucide-react';

export default function EquipmentManagementPage() {
  const { user, isLoading } = useAuthLogic();
  const [showAddModal, setShowAddModal] = useState(false);

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading equipment management..." />;
  }

  return (
    <RoleBasedRoute allowedRoles={['equipment_provider']} userRole={user.role}>
      <div className="space-y-6">
        {/* Header */}
        <DashboardHeader
          title="Equipment Management"
          subtitle="Manage your equipment inventory and listings"
          user={user}
          userBadgeColor="bg-green-100"
          userBadgeText="Equipment Provider"
        />

        {/* Action Bar */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Equipment
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package className="w-4 h-4" />
              <span>Manage your equipment inventory</span>
            </div>
          </div>
        </div>

        {/* Equipment Management Component */}
        <EquipmentManagement 
          onAddEquipment={() => setShowAddModal(true)}
        />

        {/* Add Equipment Modal */}
        <AddEquipmentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            // The EquipmentManagement component will handle reloading data
          }}
        />
      </div>
    </RoleBasedRoute>
  );
}