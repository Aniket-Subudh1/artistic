'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, Users, Clock, Calendar, 
  ShoppingCart, Eye, ArrowRight, CheckCircle, User
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { equipmentPackagesService, EquipmentPackage } from '@/services/equipment-packages.service';
import { TranslatedDataWrapper } from '@/components/ui/TranslatedDataWrapper';
import { TranslatableText } from '@/components/ui/TranslatableText';

interface PublicPackagesProps {
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

const PublicPackages: React.FC<PublicPackagesProps> = ({ 
  limit, 
  showHeader = true, 
  className = '' 
}) => {
  const [packages, setPackages] = useState<EquipmentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPublicPackages();
  }, []);

  const fetchPublicPackages = async () => {
    try {
      const data = await equipmentPackagesService.getPublicPackages();
      const displayPackages = limit ? data.slice(0, limit) : data;
      setPackages(displayPackages);
    } catch (error: any) {
      setError('Failed to load packages');
      console.error('Error fetching public packages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        {showHeader && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Equipment Packages</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover curated equipment packages perfect for your next event or project
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
              <div className="h-56 bg-gray-200 animate-pulse"></div>
              <div className="p-6 space-y-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex gap-1 mb-2">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load packages</h3>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No packages available</h3>
        <p className="text-gray-500">Check back soon for new equipment packages</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <TranslatedDataWrapper 
        data={packages}
        translateFields={['name', 'description', 'category', 'features', 'specifications', 'adminNotes', 'equipmentId']}
        preserveFields={['totalPrice', 'coverImage', 'imageUrl', '_id', 'createdBy', 'status', 'visibility', 'roleRef', 'createdAt', 'updatedAt', 'pricePerDay', 'quantity', 'images']}
        showLoadingOverlay={false}
      >
        {(translatedPackages, isTranslating) => (
          <>
            {showHeader && (
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  <TranslatableText>Book Equipment Packages</TranslatableText>
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  <TranslatableText>Discover professionally curated equipment packages perfect for your next event or project</TranslatableText>
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {(translatedPackages as EquipmentPackage[]).map((pkg, index) => (
          <Link 
            key={pkg._id} 
            href={`/package-details/${pkg._id}`}
            className="block group"
          >
            <div
              className="bg-white rounded-3xl border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#391C71]/10 cursor-pointer transform hover:-translate-y-2 hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Package Image */}
              <div className="relative h-56 overflow-hidden">
                {pkg.coverImage ? (
                  <img
                    src={pkg.coverImage}
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                  />
                ) : pkg.imageUrl ? (
                  <img
                    src={pkg.imageUrl}
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500" />
                )}
                
                {/* Overlay effects to match equipment cards */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                {/* Items count overlay */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full flex items-center shadow-lg border border-white/20">
                  <Package className="w-4 h-4 text-[#391C71] mr-1" />
                  <span className="text-sm font-semibold text-gray-700">
                    {pkg.items && Array.isArray(pkg.items) ? pkg.items.length : 0} <TranslatableText>items</TranslatableText>
                  </span>
                </div>
                
                {/* Hover shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </div>

              {/* Package Content */}
              <div className="p-6">
                {/* Category - generic label for equipment packages */}
                <div className="text-xs text-[#391C71] font-bold mb-3 uppercase tracking-wider">
                  <TranslatableText>Equipment Package</TranslatableText>
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
                    {pkg.items && Array.isArray(pkg.items) && pkg.items.length > 0 && (
                      <>
                        {[...new Set(pkg.items.slice(0, 3).map(item => item.equipmentId?.category || 'Equipment'))].map((category, index) => (
                          <span 
                            key={index} 
                            className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                          >
                            <TranslatableText>{category}</TranslatableText>
                          </span>
                        ))}
                        {pkg.items.length > 3 && (
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                            +{pkg.items.length - 3} <TranslatableText>more</TranslatableText>
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                {/* Provider Info */}
                <div className="flex items-center text-sm text-gray-500 mb-5">
                  <User className="w-4 h-4 mr-2 text-[#391C71]" />
                  <span><TranslatableText>By</TranslatableText> {pkg.createdBy.firstName} {pkg.createdBy.lastName}</span>
                </div>
                
                {/* Price and Action */}
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-lg">
                    {pkg.totalPrice} <TranslatableText>KWD/day</TranslatableText>
                  </span>
                  <span className="bg-[#391C71] text-white px-5 py-2 rounded-full text-sm font-medium group-hover:bg-[#5B2C87] transition-all duration-300 shadow-lg">
                    <TranslatableText>Details</TranslatableText>
                  </span>
                </div>
              </div>
            </div>
          </Link>
              ))}
            </div>

            {/* Show More Button */}
            {limit && (translatedPackages as EquipmentPackage[]).length >= limit && (
              <div className="text-center mt-12">
                <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <TranslatableText>View All Packages</TranslatableText>
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              </div>
            )}
          </>
        )}
      </TranslatedDataWrapper>
    </div>
  );
};

export default PublicPackages;