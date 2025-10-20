'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Package, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  AlertCircle, 
  CheckCircle,
  Shield,
  Settings
} from 'lucide-react';
import { EquipmentProviderService, EquipmentProvider } from '@/services/equipment-provider.service';
import { AdminService, CreateEquipmentProviderRequest } from '@/services/admin.service';
import { CountryCodeDropdown, Country, getDefaultCountry, formatPhoneNumber } from '@/components/ui/CountryCodeDropdown';

export function EquipmentProviderManagement() {
  const [providers, setProviders] = useState<EquipmentProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<EquipmentProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<EquipmentProvider | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Country code state
  const [selectedCountry, setSelectedCountry] = useState<Country>(getDefaultCountry());

  const [createFormData, setCreateFormData] = useState<CreateEquipmentProviderRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    companyName: '',
    businessDescription: ''
  });

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [providers, searchTerm]);

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const data = await EquipmentProviderService.getAllProviders();
      setProviders(data);
    } catch (error: any) {
      setError('Failed to load equipment providers: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const filterProviders = () => {
    let filtered = providers;

    if (searchTerm) {
      filtered = filtered.filter(provider => 
        `${provider.firstName} ${provider.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProviders(filtered);
  };

  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Combine country code with phone number
      const formDataWithPhoneNumber = {
        ...createFormData,
        phoneNumber: formatPhoneNumber(createFormData.phoneNumber, selectedCountry.code)
      };
      
      const response = await AdminService.createEquipmentProvider(formDataWithPhoneNumber);
      setSuccess(response.message || 'Equipment provider created successfully!');
      setShowCreateModal(false);
      setCreateFormData({ 
        firstName: '', 
        lastName: '', 
        email: '', 
        phoneNumber: '', 
        companyName: '', 
        businessDescription: '' 
      });
      setSelectedCountry(getDefaultCountry());
      loadProviders();
    } catch (error: any) {
      setError('Failed to create equipment provider: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
          <h1 className="text-2xl font-bold text-gray-900">Equipment Provider Management</h1>
          <p className="text-gray-600">Manage equipment providers and their accounts</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Provider
        </button>
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
              <p className="text-sm font-medium text-gray-600">Total Providers</p>
              <p className="text-2xl font-bold text-gray-900">{providers.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Providers</p>
              <p className="text-2xl font-bold text-gray-900">{providers.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Signups</p>
              <p className="text-2xl font-bold text-gray-900">
                {providers.filter(provider => {
                  const createdDate = new Date(provider.createdAt);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return createdDate > weekAgo;
                }).length}
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
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {providers.filter(provider => {
                  const createdDate = new Date(provider.createdAt);
                  const monthAgo = new Date();
                  monthAgo.setMonth(monthAgo.getMonth() - 1);
                  return createdDate > monthAgo;
                }).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search providers by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Providers Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredProviders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search criteria'
                : 'Start by adding your first equipment provider'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Provider
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
                    Joined
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
                {filteredProviders.map((provider) => (
                  <tr key={provider._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {provider.firstName.charAt(0)}{provider.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {provider.firstName} {provider.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {provider._id.substring(0, 8)}...
                        </div>
                      </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {provider.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {provider.phoneNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(provider.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedProvider(provider);
                            setShowViewModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 flex items-center">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900 flex items-center">
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

      {/* Create Provider Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add Equipment Provider</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateProvider} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={createFormData.firstName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter first name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={createFormData.lastName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter last name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={createFormData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                      name="phoneNumber"
                      value={createFormData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter phone number"
                      className="flex-1 px-3 py-2 border border-gray-300 border-l-0 rounded-r-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={createFormData.companyName || ''}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Description (Optional)
                  </label>
                  <textarea
                    name="businessDescription"
                    value={createFormData.businessDescription || ''}
                    onChange={handleInputChange}
                    placeholder="Describe the business and services offered"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Important Note</p>
                      <p>A temporary password will be generated and sent to the provider via email. They can change it after their first login.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Provider'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Provider Modal */}
      {showViewModal && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Provider Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Provider Header */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">
                      {selectedProvider.firstName.charAt(0)}{selectedProvider.lastName.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedProvider.firstName} {selectedProvider.lastName}</h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mt-2">
                    <Shield className="w-3 h-3 mr-1" />
                    Equipment Provider
                  </span>
                </div>

                {/* Provider Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedProvider.email}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{selectedProvider.phoneNumber}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Provider ID</label>
                    <p className="text-gray-900 font-mono text-xs">{selectedProvider._id}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Role</label>
                    <p className="text-gray-900">{selectedProvider.role}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Joined Date</label>
                    <p className="text-gray-900">{new Date(selectedProvider.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Last Updated</label>
                    <p className="text-gray-900">{new Date(selectedProvider.updatedAt).toLocaleDateString()}</p>
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
    </div>
  );
}