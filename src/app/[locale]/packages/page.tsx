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
  Filter, 
  Package, 
  User,
  SlidersHorizontal,
  X,
  Tag,
  Plus,
  Wrench
} from 'lucide-react';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';
import { CustomEquipmentPackages } from '@/components/equipment-provider/CustomEquipmentPackages';
import { useAuthLogic } from '@/hooks/useAuth';

export default function PackagesPage() {
  const { isAuthenticated } = useAuthLogic();
  const [activeTab, setActiveTab] = useState<'regular' | 'custom'>('regular');
  const [packages, setPackages] = useState<EquipmentPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<EquipmentPackage[]>([]);
  const [customPackages, setCustomPackages] = useState<CustomEquipmentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories for filter
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchPackages();
  }, []);

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

      // Also fetch custom packages (user's own + public if authenticated, or just public if not)
      try {
        if (isAuthenticated) {
          const customData = await customEquipmentPackagesService.getAllCustomPackages();
          setCustomPackages(Array.isArray(customData) ? customData : []);
        } else {
          const customData = await customEquipmentPackagesService.getPublicCustomPackages();
          setCustomPackages(Array.isArray(customData) ? customData : []);
        }
      } catch (customError) {
        console.error('Error fetching custom packages:', customError);
        setCustomPackages([]);
      }
    } catch (error: any) {
      setError('Failed to load equipment packages');
      console.error('Error fetching packages:', error);
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
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#391C71] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading equipment packages...</p>
          </div>
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
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load packages</h3>
            <p className="text-gray-500">{error}</p>
          </div>
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
                <div className="mt-4 text-sm text-[#391C71] font-semibold">
                  {activeTab === 'regular' 
                    ? `${filteredPackages.length} of ${packages.length} packages`
                    : `${customPackages.length} custom packages`
                  }
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredPackages.map((pkg, index) => (
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
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900 text-lg">
                          {pkg.totalPrice} KWD/day
                        </span>
                        <span className="bg-[#391C71] text-white px-5 py-2 rounded-full text-sm font-medium group-hover:bg-[#5B2C87] transition-all duration-300 shadow-lg">
                          Details
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
            </div>
          ) : (
            /* Custom Packages */
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8">
              {isAuthenticated ? (
                <CustomEquipmentPackages showCreateButton={true} />
              ) : (
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
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
      
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