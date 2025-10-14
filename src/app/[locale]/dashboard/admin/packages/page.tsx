'use client';

import { useAuthLogic } from '@/hooks/useAuth';
import AdminPackageManagement from '@/components/admin/AdminPackageManagement';
import { Package } from 'lucide-react';

export default function AdminPackagesPage() {
  const { user, isLoading } = useAuthLogic();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">Access denied. Admin role required.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <AdminPackageManagement />
    </div>
  );
}