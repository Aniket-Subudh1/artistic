'use client';

import { useState, useEffect } from 'react';
import { equipmentPackagesService, EquipmentPackage } from '@/services/equipment-packages.service';
import { Package, Star, ShoppingCart, Eye, Calendar } from 'lucide-react';

interface PublicPackagesProps {
  showTitle?: boolean;
  maxItems?: number;
}

const PublicPackages: React.FC<PublicPackagesProps> = ({ 
  showTitle = true, 
  maxItems 
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
      const displayPackages = maxItems ? data.slice(0, maxItems) : data;
      setPackages(displayPackages);
    } catch (error: any) {
      setError('Failed to fetch packages: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">No equipment packages available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Equipment Packages</h2>
          <p className="text-gray-600">Complete equipment solutions for your events</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {/* Package Cover Image */}
            {pkg.coverImage ? (
              <div className="h-48 bg-gray-200 overflow-hidden">
                <img 
                  src={pkg.coverImage} 
                  alt={pkg.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Package className="h-16 w-16 text-white opacity-80" />
              </div>
            )}

            {/* Package Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{pkg.name}</h3>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  Available
                </span>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">{pkg.description}</p>
            </div>

            {/* Package Items */}
            <div className="p-6">
              <h4 className="font-medium text-gray-900 mb-3">Package Includes:</h4>
              <div className="space-y-2 mb-4">
                {pkg.items.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.equipmentId.name} x {item.quantity}
                    </span>
                    <span className="text-gray-500">${item.equipmentId.pricePerDay * item.quantity}/day</span>
                  </div>
                ))}
                {pkg.items.length > 3 && (
                  <div className="text-sm text-gray-500">
                    +{pkg.items.length - 3} more items
                  </div>
                )}
              </div>

              {/* Package Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  {pkg.items.length} items
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  4.8 (125 reviews)
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-2xl font-bold text-green-600">${pkg.totalPrice}</p>
                    <p className="text-sm text-gray-500">per day</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Minimum rental</p>
                    <p className="text-sm font-medium">1 day</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Book Package
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Provider Info */}
            <div className="bg-gray-50 px-6 py-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  By {pkg.createdBy.firstName} {pkg.createdBy.lastName}
                </span>
                <div className="flex items-center gap-1 text-gray-500">
                  <Calendar className="h-3 w-3" />
                  Available today
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {maxItems && packages.length >= maxItems && (
        <div className="text-center">
          <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            View All Packages
          </button>
        </div>
      )}
    </div>
  );
};

export default PublicPackages;