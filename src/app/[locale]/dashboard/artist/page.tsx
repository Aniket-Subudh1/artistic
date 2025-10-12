'use client';

import React, { useState, useEffect } from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
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
    return <LoadingSpinner />;
  }

  if (!user) {
    return <div className="text-center">Please log in to view your dashboard.</div>;
  }

  return (
    <RoleBasedRoute allowedRoles={['artist']} userRole={user.role}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Artist Dashboard</h1>
          <p className="text-gray-600">Manage your artist profile and track your performance</p>
        </div>

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
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Heart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Likes</p>
                    <p className="text-2xl font-bold text-gray-900">{artist.likeCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Star className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Experience</p>
                    <p className="text-2xl font-bold text-gray-900">{artist.yearsOfExperience} years</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Rate/Hour</p>
                    <p className="text-2xl font-bold text-gray-900">${artist.pricePerHour}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  href="/dashboard/artist/profile"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <User className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">View Profile</p>
                    <p className="text-sm text-gray-600">See your public profile</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/artist/profile/update"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Update Profile</p>
                    <p className="text-sm text-gray-600">Request profile changes</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/artist/portfolio"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Camera className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Portfolio</p>
                    <p className="text-sm text-gray-600">Manage your work</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/artist/update-requests"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="h-8 w-8 text-orange-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Update Requests</p>
                    <p className="text-sm text-gray-600">Track your requests</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Profile Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h2>
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
            </div>
          </>
        )}
      </div>
    </RoleBasedRoute>
  );
}