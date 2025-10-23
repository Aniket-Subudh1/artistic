'use client';

import React from 'react';
import { EquipmentPackageBooking, BOOKING_STATUSES } from '@/types/booking';
import { 
  Calendar, Clock, MapPin, Package, DollarSign, 
  Star, CheckCircle, XCircle, AlertCircle, PlayCircle,
  Users, Wrench, Settings, Timer, CreditCard, Eye,
  ArrowRight, Sparkles, BadgeCheck, Building, Box,
  Layers, Zap, Shield, Award, X
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';

interface EnhancedEquipmentPackageBookingCardProps {
  booking: EquipmentPackageBooking;
  onViewDetails: (booking: EquipmentPackageBooking) => void;
  onCancel?: (bookingId: string) => void;
  className?: string;
}

export function EnhancedEquipmentPackageBookingCard({ 
  booking, 
  onViewDetails, 
  onCancel, 
  className = '' 
}: EnhancedEquipmentPackageBookingCardProps) {
  const status = BOOKING_STATUSES[booking.status];
  
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  const isUpcoming = startDate > new Date();
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  // Enhanced package type detection
  const isCustomPackage = !booking.packageId || booking.specialRequests?.includes('[CUSTOM PACKAGE]');
  const hasPackageData = booking.packageId && booking.packageId.name;
  const packageName = hasPackageData ? booking.packageId.name : 'Custom Equipment Package';
  const packageDescription = hasPackageData ? booking.packageId.description : 'Custom equipment package configured by user';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KWD'
    }).format(amount);
  };

  const getStatusIcon = () => {
    switch (booking.status) {
      case 'confirmed': return <CheckCircle className="h-3 w-3" />;
      case 'pending': return <AlertCircle className="h-3 w-3" />;
      case 'cancelled': return <XCircle className="h-3 w-3" />;
      case 'completed': return <BadgeCheck className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className={`
      group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg 
      transition-all duration-300 hover:border-gray-300 cursor-pointer
      overflow-hidden w-full h-[480px] flex flex-col ${className}
    `}>
      
      {/* Header Section with Badges */}
      <div className="relative p-4 pb-2">
        {/* Status and Type Badges */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`
              inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium 
              ${status.bgColor} ${status.color}
            `}>
              {getStatusIcon()}
              {status.label}
            </span>
            
            {isUpcoming && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <PlayCircle className="h-3 w-3" />
                Upcoming
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {hasPackageData && booking.packageId?.status === 'approved' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                <Shield className="h-3 w-3" />
                Approved
              </span>
            )}
            
            {isCustomPackage && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                <Wrench className="h-3 w-3" />
                Custom
              </span>
            )}
            
            {booking.numberOfDays > 1 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                <Calendar className="h-3 w-3" />
                {booking.numberOfDays}D
              </span>
            )}
          </div>
        </div>

        {/* Booking Type Badge */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
            <Package className="h-3 w-3" />
            Equipment Package
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 flex-1 flex flex-col">
        {/* Package Section */}
        <div className="flex items-center gap-3 mb-4">
          {/* Package Image */}
          <div className="relative w-12 h-12 flex-shrink-0">
            {hasPackageData && booking.packageId?.coverImage ? (
              <img 
                src={booking.packageId.coverImage} 
                alt={packageName}
                className="w-full h-full object-cover rounded-lg border border-gray-200"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 rounded-lg border border-gray-200 flex items-center justify-center">
                {isCustomPackage ? (
                  <Wrench className="h-6 w-6 text-orange-500" />
                ) : (
                  <Package className="h-6 w-6 text-orange-500" />
                )}
              </div>
            )}
            {booking.status === 'confirmed' && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-2.5 w-2.5 text-white" />
              </div>
            )}
          </div>

          {/* Package Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-0.5 line-clamp-1 group-hover:text-orange-600 transition-colors">
              {packageName}
            </h3>
            <p className="text-xs text-gray-600 line-clamp-1 mb-1">
              {packageDescription}
            </p>
            {hasPackageData && booking.packageId?.createdBy && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Building className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{booking.packageId.createdBy.firstName} {booking.packageId.createdBy.lastName}</span>
              </div>
            )}
            {isCustomPackage && (
              <div className="flex items-center gap-1 text-xs text-orange-600">
                <Wrench className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">User Configured</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0">
            <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(booking.totalPrice)}
              </p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>

        {/* Rental Schedule */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <h4 className="font-medium text-gray-900 text-sm">Rental Period</h4>
            <div className="ml-auto flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              <Timer className="h-3 w-3" />
              {booking.numberOfDays}d
            </div>
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 text-xs">Start:</span>
              <span className="font-medium text-gray-900 text-xs">
                {format(startDate, 'MMM d, yyyy')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-xs">End:</span>
              <span className="font-medium text-gray-900 text-xs">
                {format(endDate, 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>

        {/* Equipment Items - Only for normal packages */}
        {hasPackageData && booking.packageId?.items && booking.packageId.items.length > 0 && (
          <div className="bg-orange-50 rounded-lg p-3 mb-3 border border-orange-100">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4 text-orange-500" />
              <h4 className="font-medium text-gray-900 text-sm">Package Contents</h4>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                  <Box className="h-3 w-3" />
                  {booking.packageId.items.length} items
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              {booking.packageId.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 border border-orange-200">
                  <div className="flex items-start gap-3">
                    {/* Equipment Image */}
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.equipmentId?.images && item.equipmentId.images.length > 0 ? (
                        <img 
                          src={item.equipmentId.images[0]} 
                          alt={item.equipmentId.name || 'Equipment'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Equipment Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-gray-900 text-xs truncate">
                            {item.equipmentId?.name || 'Equipment Item'}
                          </h5>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {item.equipmentId?.category || 'Equipment'} • Qty: {item.quantity || 1}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-bold text-gray-900">
                            {formatCurrency((item.equipmentId?.pricePerDay || 0) * (item.quantity || 1))}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatCurrency(item.equipmentId?.pricePerDay || 0)}/day
                          </div>
                        </div>
                      </div>
                      

                    </div>
                  </div>
                </div>
              ))}
              
              {booking.packageId.items.length > 3 && (
                <div className="bg-white rounded-lg p-2 border border-orange-200 text-center">
                  <span className="text-xs text-gray-600 font-medium">
                    +{booking.packageId.items.length - 3} more equipment items
                  </span>
                </div>
              )}
              
              {/* Total Package Value */}
              <div className="bg-orange-100 rounded-lg p-2 border border-orange-200 mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-orange-800">Package Total:</span>
                  <span className="font-bold text-orange-900">
                    {formatCurrency(booking.packageId.items.reduce((total, item) => 
                      total + ((item.equipmentId?.pricePerDay || 0) * (item.quantity || 1)), 0
                    ))} /day
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Custom Package Notice - Enhanced */}
        {isCustomPackage && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 mb-3 border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-orange-700 font-medium">Custom Equipment Package</span>
              <div className="ml-auto">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                  <Settings className="h-3 w-3" />
                  Custom
                </span>
              </div>
            </div>
            
            {/* Enhanced custom package info */}
            <div className="bg-white rounded-lg p-3 border border-orange-200 mt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Package Type:</span>
                  <span className="font-medium text-orange-700">User Configured</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Total Value:</span>
                  <span className="font-bold text-gray-900">{formatCurrency(booking.totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Daily Rate:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(booking.pricePerDay)}</span>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-orange-600 mt-2">
              This package was customized with specific equipment requirements. 
              Equipment details are managed through the custom package configuration.
            </p>
            
            {booking.specialRequests && !booking.specialRequests.includes('[CUSTOM PACKAGE]') && (
              <div className="bg-white rounded-lg p-2 border border-orange-200 mt-2">
                <p className="text-xs text-gray-700">
                  <span className="font-medium">Special Requirements:</span> {booking.specialRequests}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Venue Information */}
        <div className="bg-emerald-50 rounded-lg p-3 mb-4 border border-emerald-100">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-emerald-500" />
            <h4 className="font-medium text-gray-900 text-sm">Delivery Location</h4>
          </div>
          <div className="text-sm">
            <div className="font-medium text-xs text-gray-900">
              {booking.venueDetails.city}, {booking.venueDetails.state}
            </div>
            <div className="text-gray-600 text-xs truncate mt-0.5">
              {booking.venueDetails.address}
            </div>
          </div>
        </div>

        {/* Event Description */}
        {booking.eventDescription && (
          <div className="bg-purple-50 rounded-lg p-3 mb-4 border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <h4 className="font-medium text-gray-900 text-sm">Event Description</h4>
            </div>
            <p className="text-xs text-gray-700 line-clamp-2">
              {booking.eventDescription}
            </p>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Per Day:</span>
              <span className="font-medium text-gray-900">{formatCurrency(booking.pricePerDay)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium text-gray-900">{booking.numberOfDays} days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 pt-0 mt-auto">
        {/* Action Buttons */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => onViewDetails(booking)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Eye className="h-4 w-4" />
            View Details
          </button>
          
          {canCancel && (
            <button 
              onClick={() => onCancel?.(booking._id)}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Booked {format(new Date(booking.createdAt || booking.startDate), 'MMM d, yyyy')}
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
            <Award className="h-3 w-3" />
            Equipment
          </div>
        </div>
      </div>
    </div>
  );
}