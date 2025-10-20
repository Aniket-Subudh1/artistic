'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  AlertCircle, 
  CheckCircle,
  Shield,
  Settings,
  Building
} from 'lucide-react';
import { VenueProviderService, VenueProvider, CreateVenueProviderRequest } from '@/services/venue-provider.service';
import { CountryCodeDropdown, Country, getDefaultCountry, formatPhoneNumber } from '@/components/ui/CountryCodeDropdown';

export function VenueProviderManagement() {
  const [providers, setProviders] = useState<VenueProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<VenueProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<VenueProvider | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Country code state
  const [selectedCountry, setSelectedCountry] = useState<Country>(getDefaultCountry());

  const [createFormData, setCreateFormData] = useState<CreateVenueProviderRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    category: ''
  });

  const [createFiles, setCreateFiles] = useState<{
    profileImage?: File;
    coverPhoto?: File;
  }>({});

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [providers, searchTerm]);

  const loadProviders = async () => {
    try {
      setIsLoading(true);
      const response = await VenueProviderService.getAllVenueProviders();
      if (response.success) {
        setProviders(response.data);
        setError('');
      } else {
        setError('Failed to load venue providers');
      }
    } catch (error: any) {
      console.error('Error loading venue providers:', error);
      setError(error?.message || 'Failed to load venue providers');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProviders = () => {
    if (!searchTerm) {
      setFilteredProviders(providers);
      return;
    }

    const filtered = providers.filter(provider => 
      provider.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.phoneNumber.includes(searchTerm) ||
      provider.profile?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.profile?.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProviders(filtered);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      
      // Combine country code with phone number
      const formDataWithPhoneNumber = {
        ...createFormData,
        phoneNumber: formatPhoneNumber(createFormData.phoneNumber, selectedCountry.code)
      };
      
      await VenueProviderService.createVenueProvider(formDataWithPhoneNumber, createFiles);
      
      setSuccess('Venue provider created successfully');
      setShowCreateModal(false);
      resetCreateForm();
      loadProviders();
    } catch (error: any) {
      console.error('Error creating venue provider:', error);
      setError(error?.message || 'Failed to create venue provider');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (providerId: string) => {
    if (!window.confirm('Are you sure you want to delete this venue provider?')) {
      return;
    }

    try {
      await VenueProviderService.deleteVenueProvider(providerId);
      setSuccess('Venue provider deleted successfully');
      loadProviders();
    } catch (error: any) {
      console.error('Error deleting venue provider:', error);
      setError(error?.message || 'Failed to delete venue provider');
    }
  };

  const resetCreateForm = () => {
    setCreateFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: '',
      category: ''
    });
    setCreateFiles({});
    setSelectedCountry(getDefaultCountry());
  };

  const handleFileChange = (field: 'profileImage' | 'coverPhoto', file: File | null) => {
    setCreateFiles(prev => ({
      ...prev,
      [field]: file || undefined
    }));
  };

  const handleViewProvider = (provider: VenueProvider) => {
    setSelectedProvider(provider);
    setShowViewModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-600" />
                Venue Provider Management
              </h1>
              <p className="text-gray-600 mt-1">Manage venue providers and their profiles</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Venue Provider
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search venue providers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Providers List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Venue Providers ({filteredProviders.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading venue providers...</p>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="p-8 text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No venue providers found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No providers match your search criteria.' : 'Get started by adding your first venue provider.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Venue Provider
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location & Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProviders.map((provider) => (
                    <tr key={provider._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {provider.profile?.profileImage ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={provider.profile.profileImage}
                                alt={`${provider.firstName} ${provider.lastName}`}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {provider.firstName} {provider.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {provider._id.slice(-6)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {provider.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {provider.phoneNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {provider.profile?.address || 'Not specified'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Building className="w-4 h-4 text-gray-400" />
                          {provider.profile?.category || 'Not specified'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          provider.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {provider.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(provider.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewProvider(provider)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-100 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(provider._id)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-100 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Create Provider Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New Venue Provider</h2>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createFormData.firstName}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createFormData.lastName}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="flex">
                  <CountryCodeDropdown
                    selectedCountry={selectedCountry}
                    onCountrySelect={setSelectedCountry}
                    buttonClassName="border-r-0 rounded-r-none"
                  />
                  <input
                    type="tel"
                    required
                    value={createFormData.phoneNumber}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 border-l-0 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <textarea
                  required
                  value={createFormData.address}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={createFormData.category}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a category</option>
                  <option value="Wedding Venue">Wedding Venue</option>
                  <option value="Event Hall">Event Hall</option>
                  <option value="Conference Center">Conference Center</option>
                  <option value="Banquet Hall">Banquet Hall</option>
                  <option value="Outdoor Venue">Outdoor Venue</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('profileImage', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('coverPhoto', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  {isSubmitting ? 'Creating...' : 'Create Provider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Provider Modal */}
      {showViewModal && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Venue Provider Details</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Provider Profile */}
              <div className="flex items-center space-x-4">
                {selectedProvider.profile?.profileImage ? (
                  <img
                    className="h-16 w-16 rounded-full object-cover"
                    src={selectedProvider.profile.profileImage}
                    alt={`${selectedProvider.firstName} ${selectedProvider.lastName}`}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedProvider.firstName} {selectedProvider.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedProvider.profile?.category || 'No category specified'}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedProvider.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedProvider.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {selectedProvider.profile?.address || 'No address provided'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Account Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`text-sm font-medium ${
                      selectedProvider.isActive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedProvider.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Join Date:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(selectedProvider.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Updated:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(selectedProvider.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cover Photo */}
              {selectedProvider.profile?.coverPhoto && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Cover Photo</h4>
                  <img
                    className="w-full h-48 object-cover rounded-lg"
                    src={selectedProvider.profile.coverPhoto}
                    alt="Cover photo"
                  />
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}