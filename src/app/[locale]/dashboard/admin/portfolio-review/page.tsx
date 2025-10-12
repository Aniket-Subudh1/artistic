'use client';

import React, { useState, useEffect } from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  User,
  MessageSquare,
  Calendar,
  Image as ImageIcon,
  Video,
  Music,
  ExternalLink,
  Play,
  Heart,
  Download
} from 'lucide-react';
import { ArtistService } from '@/services/artist.service';

interface PortfolioItem {
  _id: string;
  title: string;
  description: string;
  type: 'image' | 'video' | 'audio';
  fileUrl: string;
  thumbnailUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  artistProfile?: {
    _id: string;
    stageName: string;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPortfolioReviewPage() {
  const { user, isLoading } = useAuthLogic();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'audio'>('all');
  const [reviewingItem, setReviewingItem] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    if (user) {
      loadPendingPortfolioItems();
    }
  }, [user]);

  const loadPendingPortfolioItems = async () => {
    try {
      setLoading(true);
      console.log('Fetching pending portfolio items...');
      const items = await ArtistService.getPendingPortfolioItems();
      console.log('Received pending portfolio items:', items);
      setPortfolioItems(items);
    } catch (error) {
      console.error('Error loading portfolio items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (itemId: string, approve: boolean, comment?: string) => {
    try {
      setReviewingItem(itemId);
      
      console.log('Reviewing portfolio item:', { itemId, approve, comment });
      await ArtistService.reviewPortfolioItem(itemId, approve, comment);

      // Remove the reviewed item from the list
      setPortfolioItems(items => items.filter(item => item._id !== itemId));
      setReviewComment('');
      setSelectedItem(null);
    } catch (error) {
      console.error('Error reviewing portfolio item:', error);
      alert('Failed to review portfolio item');
    } finally {
      setReviewingItem(null);
    }
  };

  const filteredItems = portfolioItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.artistProfile?.stageName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Music className="h-4 w-4" />;
      default:
        return <ImageIcon className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image':
        return 'bg-blue-100 text-blue-800';
      case 'video':
        return 'bg-green-100 text-green-800';
      case 'audio':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading portfolio review..." />;
  }

  return (
    <RoleBasedRoute allowedRoles={['super_admin', 'admin']} userRole={user.role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portfolio Review</h1>
            <p className="text-gray-600">Review and approve pending portfolio submissions</p>
          </div>
          
          <div className="flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-full">
            <Clock className="h-4 w-4 text-yellow-600" />
            <span className="font-medium text-yellow-800">{portfolioItems.length} pending</span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by title, description, or artist name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
              </select>
            </div>
          </div>
        </div>

        {/* Portfolio Items Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">No pending portfolio items to review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Media Preview */}
                <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                  {item.type === 'image' && (
                    <img 
                      src={item.fileUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {item.type === 'video' && (
                    <div className="relative w-full h-full">
                      <img 
                        src={item.thumbnailUrl || item.fileUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                    </div>
                  )}
                  
                  {item.type === 'audio' && (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                      <div className="text-center text-white">
                        <Music className="h-16 w-16 mx-auto mb-2" />
                        <p className="text-lg font-medium">Audio Track</p>
                      </div>
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                      {getTypeIcon(item.type)}
                      <span className="ml-1 capitalize">{item.type}</span>
                    </span>
                  </div>

                  {/* Preview Button */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="bg-white bg-opacity-90 text-gray-700 p-2 rounded-full hover:bg-white transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    </div>
                  </div>

                  {/* Artist Info */}
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-medium text-xs">
                        {item.artistProfile?.stageName?.charAt(0) || 'A'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.artistProfile?.stageName || 'Unknown Artist'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-4 mb-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-3 w-3" />
                      <span>{item.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{item.views}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReview(item._id, true)}
                      disabled={reviewingItem === item._id}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        const comment = prompt('Enter rejection reason (optional):');
                        if (comment !== null) {
                          handleReview(item._id, false, comment);
                        }
                      }}
                      disabled={reviewingItem === item._id}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preview Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Preview: {selectedItem.title}</h3>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                {/* Media Display */}
                <div className="mb-6">
                  {selectedItem.type === 'image' && (
                    <img 
                      src={selectedItem.fileUrl} 
                      alt={selectedItem.title}
                      className="w-full max-h-96 object-contain rounded-lg"
                    />
                  )}
                  
                  {selectedItem.type === 'video' && (
                    <video 
                      src={selectedItem.fileUrl}
                      controls
                      className="w-full max-h-96 rounded-lg"
                    >
                      Your browser does not support video playback.
                    </video>
                  )}
                  
                  {selectedItem.type === 'audio' && (
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-8 text-center">
                      <Music className="h-16 w-16 text-white mx-auto mb-4" />
                      <audio src={selectedItem.fileUrl} controls className="w-full">
                        Your browser does not support audio playback.
                      </audio>
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedItem.title}</h4>
                    <p className="text-gray-600">{selectedItem.description}</p>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-medium">
                        {selectedItem.artistProfile?.stageName?.charAt(0) || 'A'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedItem.artistProfile?.stageName || 'Unknown Artist'}</p>
                      <p className="text-sm text-gray-500">
                        Uploaded on {new Date(selectedItem.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleReview(selectedItem._id, true);
                      setSelectedItem(null);
                    }}
                    disabled={reviewingItem === selectedItem._id}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Approve</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      const comment = prompt('Enter rejection reason (optional):');
                      if (comment !== null) {
                        handleReview(selectedItem._id, false, comment);
                        setSelectedItem(null);
                      }
                    }}
                    disabled={reviewingItem === selectedItem._id}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <XCircle className="h-5 w-5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleBasedRoute>
  );
}