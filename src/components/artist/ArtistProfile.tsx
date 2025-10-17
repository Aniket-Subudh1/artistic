'use client';

import React, { useState, useEffect } from 'react';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Star, 
  Award, 
  DollarSign, 
  Music, 
  Languages,
  Heart,
  Edit,
  Camera,
  Play
} from 'lucide-react';
import { ArtistService, Artist } from '@/services/artist.service';
import { getYouTubeEmbedUrl } from '@/lib/youtube';

interface ArtistProfileProps {
  artistId?: string;
  isOwnProfile?: boolean;
}

export function ArtistProfile({ artistId, isOwnProfile = false }: ArtistProfileProps) {
  const { user, isLoading: authLoading } = useAuthLogic();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArtistProfile = async () => {
      try {
        setLoading(true);
        setError('');
        
        // For now, we'll fetch from the public list since there's no direct profile endpoint
        const artists = await ArtistService.getPublicArtists();
        
        if (isOwnProfile && user?.id) {
          const ownProfile = artists.find(a => a.user && a.user._id === user.id);
          setArtist(ownProfile || null);
        } else if (artistId) {
          const foundArtist = artists.find(a => a._id === artistId);
          setArtist(foundArtist || null);
        }
      } catch (err) {
        console.error('Error fetching artist profile:', err);
        setError('Failed to load artist profile');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchArtistProfile();
    }
  }, [artistId, isOwnProfile, user?.id, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="text-center py-8">
        <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isOwnProfile ? 'Profile Not Found' : 'Artist Not Found'}
        </h3>
        <p className="text-gray-500">
          {isOwnProfile ? 'You need to be onboarded as an artist first.' : 'The requested artist profile could not be found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          {artist.profileCoverImage && (
            <img 
              src={artist.profileCoverImage} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          )}
          {isOwnProfile && (
            <button className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70">
              <Camera className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
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
              {isOwnProfile && (
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700">
                  <Camera className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{artist.stageName}</h1>
                  <p className="text-gray-600">{artist.user?.firstName || 'Unknown'} {artist.user?.lastName || 'Artist'}</p>
                  <p className="text-sm text-gray-500 capitalize">{artist.category}</p>
                </div>
                {isOwnProfile && (
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                    <Edit className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-600">{artist.likeCount} likes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{artist.yearsOfExperience} years experience</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">{artist.pricePerHour} KWD/hour</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
            <p className="text-gray-700 leading-relaxed">
              {artist.about || 'No description available.'}
            </p>
          </div>

          {/* Demo Video */}
          {artist.youtubeLink && getYouTubeEmbedUrl(artist.youtubeLink) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Play className="h-5 w-5" />
                <span>Demo Video</span>
              </h2>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <iframe 
                  src={getYouTubeEmbedUrl(artist.youtubeLink)!} 
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Artist Demo Video"
                />
              </div>
            </div>
          )}

          {/* Skills */}
          {artist.skills && artist.skills.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Skills</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {artist.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Genres */}
          {artist.genres && artist.genres.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Music className="h-5 w-5" />
                <span>Genres</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {artist.genres.map((genre, index) => (
                  <span 
                    key={index}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              {artist.user?.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{artist.user.email}</span>
                </div>
              )}
              {artist.user?.phoneNumber && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{artist.user.phoneNumber}</span>
                </div>
              )}
              {artist.country && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{artist.country}</span>
                </div>
              )}
            </div>
          </div>

          {/* Languages */}
          {artist.musicLanguages && artist.musicLanguages.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Languages className="h-5 w-5" />
                <span>Languages</span>
              </h2>
              <div className="space-y-2">
                {artist.musicLanguages.map((language, index) => (
                  <span 
                    key={index}
                    className="block text-sm text-gray-700"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Awards */}
          {artist.awards && artist.awards.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Awards</span>
              </h2>
              <div className="space-y-2">
                {artist.awards.map((award, index) => (
                  <div key={index} className="text-sm text-gray-700">
                    {award}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Preference */}
          {artist.performPreference && artist.performPreference.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Preference</h2>
              <div className="space-y-2">
                {artist.performPreference.map((pref, index) => (
                  <span 
                    key={index}
                    className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm mr-2 mb-1 capitalize"
                  >
                    {pref}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ArtistProfile;
