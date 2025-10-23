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
      <div className="w-full max-w-full overflow-hidden h-full">
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