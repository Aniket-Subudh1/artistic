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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KWD'
    }).format(amount);
  };

  const getStatusIcon = () => {
    switch (booking.status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'completed': return <BadgeCheck className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className={`
      group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg 
      transition-all duration-300 hover:border-gray-300 cursor-pointer
      overflow-hidden min-h-[400px] flex flex-col ${className}
    `}>
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-50/50 to-transparent rounded-xl transform rotate-12 translate-x-6 -translate-y-6" />
      
      {/* Status Badge - Floating */}
      <div className="absolute top-3 right-3 z-10">
        <span className={`
          inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium 
          backdrop-blur-sm border shadow-sm
          ${status.bgColor} ${status.color}
        `}>
          {getStatusIcon()}
          <span className="hidden sm:inline">{status.label}</span>
        </span>
      </div>

      {/* Upcoming Badge */}
      {isUpcoming && (
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200 shadow-sm backdrop-blur-sm">
            <PlayCircle className="h-3 w-3" />
            <span className="hidden sm:inline">Upcoming</span>
          </span>
        </div>
      )}

      {/* Multi-day Badge */}
      {booking.numberOfDays > 1 && (
        <div className="absolute top-12 left-3 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200 shadow-sm backdrop-blur-sm">
            <Calendar className="h-3 w-3" />
            <span className="hidden sm:inline">{booking.numberOfDays} Days</span>
          </span>
        </div>
      )}

      <div className="p-4 lg:p-6 flex-1 flex flex-col">
        {/* Header Section */}
        <div className="flex items-start gap-3 mb-4">
          {/* Package Image */}
          <div className="relative w-12 h-12 lg:w-14 lg:h-14 flex-shrink-0">
            {booking.packageId.coverImage ? (
              <img 
                src={booking.packageId.coverImage} 
                alt={booking.packageId.name}
                className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center">
                <Package className="h-6 w-6 lg:h-7 lg:w-7 text-orange-500" />
              </div>
            )}
            {booking.status === 'confirmed' && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
            )}
          </div>

          {/* Package Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1 flex-wrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                <Package className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Equipment</span>
              </span>
              {booking.packageId.status === 'approved' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <Shield className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Approved</span>
                </span>
              )}
            </div>
            
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
              {booking.packageId.name}
            </h3>
            <div className="space-y-0.5">
              <p className="text-sm text-gray-600 line-clamp-1">
                {booking.packageId.description}
              </p>
              {booking.packageId.createdBy && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Building className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{booking.packageId.createdBy.firstName} {booking.packageId.createdBy.lastName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Price Section */}
          <div className="text-right flex-shrink-0">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-2 lg:p-3 border border-orange-100">
              <p className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-900">
                {formatCurrency(booking.totalPrice)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Total
              </p>
              <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                <div className="flex justify-between items-center">
                  <span>Per Day:</span>
                  <span className="font-medium">{formatCurrency(booking.pricePerDay)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Duration:</span>
                  <span className="font-medium">{booking.numberOfDays}d</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rental Timeline */}
        <div className="mb-4 flex-1">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100 h-full">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <h4 className="font-medium text-gray-900 text-sm">Rental Period</h4>
              <div className="flex-1" />
              <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                <Timer className="h-3 w-3" />
                {booking.numberOfDays}d
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-xs">Start:</span>
                <span className="font-medium text-gray-900 text-xs">
                  {format(startDate, 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-xs">End:</span>
                <span className="font-medium text-gray-900 text-xs">
                  {format(endDate, 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Items */}
        {booking.packageId.items && booking.packageId.items.length > 0 && (
          <div className="mb-4">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <Box className="h-4 w-4 text-amber-500" />
                <h4 className="font-medium text-gray-900 text-sm">Contents</h4>
                <div className="flex-1" />
                <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                  <Layers className="h-3 w-3" />
                  {booking.packageId.items.length}
                </div>
              </div>
              
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {booking.packageId.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white rounded p-2 border border-amber-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 bg-amber-100 rounded flex items-center justify-center flex-shrink-0">
                        <Wrench className="h-3 w-3 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 text-xs line-clamp-1">{item.equipmentId.name}</div>
                        <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-gray-900 flex-shrink-0 ml-2">
                      {formatCurrency(item.equipmentId.pricePerDay * item.quantity)}
                    </div>
                  </div>
                ))}
                {booking.packageId.items.length > 3 && (
                  <div className="text-xs text-gray-500 text-center py-1">
                    +{booking.packageId.items.length - 3} more items
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Venue Information */}
        <div className="mb-4">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-emerald-500" />
              <h4 className="font-medium text-gray-900 text-sm">Delivery Location</h4>
            </div>
            <div className="text-sm text-gray-700">
              <div className="font-medium text-xs">{booking.venueDetails.city}, {booking.venueDetails.state}</div>
              <div className="text-gray-600 text-xs mt-0.5 line-clamp-1">{booking.venueDetails.address}</div>
            </div>
          </div>
        </div>

        {/* Event Description */}
        {booking.eventDescription && (
          <div className="mb-4">
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-3 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <h4 className="font-medium text-gray-900 text-sm">Event Description</h4>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">
                {booking.eventDescription}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails(booking)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200 text-sm font-medium"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">View</span>
            </button>
            
            {canCancel && (
              <button 
                onClick={() => onCancel?.(booking._id)}
                className="px-3 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <span className="hidden sm:inline">Cancel</span>
                <X className="h-4 w-4 sm:hidden" />
              </button>
            )}
          </div>

          {/* Booking Date Footer */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className="hidden sm:inline">Booked {format(new Date(booking.createdAt || booking.startDate), 'MMM d, yyyy')}</span>
              <span className="sm:hidden">{format(new Date(booking.createdAt || booking.startDate), 'MMM d')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              <span className="hidden sm:inline">Equipment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}