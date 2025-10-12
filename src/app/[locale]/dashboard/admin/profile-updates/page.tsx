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
  Calendar
} from 'lucide-react';
import { AdminService, UpdateRequest as AdminUpdateRequest } from '@/services/admin.service';

interface UpdateRequest {
  _id: string;
  type?: 'PROFILE_UPDATE' | 'PORTFOLIO_ITEM';
  artist?: {
    _id: string;
    stageName: string;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  requestedChanges?: {
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
    title?: string;
    description?: string;
    type?: 'image' | 'video' | 'audio';
    fileUrl?: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    firstName: string;
    lastName: string;
  };
  adminComment?: string;
}

export default function AdminProfileUpdatesPage() {
  const { user, isLoading } = useAuthLogic();
  const [requests, setRequests] = useState<UpdateRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<UpdateRequest[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<UpdateRequest | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    if (user) {
      loadUpdateRequests();
    }
  }, [user]);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, statusFilter]);

  const loadUpdateRequests = async () => {
    setIsLoadingData(true);
    try {
      console.log('Fetching pending update requests...');
      const pendingRequests = await AdminService.getAllUpdateRequests();
      console.log('Received pending requests:', pendingRequests);
      setRequests(pendingRequests);
    } catch (error: any) {
      console.error('Error loading update requests:', error);
      setError('Failed to load update requests: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoadingData(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request => {
        const stageName = request.artist?.stageName || '';
        const firstName = request.artist?.user?.firstName || '';
        const lastName = request.artist?.user?.lastName || '';
        const email = request.artist?.user?.email || '';
        
        return stageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               email.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter.toUpperCase());
    }

    setFilteredRequests(filtered);
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
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
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

  const handleReviewRequest = async (requestId: string, approve: boolean) => {
    try {
      if (selectedRequest?.type === 'PORTFOLIO_ITEM') {
        await AdminService.reviewPortfolioItem(requestId, approve, reviewComment);
      } else {
        await AdminService.reviewProfileUpdateRequest(requestId, approve, reviewComment);
      }
      setSuccess(`Request ${approve ? 'approved' : 'rejected'} successfully!`);
      setShowReviewModal(false);
      setReviewComment('');
      loadUpdateRequests();
    } catch (error: any) {
      setError('Failed to review request: ' + (error.message || 'Unknown error'));
    }
  };

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading profile update requests..." />;
  }

  return (
    <RoleBasedRoute allowedRoles={['super_admin', 'admin']} userRole={user.role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Update Requests</h1>
            <p className="text-gray-600">Review and manage artist profile update requests</p>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span>Pending: {requests.filter(req => req.status === 'PENDING').length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Approved: {requests.filter(req => req.status === 'APPROVED').length}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(req => req.status === 'APPROVED').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(req => req.status === 'REJECTED').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by artist name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Requests List */}
        {isLoadingData ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No update requests found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No profile update requests to review at this time'
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artist
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Changes Requested
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
                  {filteredRequests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {request.artist?.user?.firstName?.charAt(0) || '?'}{request.artist?.user?.lastName?.charAt(0) || ''}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.artist?.stageName || 'Unknown Artist'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.artist?.user?.firstName || 'Unknown'} {request.artist?.user?.lastName || 'User'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.type === 'PORTFOLIO_ITEM' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {request.type === 'PORTFOLIO_ITEM' ? 'Portfolio Item' : 'Profile Update'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {request.type === 'PORTFOLIO_ITEM' 
                            ? request.requestedChanges?.title || 'New portfolio item'
                            : `${request.requestedChanges ? Object.keys(request.requestedChanges).length : 0} field(s)`
                          }
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.requestedChanges ? (
                            <>
                              {Object.keys(request.requestedChanges).slice(0, 2).join(', ')}
                              {Object.keys(request.requestedChanges).length > 2 && '...'}
                            </>
                          ) : (
                            'No changes specified'
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(request.submittedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
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
                          {request.status === 'PENDING' && (
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowReviewModal(true);
                              }}
                              className="text-purple-600 hover:text-purple-900 flex items-center"
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Review
                            </button>
                          )}
                        </div>
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
                  {/* Artist Info */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Artist Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Stage Name</p>
                        <p className="text-sm text-gray-900">{selectedRequest.artist?.stageName || 'Unknown Artist'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Full Name</p>
                        <p className="text-sm text-gray-900">
                          {selectedRequest.artist?.user?.firstName || 'Unknown'} {selectedRequest.artist?.user?.lastName || 'User'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Requested Changes */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {selectedRequest.type === 'PORTFOLIO_ITEM' ? 'Portfolio Item Details' : 'Requested Changes'}
                    </h3>
                    
                    {selectedRequest.type === 'PORTFOLIO_ITEM' ? (
                      <div className="space-y-4">
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-2">Title</p>
                          <p className="text-sm text-gray-900">{selectedRequest.requestedChanges?.title || 'No title'}</p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                          <p className="text-sm text-gray-900">{selectedRequest.requestedChanges?.description || 'No description'}</p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-2">Type</p>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {selectedRequest.requestedChanges?.type || 'Unknown'}
                          </span>
                        </div>
                        {selectedRequest.requestedChanges?.fileUrl && (
                          <div className="p-4 border border-gray-200 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-2">File Preview</p>
                            {selectedRequest.requestedChanges.type === 'image' ? (
                              <img 
                                src={selectedRequest.requestedChanges.fileUrl} 
                                alt="Portfolio item"
                                className="max-w-full h-auto max-h-64 rounded-lg"
                              />
                            ) : selectedRequest.requestedChanges.type === 'video' ? (
                              <video 
                                src={selectedRequest.requestedChanges.fileUrl} 
                                controls
                                className="max-w-full h-auto max-h-64 rounded-lg"
                              />
                            ) : selectedRequest.requestedChanges.type === 'audio' ? (
                              <audio 
                                src={selectedRequest.requestedChanges.fileUrl} 
                                controls
                                className="w-full"
                              />
                            ) : (
                              <a 
                                href={selectedRequest.requestedChanges.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                View File
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedRequest.requestedChanges ? Object.entries(selectedRequest.requestedChanges).map(([key, value]) => (
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
                        )) : (
                          <div className="col-span-2 text-center py-8 text-gray-500">
                            No changes specified
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status & Review Info */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Status</span>
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Submitted: {new Date(selectedRequest.submittedAt).toLocaleString()}
                    </div>
                    {selectedRequest.reviewedAt && (
                      <div className="text-sm text-gray-600">
                        Reviewed: {new Date(selectedRequest.reviewedAt).toLocaleString()}
                        {selectedRequest.reviewedBy && (
                          <span> by {selectedRequest.reviewedBy.firstName} {selectedRequest.reviewedBy.lastName}</span>
                        )}
                      </div>
                    )}
                    {selectedRequest.adminComment && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Admin Comment:</p>
                        <p className="text-sm text-gray-900">{selectedRequest.adminComment}</p>
                      </div>
                    )}
                  </div>
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

        {/* Review Request Modal */}
        {showReviewModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Review Update Request</h2>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      Reviewing request from <strong>{selectedRequest.artist?.stageName || 'Unknown Artist'}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Comment (Optional)
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Add a comment about your decision..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleReviewRequest(selectedRequest._id, true)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve Request
                    </button>
                    <button
                      onClick={() => handleReviewRequest(selectedRequest._id, false)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Request
                    </button>
                  </div>

                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
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