// src/app/[locale]/dashboard/equipment/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EquipmentService } from '@/services/equipment.service';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Calendar,
  Settings
} from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function EquipmentListPage() {
  const { user, isLoading } = useAuthLogic();
  const [equipment, setEquipment] = useState<any[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadEquipment();
    }
  }, [user]);

  useEffect(() => {
    filterEquipment();
  }, [equipment, searchTerm, categoryFilter]);

  const loadEquipment = async () => {
    if (!user) return;
    
    setIsLoadingData(true);
    try {
      let equipmentData;
      if (user.role === 'equipment_provider') {
        // Load equipment for the current provider
        equipmentData = await EquipmentService.getEquipmentByProvider(user.id);
      } else {
        // Load all equipment for admins/users
        equipmentData = await EquipmentService.getAllEquipment();
      }
      setEquipment(equipmentData);
    } catch (error: any) {
      setError('Failed to load equipment: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoadingData(false);
    }
  };

  const filterEquipment = () => {
    let filtered = equipment;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    setFilteredEquipment(filtered);
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      SOUND: { label: 'Sound', classes: 'bg-blue-100 text-blue-800' },
      DISPLAY: { label: 'Display', classes: 'bg-green-100 text-green-800' },
      LIGHT: { label: 'Light', classes: 'bg-yellow-100 text-yellow-800' },
      OTHER: { label: 'Other', classes: 'bg-gray-100 text-gray-800' }
    };

    const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.OTHER;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes}`}>
        {config.label}
      </span>
    );
  };

  const getAvailabilityBadge = (quantity: number) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {quantity > 0 ? `${quantity} Available` : 'Out of Stock'}
      </span>
    );
  };

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading equipment..." />;
  }

  return (
    <RoleBasedRoute allowedRoles={['equipment_provider', 'admin', 'super_admin']} userRole={user.role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.role === 'equipment_provider' ? 'My Equipment' : 'All Equipment'}
            </h1>
            <p className="text-gray-600">
              {user.role === 'equipment_provider' 
                ? 'Manage your equipment inventory and availability'
                : 'Overview of all equipment in the system'
              }
            </p>
          </div>
          
          {user.role === 'equipment_provider' && (
            <Link
              href="/dashboard/equipment/add"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Equipment
            </Link>
          )}
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
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{equipment.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {equipment.filter(item => item.quantity > 0).length}
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
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(equipment.map(item => item.category)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Filter className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Price/Day</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${equipment.length > 0 ? Math.round(equipment.reduce((sum, item) => sum + item.pricePerDay, 0) / equipment.length) : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
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
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">All Categories</option>
            <option value="SOUND">Sound</option>
            <option value="DISPLAY">Display</option>
            <option value="LIGHT">Light</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Equipment Grid */}
        {isLoadingData ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {equipment.length === 0 ? 'No equipment yet' : 'No equipment found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {equipment.length === 0 
                ? 'Start by adding your first equipment item'
                : 'Try adjusting your search or filters'
              }
            </p>
            {user.role === 'equipment_provider' && equipment.length === 0 && (
              <Link
                href="/dashboard/equipment/add"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Equipment
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((item) => (
              <div key={item._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-100">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="w-16 h-16" />
                    </div>
                  )}
                  
                  <div className="absolute top-4 right-4">
                    {getCategoryBadge(item.category)}
                  </div>

                  <div className="absolute bottom-4 left-4">
                    {getAvailabilityBadge(item.quantity)}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center justify-between">
                      <span>Hourly Rate:</span>
                      <span className="font-medium text-gray-900">${item.pricePerHour}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Daily Rate:</span>
                      <span className="font-medium text-gray-900">${item.pricePerDay}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedEquipment(item);
                        setShowViewModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    {user.role === 'equipment_provider' && (
                      <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1">
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Equipment Modal */}
        {showViewModal && selectedEquipment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Equipment Details</h2>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Equipment Image */}
                  <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
                    {selectedEquipment.imageUrl ? (
                      <img 
                        src={selectedEquipment.imageUrl} 
                        alt={selectedEquipment.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-20 h-20" />
                      </div>
                    )}
                  </div>

                  {/* Equipment Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="col-span-2">
                      <label className="block font-medium text-gray-700">Equipment Name</label>
                      <p className="text-gray-900 text-lg font-semibold">{selectedEquipment.name}</p>
                    </div>
                    
                    <div>
                      <label className="block font-medium text-gray-700">Category</label>
                      <div className="mt-1">{getCategoryBadge(selectedEquipment.category)}</div>
                    </div>
                    
                    <div>
                      <label className="block font-medium text-gray-700">Availability</label>
                      <div className="mt-1">{getAvailabilityBadge(selectedEquipment.quantity)}</div>
                    </div>

                    <div>
                      <label className="block font-medium text-gray-700">Price per Hour</label>
                      <p className="text-gray-900 font-semibold">${selectedEquipment.pricePerHour}</p>
                    </div>
                    
                    <div>
                      <label className="block font-medium text-gray-700">Price per Day</label>
                      <p className="text-gray-900 font-semibold">${selectedEquipment.pricePerDay}</p>
                    </div>

                    <div className="col-span-2">
                      <label className="block font-medium text-gray-700">Description</label>
                      <p className="text-gray-900">{selectedEquipment.description}</p>
                    </div>

                  {selectedEquipment.provider && (
                      <div className="col-span-2">
                        <label className="block font-medium text-gray-700">Provider Information</label>
                        <div className="bg-gray-50 p-4 rounded-lg mt-1">
                          <p className="font-medium text-gray-900">{selectedEquipment.provider.fullName}</p>
                          <p className="text-gray-600">{selectedEquipment.provider.email}</p>
                          <p className="text-gray-600">{selectedEquipment.provider.phoneNumber}</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block font-medium text-gray-700">Created At</label>
                      <p className="text-gray-900">{new Date(selectedEquipment.createdAt).toLocaleString()}</p>
                    </div>
                    
                    <div>
                      <label className="block font-medium text-gray-700">Updated At</label>
                      <p className="text-gray-900">{new Date(selectedEquipment.updatedAt).toLocaleString()}</p>
                    </div>

                    <div className="col-span-2">
                      <label className="block font-medium text-gray-700">Equipment ID</label>
                      <p className="text-gray-900 font-mono text-xs">{selectedEquipment._id}</p>
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
    </RoleBasedRoute>
  );
}