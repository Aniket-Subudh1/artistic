"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { venueLayoutService, VenueLayout } from '@/services/venue-layout.service';
import VenueLayoutManagement from '@/components/admin/VenueLayoutManagement';

export default function VenueOwnerEditLayoutPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const locale = params?.locale as string | undefined;
  const { user, isLoading } = useAuthLogic();
  const [layout, setLayout] = useState<VenueLayout | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || id === 'edit') {
      setError('Invalid layout URL. Missing layout ID.');
      return;
    }
    (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        console.log('[Owner Edit] Fetching layout with ID:', id);
        const l = await venueLayoutService.getLayoutById(id);
        setLayout(l);
      } catch (e: any) {
        if (e?.name === 'AbortError') {
          setError('Request timed out while loading layout. Please try again.');
        } else {
          setError(e?.message || 'Failed to load layout');
        }
      } finally {
        clearTimeout(timeout);
      }
    })();
  }, [id]);

  if (isLoading || !user) return <LoadingSpinner text="Loading..." />;

  if (error) {
    return (
      <RoleBasedRoute allowedRoles={["venue_owner"]} userRole={user.role}>
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">Error Loading Layout</h1>
          <p className="text-red-600">{error}</p>
          <div>
            <button
              className="mt-2 inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              onClick={() => {
                setError(null);
                setLayout(null);
                // trigger effect again by setting a noop; id in deps will rerun
                // or force reload
                window.location.reload();
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </RoleBasedRoute>
    );
  }

  if (!layout) return <LoadingSpinner text="Loading layout..." />;

  if (!layout.ownerCanEdit) {
    // If permission was revoked, redirect back to view page
    router.replace(`${locale ? `/${locale}` : ''}/dashboard/venue-owner/layouts/${id}` as any);
    return null;
  }

  return (
    <RoleBasedRoute allowedRoles={["venue_owner"]} userRole={user.role}>
      <div className="w-full max-w-full overflow-hidden h-full">
        <VenueLayoutManagement
          initialLayout={layout}
          isOwnerEditing
          initialMode="admin"
          showModeToggle={false}
          onBack={() => router.push(`${locale ? `/${locale}` : ''}/dashboard/venue-owner/layouts/${id}` as any)}
        />
      </div>
    </RoleBasedRoute>
  );
}
