'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Plus, 
  Minus, 
  Search, 
  Filter, 
  Package, 
  Wrench, 
  ArrowLeft, 
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  X,
  ShoppingCart
} from 'lucide-react';
import { 
  customEquipmentPackagesService, 
  CreateCustomPackageDto,
  CustomPackageItem 
} from '@/services/custom-equipment-packages.service';
import { useAuthLogic } from '@/hooks/useAuth';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';

interface Equipment {
  _id: string;
  name: string;
  category: string;
  pricePerDay: number;
  images?: string[];
  imageUrl?: string; // Handle single image from backend
  description?: string;
  provider?: {
    _id: string;
    companyName?: string;
    firstName: string;
    lastName: string;
  };
}

interface SelectedEquipment extends Equipment {
  quantity: number;
}

const CreateCustomPackagePage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthLogic();

  // Form state
  const [packageName, setPackageName] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [notes, setNotes] = useState('');

  // Equipment state
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchAvailableEquipment = useCallback(async () => {
    try {
      setLoading(true);
      setError(''); 
      console.log('Fetching equipment...');
      console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL);
      console.log('Auth token exists:', !!localStorage.getItem('authToken'));
      
      const response = await customEquipmentPackagesService.getAvailableEquipment({
        limit: 100 
      });
      console.log('Equipment API Response:', response);
      console.log('Equipment fetched successfully:', response.data?.length || 0, 'items');
      
      if (response.data) {
        setAvailableEquipment(response.data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(response.data.map(item => item.category))].filter(Boolean);
        setCategories(uniqueCategories);
        console.log('Categories extracted:', uniqueCategories);
      } else {
        console.warn('No data field in response:', response);
        setAvailableEquipment([]);
      }
    } catch (error: any) {
      console.error('Error fetching equipment:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        data: error.data
      });
      
      if (error.status === 401) {
        setError('Session expired. Please login again.');
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
        setTimeout(() => router.push(`/auth/signin?returnUrl=${encodeURIComponent(currentPath)}`), 2000);
      } else {
        setError('Failed to load equipment: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Add debugging
    console.log('Auth check:', { isAuthenticated, user, isLoading });
    console.log('Token exists:', !!localStorage.getItem('authToken'));
    console.log('User in localStorage:', localStorage.getItem('user'));
    
    if (!isLoading && !isAuthenticated) {
      console.log('Redirecting to login - not authenticated');
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
      router.push(`/auth/signin?returnUrl=${encodeURIComponent(currentPath)}`);
      return;
    }
    
    if (isAuthenticated && !isLoading) {
      fetchAvailableEquipment();
    }
  }, [isAuthenticated, isLoading, router, fetchAvailableEquipment]);

  const filteredEquipment = availableEquipment.filter(equipment => {
    const matchesSearch = !searchTerm || 
      equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || equipment.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const addToPackage = (equipment: Equipment) => {
    const existing = selectedEquipment.find(item => item._id === equipment._id);
    if (existing) {
      setSelectedEquipment(prev => 
        prev.map(item => 
          item._id === equipment._id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedEquipment(prev => [...prev, { ...equipment, quantity: 1 }]);
    }
  };

  const removeFromPackage = (equipmentId: string) => {
    setSelectedEquipment(prev => prev.filter(item => item._id !== equipmentId));
  };

  const updateQuantity = (equipmentId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromPackage(equipmentId);
      return;
    }
    
    setSelectedEquipment(prev => 
      prev.map(item => 
        item._id === equipmentId 
          ? { ...item, quantity }
          : item
      )
    );
  };

  const calculateTotalPrice = () => {
    return selectedEquipment.reduce((total, item) => total + (item.pricePerDay * item.quantity), 0);
  };

  const validateForm = () => {
    if (!packageName.trim()) {
      setError('Package name is required');
      return false;
    }
    
    if (!packageDescription.trim()) {
      setError('Package description is required');
      return false;
    }
    
    if (selectedEquipment.length === 0) {
      setError('Please select at least one equipment item');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    setError('');
    
    try {
      const packageData: CreateCustomPackageDto = {
        name: packageName,
        description: packageDescription,
        items: selectedEquipment.map(item => ({
          equipmentId: item._id,
          quantity: item.quantity
        })),
        isPublic,
        notes
      };
      
      await customEquipmentPackagesService.createCustomPackage(packageData);
      setSuccess('Custom package created successfully!');
      
      // Redirect to packages page after success
      setTimeout(() => {
        router.push('/packages');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to create custom package');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <Image
            src="/design.png"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-white/50 to-pink-50/80"></div>
        </div>
        <Navbar />
        <div className="relative z-10 flex justify-center items-center h-96 pt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#391C71]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <Image
            src="/design.png"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-white/50 to-pink-50/80"></div>
        </div>
        <Navbar />
        <div className="relative z-10 flex justify-center items-center h-96 pt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#391C71]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/design.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-white/50 to-pink-50/80"></div>
      </div>
      
      <Navbar />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-8">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-400/10 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-100/50 to-transparent rounded-tr-full"></div>
          
          <div className="relative z-10">
            <button
              onClick={() => router.back()}
              className="flex items-center bg-white/90 backdrop-blur-sm text-[#391C71] hover:text-[#5B2C87] mb-6 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Packages
            </button>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-full p-3">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Create Custom Package</h1>
                <p className="text-gray-600 text-lg mt-2">Combine equipment items to create your perfect package</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Package Builder - Left Side */}
          <div className="lg:col-span-2 space-y-8">
            {/* Package Details Form */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-orange-400/10 to-transparent rounded-bl-full"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-full p-3 mr-4">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  Package Details
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Package Name
                    </label>
                    <input
                      type="text"
                      value={packageName}
                      onChange={(e) => setPackageName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 shadow-lg transition-all duration-200"
                      placeholder="Enter package name..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Description
                    </label>
                    <textarea
                      value={packageDescription}
                      onChange={(e) => setPackageDescription(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 shadow-lg transition-all duration-200 resize-none"
                      placeholder="Describe your custom package..."
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="w-5 h-5 text-orange-500 bg-white border-gray-300 rounded focus:ring-orange-400 focus:ring-2"
                      />
                      <label htmlFor="isPublic" className="ml-3 text-sm font-medium text-gray-700 flex items-center">
                        {isPublic ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                        Make this package public
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 shadow-lg transition-all duration-200 resize-none"
                      placeholder="Any additional notes..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Equipment Selection */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-orange-400/20 to-transparent rounded-br-full"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-full p-3 mr-4">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  Select Equipment
                </h3>
                
                {/* Search and Filters */}
                <div className="mb-6">
                  <div className="flex flex-col lg:flex-row gap-4 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search equipment..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/80 border border-orange-400/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-2xl hover:from-orange-500 hover:to-orange-600 transition-all duration-300 shadow-lg"
                    >
                      <Filter className="w-5 h-5" />
                      Filters
                    </button>
                  </div>

                  {/* Filter Panel */}
                  {showFilters && (
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                          <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-4 py-2 bg-white/80 border border-orange-400/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/50"
                          >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex items-end">
                          <button
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedCategory('');
                            }}
                            className="w-full px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors duration-300 flex items-center justify-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Equipment Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredEquipment.map((equipment) => {
                    const isSelected = selectedEquipment.some(item => item._id === equipment._id);
                    const selectedItem = selectedEquipment.find(item => item._id === equipment._id);
                    
                    return (
                      <div
                        key={equipment._id}
                        className={`p-6 rounded-2xl border transition-all duration-300 ${
                          isSelected 
                            ? 'bg-orange-50 border-orange-300 shadow-lg' 
                            : 'bg-white/50 border-white/20 hover:bg-white/70'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-2">{equipment.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{equipment.category}</p>
                            <p className="font-semibold text-orange-600">{equipment.pricePerDay} KWD/day</p>
                          </div>
                          
                          {(equipment.images && equipment.images.length > 0) || equipment.imageUrl ? (
                            <div className="relative w-16 h-16 ml-4">
                              <Image
                                src={equipment.images?.[0] || equipment.imageUrl || ''}
                                alt={equipment.name}
                                fill
                                className="object-cover rounded-lg"
                              />
                            </div>
                          ) : null}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            By {equipment.provider?.firstName || 'Unknown'} {equipment.provider?.lastName || 'Provider'}
                          </div>
                          
                          {isSelected ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(equipment._id, selectedItem!.quantity - 1)}
                                className="w-8 h-8 rounded-full bg-orange-400 text-white flex items-center justify-center hover:bg-orange-500 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-bold text-gray-900 min-w-[2rem] text-center">
                                {selectedItem!.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(equipment._id, selectedItem!.quantity + 1)}
                                className="w-8 h-8 rounded-full bg-orange-400 text-white flex items-center justify-center hover:bg-orange-500 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToPackage(equipment)}
                              className="flex items-center gap-2 px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors text-sm font-medium"
                            >
                              <Plus className="w-4 h-4" />
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredEquipment.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No equipment found matching your criteria</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Package Summary - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 sticky top-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-orange-400/20 to-transparent rounded-bl-full"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-full p-3 mr-4">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  Package Summary
                </h3>

                {selectedEquipment.length === 0 ? (
                  <div className="text-center py-8">
                    <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No equipment selected</p>
                    <p className="text-sm text-gray-400">Add equipment items to build your package</p>
                  </div>
                ) : (
                  <>
                    {/* Selected Equipment */}
                    <div className="space-y-4 mb-6">
                      {selectedEquipment.map((item) => (
                        <div key={item._id} className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-white/50">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.category}</div>
                          </div>
                          <div className="text-right mr-3">
                            <div className="text-sm font-semibold text-gray-900">×{item.quantity}</div>
                            <div className="text-xs text-orange-600">{item.pricePerDay * item.quantity} KWD/day</div>
                          </div>
                          <button
                            onClick={() => removeFromPackage(item._id)}
                            className="w-6 h-6 rounded-full bg-red-400 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Total Price */}
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total Price per Day:</span>
                        <span className="text-2xl font-bold text-orange-600">
                          {calculateTotalPrice()} KWD
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        {selectedEquipment.length} item{selectedEquipment.length !== 1 ? 's' : ''} • 
                        {selectedEquipment.reduce((sum, item) => sum + item.quantity, 0)} total pieces
                      </div>
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={handleSave}
                      disabled={saving || selectedEquipment.length === 0}
                      className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-4 rounded-2xl font-bold hover:from-orange-500 hover:to-orange-600 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 transition-all duration-300 shadow-lg"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                          Creating Package...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Create Package
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />

      {/* Notifications */}
      {error && (
        <div className="fixed top-24 right-6 bg-white/90 backdrop-blur-xl text-red-600 p-6 rounded-3xl shadow-2xl border border-white/30 z-50 max-w-md">
          <div className="flex items-start">
            <div className="bg-red-100 rounded-full p-2 mr-4 flex-shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-1">Error</p>
              <p className="text-sm text-gray-700">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="ml-4 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {success && (
        <div className="fixed top-24 right-6 bg-white/90 backdrop-blur-xl text-green-600 p-6 rounded-3xl shadow-2xl border border-white/30 z-50 max-w-md">
          <div className="flex items-start">
            <div className="bg-green-100 rounded-full p-2 mr-4 flex-shrink-0">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-1">Success</p>
              <p className="text-sm text-gray-700">{success}</p>
            </div>
            <button
              onClick={() => setSuccess('')}
              className="ml-4 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCustomPackagePage;