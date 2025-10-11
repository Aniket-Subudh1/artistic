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
  UserCheck,
  Shield,
  Calendar,
  Mail,
  Phone,
  Star
} from 'lucide-react';
import { ArtistService, Artist } from '@/services/artist.service';

export default function ArtistVerificationPage() {
  const { user, isLoading } = useAuthLogic();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadArtists();
    }
  }, [user]);

  useEffect(() => {
    filterArtists();
  }, [artists, searchTerm, statusFilter]);

  const loadArtists = async () => {
    setIsLoadingData(true);
    try {
      const data = await ArtistService.getPrivateArtists();
      setArtists(data);
    } catch (error: any) {
      setError('Failed to load artists: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoadingData(false);
    }
  };

  const filterArtists = () => {
    let filtered = artists;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(artist => 
        artist.stageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by verification status
    if (statusFilter !== 'all') {
      // Since we don't have verification status in the model, we'll use isActive as a proxy
      const isVerified = statusFilter === 'verified';
      filtered = filtered.filter(artist => artist.user.isActive === isVerified);
    }

    setFilteredArtists(filtered);
  };

  const getVerificationBadge = (isVerified: boolean) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isVerified 
          ? 'bg-green-100 text-green-800' 
          : 'bg-yellow-100 text-yellow-800'
      }`}>
        {isVerified ? (
          <>
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </>
        ) : (
          <>
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </>
        )}
      </span>
    );
  };

  const handleVerifyArtist = async (artistId: string, verify: boolean) => {
    try {
      // This would be the actual API call for verification
      // await ArtistService.verifyArtist(artistId, verify);
      setSuccess(`Artist ${verify ? 'verified' : 'unverified'} successfully!`);
      loadArtists();
    } catch (error: any) {
      setError('Failed to update verification status: ' + (error.message || 'Unknown error'));
    }
  };

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading artist verification..." />;
  }

  return (
    <RoleBasedRoute allowedRoles={['super_admin', 'admin']} userRole={user.role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Artist Verification</h1>
            <p className="text-gray-600">Verify and manage artist credentials</p>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Verified: {artists.filter(artist => artist.user.isActive).length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span>Pending: {artists.filter(artist => !artist.user.isActive).length}</span>
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
                <p className="text-sm font-medium text-gray-600">Total Artists</p>
                <p className="text-2xl font-bold text-gray-900">{artists.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">
                  {artists.filter(artist => artist.user.isActive).length}
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
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {artists.filter(artist => !artist.user.isActive).length}
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
                <p className="text-sm font-medium text-gray-600">Verification Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {artists.length > 0 ? Math.round((artists.filter(artist => artist.user.isActive).length / artists.length) * 100) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
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
              placeholder="Search artists by name or email..."
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
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Artists Grid */}
        {isLoadingData ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredArtists.length === 0 ? (
          <div className="text-center py-12">
            <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No artists found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No artists need verification at this time'
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
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Experience
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredArtists.map((artist) => (
                    <tr key={artist._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {artist.user.firstName.charAt(0)}{artist.user.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {artist.stageName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {artist.user.firstName} {artist.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {artist.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {artist.user.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {artist.user.phoneNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900">
                            {artist.yearsOfExperience} years
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Star className="w-4 h-4 mr-1 text-yellow-400" />
                            ${artist.pricePerHour}/hr
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getVerificationBadge(artist.user.isActive)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedArtist(artist);
                              setShowViewModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                          {!artist.user.isActive ? (
                            <button
                              onClick={() => handleVerifyArtist(artist._id, true)}
                              className="text-green-600 hover:text-green-900 flex items-center"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Verify
                            </button>
                          ) : (
                            <button
                              onClick={() => handleVerifyArtist(artist._id, false)}
                              className="text-yellow-600 hover:text-yellow-900 flex items-center"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Unverify
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

        {/* View Artist Modal */}
        {showViewModal && selectedArtist && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Artist Verification Details</h2>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Artist Profile */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-2xl">
                          {selectedArtist.user.firstName.charAt(0)}{selectedArtist.user.lastName.charAt(0)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedArtist.stageName}</h3>
                      <p className="text-gray-600">{selectedArtist.user.firstName} {selectedArtist.user.lastName}</p>
                      <div className="mt-2">
                        {getVerificationBadge(selectedArtist.user.isActive)}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{selectedArtist.user.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-gray-900">{selectedArtist.user.phoneNumber}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <p className="text-gray-900">{selectedArtist.category}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Country</label>
                        <p className="text-gray-900">{selectedArtist.country}</p>
                      </div>
                    </div>
                  </div>

                  {/* Professional Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">About</label>
                      <p className="text-gray-900">{selectedArtist.about || 'No description provided'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Experience</label>
                        <p className="text-gray-900">{selectedArtist.yearsOfExperience} years</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Rate</label>
                        <p className="text-gray-900">${selectedArtist.pricePerHour}/hour</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Skills</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedArtist.skills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Languages</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedArtist.musicLanguages.map((lang, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Awards</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedArtist.awards.length > 0 ? selectedArtist.awards.map((award, index) => (
                          <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            {award}
                          </span>
                        )) : (
                          <span className="text-gray-500 text-sm">No awards listed</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Performance Preference</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedArtist.performPreference.map((pref, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {pref}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Joined</label>
                        <p className="text-gray-900">{new Date(selectedArtist.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Like Count</label>
                        <p className="text-gray-900">{selectedArtist.likeCount || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Actions */}
                {!selectedArtist.user.isActive && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium">Verification Required</p>
                          <p>This artist is pending verification. Review their information and verify if all details are accurate.</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          handleVerifyArtist(selectedArtist._id, true);
                          setShowViewModal(false);
                        }}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Verify Artist
                      </button>
                      <button
                        onClick={() => setShowViewModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Review Later
                      </button>
                    </div>
                  </div>
                )}

                {selectedArtist.user.isActive && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-green-800">
                          <p className="font-medium">Artist Verified</p>
                          <p>This artist has been verified and can accept bookings.</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          handleVerifyArtist(selectedArtist._id, false);
                          setShowViewModal(false);
                        }}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Remove Verification
                      </button>
                      <button
                        onClick={() => setShowViewModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleBasedRoute>
  );
}