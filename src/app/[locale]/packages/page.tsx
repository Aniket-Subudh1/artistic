'use client';

import React, { useState, useEffect } from 'react';
import { equipmentPackagesService, EquipmentPackage } from '@/services/equipment-packages.service';
import { 
  customEquipmentPackagesService, 
  CustomEquipmentPackage 
} from '@/services/custom-equipment-packages.service';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { 
  Search, 
  Package, 
  User,
  SlidersHorizontal,
  X,
  Plus,
  Wrench,
  Lock,
  ShoppingCart
} from 'lucide-react';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';
import { TranslatedDataWrapper } from '@/components/ui/TranslatedDataWrapper';
import { CustomEquipmentPackages } from '@/components/equipment-provider/CustomEquipmentPackages';
import { useAuthLogic } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import { CartDrawer } from '@/components/ui/CartDrawer';

export default function PackagesPage() {
  const { isAuthenticated } = useAuthLogic();
  const { addToCart, cartItems } = useCart();
  const [activeTab, setActiveTab] = useState<'regular' | 'custom'>('regular');
  const [packages, setPackages] = useState<EquipmentPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<EquipmentPackage[]>([]);
  const [customPackages, setCustomPackages] = useState<CustomEquipmentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Cart and modal states
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{
    type: 'regular' | 'custom',
    package: any
  } | null>(null);
  const [bookingDates, setBookingDates] = useState({
    startDate: '',
    endDate: ''
  });
  const [cartOpen, setCartOpen] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories for filter
  const [categories, setCategories] = useState<string[]>([]);

  // Cart drawer state handled by cartOpen

  // Add to cart modal state
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [selectedPackageForCart, setSelectedPackageForCart] = useState<{
    type: 'regular' | 'custom';
    package: any;
  } | null>(null);
  const [cartDates, setCartDates] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  // When auth state changes to authenticated, fetch custom packages
  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomPackages();
    } else {
      // Clear custom packages when user logs out/not authenticated
      setCustomPackages([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    applyFilters();
  }, [packages, searchTerm, selectedCategory, priceRange]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await equipmentPackagesService.getPublicPackages();
      setPackages(data);
      
      // Extract unique categories from equipment items
      const allCategories = data.flatMap(pkg => 
        pkg.items.map(item => item.equipmentId.category)
      );
      const uniqueCategories = [...new Set(allCategories)].filter(Boolean);
      setCategories(uniqueCategories);
      // Also try to fetch custom packages if already authenticated on mount
      if (isAuthenticated) {
        await fetchCustomPackages();
      }
    } catch (error: any) {
      setError('Failed to load equipment packages');
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomPackages = async () => {
    try {
      console.log('Fetching custom packages for authenticated user...');
      const customData = await customEquipmentPackagesService.getAllCustomPackages();
      console.log('getAllCustomPackages response:', customData);
      setCustomPackages(Array.isArray(customData) ? customData : []);
    } catch (customError: any) {
      console.error('Error fetching custom packages:', customError);
      console.error('Custom packages error details:', {
        message: customError?.message,
        status: customError?.status,
        data: customError?.data
      });
      setCustomPackages([]);
    }
  };

  const applyFilters = () => {
    let filtered = packages;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(pkg =>
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.items.some(item => 
          item.equipmentId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.equipmentId.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(pkg =>
        pkg.items.some(item => item.equipmentId.category === selectedCategory)
      );
    }

    // Price range filter
    filtered = filtered.filter(pkg => 
      pkg.totalPrice >= priceRange.min && pkg.totalPrice <= priceRange.max
    );

    setFilteredPackages(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange({ min: 0, max: 5000 });
  };

  const handleAddToCart = (type: 'regular' | 'custom', packageItem: any) => {
    setSelectedPackage({ type, package: packageItem });
    setShowDateModal(true);
  };

  const handleDateSubmit = () => {
    if (selectedPackage && bookingDates.startDate && bookingDates.endDate) {
      const pkg = selectedPackage.package as any;
      const uniqueId = `${selectedPackage.type}-${pkg._id}-${bookingDates.startDate}-${bookingDates.endDate}`;
      const cartItem = {
        id: uniqueId,
        type: selectedPackage.type,
        startDate: bookingDates.startDate,
        endDate: bookingDates.endDate,
        package: selectedPackage.package
      };
      
      addToCart(cartItem);
      setShowDateModal(false);
      setSelectedPackage(null);
      setBookingDates({ startDate: '', endDate: '' });
      setCartOpen(true);
    }
  };

  const confirmAddToCart = () => {
    if (!selectedPackageForCart || !cartDates.startDate || !cartDates.endDate) return;
    
    const cartItem = {
      type: selectedPackageForCart.type,
      package: selectedPackageForCart.package,
      startDate: cartDates.startDate,
      endDate: cartDates.endDate,
      id: `${selectedPackageForCart.type}-${selectedPackageForCart.package._id}-${cartDates.startDate}-${cartDates.endDate}`
    };
    
    addToCart(cartItem);
    setShowAddToCartModal(false);
    setSelectedPackageForCart(null);
    setCartDates({ startDate: '', endDate: '' });
  };

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
        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#391C71] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading equipment packages...</p>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  if (error) {
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
        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load packages</h3>
              <p className="text-gray-500">{error}</p>
            </div>
          </div>
          <Footer />
        </div>
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
      
      <div className="relative z-10 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#391C71]/20 to-transparent rounded-bl-full"></div>
              <div className="relative z-10">
                <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                  <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-3">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  Equipment Packages
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Complete equipment solutions for your events. Browse professionally curated packages or create your own custom combinations.
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-[#391C71] font-semibold">
                    {activeTab === 'regular' 
                      ? `${filteredPackages.length} of ${packages.length} packages`
                      : `${customPackages.length} custom packages`
                    }
                  </div>
                  <button
                    onClick={() => setCartOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-4 py-2 rounded-full hover:from-[#5B2C87] hover:to-[#391C71] transition-all duration-300 shadow-lg relative"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="font-semibold">Cart</span>
                    {cartItems.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartItems.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Package Type Tabs */}
          <div className="mb-8">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-2 max-w-md mx-auto">
              <div className="flex bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setActiveTab('regular')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    activeTab === 'regular'
                      ? 'bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Provider Packages
                </button>
                <button
                  onClick={() => setActiveTab('custom')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    activeTab === 'custom'
                      ? 'bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  Custom Packages
                </button>
              </div>
            </div>
          </div>



          {/* Content Based on Active Tab */}
          {activeTab === 'regular' ? (
            /* Regular Packages */
            <div>
              {/* Search and Filters */}
              <div className="mb-8">
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#391C71]/10 to-transparent rounded-br-full"></div>
                  <div className="relative z-10">
                    
                    {/* Search Bar */}
                    <div className="flex flex-col lg:flex-row gap-4 mb-6">
                      <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search packages by name, description, or equipment..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-white/80 border border-[#391C71]/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#391C71]/50 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white rounded-2xl hover:from-[#5B2C87] hover:to-[#391C71] transition-all duration-300 shadow-lg"
                      >
                        <SlidersHorizontal className="w-5 h-5" />
                        Filters
                      </button>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                      <div className="bg-gradient-to-r from-[#391C71]/5 to-purple-50 rounded-2xl p-6 border border-[#391C71]/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          
                          {/* Category Filter */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Equipment Category</label>
                            <select
                              value={selectedCategory}
                              onChange={(e) => setSelectedCategory(e.target.value)}
                              className="w-full px-4 py-2 bg-white/80 border border-[#391C71]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#391C71]/50"
                            >
                              <option value="">All Categories</option>
                              {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </select>
                          </div>

                          {/* Price Range */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Price Range (KWD/day)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                placeholder="Min"
                                value={priceRange.min}
                                onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                                className="w-full px-3 py-2 bg-white/80 border border-[#391C71]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#391C71]/50"
                              />
                              <input
                                type="number"
                                placeholder="Max"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                                className="w-full px-3 py-2 bg-white/80 border border-[#391C71]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#391C71]/50"
                              />
                            </div>
                          </div>

                          {/* Clear Filters */}
                          <div className="flex items-end">
                            <button
                              onClick={clearFilters}
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
                </div>
              </div>

              {/* Packages Grid */}
              {filteredPackages.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-12">
                <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or filters</p>
              </div>
            </div>
          ) : (
            <TranslatedDataWrapper 
              data={filteredPackages}
              translateFields={['name', 'description', 'category', 'features', 'specifications', 'adminNotes']}
              preserveFields={['totalPrice', 'coverImage', 'imageUrl', '_id', 'createdBy', 'status', 'visibility', 'roleRef', 'createdAt', 'updatedAt', 'pricePerDay', 'quantity', 'images']}
              showLoadingOverlay={false}
            >
              {(translatedPackages, isTranslating) => (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {(translatedPackages as EquipmentPackage[]).map((pkg, index) => (
                <Link 
                  key={pkg._id} 
                  href={`/package-details/${pkg._id}`}
                  className="block group"
                >
                  <div
                    className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/30 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#391C71]/10 cursor-pointer transform hover:-translate-y-2 hover:scale-105"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Package Image */}
                    <div className="relative h-56 overflow-hidden">
                      {pkg.coverImage || pkg.imageUrl ? (
                        <Image
                          src={pkg.coverImage || pkg.imageUrl || ''}
                          alt={pkg.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#391C71] to-[#5B2C87] flex items-center justify-center">
                          <Package className="w-16 h-16 text-white" />
                        </div>
                      )}
                      
                      {/* Overlay effects */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      
                      {/* Items count overlay */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full flex items-center shadow-lg border border-white/20">
                        <Package className="w-4 h-4 text-[#391C71] mr-1" />
                        <span className="text-sm font-semibold text-gray-700">{pkg.items.length} items</span>
                      </div>
                      
                      {/* Hover shimmer effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </div>
                    </div>

                    {/* Package Content */}
                    <div className="p-6">
                      {/* Category */}
                      <div className="text-xs text-[#391C71] font-bold mb-3 uppercase tracking-wider">
                        Equipment Package
                      </div>
                      
                      {/* Title */}
                      <h3 className="font-bold text-gray-900 mb-3 text-xl group-hover:text-[#391C71] transition-colors duration-300">
                        {pkg.name}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {pkg.description}
                      </p>
                      
                      {/* Equipment Categories Summary */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {[...new Set(pkg.items.slice(0, 3).map(item => item.equipmentId.category))].map((category, index) => (
                            <span 
                              key={index} 
                              className="inline-block px-2 py-1 bg-gradient-to-r from-[#391C71]/10 to-purple-100 text-[#391C71] text-xs rounded-lg border border-[#391C71]/20"
                            >
                              {category}
                            </span>
                          ))}
                          {pkg.items.length > 3 && (
                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                              +{pkg.items.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Provider Info */}
                      <div className="flex items-center text-sm text-gray-500 mb-5">
                        <User className="w-4 h-4 mr-2 text-[#391C71]" />
                        <span>By {pkg.createdBy.firstName} {pkg.createdBy.lastName}</span>
                      </div>
                      
                      {/* Price and Action */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900 text-lg">
                            {pkg.totalPrice} KWD/day
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddToCart('regular', pkg);
                            }}
                            className="flex-1 bg-gradient-to-r from-green-400 to-green-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-green-500 hover:to-green-600 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                          </button>
                          <span className="flex-1 flex items-center justify-center bg-[#391C71] text-white px-4 py-2 rounded-full text-sm font-medium group-hover:bg-[#5B2C87] transition-all duration-300 shadow-lg">
                            Details
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
                  ))}
                </div>
              )}
            </TranslatedDataWrapper>
          )}
            </div>
          ) : (
            /* Custom Packages */
            <div>
              {isAuthenticated ? (
                <>
                  {/* Create Custom Package Button */}
                  <div className="mb-8">
                    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Create Your Custom Package</h3>
                      <p className="text-gray-600 mb-6">
                        Combine individual equipment items to create your perfect custom package.
                      </p>
                      <Link
                        href="/create-custom-package"
                        className="inline-flex items-center gap-3 bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-8 py-4 rounded-2xl font-bold hover:from-[#5B2C87] hover:to-[#391C71] hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg"
                      >
                        <Plus className="w-5 h-5" />
                        Create Custom Package
                      </Link>
                    </div>
                  </div>

                  {/* Custom Packages Grid */}
                  {!isAuthenticated ? (
                    <div className="text-center py-12">
                      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-12">
                        <Wrench className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Login Required</h3>
                        <p className="text-gray-500 mb-6">Please login to view and create custom packages</p>
                        <Link
                          href="/auth/signin"
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-6 py-3 rounded-2xl font-semibold hover:from-[#5B2C87] hover:to-[#391C71] transition-all duration-300 shadow-lg"
                        >
                          Login Now
                        </Link>
                      </div>
                    </div>
                  ) : customPackages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-12">
                        <Wrench className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No custom packages found</h3>
                        <p className="text-gray-500">Create your first custom package to get started</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {customPackages.map((pkg, index) => (
                        <Link 
                          key={pkg._id} 
                          href={`/book-custom-package/${pkg._id}`}
                          className="block group"
                        >
                          <div
                            className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/30 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#391C71]/10 cursor-pointer transform hover:-translate-y-2 hover:scale-105"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            {/* Package Image - Custom packages don't have images, so we use a gradient */}
                            <div className="relative h-56 overflow-hidden">
                              <div className="w-full h-full bg-gradient-to-br from-[#391C71] to-[#5B2C87] flex items-center justify-center">
                                <Wrench className="w-16 h-16 text-white" />
                              </div>
                              
                              {/* Overlay effects */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                              
                              {/* Items count overlay */}
                              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full flex items-center shadow-lg border border-white/20">
                                <Wrench className="w-4 h-4 text-[#391C71] mr-1" />
                                <span className="text-sm font-semibold text-gray-700">{pkg.items.length} items</span>
                              </div>
                              
                              {/* Custom Badge */}
                              <div className="absolute top-4 left-4 bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                CUSTOM
                              </div>
                              
                              {/* Hover shimmer effect */}
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                              </div>
                            </div>

                            {/* Package Content */}
                            <div className="p-6">
                              {/* Category */}
                              <div className="text-xs text-[#391C71] font-bold mb-3 uppercase tracking-wider">
                                Custom Package
                              </div>
                              
                              {/* Title */}
                              <h3 className="font-bold text-gray-900 mb-3 text-xl group-hover:text-[#391C71] transition-colors duration-300">
                                {pkg.name}
                              </h3>
                              
                              {/* Description */}
                              <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                                {pkg.description}
                              </p>
                              
                              {/* Equipment Categories Summary */}
                              <div className="mb-4">
                                <div className="flex flex-wrap gap-1">
                                  {[...new Set(pkg.items.slice(0, 3).map(item => item.equipmentId.category))].map((category, index) => (
                                    <span 
                                      key={index} 
                                      className="inline-block px-2 py-1 bg-gradient-to-r from-[#391C71]/10 to-purple-100 text-[#391C71] text-xs rounded-lg border border-[#391C71]/20"
                                    >
                                      {category}
                                    </span>
                                  ))}
                                  {pkg.items.length > 3 && (
                                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                                      +{pkg.items.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Provider Info */}
                              <div className="flex items-center text-sm text-gray-500 mb-5">
                                <User className="w-4 h-4 mr-2 text-[#391C71]" />
                                <span>Created by {pkg.createdBy.firstName} {pkg.createdBy.lastName}</span>
                              </div>
                              
                              {/* Visibility Badge */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                  {pkg.isPublic ? (
                                    <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                      Public
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
                                      <Lock className="w-3 h-3 mr-1" />
                                      Private
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Price and Action */}
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-gray-900 text-lg">
                                    {pkg.totalPricePerDay} KWD/day
                                  </span>
                                </div>
                                
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleAddToCart('custom', pkg);
                                    }}
                                    className="flex-1 bg-gradient-to-r from-green-400 to-green-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-green-500 hover:to-green-600 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                                  >
                                    <ShoppingCart className="w-4 h-4" />
                                    Add to Cart
                                  </button>
                                  <span className="flex-1 flex items-center justify-center bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-4 py-2 rounded-full text-sm font-medium group-hover:from-[#5B2C87] group-hover:to-[#391C71] transition-all duration-300 shadow-lg">
                                    Book Now
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8">
                  <div className="text-center py-12">
                    <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Sign In to Access Custom Packages</h3>
                    <p className="text-gray-600 mb-6">
                      Create your own custom equipment packages by combining individual equipment items.
                    </p>
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center gap-2 bg-[#391C71] text-white px-6 py-3 rounded-lg hover:bg-[#2d1659] transition-colors"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Date Selection Modal */}
      {showDateModal && selectedPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Select Booking Dates</h3>
              <button
                onClick={() => setShowDateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedPackage.package.name}</h4>
                <p className="text-sm text-gray-600">
                  Price: {selectedPackage.type === 'regular' 
                    ? selectedPackage.package.totalPrice 
                    : selectedPackage.package.totalPricePerDay} KWD{selectedPackage.type === 'custom' ? '/day' : ''}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={bookingDates.startDate}
                  onChange={(e) => setBookingDates(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={bookingDates.endDate}
                  onChange={(e) => setBookingDates(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71]"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDateSubmit}
                  disabled={!bookingDates.startDate || !bookingDates.endDate}
                  className="flex-1 bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-4 py-3 rounded-lg hover:from-[#5B2C87] hover:to-[#391C71] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}