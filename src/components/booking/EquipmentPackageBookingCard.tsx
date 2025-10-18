'use client';

import React from 'react';
import { 
  Package, Calendar, MapPin, DollarSign, 
  Clock, User, AlertCircle, CheckCircle, 
  XCircle, Eye, X 
} from 'lucide-react';
import { EquipmentPackageBooking } from '@/types/booking';
import { equipmentPackageBookingService } from '@/services/equipment-package-booking.service';

interface EquipmentPackageBookingCardProps {
  booking: EquipmentPackageBooking;
  onViewDetails: (booking: EquipmentPackageBooking) => void;
  onCancel?: (bookingId: string) => void;
  showProviderView?: boolean;
  className?: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50 border-yellow-200',
    label: 'Pending'
  },
  confirmed: {
    icon: CheckCircle,
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    label: 'Confirmed'
  },
  cancelled: {
    icon: XCircle,
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    label: 'Cancelled'
  },
  completed: {
    icon: CheckCircle,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    label: 'Completed'
  }
};

export const EquipmentPackageBookingCard: React.FC<EquipmentPackageBookingCardProps> = ({
  booking,
  onViewDetails,
  onCancel,
  showProviderView = false,
  className = ''
}) => {
  const status = statusConfig[booking.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const formatDateRange = () => {
    return equipmentPackageBookingService.formatDateRange(booking.startDate, booking.endDate);
  };

  const canCancel = () => {
    return booking.status === 'pending' || booking.status === 'confirmed';
  };

  return (
    <div className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            {/* Package Image */}
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
              {booking.packageId.coverImage || (booking.packageId.images && booking.packageId.images.length > 0) ? (
                <img 
                  src={booking.packageId.coverImage || booking.packageId.images![0]} 
                  alt={booking.packageId.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>

            {/* Package Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {booking.packageId.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Booking ID: {booking._id.slice(-8).toUpperCase()}
              </p>
              
              {/* Customer/Provider Info */}
              {showProviderView ? (
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-1" />
                  {booking.userDetails.name}
                </div>
              ) : (
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-1" />
                  Provider: {booking.packageId.createdBy.firstName} {booking.packageId.createdBy.lastName}
                </div>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${status.bgColor} ${status.color}`}>
            <StatusIcon className="h-4 w-4 mr-1" />
            {status.label}
          </div>
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Dates */}
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Booking Period:</p>
              <p>{formatDateRange()}</p>
              <p className="text-gray-500">{booking.numberOfDays} day{booking.numberOfDays !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Venue:</p>
              <p>{booking.venueDetails.address}</p>
              <p className="text-gray-500">
                {booking.venueDetails.city}, {booking.venueDetails.state}
              </p>
            </div>
          </div>
        </div>

        {/* Equipment Items */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Equipment Included ({booking.packageId.items.length} items):</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-24 overflow-y-auto">
            {booking.packageId.items.slice(0, 6).map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded border">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-2 flex-shrink-0"></div>
                  <span className="truncate font-medium text-gray-800">
                    {item.equipmentId?.name || 'Equipment Item'}
                  </span>
                </div>
                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                  ×{item.quantity}
                </span>
              </div>
            ))}
            {booking.packageId.items.length > 6 && (
              <div className="text-sm text-purple-600 font-medium col-span-full text-center py-1">
                +{booking.packageId.items.length - 6} more items • Click "View Details" to see all
              </div>
            )}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Price per day:</span>
              <span className="font-medium">{booking.pricePerDay.toLocaleString()} KWD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Number of days:</span>
              <span className="font-medium">{booking.numberOfDays}</span>
            </div>
            <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total Amount:</span>
              <span className="text-purple-600">{booking.totalPrice.toLocaleString()} KWD</span>
            </div>
          </div>
        </div>

        {/* Event Description */}
        {booking.eventDescription && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Event Description:</p>
            <p className="text-sm text-gray-600 line-clamp-2">{booking.eventDescription}</p>
          </div>
        )}

        {/* Special Requests */}
        {booking.specialRequests && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Special Requests:</p>
            <p className="text-sm text-gray-600 line-clamp-2">{booking.specialRequests}</p>
          </div>
        )}

        {/* Booking Date */}
        <div className="text-xs text-gray-500 mb-4">
          Booked on {new Date(booking.bookingDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            onClick={() => onViewDetails(booking)}
            className="flex items-center text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </button>

          <div className="flex items-center gap-2">
            {canCancel() && onCancel && (
              <button
                onClick={() => onCancel(booking._id)}
                className="flex items-center text-red-600 hover:text-red-700 text-sm font-medium"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentPackageBookingCard;