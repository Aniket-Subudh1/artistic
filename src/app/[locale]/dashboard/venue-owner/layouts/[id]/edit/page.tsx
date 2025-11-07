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
    // If permission was revoked or not yet approved, show message and redirect
    return (
      <RoleBasedRoute allowedRoles={["venue_owner"]} userRole={user.role}>
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">Edit Permission Required</h1>
          <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">Cannot Edit Layout</h3>
                <div className="mt-2 text-sm text-orange-700">
                  <p>This layout is pending admin approval. You cannot edit it until an administrator grants you edit permissions.</p>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push(`${locale ? `/${locale}` : ''}/dashboard/venue-owner/layouts/${id}` as any)}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            View Layout Instead
          </button>
        </div>
      </RoleBasedRoute>
    );
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
