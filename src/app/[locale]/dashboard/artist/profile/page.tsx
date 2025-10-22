'use client';

import React, { useState, useEffect } from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArtistProfileUpdateModal } from '@/components/artist/ArtistProfileUpdateModal';
import { getYouTubeEmbedUrl } from '@/lib/youtube';
import { ArtistService, Artist } from '@/services/artist.service';
import { UserService, User as UserProfile } from '@/services/user.service';
import { ArtistPerformanceSettings } from '@/components/artist';
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
  Edit,
  Eye,
  TrendingUp,
  Clock,
  Camera,
  Play,
  ExternalLink,
  Badge,
  Settings
} from 'lucide-react';
import Link from 'next/link';

export default function ArtistProfilePage() {
  const { user, isLoading } = useAuthLogic();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnimating, setIsAnimating] = useState(false);

  const getBestProfileImage = () => {
    // Priority order: artist profileImage > user profilePicture > user avatar > fallback
    if (artist?.profileImage && artist.profileImage.trim() !== '') {
      return artist.profileImage;
    }
    if (userProfile?.profilePicture && userProfile.profilePicture.trim() !== '') {
      return userProfile.profilePicture;
    }
    if (userProfile?.avatar && userProfile.avatar.trim() !== '') {
      return userProfile.avatar;
    }
    // Return a professional fallback image
    return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
  };

  const fetchArtistProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Current user:', user);
      console.log('Auth token:', localStorage.getItem('authToken'));
      
      if (user?.id) {
        // Fetch both artist profile and user profile
        const [profile, userProfileData] = await Promise.all([
          ArtistService.getMyProfile(),
          UserService.getCurrentUserProfile()
        ]);
        
        console.log('🔍 Full artist profile data:', profile);
        console.log('🖼️ Artist profile image URL:', profile?.profileImage);
        console.log('� User profile data:', userProfileData);
        console.log('🖼️ User profile picture URL:', userProfileData?.profilePicture);
        console.log('🖼️ User avatar URL:', userProfileData?.avatar);
        
        setArtist(profile);
        setUserProfile(userProfileData);
        
        console.log('Profile images available:');
        console.log('- Artist profileImage:', profile?.profileImage);
        console.log('- User profilePicture:', userProfileData?.profilePicture);
        console.log('- User avatar:', userProfileData?.avatar);
      }
    } catch (err: any) {
      console.error('Error fetching profiles:', err);
      setError(`Failed to load profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && user) {
      fetchArtistProfile();
    }
  }, [user?.id, isLoading]);

  const handleUpdateSuccess = () => {
    setIsAnimating(true);
    fetchArtistProfile();
    setTimeout(() => setIsAnimating(false), 500);
  };

  if (isLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <div className="text-center">Please log in to view your profile.</div>;
  }

  return (
    <RoleBasedRoute allowedRoles={['artist']} userRole={user.role}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Hero Section with Cover Image */}
        {artist?.profileCoverImage && (
          <div className="relative h-64 overflow-hidden rounded-b-3xl shadow-xl mb-8">
            <img 
              src={artist.profileCoverImage} 
              alt="Profile Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{artist.stageName}</h1>
              <p className="text-blue-100 capitalize font-medium">{artist.category}</p>
            </div>
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="absolute top-6 right-6 inline-flex items-center px-4 py-2 bg-gray-900/80 backdrop-blur-sm text-white rounded-xl hover:bg-gray-900 transition-all duration-300 border border-gray-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          </div>
        )}

        {/* Header for profiles without cover image */}
        {!artist?.profileCoverImage && (
          <div className="bg-gradient-to-r from-[#391C71] to-[#4A1F85] rounded-2xl p-8 mb-8 text-white shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">My Artist Profile</h1>
                <p className="text-purple-100">Showcase your talent to the world</p>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="inline-flex items-center px-6 py-3 bg-gray-900/80 backdrop-blur-sm text-white rounded-xl hover:bg-gray-900 transition-all duration-300 border border-gray-700 group"
              >
                <Edit className="h-4 w-4 mr-2 group-hover:rotate-6 transition-transform duration-200" />
                Edit Profile
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm mb-6 animate-slide-in">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              {error}
            </div>
          </div>
        )}

        {/* Profile Not Found */}
        {!artist ? (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mr-6">
                <User className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-yellow-800 mb-2">Artist Profile Not Found</h3>
                <p className="text-yellow-700">
                  You need to be onboarded as an artist to access this profile. Please contact an administrator.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className={`transition-all duration-500 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start space-x-6">
                {/* Profile Image */}
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full border-4 border-[#391C71] overflow-hidden bg-gradient-to-br from-purple-100 to-purple-200 shadow-lg">
                    <img 
                      src={getBestProfileImage()} 
                      alt={artist.stageName || 'Artist Profile'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onLoad={(e) => {
                        // Hide fallback icon when image loads
                        const fallback = (e.currentTarget.parentElement?.querySelector('.fallback-icon') as HTMLElement);
                        if (fallback) {
                          fallback.style.display = 'none';
                        }
                      }}
                      onError={(e) => {
                        console.log('❌ Profile image failed to load from:', getBestProfileImage());
                        // Hide the broken image and show fallback
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                    <div 
                      className="fallback-icon w-full h-full flex items-center justify-center"
                      style={{ display: 'none' }}
                    >
                      <User className="h-10 w-10 text-[#391C71]" />
                    </div>
                  </div>
                  {/* Online Status Indicator */}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{artist.stageName}</h2>
                    <Badge className="h-5 w-5 text-[#391C71]" />
                  </div>
                  <p className="text-[#391C71] font-semibold capitalize mb-1">{artist.category}</p>
                  <p className="text-gray-600 mb-4">
                    {artist.user?.firstName} {artist.user?.lastName}
                  </p>

                  {/* Contact Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {artist.user?.email && (
                      <div className="flex items-center text-gray-600 hover:text-[#391C71] transition-colors">
                        <Mail className="h-4 w-4 mr-2 text-[#391C71]" />
                        <span className="text-sm">{artist.user.email}</span>
                      </div>
                    )}
                    {artist.user?.phoneNumber && (
                      <div className="flex items-center text-gray-600 hover:text-[#391C71] transition-colors">
                        <Phone className="h-4 w-4 mr-2 text-[#391C71]" />
                        <span className="text-sm">{artist.user.phoneNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600 hover:text-[#391C71] transition-colors">
                      <MapPin className="h-4 w-4 mr-2 text-[#391C71]" />
                      <span className="text-sm">{artist.country}</span>
                    </div>
                    <div className="flex items-center text-gray-600 hover:text-[#391C71] transition-colors">
                      <Calendar className="h-4 w-4 mr-2 text-[#391C71]" />
                      <span className="text-sm">{artist.yearsOfExperience} years experience</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="hidden lg:flex flex-col space-y-4">
                  <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 min-w-[120px] border border-purple-200">
                    <Heart className="h-6 w-6 text-red-500 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-gray-900">{artist.likeCount || 0}</div>
                    <div className="text-xs text-gray-600">Likes</div>
                  </div>
                  <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <DollarSign className="h-6 w-6 text-[#391C71] mx-auto mb-1" />
                    <div className="text-xl font-bold text-gray-900">{artist.pricePerHour} KWD</div>
                    <div className="text-xs text-gray-600">Per Hour</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 mb-8 bg-white p-2 rounded-xl shadow-lg border border-gray-100">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'skills', label: 'Skills & Talents', icon: Star },
                { id: 'media', label: 'Media Gallery', icon: Camera },
                { id: 'settings', label: 'Performance Settings', icon: Settings },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#391C71] to-[#4A1F85] text-white shadow-lg'
                      : 'text-gray-600 hover:text-[#391C71] hover:bg-purple-50'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
            {/* Tab Content */}
            <div className="space-y-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                  {/* About Section */}
                  <div className="lg:col-span-2">
                    {artist.about && (
                      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 hover:shadow-xl transition-all duration-300">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <User className="h-5 w-5 mr-2 text-[#391C71]" />
                        About Me
                      </h3>
                        <p className="text-gray-700 leading-relaxed text-lg">{artist.about}</p>
                      </div>
                    )}

                    {/* Quick Stats Mobile */}
                    <div className="lg:hidden grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center shadow-lg border border-purple-200">
                        <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">{artist.likeCount || 0}</div>
                        <div className="text-sm text-gray-600">Total Likes</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center shadow-lg border border-purple-200">
                        <DollarSign className="h-8 w-8 text-[#391C71] mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">{artist.pricePerHour} KWD</div>
                        <div className="text-sm text-gray-600">Per Hour</div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Status Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-[#391C71]" />
                        Profile Status
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Account Status</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            artist.user?.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {artist.user?.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Profile Views</span>
                          <span className="font-semibold text-gray-900 flex items-center">
                            <Eye className="h-4 w-4 mr-1 text-[#391C71]" />
                            {Math.floor(Math.random() * 1000) + 100}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Last Updated</span>
                          <span className="text-sm text-gray-500 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            2 days ago
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <Link
                          href="/dashboard/artist/portfolio"
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:text-[#391C71] hover:bg-purple-50 rounded-lg transition-all duration-200 group"
                        >
                          <Camera className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                          Manage Portfolio
                          <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <Link
                          href="/dashboard/artist/update-requests"
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:text-[#391C71] hover:bg-purple-50 rounded-lg transition-all duration-200 group"
                        >
                          <Clock className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                          View Update Requests
                          <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <button
                          onClick={() => setActiveTab('settings')}
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:text-[#391C71] hover:bg-purple-50 rounded-lg transition-all duration-200 group"
                        >
                          <Settings className="h-4 w-4 mr-3 group-hover:rotate-6 transition-transform" />
                          Performance Settings
                        </button>
                        <button
                          onClick={() => setIsUpdateModalOpen(true)}
                          className="flex items-center w-full px-4 py-3 text-sm text-[#391C71] hover:bg-purple-50 rounded-lg transition-all duration-200 group"
                        >
                          <Edit className="h-4 w-4 mr-3 group-hover:rotate-6 transition-transform" />
                          Request Profile Update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills Tab */}
              {activeTab === 'skills' && (
                <div className="animate-fade-in space-y-8">
                  {/* Skills */}
                  {artist.skills && artist.skills.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <Star className="h-6 w-6 mr-3 text-[#391C71]" />
                        Skills & Abilities
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {artist.skills.map((skill, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 text-[#391C71] px-4 py-3 rounded-xl text-sm font-medium text-center hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-105 cursor-default"
                          >
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Music Languages */}
                  {artist.musicLanguages && artist.musicLanguages.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <Music className="h-6 w-6 mr-3 text-[#391C71]" />
                        Music Languages
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {artist.musicLanguages.map((language, index) => (
                          <span
                            key={index}
                            className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 text-[#391C71] px-4 py-2 rounded-full text-sm font-medium hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-105 cursor-default"
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Genres */}
                  {artist.genres && artist.genres.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <Music className="h-6 w-6 mr-3 text-[#391C71]" />
                        Musical Genres
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {artist.genres.map((genre, index) => (
                          <span
                            key={index}
                            className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 text-[#391C71] px-4 py-2 rounded-full text-sm font-medium hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-105 cursor-default"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Performance Preferences */}
                  {artist.performPreference && artist.performPreference.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <Star className="h-6 w-6 mr-3 text-[#391C71]" />
                        Performance Preferences
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {artist.performPreference.map((preference, index) => (
                          <span
                            key={index}
                            className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 text-[#391C71] px-4 py-2 rounded-full text-sm font-medium hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-105 cursor-default"
                          >
                            {preference}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Media Tab */}
              {activeTab === 'media' && (
                <div className="animate-fade-in space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Cover Image */}
                    {artist.profileCoverImage && (
                      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Camera className="h-5 w-5 mr-2 text-[#391C71]" />
                          Cover Image
                        </h3>
                        <div className="relative group overflow-hidden rounded-xl">
                          <img 
                            src={artist.profileCoverImage} 
                            alt="Cover"
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Eye className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Demo Video */}
                    {artist.youtubeLink && getYouTubeEmbedUrl(artist.youtubeLink) && (
                      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Play className="h-5 w-5 mr-2 text-[#391C71]" />
                          Demo Video
                        </h3>
                        <div className="relative group overflow-hidden rounded-xl">
                          <iframe 
                            src={getYouTubeEmbedUrl(artist.youtubeLink)!} 
                            className="w-full aspect-video rounded-xl"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="Artist Demo Video"
                          />
                        </div>
                      </div>
                    )}

                    {!artist.profileCoverImage && !artist.youtubeLink && (
                      <div className="lg:col-span-2 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
                        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Media Uploaded</h3>
                        <p className="text-gray-500 mb-4">Upload your cover image and add YouTube demo video to showcase your work</p>
                        <button
                          onClick={() => setIsUpdateModalOpen(true)}
                          className="inline-flex items-center px-4 py-2 bg-[#391C71] text-white rounded-lg hover:bg-[#4A1F85] transition-colors"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Upload Media
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Achievements Tab */}
              {activeTab === 'achievements' && (
                <div className="animate-fade-in">
                  {artist.awards && artist.awards.length > 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <Award className="h-6 w-6 mr-3 text-[#391C71]" />
                        Awards & Recognition
                      </h3>
                      <div className="space-y-4">
                        {artist.awards.map((award, index) => (
                          <div key={index} className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                              <Award className="h-6 w-6 text-[#391C71]" />
                            </div>
                            <span className="text-gray-800 font-medium">{award}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
                      <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Awards Listed</h3>
                      <p className="text-gray-500 mb-4">Share your achievements and recognition to build credibility</p>
                      <button
                        onClick={() => setIsUpdateModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 bg-[#391C71] text-white rounded-lg hover:bg-[#4A1F85] transition-colors"
                      >
                        <Award className="h-4 w-4 mr-2" />
                        Add Achievements
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="animate-fade-in">
                  <ArtistPerformanceSettings
                    initialSettings={{
                      cooldownPeriodHours: artist.cooldownPeriodHours || 2,
                      maximumPerformanceHours: artist.maximumPerformanceHours || 4,
                    }}
                    onUpdate={(updatedSettings) => {
                      // Update the artist state with new settings
                      setArtist(prev => prev ? {
                        ...prev,
                        cooldownPeriodHours: updatedSettings.cooldownPeriodHours,
                        maximumPerformanceHours: updatedSettings.maximumPerformanceHours,
                      } : null);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Update Modal */}
        {artist && (
          <ArtistProfileUpdateModal
            isOpen={isUpdateModalOpen}
            onClose={() => setIsUpdateModalOpen(false)}
            artist={artist}
            onUpdateSuccess={handleUpdateSuccess}
          />
        )}
      </div>
    </RoleBasedRoute>
  );
}