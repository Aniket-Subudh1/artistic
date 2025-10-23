'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { venueLayoutService, VenueLayout } from '@/services/venue-layout.service';
import VenueLayoutViewer from '@/components/public/VenueLayoutViewer';
import VenueLayoutLegend from '@/components/public/VenueLayoutLegend';

export default function VenueOwnerLayoutViewerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const locale = params?.locale as string | undefined;
  const { user, isLoading } = useAuthLogic();
  const [layout, setLayout] = useState<VenueLayout | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    if (id === 'edit') {
      router.replace(`${locale ? `/${locale}` : ''}/dashboard/venue-owner/layouts` as any);
      return;
    }
    
    const fetchLayout = async () => {
      try {
        console.log('Fetching layout with ID:', id);
        const l = await venueLayoutService.getLayoutById(id);
        console.log('Fetched layout:', l);
        setLayout(l);
      } catch (err: any) {
        console.error('Error fetching layout:', err);
        setError(err.message || 'Failed to load layout');
      }
    };
    
    fetchLayout();
  }, [id, locale, router]);

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading..." />;
  }

  if (error) {
    return (
      <RoleBasedRoute allowedRoles={["venue_owner"]} userRole={user.role}>
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">Error Loading Layout</h1>
          <p className="text-red-600">{error}</p>
          <p className="text-sm text-gray-500">Layout ID: {id}</p>
        </div>
      </RoleBasedRoute>
    );
  }

  if (!layout) {
    return <LoadingSpinner text="Loading layout..." />;
  }

  return (
    <RoleBasedRoute allowedRoles={["venue_owner"]} userRole={user.role}>
      <div className="space-y-4 max-w-full overflow-x-hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{layout.name}</h1>
          {layout.ownerCanEdit && (
            <Link
              href={`${locale ? `/${locale}` : ''}/dashboard/venue-owner/layouts/${id}/edit`}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              title="Edit this layout"
            >
              Edit
            </Link>
          )}
        </div>
        <div className="flex flex-col lg:flex-row gap-4 max-w-full min-h-[70vh]">
          <div className="min-w-0 flex-1 h-full min-h-[500px] rounded-md border bg-white p-2">
            <VenueLayoutViewer layout={layout} />
          </div>
          <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
            <VenueLayoutLegend layout={layout} />
          </div>
        </div>
      </div>
    </RoleBasedRoute>
  );
}
