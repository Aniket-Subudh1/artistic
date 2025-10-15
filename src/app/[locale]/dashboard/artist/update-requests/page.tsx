'use client';

import React, { useState, useEffect } from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArtistService } from '@/services/artist.service';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Calendar,
  User,
  Plus,
  Download
} from 'lucide-react';
import Link from 'next/link';

interface UpdateRequest {
  _id: string;
  artistProfile: {
    _id: string;
    stageName: string;
  };
  artistUser: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  requestedChanges: {
    stageName?: string;
    about?: string;
    yearsOfExperience?: number;
    skills?: string[];
    musicLanguages?: string[];
    awards?: string[];
    pricePerHour?: number;
    performPreference?: string[];
    category?: string;
    country?: string;
    genres?: string[];
    profileImage?: string;
    profileCoverImage?: string;
    demoVideo?: string;
  };
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  adminComment?: string;
}

export default function ArtistUpdateRequestsPage() {
  const { user, isLoading } = useAuthLogic();
  const [requests, setRequests] = useState<UpdateRequest[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<UpdateRequest | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const getFieldDisplayName = (fieldName: string): string => {
    const fieldNames: Record<string, string> = {
      'about': 'About',
      'yearsOfExperience': 'Years of Experience',
      'pricePerHour': 'Price Per Hour',
      'musicLanguages': 'Music Languages',
      'performPreference': 'Performance Preferences',
      'profileImage': 'Profile Image',
      'profileCoverImage': 'Cover Image',
      'demoVideo': 'Demo Video',
      'stageName': 'Stage Name',
      'category': 'Category',
      'skills': 'Skills',
      'genres': 'Genres',
      'awards': 'Awards & Achievements',
      'country': 'Country'
    };
    return fieldNames[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').trim();
  };

  useEffect(() => {
    if (user) {
      loadUpdateRequests();
    }
  }, [user]);

  const loadUpdateRequests = async () => {
    setIsLoadingData(true);
    try {
      const requests = await ArtistService.getMyUpdateRequests();
      console.log('Loaded update requests:', requests);
      setRequests(requests);
    } catch (error: any) {
      console.error('Error loading update requests:', error);
      setError('Failed to load update requests: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoadingData(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading update requests..." />;
  }

  return (
    <RoleBasedRoute allowedRoles={['artist']} userRole={user.role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Update Requests</h1>
            <p className="text-gray-600">Track your profile update requests</p>
          </div>
          <Link
            href="/dashboard/artist/profile/update"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(req => req.status === 'PENDING').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(req => req.status === 'ACCEPTED').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {isLoadingData ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No update requests</h3>
            <p className="text-gray-600">You haven't submitted any profile update requests yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Profile Update Request
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.requestedChanges ? Object.keys(request.requestedChanges).length : 0} field(s) to update
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              console.log('Selected request data:', request);
                              setSelectedRequest(request);
                              setShowViewModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View Request Modal */}
        {showViewModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Update Request Details</h2>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Status & Dates */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Status</p>
                        {getStatusBadge(selectedRequest.status)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Submitted</p>
                        <p className="text-sm text-gray-600">
                          {new Date(selectedRequest.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {selectedRequest.reviewedAt && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Reviewed</p>
                          <p className="text-sm text-gray-600">
                            {new Date(selectedRequest.reviewedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Requested Changes */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Requested Changes</h3>
                    {/* Debug: Show raw data */}
                    {process.env.NODE_ENV === 'development' && (
                      <details className="mb-4 p-2 bg-gray-100 rounded text-xs">
                        <summary className="cursor-pointer">Debug: Raw request data</summary>
                        <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(selectedRequest, null, 2)}</pre>
                      </details>
                    )}
                    
                    {selectedRequest.requestedChanges && Object.keys(selectedRequest.requestedChanges).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(selectedRequest.requestedChanges).map(([key, value]) => (
                          <div key={key} className="p-4 border border-gray-200 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              {getFieldDisplayName(key)}
                            </p>
                            <div className="text-sm text-gray-900">
                              {/* Handle media fields specifically */}
                              {(key === 'profileImage' || key === 'profileCoverImage') && typeof value === 'string' && value && (value.includes('http') || value.includes('amazonaws.com') || value.includes('s3')) ? (
                                <div className="space-y-2">
                                  <div className="relative">
                                    <img 
                                      src={value} 
                                      alt={key === 'profileImage' ? 'Profile Image' : 'Cover Image'}
                                      className="max-w-full h-auto max-h-48 rounded-lg border border-gray-200 shadow-sm"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).nextElementSibling!.className = 'block text-red-600 text-xs';
                                      }}
                                    />
                                    <p className="hidden">Failed to load image. <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Original</a></p>
                                  </div>
                                  <a 
                                    href={value} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-blue-600 hover:underline text-xs"
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View Full Size
                                  </a>
                                </div>
                              ) : key === 'demoVideo' && typeof value === 'string' && value && (value.includes('http') || value.includes('amazonaws.com') || value.includes('s3')) ? (
                                <div className="space-y-2">
                                  <div className="relative">
                                    <video 
                                      src={value} 
                                      controls
                                      className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200 shadow-sm"
                                      onError={(e) => {
                                        (e.target as HTMLVideoElement).style.display = 'none';
                                        (e.target as HTMLVideoElement).nextElementSibling!.className = 'block text-red-600 text-xs';
                                      }}
                                    >
                                      Your browser does not support the video tag.
                                    </video>
                                    <p className="hidden">Failed to load video. <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download Video</a></p>
                                  </div>
                                  <div className="flex gap-2">
                                    <a 
                                      href={value} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-blue-600 hover:underline text-xs"
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      Open in New Tab
                                    </a>
                                    <a 
                                      href={value} 
                                      download
                                      className="inline-flex items-center text-green-600 hover:underline text-xs"
                                    >
                                      <Download className="h-3 w-3 mr-1" />
                                      Download
                                    </a>
                                  </div>
                                </div>
                              ) : Array.isArray(value) ? (
                                <div className="flex flex-wrap gap-1">
                                  {value.map((item, index) => (
                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              ) : typeof value === 'string' && value.length > 100 ? (
                                <div className="space-y-2">
                                  <p className="line-clamp-3">{value}</p>
                                  <button
                                    onClick={(e) => {
                                      const target = e.target as HTMLButtonElement;
                                      const textElement = target.previousElementSibling as HTMLParagraphElement;
                                      if (textElement.classList.contains('line-clamp-3')) {
                                        textElement.classList.remove('line-clamp-3');
                                        target.textContent = 'Show Less';
                                      } else {
                                        textElement.classList.add('line-clamp-3');
                                        target.textContent = 'Show More';
                                      }
                                    }}
                                    className="text-blue-600 hover:underline text-xs"
                                  >
                                    Show More
                                  </button>
                                </div>
                              ) : (
                                <p className="break-words">{String(value)}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h4 className="text-lg font-medium text-gray-700 mb-2">No Changes Found</h4>
                        <p className="text-sm">This request appears to be empty or the changes couldn't be loaded.</p>
                        <p className="text-xs mt-2 text-gray-400">Please contact support if this seems incorrect.</p>
                      </div>
                    )}
                  </div>

                  {/* Admin Comment */}
                  {selectedRequest.adminComment && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Comment</h3>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">{selectedRequest.adminComment}</p>
                        {selectedRequest.reviewedBy && (
                          <p className="text-xs text-blue-600 mt-2">
                            - {selectedRequest.reviewedBy.firstName} {selectedRequest.reviewedBy.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
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