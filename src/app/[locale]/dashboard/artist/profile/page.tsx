'use client';

import React, { useState, useEffect } from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArtistService, Artist } from '@/services/artist.service';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Star, 
  Heart,
  DollarSign,
  Music,
  Award,
  Edit
} from 'lucide-react';
import Link from 'next/link';

export default function ArtistProfilePage() {
  const { user, isLoading } = useAuthLogic();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArtistProfile = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('Current user:', user);
        console.log('Auth token:', localStorage.getItem('authToken'));
        
        if (user?.id) {
          const profile = await ArtistService.getMyProfile();
          setArtist(profile);
        }
      } catch (err: any) {
        console.error('Error fetching artist profile:', err);
        setError(`Failed to load artist profile: ${err.message}`);
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
    return <div className="text-center">Please log in to view your profile.</div>;
  }

  return (
    <RoleBasedRoute allowedRoles={['artist']} userRole={user.role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Artist Profile</h1>
            <p className="text-gray-600">View and manage your artist profile information</p>
          </div>
          <Link
            href="/dashboard/artist/profile/update"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Request Update
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Profile Not Found */}
        {!artist ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-yellow-800">Artist Profile Not Found</h3>
                <p className="text-yellow-700 mt-1">
                  You need to be onboarded as an artist to access this profile. Please contact an administrator.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                
                {/* Profile Header */}
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-20 h-20 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100">
                    {artist.profileImage ? (
                      <img 
                        src={artist.profileImage} 
                        alt={artist.stageName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{artist.stageName}</h3>
                    <p className="text-gray-600 capitalize">{artist.category}</p>
                    <p className="text-sm text-gray-500">
                      {artist.user?.firstName} {artist.user?.lastName}
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {artist.user?.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">{artist.user.email}</span>
                    </div>
                  )}
                  {artist.user?.phoneNumber && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">{artist.user.phoneNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{artist.country}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{artist.yearsOfExperience} years experience</span>
                  </div>
                </div>

                {/* About */}
                {artist.about && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">About</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{artist.about}</p>
                  </div>
                )}
              </div>

              {/* Skills and Specializations */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills & Specializations</h2>
                
                {/* Skills */}
                {artist.skills && artist.skills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {artist.skills.map((skill, index) => (
                        <span 
                          key={index}
                          className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Music Languages */}
                {artist.musicLanguages && artist.musicLanguages.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Music Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {artist.musicLanguages.map((language, index) => (
                        <span 
                          key={index}
                          className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Genres */}
                {artist.genres && artist.genres.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Genres</h4>
                    <div className="flex flex-wrap gap-2">
                      {artist.genres.map((genre, index) => (
                        <span 
                          key={index}
                          className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Performance Preferences */}
                {artist.performPreference && artist.performPreference.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Performance Preferences</h4>
                    <div className="flex flex-wrap gap-2">
                      {artist.performPreference.map((preference, index) => (
                        <span 
                          key={index}
                          className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {preference}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Awards */}
              {artist.awards && artist.awards.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Awards & Recognition</h2>
                  <div className="space-y-2">
                    {artist.awards.map((award, index) => (
                      <div key={index} className="flex items-center">
                        <Award className="h-4 w-4 text-yellow-500 mr-2" />
                        <span className="text-gray-700">{award}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Stats</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm text-gray-600">Total Likes</span>
                    </div>
                    <span className="font-semibold text-gray-900">{artist.likeCount || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-600">Rate/Hour</span>
                    </div>
                    <span className="font-semibold text-gray-900">${artist.pricePerHour}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-2" />
                      <span className="text-sm text-gray-600">Status</span>
                    </div>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      artist.user?.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {artist.user?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Media */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Media</h2>
                
                {/* Cover Image */}
                {artist.profileCoverImage && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Cover Image</h4>
                    <img 
                      src={artist.profileCoverImage} 
                      alt="Cover"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Demo Video */}
                {artist.demoVideo && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Demo Video</h4>
                    <video 
                      src={artist.demoVideo} 
                      controls
                      className="w-full rounded-lg"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {!artist.profileCoverImage && !artist.demoVideo && (
                  <p className="text-gray-500 text-sm">No media uploaded</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                
                <div className="space-y-2">
                  <Link
                    href="/dashboard/artist/portfolio"
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Manage Portfolio
                  </Link>
                  <Link
                    href="/dashboard/artist/update-requests"
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    View Update Requests
                  </Link>
                  <Link
                    href="/dashboard/artist/profile/update"
                    className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Request Profile Update
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleBasedRoute>
  );
}