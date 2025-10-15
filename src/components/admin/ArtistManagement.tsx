'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Star, 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Mail,
  Phone,
  User,
  UserCheck,
  UserX,
  X,
  EyeOff
} from 'lucide-react';
import { ArtistService, Artist, ArtistType } from '@/services/artist.service';
import { AdminService } from '@/services/admin.service';
import { UserService } from '@/services/user.service';

export function ArtistManagement() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistTypes, setArtistTypes] = useState<ArtistType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [createArtistForm, setCreateArtistForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    stageName: '',
    about: '',
    yearsOfExperience: 0,
    skills: [] as string[],
    musicLanguages: [] as string[],
    awards: [] as string[],
    pricePerHour: 0,
    gender: '',
    artistType: '',
    category: '',
    country: '',
    performPreference: [] as string[]
  });

  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newAward, setNewAward] = useState('');
  const [newPerformPreference, setNewPerformPreference] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [artistsData, typesData] = await Promise.all([
        ArtistService.getPrivateArtists(),
        ArtistService.getArtistTypes(),
      ]);
      setArtists(artistsData);
      setArtistTypes(typesData);
    } catch (error: any) {
      setError('Failed to load data: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleArtistStatus = async (userId: string) => {
    setError('');
    setSuccess('');

    try {
      await UserService.toggleUserStatus(userId);
      setSuccess('Artist status updated successfully!');
      loadData();
    } catch (error: any) {
      setError('Failed to update artist status: ' + (error.message || 'Unknown error'));
    }
  };

  const handleToggleArtistVisibility = async (artistId: string, currentVisibility: boolean) => {
    setError('');
    setSuccess('');

    try {
      await ArtistService.toggleArtistVisibility(artistId, !currentVisibility);
      setSuccess(`Artist ${!currentVisibility ? 'shown' : 'hidden'} on homepage successfully!`);
      loadData();
    } catch (error: any) {
      setError('Failed to update artist visibility: ' + (error.message || 'Unknown error'));
    }
  };

  const handleCreateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate required fields
    if (!createArtistForm.firstName || !createArtistForm.lastName || !createArtistForm.email || 
        !createArtistForm.phoneNumber || !createArtistForm.stageName || !createArtistForm.artistType ||
        !createArtistForm.category || !createArtistForm.country || !createArtistForm.gender) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await ArtistService.createArtist(createArtistForm);
      setSuccess('Artist created successfully!');
      setShowCreateModal(false);
      // Reset form
      setCreateArtistForm({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        stageName: '',
        about: '',
        yearsOfExperience: 0,
        skills: [],
        musicLanguages: [],
        awards: [],
        pricePerHour: 0,
        gender: '',
        artistType: '',
        category: '',
        country: '',
        performPreference: []
      });
      setNewSkill('');
      setNewLanguage('');
      setNewAward('');
      setNewPerformPreference('');
      loadData();
    } catch (error: any) {
      setError('Failed to create artist: ' + (error.message || 'Unknown error'));
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !createArtistForm.skills.includes(newSkill.trim())) {
      setCreateArtistForm(prev => ({ 
        ...prev, 
        skills: [...prev.skills, newSkill.trim()] 
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setCreateArtistForm(prev => ({ 
      ...prev, 
      skills: prev.skills.filter(s => s !== skill) 
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !createArtistForm.musicLanguages.includes(newLanguage.trim())) {
      setCreateArtistForm(prev => ({ 
        ...prev, 
        musicLanguages: [...prev.musicLanguages, newLanguage.trim()] 
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setCreateArtistForm(prev => ({ 
      ...prev, 
      musicLanguages: prev.musicLanguages.filter(l => l !== language) 
    }));
  };

  const addAward = () => {
    if (newAward.trim() && !createArtistForm.awards.includes(newAward.trim())) {
      setCreateArtistForm(prev => ({ 
        ...prev, 
        awards: [...prev.awards, newAward.trim()] 
      }));
      setNewAward('');
    }
  };

  const removeAward = (award: string) => {
    setCreateArtistForm(prev => ({ 
      ...prev, 
      awards: prev.awards.filter(a => a !== award) 
    }));
  };

  const addPerformPreference = () => {
    if (newPerformPreference.trim() && !createArtistForm.performPreference.includes(newPerformPreference.trim())) {
      setCreateArtistForm(prev => ({ 
        ...prev, 
        performPreference: [...prev.performPreference, newPerformPreference.trim()] 
      }));
      setNewPerformPreference('');
    }
  };

  const removePerformPreference = (preference: string) => {
    setCreateArtistForm(prev => ({ 
      ...prev, 
      performPreference: prev.performPreference.filter(p => p !== preference) 
    }));
  };

  const filteredArtists = artists.filter(artist => {
  const matchesSearch = (artist.stageName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
             (artist.user?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
             (artist.user?.lastName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         (artist.category || '').toLowerCase() === selectedFilter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Artist Management</h1>
          <p className="text-gray-600">Manage artists and their profiles</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Artist
          </button>
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Artists</p>
              <p className="text-2xl font-bold text-gray-900">{artists.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Artists</p>
              <p className="text-2xl font-bold text-gray-900">
                {artists.filter(artist => !!artist.user?.isActive).length}
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
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{artistTypes.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                ${artists.length > 0 ? Math.round(artists.reduce((sum, artist) => sum + artist.pricePerHour, 0) / artists.length) : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
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
            placeholder="Search artists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="all">All Categories</option>
          <option value="music">Music</option>
          <option value="dance">Dance</option>
          <option value="art">Art</option>
          <option value="theater">Theater</option>
        </select>
      </div>

      {/* Artists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtists.map((artist) => (
          <div key={artist._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 bg-gradient-to-br from-purple-500 to-blue-600">
              {artist.profileCoverImage ? (
                <img 
                  src={artist.profileCoverImage} 
                  alt={artist.stageName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold">
                        {(artist.user?.firstName?.charAt(0) || 'A')}{(artist.user?.lastName?.charAt(0) || 'R')}
                      </span>
                    </div>
                    <p className="text-sm">{artist.stageName}</p>
                  </div>
                </div>
              )}
              
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                {artist.category}
              </div>

              <div className="absolute top-4 left-4 flex flex-col gap-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  artist.user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {artist.user?.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  artist.isVisible !== false ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {artist.isVisible !== false ? 'Visible' : 'Hidden'}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{artist.stageName || 'Unknown Artist'}</h3>
                  <p className="text-sm text-gray-600">{artist.user?.firstName || 'Unknown'} {artist.user?.lastName || 'Artist'}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{artist.likeCount || 0}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{artist.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{artist.yearsOfExperience} years experience</span>
                </div>
                <div className="font-semibold text-gray-900">
                  ${artist.pricePerHour}/hour
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => {
                    setSelectedArtist(artist);
                    setShowViewModal(true);
                  }}
                  className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button 
                  onClick={() => artist.user && handleToggleArtistStatus(artist.user._id)}
                  disabled={!artist.user}
                  className={`flex-1 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                    !artist.user 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : artist.user?.isActive 
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                  title={
                    !artist.user 
                      ? 'No user account linked' 
                      : artist.user?.isActive ? 'Deactivate Artist' : 'Activate Artist'
                  }
                >
                  {!artist.user ? (
                    <>
                      <User className="w-4 h-4" />
                      No User
                    </>
                  ) : artist.user?.isActive ? (
                    <>
                      <UserX className="w-4 h-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Activate
                    </>
                  )}
                </button>
                <button 
                  onClick={() => handleToggleArtistVisibility(artist._id, artist.isVisible !== false)}
                  className={`flex-1 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                    artist.isVisible !== false
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={artist.isVisible !== false ? 'Hide from Homepage' : 'Show on Homepage'}
                >
                  {artist.isVisible !== false ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Show
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredArtists.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No artists found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}

      {/* View Artist Modal */}
      {showViewModal && selectedArtist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Artist Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Artist Header */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">
                      {(selectedArtist.user?.firstName?.charAt(0) || 'A')}{(selectedArtist.user?.lastName?.charAt(0) || 'R')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedArtist.stageName}</h3>
                  <p className="text-gray-600">{selectedArtist.user?.firstName || 'Unknown'} {selectedArtist.user?.lastName || 'Artist'}</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                    selectedArtist.user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedArtist.user?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedArtist.user?.email || '—'}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{selectedArtist.user?.phoneNumber || '—'}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Category</label>
                    <p className="text-gray-900">{selectedArtist.category}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Country</label>
                    <p className="text-gray-900">{selectedArtist.country}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Experience</label>
                    <p className="text-gray-900">{selectedArtist.yearsOfExperience} years</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Rate</label>
                    <p className="text-gray-900">${selectedArtist.pricePerHour}/hour</p>
                  </div>
                </div>

                {/* About */}
                <div>
                  <label className="block font-medium text-gray-700 mb-1">About</label>
                  <p className="text-gray-900">{selectedArtist.about || 'No description provided'}</p>
                </div>

                {/* Skills */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedArtist.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Languages</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedArtist.musicLanguages.map((lang, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6">
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

      {/* Create Artist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New Artist</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateArtist} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={createArtistForm.firstName}
                        onChange={(e) => setCreateArtistForm(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={createArtistForm.lastName}
                        onChange={(e) => setCreateArtistForm(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={createArtistForm.email}
                        onChange={(e) => setCreateArtistForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={createArtistForm.phoneNumber}
                        onChange={(e) => setCreateArtistForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Artist Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Artist Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stage Name *
                      </label>
                      <input
                        type="text"
                        value={createArtistForm.stageName}
                        onChange={(e) => setCreateArtistForm(prev => ({ ...prev, stageName: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={createArtistForm.category}
                        onChange={(e) => setCreateArtistForm(prev => ({ ...prev, category: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">Select Category</option>
                        <option value="VOCALIST">Vocalist</option>
                        <option value="INSTRUMENTALIST">Instrumentalist</option>
                        <option value="BAND">Band</option>
                        <option value="DJ">DJ</option>
                        <option value="DANCER">Dancer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Artist Type *
                      </label>
                      <select
                        value={createArtistForm.artistType}
                        onChange={(e) => setCreateArtistForm(prev => ({ ...prev, artistType: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">Select Type</option>
                        {artistTypes.map((type) => (
                          <option key={type._id} value={type._id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender *
                      </label>
                      <select
                        value={createArtistForm.gender}
                        onChange={(e) => setCreateArtistForm(prev => ({ ...prev, gender: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <input
                        type="text"
                        value={createArtistForm.country}
                        onChange={(e) => setCreateArtistForm(prev => ({ ...prev, country: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={createArtistForm.yearsOfExperience}
                        onChange={(e) => setCreateArtistForm(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price per Hour ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={createArtistForm.pricePerHour}
                        onChange={(e) => setCreateArtistForm(prev => ({ ...prev, pricePerHour: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      About
                    </label>
                    <textarea
                      value={createArtistForm.about}
                      onChange={(e) => setCreateArtistForm(prev => ({ ...prev, about: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Skills</h3>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {createArtistForm.skills.map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-2 text-purple-600 hover:text-purple-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Music Languages */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Music Languages</h3>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        placeholder="Add a language"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                      />
                      <button
                        type="button"
                        onClick={addLanguage}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {createArtistForm.musicLanguages.map((language, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          {language}
                          <button
                            type="button"
                            onClick={() => removeLanguage(language)}
                            className="ml-2 text-green-600 hover:text-green-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Performance Preferences */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Preferences</h3>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPerformPreference}
                        onChange={(e) => setNewPerformPreference(e.target.value)}
                        placeholder="Add a preference"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPerformPreference())}
                      />
                      <button
                        type="button"
                        onClick={addPerformPreference}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {createArtistForm.performPreference.map((preference, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {preference}
                          <button
                            type="button"
                            onClick={() => removePerformPreference(preference)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Quick Add Common Preferences:</p>
                      <div className="flex flex-wrap gap-2">
                        {['private', 'public', 'international', 'workshop'].map((pref) => (
                          <button
                            key={pref}
                            type="button"
                            onClick={() => {
                              if (!createArtistForm.performPreference.includes(pref)) {
                                setCreateArtistForm(prev => ({
                                  ...prev,
                                  performPreference: [...prev.performPreference, pref]
                                }));
                              }
                            }}
                            disabled={createArtistForm.performPreference.includes(pref)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {pref}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create Artist
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