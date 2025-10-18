'use client';

import React, { useState, useEffect } from 'react';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Camera, 
  Play, 
  Heart, 
  Eye, 
  Calendar, 
  Star,
  Upload,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Video,
  Music,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { ArtistService, Artist, PortfolioItem, CreatePortfolioItemRequest } from '@/services/artist.service';
import { getYouTubeEmbedUrl } from '@/lib/youtube';

export function ArtistPortfolio() {
  const { user, isLoading: authLoading } = useAuthLogic();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (user?.id) {
          try {
            // Try to fetch artist profile
            const profile = await ArtistService.getMyProfile();
            setArtist(profile);
            
            // If profile exists, fetch portfolio items
            const items = await ArtistService.getMyPortfolioItems();
            setPortfolioItems(items);
          } catch (profileError: any) {
            // If artist profile doesn't exist, that's okay - show empty state
            if (profileError.status === 404) {
              console.log('No artist profile found - user needs to create one');
              setArtist(null);
              setPortfolioItems([]);
            } else {
              throw profileError; // Re-throw other errors
            }
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load portfolio data');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
  }, [user?.id, authLoading]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this portfolio item?')) {
      try {
        await ArtistService.deletePortfolioItem(itemId);
        setPortfolioItems(items => items.filter(item => item._id !== itemId));
      } catch (err) {
        console.error('Delete error:', err);
        setError('Failed to delete portfolio item');
      }
    }
  };

  const filteredItems = portfolioItems.filter(item => {
    if (selectedTab === 'all') return true;
    return item.status.toLowerCase() === selectedTab;
  });

  const renderPortfolioItem = (item: PortfolioItem) => {
    return (
      <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {/* Media Content */}
        <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
          {item.type === 'video' && (
            <>
              <img 
                src={item.thumbnailUrl} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button className="bg-white bg-opacity-95 text-gray-800 p-4 rounded-full hover:bg-white transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg">
                  <Play className="h-6 w-6 ml-0.5" />
                </button>
              </div>
              {/* File Type Badge */}
              <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-xs flex items-center space-x-1">
                <Video className="h-3 w-3" />
                <span>Video</span>
              </div>
            </>
          )}
          
          {item.type === 'image' && (
            <>
              <img 
                src={item.fileUrl} 
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* File Type Badge */}
              <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-xs flex items-center space-x-1">
                <ImageIcon className="h-3 w-3" />
                <span>Image</span>
              </div>
            </>
          )}
          
          {item.type === 'audio' && (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500">
              <div className="text-center text-white">
                <div className="bg-white bg-opacity-20 rounded-full p-6 mb-4 mx-auto w-fit">
                  <Music className="h-12 w-12" />
                </div>
                <p className="text-lg font-medium">Audio Track</p>
              </div>
              {/* File Type Badge */}
              <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-xs flex items-center space-x-1">
                <Music className="h-3 w-3" />
                <span>Audio</span>
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            {getStatusBadge(item.status)}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={() => handleDeleteItem(item._id)}
              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-semibold text-gray-900 mb-2 text-lg leading-tight">{item.title}</h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
          
          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5 bg-gray-50 px-2 py-1 rounded-full">
                <Heart className="h-3 w-3 text-red-400" />
                <span className="font-medium">{item.likes}</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-gray-50 px-2 py-1 rounded-full">
                <Eye className="h-3 w-3 text-blue-400" />
                <span className="font-medium">{item.views}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-gray-400">
              <Calendar className="h-3 w-3" />
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Review Comment for Rejected Items */}
          {item.status === 'REJECTED' && item.reviewComment && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800 mb-1">Admin Feedback:</p>
                  <p className="text-sm text-red-700">{item.reviewComment}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

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
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <Camera className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Artist Profile Required
          </h3>
          <p className="text-gray-600 mb-6">
            You need to have an artist profile to access the portfolio feature. 
            Please contact an administrator to set up your artist profile.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Only administrators can create artist profiles at this time. 
              Once your profile is set up, you'll be able to upload and manage your portfolio items.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Portfolio</h1>
            <p className="text-gray-600 text-lg">Showcase your best work and creative performances</p>
            {artist && (
              <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  {artist.stageName}
                </span>
                <span>•</span>
                <span>{portfolioItems.length} items</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowUploadModal(true)}
            disabled={uploading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Item</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 mt-8 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 w-fit">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedTab === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setSelectedTab('pending')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedTab === 'pending'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Pending</span>
            </div>
          </button>
          <button
            onClick={() => setSelectedTab('approved')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedTab === 'approved'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Approved</span>
            </div>
          </button>
          <button
            onClick={() => setSelectedTab('rejected')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedTab === 'rejected'
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4" />
              <span>Rejected</span>
            </div>
          </button>
        </div>
      </div>

      {/* Portfolio Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(renderPortfolioItem)}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="max-w-sm mx-auto">
            <div className="mb-6">
              <Camera className="mx-auto h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {selectedTab === 'all' ? 'No Portfolio Items Yet' : `No ${selectedTab} Items Found`}
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {selectedTab === 'all' 
                ? 'Start building your portfolio by uploading your best work. Share your creativity with the world!'
                : `You don't have any ${selectedTab} portfolio items yet. Upload some ${selectedTab} content to get started.`
              }
            </p>
            <button 
              onClick={() => setShowUploadModal(true)}
              disabled={uploading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 mx-auto font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="h-5 w-5" />
              <span>Upload Your First Item</span>
            </button>
          </div>
        </div>
      )}

      {/* Demo Video Section */}
      {artist.youtubeLink && getYouTubeEmbedUrl(artist.youtubeLink) && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Featured Demo Video</span>
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Upload Portfolio Item</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                
                if (uploading) return; // Prevent multiple submissions
                
                const formData = new FormData(e.currentTarget);
                const file = formData.get('file') as File;
                const title = formData.get('title') as string;
                const description = formData.get('description') as string;
                
                if (!file || !title.trim()) {
                  return;
                }

                // Determine file type based on MIME type
                let type: 'image' | 'video' | 'audio';
                if (file.type.startsWith('image/')) {
                  type = 'image';
                } else if (file.type.startsWith('video/')) {
                  type = 'video';
                } else if (file.type.startsWith('audio/')) {
                  type = 'audio';
                } else {
                  return;
                }

                try {
                  setUploading(true);
                  setError('');
                  
                  await ArtistService.createPortfolioItem({ title: title.trim(), description: description.trim(), type }, file);
                  
                  // Refresh portfolio items
                  const items = await ArtistService.getMyPortfolioItems();
                  setPortfolioItems(items);
                  
                  setShowUploadModal(false);
                  
                  // Reset form
                  (e.target as HTMLFormElement).reset();
                } catch (err: any) {
                  console.error('Upload error:', err);
                  setError(err?.message || 'Failed to upload portfolio item');
                } finally {
                  setUploading(false);
                }
              }}>
                <div className="space-y-5">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose File <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        name="file"
                        accept="image/*,video/*,audio/*"
                        required
                        disabled={uploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const fileType = document.getElementById('file-type-indicator');
                            if (fileType) {
                              let icon = '📄';
                              let label = 'File';
                              if (file.type.startsWith('image/')) {
                                icon = '🖼️';
                                label = 'Image';
                              } else if (file.type.startsWith('video/')) {
                                icon = '🎥';
                                label = 'Video';
                              } else if (file.type.startsWith('audio/')) {
                                icon = '🎵';
                                label = 'Audio';
                              }
                              fileType.innerHTML = `${icon} ${label} - ${file.name}`;
                            }
                          }
                        }}
                        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100"
                      />
                      <div id="file-type-indicator" className="mt-2 text-sm text-gray-600 flex items-center">
                        <ImageIcon className="h-4 w-4 mr-1" />
                        Select an image, video, or audio file
                      </div>
                    </div>
                  </div>
                  
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      disabled={uploading}
                      placeholder="Enter a catchy title for your work"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={4}
                      disabled={uploading}
                      placeholder="Describe your work, inspiration, or any details you'd like to share..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                    />
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <XCircle className="h-5 w-5 text-red-400 mr-2" />
                        <span className="text-red-800 text-sm">{error}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    disabled={uploading}
                    className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2 min-w-[120px] justify-center"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Upload</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArtistPortfolio;
