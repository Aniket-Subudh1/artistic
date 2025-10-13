'use client';

import React, { useState, useEffect } from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStatsGrid } from '@/components/dashboard/DashboardStatsGrid';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  User, 
  Calendar, 
  Star, 
  TrendingUp, 
  Eye, 
  Heart,
  Music,
  Camera,
  Edit,
  FileText
} from 'lucide-react';
import { ArtistService, Artist } from '@/services/artist.service';
import Link from 'next/link';

export default function ArtistDashboard() {
  const { user, isLoading } = useAuthLogic();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArtistProfile = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (user?.id) {
          const profile = await ArtistService.getMyProfile();
          setArtist(profile);
        }
      } catch (err) {
        console.error('Error fetching artist profile:', err);
        setError('Failed to load artist profile');
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && user) {
      fetchArtistProfile();
    }
  }, [user?.id, isLoading]);

  if (isLoading || loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  if (!user) {
    return <div className="text-center">Please log in to view your dashboard.</div>;
  }

  const quickActions = [
    {
      title: 'View Profile',
      description: 'See your public profile',
      icon: User,
      href: '/dashboard/artist/profile',
      color: 'blue' as const
    },
    {
      title: 'Update Profile',
      description: 'Request profile changes',
      icon: Edit,
      href: '/dashboard/artist/profile/update',
      color: 'green' as const
    },
    {
      title: 'Portfolio',
      description: 'Manage your work',
      icon: Camera,
      href: '/dashboard/artist/portfolio',
      color: 'purple' as const
    },
    {
      title: 'Update Requests',
      description: 'Track your requests',
      icon: FileText,
      href: '/dashboard/artist/update-requests',
      color: 'orange' as const
    }
  ];

  return (
    <RoleBasedRoute allowedRoles={['artist']} userRole={user.role}>
      <div className="space-y-6">
        {/* Header */}
        <DashboardHeader
          title="Artist Dashboard"
          subtitle="Manage your artist profile and track your performance"
          user={user}
          userBadgeColor="bg-purple-100"
          userBadgeText="Artist"
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Profile Status */}
        {!artist ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-yellow-800">Artist Profile Not Found</h3>
                <p className="text-yellow-700 mt-1">
                  You need to be onboarded as an artist to access this dashboard. Please contact an administrator.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <DashboardStatsGrid stats={[
              {
                title: 'Total Likes',
                value: artist.likeCount,
                icon: Heart,
                iconColor: 'text-blue-600',
                iconBgColor: 'bg-blue-100'
              },
              {
                title: 'Experience',
                value: `${artist.yearsOfExperience} years`,
                icon: Star,
                iconColor: 'text-green-600',
                iconBgColor: 'bg-green-100'
              },
              {
                title: 'Rate/Hour',
                value: `$${artist.pricePerHour}`,
                icon: TrendingUp,
                iconColor: 'text-purple-600',
                iconBgColor: 'bg-purple-100'
              }
            ]} />

            {/* Quick Actions */}
            <QuickActions actions={quickActions} />

            {/* Profile Summary */}
            <DashboardCard title="Profile Summary">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100">
                  {artist.profileImage ? (
                    <img 
                      src={artist.profileImage} 
                      alt={artist.stageName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{artist.stageName}</h3>
                  <p className="text-gray-600 capitalize">{artist.category}</p>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {artist.about || 'No description available'}
                  </p>
                  
                  {/* Skills */}
                  {artist.skills && artist.skills.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {artist.skills.slice(0, 5).map((skill, index) => (
                          <span 
                            key={index}
                            className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {artist.skills.length > 5 && (
                          <span className="text-xs text-gray-500">+{artist.skills.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </DashboardCard>
          </>
        )}
      </div>
    </RoleBasedRoute>
  );
}