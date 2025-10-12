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
  Plus
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
  proposedChnages: {
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

  useEffect(() => {
    if (user) {
      loadUpdateRequests();
    }
  }, [user]);

  const loadUpdateRequests = async () => {
    setIsLoadingData(true);
    try {
      const requests = await ArtistService.getMyUpdateRequests();
      setRequests(requests);
    } catch (error: any) {
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
                            {request.proposedChnages ? Object.keys(request.proposedChnages).length : 0} field(s) to update
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRequest.proposedChnages && Object.entries(selectedRequest.proposedChnages).map(([key, value]) => (
                        <div key={key} className="p-4 border border-gray-200 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 capitalize mb-2">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <div className="text-sm text-gray-900">
                            {Array.isArray(value) ? (
                              <div className="flex flex-wrap gap-1">
                                {value.map((item, index) => (
                                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p>{String(value)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
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