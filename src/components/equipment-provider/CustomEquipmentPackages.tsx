'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Share, 
  Lock, 
  Calendar,
  DollarSign,
  User,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  ShoppingCart
} from 'lucide-react';
import { 
  customEquipmentPackagesService, 
  CustomEquipmentPackage 
} from '@/services/custom-equipment-packages.service';
import { CreateCustomPackageModal } from './CreateCustomPackageModal';

interface CustomEquipmentPackagesProps {
  showCreateButton?: boolean;
  onPackageSelect?: (pkg: CustomEquipmentPackage) => void;
  selectedPackages?: string[];
}

export function CustomEquipmentPackages({ 
  showCreateButton = true, 
  onPackageSelect,
  selectedPackages = []
}: CustomEquipmentPackagesProps) {
  const [packages, setPackages] = useState<CustomEquipmentPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<CustomEquipmentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyMyPackages, setShowOnlyMyPackages] = useState(false);


  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [packages, searchTerm, showOnlyMyPackages]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await customEquipmentPackagesService.getAllCustomPackages();
      setPackages(Array.isArray(data) ? data : []);
    } catch (error: any) {
      setError('Failed to load custom packages');
      console.error('Error fetching custom packages:', error);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = packages;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(pkg =>
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.items.some(item => 
          item.equipmentId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.equipmentId.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // My packages filter
    if (showOnlyMyPackages) {
      // This would need the current user ID to filter properly
      // For now, we'll assume all packages are accessible
    }

    // Custom packages are always private, so no need for public filter

    setFilteredPackages(filtered);
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this custom package?')) {
      return;
    }

    try {
      await customEquipmentPackagesService.deleteCustomPackage(packageId);
      await fetchPackages();
    } catch (error: any) {
      console.error('Error deleting package:', error);
      setError('Failed to delete package');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#391C71]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Custom Equipment Packages</h2>
          <p className="text-gray-600 mt-1">Create and manage your custom equipment combinations</p>
        </div>
        {showCreateButton && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#391C71] text-white px-6 py-3 rounded-lg hover:bg-[#2d1659] transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Custom Package
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search custom packages..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={showOnlyMyPackages}
                onChange={(e) => setShowOnlyMyPackages(e.target.checked)}
                className="rounded border-gray-300 text-[#391C71] focus:ring-[#391C71] mr-2"
              />
              My Packages Only
            </label>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Packages Grid */}
      {filteredPackages.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Custom Packages</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || showOnlyMyPackages
              ? 'No packages match your current filters.'
              : 'You haven\'t created any custom packages yet.'}
          </p>
          {showCreateButton && !searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#391C71] text-white px-6 py-3 rounded-lg hover:bg-[#2d1659] transition-colors"
            >
              Create Your First Custom Package
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <CustomPackageCard
              key={pkg._id}
              package={pkg}
              onDelete={handleDeletePackage}
              onSelect={onPackageSelect}
              isSelected={selectedPackages.includes(pkg._id)}
            />
          ))}
        </div>
      )}

      {/* Create Package Modal */}
      <CreateCustomPackageModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPackageCreated={fetchPackages}
      />
    </div>
  );
}

interface CustomPackageCardProps {
  package: CustomEquipmentPackage;
  onDelete: (id: string) => void;
  onSelect?: (pkg: CustomEquipmentPackage) => void;
  isSelected?: boolean;
}

function CustomPackageCard({ 
  package: pkg, 
  onDelete, 
  onSelect,
  isSelected = false 
}: CustomPackageCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(pkg);
    } else {
      setShowDetails(!showDetails);
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-all cursor-pointer ${
        isSelected 
          ? 'border-[#391C71] bg-purple-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={handleCardClick}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{pkg.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{pkg.description}</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <div title="Private - Only visible to you">
              <Lock className="w-4 h-4 text-gray-400" />
            </div>
            {isSelected && (
              <div className="w-4 h-4 bg-[#391C71] rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Package className="w-4 h-4 mr-1" />
            {pkg.items.length} items
          </div>
          <div className="text-lg font-bold text-[#391C71]">
            ${pkg.totalPricePerDay}/day
          </div>
        </div>

        {/* Creator Info */}
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <User className="w-4 h-4 mr-1" />
          Created by {pkg.createdBy.firstName} {pkg.createdBy.lastName}
        </div>

        {/* Equipment Preview */}
        <div className="space-y-2 mb-4">
          <p className="text-sm font-medium text-gray-700">Equipment included:</p>
          <div className="space-y-1">
            {pkg.items.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.equipmentId.name}
                </span>
                <span className="text-gray-500">
                  ${item.quantity * item.pricePerDay}/day
                </span>
              </div>
            ))}
            {pkg.items.length > 3 && (
              <p className="text-sm text-[#391C71]">
                +{pkg.items.length - 3} more items
              </p>
            )}
          </div>
        </div>

        {/* Notes */}
        {pkg.notes && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">{pkg.notes}</p>
          </div>
        )}

        {/* Date */}
        <div className="flex items-center text-xs text-gray-500 mb-4">
          <Calendar className="w-3 h-3 mr-1" />
          Created {new Date(pkg.createdAt).toLocaleDateString()}
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          {/* Book Now Button - Primary Action */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/book-custom-package/${pkg._id}`;
            }}
            className="w-full bg-[#391C71] text-white px-4 py-2 rounded-lg hover:bg-[#2d1659] transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <ShoppingCart className="w-4 h-4" />
            Book Now
          </button>
          
          {/* Secondary Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(!showDetails);
              }}
              className="text-[#391C71] hover:text-[#2d1659] text-sm font-medium flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement edit functionality
                }}
                className="text-gray-600 hover:text-gray-800"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement share functionality
                }}
                className="text-gray-600 hover:text-gray-800"
                title="Share"
              >
                <Share className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(pkg._id);
                }}
                className="text-red-600 hover:text-red-700"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Detailed View */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <h4 className="font-medium text-gray-900">All Equipment Items:</h4>
            {pkg.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm bg-gray-50 rounded p-2">
                <div>
                  <p className="font-medium">{item.equipmentId.name}</p>
                  <p className="text-gray-600">{item.equipmentId.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {item.quantity}x ${item.pricePerDay} = ${item.quantity * item.pricePerDay}
                  </p>
                  <p className="text-gray-600">per day</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}