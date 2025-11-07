"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import VenueLayoutManagement from '@/components/admin/VenueLayoutManagement';

export default function VenueOwnerCreateLayoutPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string | undefined;
  const { user, isLoading } = useAuthLogic();

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading..." />;
  }

  return (
    <RoleBasedRoute allowedRoles={["venue_owner"]} userRole={user.role}>
      <div className="w-full max-w-full overflow-hidden h-full space-y-4">
        {/* Admin Approval Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Important: Admin Approval Required</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Once you create this layout, it will be saved as <strong>read-only</strong>. An administrator must review and approve it before you can edit or use it for events. You will be able to view the layout but not modify it until approval is granted.</p>
              </div>
            </div>
          </div>
        </div>

        <VenueLayoutManagement
          isOwnerEditing
          initialMode="admin"
          showModeToggle={false}
          onBack={() => router.push(`${locale ? `/${locale}` : ''}/dashboard/venue-owner/layouts` as any)}
        />
      </div>
    </RoleBasedRoute>
  );
}