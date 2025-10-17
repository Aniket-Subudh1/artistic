'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Package, Trash2, Eye, Edit, ExternalLink, 
  AlertCircle, CheckCircle, Calendar, Clock, X, DollarSign, Search, Minus
} from 'lucide-react';
import { equipmentPackagesService, EquipmentPackage } from '@/services/equipment-packages.service';
import { EquipmentService, Equipment } from '@/services/equipment.service';
import PackageImageCropper from '@/components/ui/PackageImageCropper';
import MultipleImageCropper from '@/components/ui/MultipleImageCropper';

interface PackageItem {
  equipmentId: string | Equipment;
  quantity: number;
}

interface Props {
  isModal?: boolean;
}

type ModalType = 'create' | 'edit' | 'view' | 'delete' | null;

interface ModalState {
  isOpen: boolean;
  type: ModalType;
  data?: EquipmentPackage;
}

const EquipmentProviderPackages: React.FC<Props> = ({ isModal = false }) => {
  const [packages, setPackages] = useState<EquipmentPackage[]>([]);
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal state
  const [modal, setModal] = useState<ModalState>({ isOpen: false, type: null });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    items: [] as PackageItem[],
    totalPrice: 0,
    imageUrl: '',
    images: [] as string[],
    coverImage: '' as string
  });
  const [selectedItems, setSelectedItems] = useState<Array<{ equipmentId: string; quantity: number }>>([]);
  
  // Equipment selection state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, Infinity]);

  // Get unique categories from available equipment
  const categories = ['all', ...Array.from(new Set(availableEquipment.map(eq => eq.category)))];

  // Filter equipment based on search and filters
  const filteredEquipment = availableEquipment.filter(equipment => {
    const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || equipment.category.toLowerCase() === selectedCategory.toLowerCase();
    // No price filtering - show all equipment regardless of price
    
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    fetchPackages();
    fetchAvailableEquipment();
  }, []);

  useEffect(() => {
    const total = selectedItems.reduce((sum, item) => {
      const equipment = availableEquipment.find(eq => eq._id === item.equipmentId);
      return sum + (equipment ? equipment.pricePerDay * item.quantity : 0);
    }, 0);
    setFormData(prev => ({ ...prev, totalPrice: total }));
  }, [selectedItems, availableEquipment]);

  const fetchPackages = async () => {
    try {
      const packages = await equipmentPackagesService.getMyPackages();
      setPackages(packages);
    } catch (err) {
      setError('Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableEquipment = async () => {
    try {
      const equipment = await EquipmentService.getMyEquipment();
      console.log('Fetched equipment:', equipment);
      console.log('Total equipment count:', equipment.length);
      setAvailableEquipment(equipment);
    } catch (err) {
      console.error('Failed to fetch equipment:', err);
      setError('Failed to fetch equipment. Please try again.');
    }
  };

  const calculateTotalPrice = () => {
    const total = selectedItems.reduce((sum, item) => {
      const equipment = availableEquipment.find(eq => eq._id === item.equipmentId);
      return sum + (equipment ? equipment.pricePerDay * item.quantity : 0);
    }, 0);
    return total.toFixed(2);
  };

  const openModal = (type: ModalType, data?: EquipmentPackage) => {
    setModal({ isOpen: true, type, data });
    setError('');
    setSuccess('');

    // Refresh equipment data when opening create/edit modals
    if (type === 'create' || type === 'edit') {
      fetchAvailableEquipment();
    }

    if (type === 'create') {
      setFormData({ 
        name: '', 
        description: '', 
        items: [], 
        totalPrice: 0, 
        imageUrl: '',
        images: [],
        coverImage: ''
      });
      setSelectedItems([]);
    } else if (type === 'edit' && data) {
      setFormData({
        name: data.name,
        description: data.description,
        items: data.items.map(item => ({
          equipmentId: typeof item.equipmentId === 'string' ? item.equipmentId : item.equipmentId._id,
          quantity: item.quantity
        })),
        totalPrice: data.totalPrice,
        imageUrl: data.imageUrl || '',
        images: data.images || [],
        coverImage: data.coverImage || ''
      });
      setSelectedItems(data.items.map(item => ({
        equipmentId: typeof item.equipmentId === 'string' ? item.equipmentId : item.equipmentId._id,
        quantity: item.quantity
      })));
    }
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: null });
    setFormData({ 
      name: '', 
      description: '', 
      items: [], 
      totalPrice: 0, 
      imageUrl: '',
      images: [],
      coverImage: ''
    });
    setSelectedItems([]);
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange([0, 1000]);
    setError('');
    setSuccess('');
  };

  const isEquipmentSelected = (equipmentId: string) => {
    return selectedItems.some(item => item.equipmentId === equipmentId);
  };

  const getSelectedQuantity = (equipmentId: string) => {
    const item = selectedItems.find(item => item.equipmentId === equipmentId);
    return item ? item.quantity : 0;
  };

  const addEquipmentToPackage = (equipment: Equipment) => {
    const existingIndex = selectedItems.findIndex(item => item.equipmentId === equipment._id);
    
    if (existingIndex >= 0) {
      // Update quantity if already selected
      setSelectedItems(prev => 
        prev.map((item, index) => 
          index === existingIndex 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // Add new item
      setSelectedItems(prev => [...prev, { equipmentId: equipment._id, quantity: 1 }]);
    }
  };

  const removeEquipmentFromPackage = (equipmentId: string) => {
    setSelectedItems(prev => prev.filter(item => item.equipmentId !== equipmentId));
  };

  const updateEquipmentQuantity = (equipmentId: string, quantity: number) => {
    if (quantity <= 0) {
      removeEquipmentFromPackage(equipmentId);
    } else {
      setSelectedItems(prev =>
        prev.map(item =>
          item.equipmentId === equipmentId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const addItemToPackage = () => {
    setSelectedItems(prev => [...prev, { equipmentId: '', quantity: 1 }]);
  };

  const removeItemFromPackage = (index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const updatePackageItem = (index: number, field: string, value: string | number) => {
    setSelectedItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleCreatePackage = async () => {
    if (!formData.name || !formData.description || selectedItems.length === 0) {
      setError('Please fill in all required fields and add at least one item');
      return;
    }

    // Validate all items have equipment selected
    const hasEmptyItems = selectedItems.some(item => !item.equipmentId);
    if (hasEmptyItems) {
      setError('Please select equipment for all package items');
      return;
    }

    setSubmitLoading(true);
    try {
      // First create the package without images
      const packageData = {
        name: formData.name,
        description: formData.description,
        items: selectedItems,
        totalPrice: formData.totalPrice,
        imageUrl: '', // Will be set after upload
        images: [], // Will be set after upload
        coverImage: '' // Will be set after upload
      };

      let packageResponse;
      if (modal.type === 'edit' && modal.data) {
        packageResponse = await equipmentPackagesService.updatePackage(modal.data._id, packageData);
      } else {
        packageResponse = await equipmentPackagesService.createPackage(packageData);
      }

      const packageId = modal.type === 'edit' ? modal.data!._id : packageResponse.pkg._id;

      // Upload images if any
      if (formData.images.length > 0) {
        setError('Uploading images...');
        const imageFiles = await Promise.all(
          formData.images.map(async (imageUrl) => {
            if (imageUrl.startsWith('blob:')) {
              const response = await fetch(imageUrl);
              const blob = await response.blob();
              return new File([blob], `package-image-${Date.now()}.jpg`, { type: 'image/jpeg' });
            }
            return null;
          })
        );
        
        const validImageFiles = imageFiles.filter(file => file !== null) as File[];
        if (validImageFiles.length > 0) {
          await equipmentPackagesService.uploadPackageImages(packageId, validImageFiles);
        }
      }

      // Upload cover image if it's a blob
      if (formData.coverImage && formData.coverImage.startsWith('blob:')) {
        setError('Uploading cover image...');
        const response = await fetch(formData.coverImage);
        const blob = await response.blob();
        const coverImageFile = new File([blob], `cover-image-${Date.now()}.jpg`, { type: 'image/jpeg' });
        await equipmentPackagesService.uploadCoverImage(packageId, coverImageFile);
      }

      setError(''); // Clear any upload status messages

      setSuccess(modal.type === 'edit' ? 'Package updated successfully' : 'Package created successfully');
      closeModal();
      await fetchPackages();
    } catch (err: any) {
      setError(err.message || 'Failed to save package');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitForReview = async (packageId: string) => {
    try {
      await equipmentPackagesService.submitPackageForReview(packageId);
      setSuccess('Package submitted for review');
      await fetchPackages();
    } catch (err: any) {
      setError(err.message || 'Failed to submit package');
    }
  };

  const handleDeletePackage = async () => {
    if (!modal.data) return;
    
    setSubmitLoading(true);
    try {
      await equipmentPackagesService.deletePackage(modal.data._id);
      setSuccess('Package deleted successfully');
      closeModal();
      await fetchPackages();
    } catch (err: any) {
      setError(err.message || 'Failed to delete package');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Use useCallback to prevent infinite re-renders
  const handleImagesChange = useCallback((images: string[], coverImage?: string) => {
    setFormData(prev => ({ 
      ...prev, 
      images, 
      coverImage: coverImage || '',
      imageUrl: coverImage || '' // Keep backward compatibility
    }));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'pending_review': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getVisibilityColor = (visibility: string) => {
    return visibility === 'online' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isModal ? 'max-h-96 overflow-y-auto' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Equipment Packages</h2>
          <p className="text-gray-600 mt-1">Create and manage your equipment package offerings</p>
        </div>
        <button 
          onClick={() => openModal('create')}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Package
        </button>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}

      {/* Packages Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packages.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border-2 border-dashed border-gray-200 text-center py-12">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No packages created yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Create your first equipment package to offer curated solutions to your customers
            </p>
            <button
              onClick={() => openModal('create')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Package
            </button>
          </div>
        ) : (
          packages.map((pkg) => (
            <div key={pkg._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              {/* Package Image */}
              <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-xl overflow-hidden">
                {pkg.coverImage || pkg.imageUrl || (pkg.images && pkg.images.length > 0) ? (
                  <img
                    src={pkg.coverImage || pkg.imageUrl || pkg.images?.[0]}
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-8 w-8 text-white/80" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-1 flex-col">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pkg.status)}`}>
                    {pkg.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisibilityColor(pkg.visibility)}`}>
                    {pkg.visibility}
                  </span>
                </div>
              </div>

              {/* Package Details */}
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{pkg.name}</h3>
                  <p className="text-gray-600 text-sm overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{pkg.description}</p>
                </div>

                {/* Package Summary */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Items: {pkg.items.length}</span>
                    <span className="text-lg font-bold text-green-600">${pkg.totalPrice}/day</span>
                  </div>
                  
                  {/* Equipment Categories */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {Array.from(new Set(pkg.items.map(item => item.equipmentId.category))).slice(0, 2).map((category, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                        {category}
                      </span>
                    ))}
                    {Array.from(new Set(pkg.items.map(item => item.equipmentId.category))).length > 2 && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                        +{Array.from(new Set(pkg.items.map(item => item.equipmentId.category))).length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Admin Notes */}
                {pkg.adminNotes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-3">
                    <h5 className="font-medium text-yellow-800 mb-1 text-xs">Admin Feedback:</h5>
                    <p className="text-yellow-700 text-xs overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{pkg.adminNotes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => openModal('view', pkg)}
                    className="w-full inline-flex items-center justify-center px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </button>

                  {(pkg.status === 'draft' || 
                    pkg.status === 'rejected' || 
                    pkg.status === 'pending_review' ||
                    (pkg.status === 'approved' && pkg.visibility === 'offline')) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal('edit', pkg)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => openModal('delete', pkg)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  )}

                  {(pkg.status === 'draft' || pkg.status === 'rejected') && (
                    <button
                      onClick={() => handleSubmitForReview(pkg._id)}
                      className="w-full inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {pkg.status === 'rejected' ? 'Resubmit' : 'Submit for Review'}
                    </button>
                  )}

                  {pkg.status === 'pending_review' && (
                    <div className="flex items-center justify-center px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
                      <Clock className="h-4 w-4 mr-2" />
                      Pending Review
                    </div>
                  )}

                  {pkg.status === 'approved' && pkg.visibility === 'online' && (
                    <div className="flex items-center justify-center px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Published
                    </div>
                  )}

                  {pkg.status === 'approved' && pkg.visibility === 'offline' && (
                    <div className="flex items-center justify-center px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Approved (Offline)
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Package Modal */}
      {modal.isOpen && (modal.type === 'create' || modal.type === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {modal.type === 'create' ? 'Create New Package' : 'Edit Package'}
                </h3>
                <p className="text-gray-600 mt-1">
                  {modal.type === 'create' 
                    ? 'Bundle your equipment into attractive packages' 
                    : 'Update your package details and items'
                  }
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}

              {/* Package Images Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Package Images (Max 10) & Cover Image *
                </label>
                <MultipleImageCropper
                  images={formData.images}
                  coverImage={formData.coverImage}
                  onImagesChange={handleImagesChange}
                  maxImages={10}
                  aspectRatio={16/9}
                  className="mb-4"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Upload up to 10 images of your equipment package. The cover image will be displayed on the public packages page.
                </p>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData(prev => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Complete Audio Setup"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Price
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      value={formData.totalPrice}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      placeholder="Calculated automatically"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Auto-calculated from selected items</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    setFormData(prev => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe what's included in this package and what events it's perfect for..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Package Items - New Equipment Selection UI */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Equipment Selection *
                  </label>
                  <div className="text-sm text-gray-600">
                    {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                  </div>
                </div>

                {/* Equipment Filters */}
                <div className="mb-6 space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search equipment..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Category Filter and Price Range */}
                  <div className="flex gap-4 flex-wrap">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Categories</option>
                      {categories.filter(cat => cat !== 'all').map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-blue-600">({availableEquipment.length} total, {filteredEquipment.length} showing)</span>
                    </div>
                  </div>
                </div>

                {/* Equipment Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {filteredEquipment.map((equipment) => {
                    if (!equipment || !equipment._id) {
                      console.warn('Invalid equipment data:', equipment);
                      return null;
                    }
                    const selectedQuantity = getSelectedQuantity(equipment._id);
                    const isSelected = selectedQuantity > 0;

                    return (
                      <div
                        key={equipment._id}
                        className={`relative p-4 border rounded-lg transition-all cursor-pointer hover:shadow-md ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* Equipment Image */}
                        <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                          {equipment.imageUrl ? (
                            <img
                              src={equipment.imageUrl}
                              alt={equipment.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Equipment Info */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-gray-900 truncate">
                            {equipment.name}
                          </h4>
                          <p className="text-xs text-gray-600 h-8 overflow-hidden">
                            {equipment.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-blue-600">
                              ${equipment.pricePerDay}/day
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {equipment.category}
                            </span>
                          </div>
                        </div>

                        {/* Selection Controls */}
                        <div className="mt-3 flex items-center justify-between">
                          {!isSelected ? (
                            <button
                              onClick={() => addEquipmentToPackage(equipment)}
                              className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Add to Package
                            </button>
                          ) : (
                            <div className="w-full flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateEquipmentQuantity(equipment._id, selectedQuantity - 1)}
                                  className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-sm font-medium">{selectedQuantity}</span>
                                <button
                                  onClick={() => updateEquipmentQuantity(equipment._id, selectedQuantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <button
                                onClick={() => removeEquipmentFromPackage(equipment._id)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Selected Badge */}
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {filteredEquipment.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      {availableEquipment.length === 0 ? (
                        <>
                          <p className="text-gray-500">No equipment available</p>
                          <p className="text-sm text-gray-400">Add equipment to your inventory first</p>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-500">No equipment found</p>
                          <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Items Summary */}
                {selectedItems.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-3">Selected Equipment</h4>
                    <div className="space-y-2">
                      {selectedItems.map((item) => {
                        const equipment = availableEquipment.find(eq => eq._id === item.equipmentId);
                        if (!equipment) return null;
                        
                        return (
                          <div key={item.equipmentId} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">
                              {equipment.name} × {item.quantity}
                            </span>
                            <span className="font-medium text-blue-600">
                              ${(equipment.pricePerDay * item.quantity).toFixed(2)}/day
                            </span>
                          </div>
                        );
                      })}
                      <div className="border-t border-blue-200 pt-2 mt-2">
                        <div className="flex items-center justify-between font-semibold text-blue-900">
                          <span>Total</span>
                          <span>${calculateTotalPrice()}/day</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="text-sm text-gray-600">
                {selectedItems.length > 0 && (
                  <span>
                    {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} • ${calculateTotalPrice()}/day
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePackage}
                  disabled={submitLoading || !formData.name || !formData.description || selectedItems.length === 0}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {submitLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                  {modal.type === 'create' ? 'Create Package' : 'Update Package'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Package Modal */}
      {modal.isOpen && modal.type === 'view' && modal.data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{modal.data.name}</h3>
                <div className="flex gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(modal.data.status)}`}>
                    {modal.data.status.replace('_', ' ')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getVisibilityColor(modal.data.visibility)}`}>
                    {modal.data.visibility}
                  </span>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Package Image */}
              {(modal.data.coverImage || modal.data.imageUrl || (modal.data.images && modal.data.images.length > 0)) && (
                <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={modal.data.coverImage || modal.data.imageUrl || modal.data.images?.[0]}
                    alt={modal.data.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Additional Images */}
              {modal.data.images && modal.data.images.length > 1 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Additional Images</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {modal.data.images.slice(1, 4).map((image, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`Package image ${index + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {modal.data.images.length > 4 && (
                      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-600 text-sm">+{modal.data.images.length - 4} more</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600 leading-relaxed">{modal.data.description}</p>
              </div>

              {/* Package Items */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Package Items</h4>
                <div className="space-y-3">
                  {modal.data.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.equipmentId.images && item.equipmentId.images.length > 0 ? (
                            <img 
                              src={item.equipmentId.images[0]} 
                              alt={item.equipmentId.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{item.equipmentId.name}</h5>
                          <p className="text-sm text-gray-600">Category: {item.equipmentId.category}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm text-blue-600 font-medium">${item.equipmentId.pricePerDay}/day each</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${((item.equipmentId.pricePerDay || 0) * (item.quantity || 0)).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">total per day</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Category Summary */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">Equipment Categories</h5>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(modal.data.items.map(item => item.equipmentId.category))).map((category, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Total Price */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-blue-900">Total Package Price</h4>
                  <p className="text-2xl font-bold text-blue-600">${(modal.data.totalPrice || 0).toFixed(2)}/day</p>
                </div>
              </div>

              {/* Admin Notes */}
              {modal.data.adminNotes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-semibold text-yellow-800 mb-2">Admin Feedback</h5>
                  <p className="text-yellow-700">{modal.data.adminNotes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="font-medium">Created</p>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(modal.data.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Last Updated</p>
                  <p className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(modal.data.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={closeModal}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Package Modal */}
      {modal.isOpen && modal.type === 'delete' && modal.data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Delete Package</h3>
                <p className="text-gray-600 mt-1">This action cannot be undone</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{modal.data.name}</h4>
                  <p className="text-sm text-gray-600">
                    Status: {modal.data.status.replace('_', ' ')}
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 leading-relaxed">
                Are you sure you want to delete this package? This will permanently remove 
                the package and all its data. This action cannot be undone.
              </p>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={closeModal}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePackage}
                disabled={submitLoading}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                Delete Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentProviderPackages;