// src/components/admin/ApplicationManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download, 
  User, 
  Mail, 
  Calendar,
  FileText,
  Video,
  AlertCircle,
  Search,
  Filter,
  MessageSquare,
  Users,
  Trash2
} from 'lucide-react';
import { ApplicationService, Application } from '@/services/application.service';

export function ApplicationManagement() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter, typeFilter]);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const data = await ApplicationService.getAllApplications();
      setApplications(data);
    } catch (error: any) {
      setError('Failed to load applications: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter.toUpperCase());
    }

    // Filter by application type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(app => app.applicationType.toLowerCase() === typeFilter.toLowerCase());
    }

    setFilteredApplications(filtered);
  };

  const handleReviewApplication = async (action: 'approve' | 'reject') => {
    if (!selectedApplication) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await ApplicationService.reviewApplication(
        selectedApplication._id,
        action,
        reviewComment
      );

      setSuccess(response.message);
      setShowReviewModal(false);
      setSelectedApplication(null);
      setReviewComment('');
      
      // Reload applications
      await loadApplications();
    } catch (error: any) {
      setError('Failed to review application: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReviewModal = (application: Application) => {
    setSelectedApplication(application);
    setShowReviewModal(true);
    setReviewComment('');
  };

  const handleDeleteApplication = async (applicationId: string, applicantName: string) => {
    if (!confirm(`Are you sure you want to delete the application from ${applicantName}? This action cannot be undone.`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await ApplicationService.deleteApplication(applicationId);
      setSuccess(response.message || 'Application deleted successfully');
      
      // Reload applications
      await loadApplications();
    } catch (error: any) {
      setError('Failed to delete application: ' + (error.message || 'Unknown error'));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        label: 'Pending',
        classes: 'bg-yellow-100 text-yellow-800',
        icon: Clock
      },
      APPROVED: {
        label: 'Approved',
        classes: 'bg-green-100 text-green-800',
        icon: CheckCircle
      },
      REJECTED: {
        label: 'Rejected',
        classes: 'bg-red-100 text-red-800',
        icon: XCircle
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status || 'Unknown',
      classes: 'bg-gray-100 text-gray-800',
      icon: Clock
    };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getApplicationTypeLabel = (type: string) => {
    return type === 'Solo' ? 'Solo Artist' : 'Team/Group';
  };

  const getApplicationTypeBadge = (type: string) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        type === 'Solo' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
      }`}>
        {type === 'Solo' ? <User className="w-3 h-3 mr-1" /> : <Users className="w-3 h-3 mr-1" />}
        {getApplicationTypeLabel(type)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Management</h1>
          <p className="text-gray-600">Review and manage artist applications</p>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span>Pending: {applications.filter(app => app.status === 'PENDING').length}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span>Approved: {applications.filter(app => app.status === 'APPROVED').length}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span>Rejected: {applications.filter(app => app.status === 'REJECTED').length}</span>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter(app => app.status === 'PENDING').length}
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
              <p className="text-sm font-medium text-gray-600">Solo Artists</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter(app => app.applicationType === 'Solo').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Teams/Groups</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter(app => app.applicationType === 'Team').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
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
            placeholder="Search by name or email..."
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
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="all">All Types</option>
          <option value="solo">Solo Artist</option>
          <option value="team">Team/Group</option>
        </select>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No applications have been submitted yet'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
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
                {filteredApplications.map((application) => (
                  <tr key={application._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {application.fullName.split(' ').map(n => n.charAt(0)).join('').substring(0, 2)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {application.fullName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {application.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {application.age} years, {application.gender}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getApplicationTypeBadge(application.applicationType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(application.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(application.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openReviewModal(application)}
                          className="text-purple-600 hover:text-purple-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </button>
                        {application.resume && (
                          <a
                            href={application.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            CV
                          </a>
                        )}
                        {application.videoLink && (
                          <a
                            href={application.videoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <Video className="w-4 h-4 mr-1" />
                            Video
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteApplication(application._id, application.fullName)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          title="Delete Application"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Review Application</h2>
              <p className="text-gray-600 mt-1">
                Application from {selectedApplication.fullName}
              </p>
            </div>

            <div className="p-6">
              {/* Application Details */}
              <div className="space-y-4 mb-6">
                {/* Profile Image */}
                {selectedApplication.profileImage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                    <div className="flex justify-center">
                      <img
                        src={selectedApplication.profileImage}
                        alt={`${selectedApplication.fullName}'s profile`}
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-gray-900">{selectedApplication.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Age</label>
                    <p className="text-gray-900">{selectedApplication.age} years</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <p className="text-gray-900">{selectedApplication.gender}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Application Type</label>
                    <div className="mt-1">
                      {getApplicationTypeBadge(selectedApplication.applicationType)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedApplication.status)}
                    </div>
                  </div>
                </div>

                {selectedApplication.performPreference && selectedApplication.performPreference.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Performance Preferences</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.performPreference.map((preference, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                        >
                          {preference.charAt(0).toUpperCase() + preference.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedApplication.videoLink && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Portfolio Video</label>
                    <a
                      href={selectedApplication.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center mt-1"
                    >
                      <Video className="w-4 h-4 mr-1" />
                      View Portfolio Video
                    </a>
                  </div>
                )}

                {selectedApplication.resume && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CV/Resume</label>
                    <a
                      href={selectedApplication.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center mt-1"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download CV/Resume
                    </a>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Submitted At</label>
                  <p className="text-gray-900">{new Date(selectedApplication.createdAt).toLocaleString()}</p>
                </div>
              
              </div>

              {selectedApplication.status === 'PENDING' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="reviewComment" className="block text-sm font-medium text-gray-700 mb-1">
                      Review Comment
                    </label>
                    <textarea
                      id="reviewComment"
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Add a comment about your decision..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleReviewApplication('approve')}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReviewApplication('reject')}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Already reviewed message */}
              {selectedApplication.status !== 'PENDING' && (
                  <div className={`p-4 rounded-lg ${
                  selectedApplication.status === 'APPROVED' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {selectedApplication.status === 'APPROVED' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`font-medium ${
                      selectedApplication.status === 'APPROVED' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      This application has been {selectedApplication.status}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedApplication(null);
                    setReviewComment('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (selectedApplication) {
                      handleDeleteApplication(selectedApplication._id, selectedApplication.fullName);
                      setShowReviewModal(false);
                      setSelectedApplication(null);
                      setReviewComment('');
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}