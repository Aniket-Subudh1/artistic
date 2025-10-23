'use client';

import React, { useEffect, useState } from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Link } from '@/i18n/routing';
import { venueLayoutService, VenueLayout } from '@/services/venue-layout.service';
import { VenueProviderService, VenueProvider } from '@/services/venue-provider.service';

export default function VenueOwnerLayoutsPage() {
  const { user, isLoading } = useAuthLogic();
  const [layouts, setLayouts] = useState<VenueLayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Helper function to validate ObjectId format
  const isValidObjectId = (id: string): boolean => {
    return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const fetchLayouts = async () => {
      try {
        console.log('Current user:', user);
        
        // Fetch venue owner profile to get the correct profile _id used by layouts
        const profileResponse = await VenueProviderService.getMyProfile().catch((error) => {
          console.error('Error fetching venue owner profile:', error);
          return null;
        });
        console.log('Full profile response:', profileResponse);
        
        let ownerId = undefined;
        
        // Parse the profile response more carefully
        if (profileResponse) {
          if ((profileResponse as any).profileData && Array.isArray((profileResponse as any).profileData)) {
            const profileArray = (profileResponse as any).profileData;
            console.log('Profile data array:', profileArray);
            
            if (profileArray.length > 0 && profileArray[0]._id) {
              ownerId = profileArray[0]._id;
              console.log('Extracted owner ID from profile:', ownerId);
            } else {
              console.warn('Profile array is empty or missing _id');
            }
          } else {
            console.warn('Invalid profile response structure:', profileResponse);
          }
        } else {
          console.warn('No profile response received');
        }
        
        // Validate the owner ID before using it
        if (ownerId && isValidObjectId(ownerId)) {
          console.log('Using valid ownerId for layouts fetch:', ownerId);
          
          const ls = await venueLayoutService.getAllLayouts({ venueOwnerId: ownerId });
          console.log('Fetched layouts for owner:', ls);
          if (!cancelled) setLayouts(ls);
        } else {
          if (ownerId) {
            console.error('Invalid ObjectId format for owner ID:', ownerId);
            setProfileError('Invalid venue owner profile ID format');
          } else {
            console.warn('No venue owner profile found. This user may not have a venue owner profile set up yet.');
            setProfileError('Venue owner profile not found. Please contact an administrator to set up your profile.');
          }
          console.log('No valid owner ID found, showing empty state');
          
          // For venue owners without a profile, show empty state rather than all layouts
          if (!cancelled) setLayouts([]);
        }
      } catch (e: any) {
        console.error('Error fetching layouts:', e);
        console.error('Error details:', e.message, e.status);
        
        // If it's a 401 error, it might be an auth issue
        if (e.status === 401) {
          setProfileError('Authentication error. Please try logging in again.');
        } else if (e.message?.includes('Invalid venueOwnerId')) {
          setProfileError('Invalid venue owner profile. Please contact support.');
        } else {
          setProfileError('Error loading venue layouts. Please try again later.');
        }
        
        // Gracefully handle API errors (e.g., invalid ObjectId)
        if (!cancelled) setLayouts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLayouts();
    return () => { cancelled = true; };
  }, [user]);

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading venue owner..." />;
  }
  if (loading) {
    return <LoadingSpinner text="Loading your venue layouts..." />;
  }

  return (
    <RoleBasedRoute allowedRoles={["venue_owner"]} userRole={user.role}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">My Venue Layouts</h1>
          <Link 
            href="/dashboard/venue-owner/layouts/new"
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create New Layout
          </Link>
        </div>
        {profileError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Profile Setup Required</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  {profileError}
                </div>
              </div>
            </div>
          </div>
        )}
        {layouts.length === 0 && !profileError ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 mb-4">No layouts yet.</p>
            <Link 
              href="/dashboard/venue-owner/layouts/new"
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Create Your First Layout
            </Link>
          </div>
        ) : (
          <ul className="divide-y border rounded-md">
            {layouts.map((l) => (
              <li key={l._id} className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{l.name}</div>
                  <div className="text-xs text-gray-500">{new Date(l.updatedAt).toLocaleString()}</div>
                  <div className="text-xs text-blue-600">
                    {l.ownerCanEdit ? 'Editable' : 'Read-only'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/venue-owner/layouts/${l._id}`} className="text-blue-600 text-sm underline">
                    View
                  </Link>
                  {l.ownerCanEdit && (
                    <Link href={`/dashboard/venue-owner/layouts/${l._id}/edit`} className="text-green-600 text-sm underline">
                      Edit
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </RoleBasedRoute>
  );
}
