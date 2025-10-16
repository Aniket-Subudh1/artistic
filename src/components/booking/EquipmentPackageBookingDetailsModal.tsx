'use client';

import React, { useState } from 'react';
import { 
  X, Package, Calendar, MapPin, User, Phone, Mail, 
  DollarSign, Clock, AlertCircle, CheckCircle, XCircle,
  MessageSquare, MapPinIcon
} from 'lucide-react';
import { EquipmentPackageBooking } from '@/types/booking';
import { equipmentPackageBookingService } from '@/services/equipment-package-booking.service';

interface EquipmentPackageBookingDetailsModalProps {
  booking: EquipmentPackageBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onCancel?: (bookingId: string, reason: string) => void;
  onStatusUpdate?: (bookingId: string, status: string) => void;
  showProviderActions?: boolean;
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

export const EquipmentPackageBookingDetailsModal: React.FC<EquipmentPackageBookingDetailsModalProps> = ({
  booking,
  isOpen,
  onClose,
  onCancel,
  onStatusUpdate,
  showProviderActions = false
}) => {
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !booking) return null;

  const status = statusConfig[booking.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const formatDateRange = () => {
    return equipmentPackageBookingService.formatDateRange(booking.startDate, booking.endDate);
  };

  const handleCancel = async () => {
    if (!cancellationReason.trim()) return;

    setSubmitting(true);
    try {
      await onCancel?.(booking._id, cancellationReason);
      setShowCancelForm(false);
      setCancellationReason('');
      onClose();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setSubmitting(true);
    try {
      await onStatusUpdate?.(booking._id, newStatus);
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const canCancel = () => {
    return booking.status === 'pending' || booking.status === 'confirmed';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Package Booking Details</h2>
              <p className="text-sm text-gray-600">
                Booking ID: {booking._id.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Status and Package Info */}
          <div className="grid grid-cols-1 gap-4">
            {/* Package Details */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Package Information</h3>
              
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start gap-3">
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
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{booking.packageId.name}</h4>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{booking.packageId.description}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <User className="h-4 w-4 mr-1" />
                      Provider: {booking.packageId.createdBy.firstName} {booking.packageId.createdBy.lastName}
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipment Items */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Equipment Included</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {booking.packageId.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.equipmentId.images && item.equipmentId.images.length > 0 ? (
                          <img 
                            src={item.equipmentId.images[0]} 
                            alt={item.equipmentId.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{item.equipmentId.name}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity} • {item.equipmentId.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Status and Actions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Booking Status</h3>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium border ${status.bgColor} ${status.color}`}>
                  <StatusIcon className="h-4 w-4 mr-1" />
                  {status.label}
                </div>
              </div>

              {/* Booking Dates and Pricing */}
              <div className="border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">Booking Period</p>
                    <p className="text-gray-600 text-sm">{formatDateRange()}</p>
                    <p className="text-xs text-gray-500">{booking.numberOfDays} day{booking.numberOfDays !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">Total Amount</p>
                    <p className="text-lg font-bold text-purple-600">${booking.totalPrice.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      ${booking.pricePerDay.toLocaleString()} × {booking.numberOfDays} day{booking.numberOfDays !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Provider Actions */}
              {showProviderActions && booking.status === 'pending' && (
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">Provider Actions</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate('confirmed')}
                      disabled={submitting}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Confirm Booking
                    </button>
                    <button
                      onClick={() => setShowCancelForm(true)}
                      disabled={submitting}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject Booking
                    </button>
                  </div>
                </div>
              )}

              {/* Customer Cancel */}
              {!showProviderActions && canCancel() && onCancel && (
                <button
                  onClick={() => setShowCancelForm(true)}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm">Name</p>
                    <p className="text-gray-600 text-sm truncate">{booking.userDetails.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm">Email</p>
                    <p className="text-gray-600 text-sm truncate">{booking.userDetails.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm">Phone</p>
                    <p className="text-gray-600 text-sm">{booking.userDetails.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Venue Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Venue Information</h3>
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm">Address</p>
                  <p className="text-gray-600 text-sm">{booking.venueDetails.address}</p>
                  <p className="text-gray-600 text-sm">
                    {booking.venueDetails.city}, {booking.venueDetails.state}, {booking.venueDetails.country}
                  </p>
                  {booking.venueDetails.postalCode && (
                    <p className="text-gray-600 text-sm">{booking.venueDetails.postalCode}</p>
                  )}
                  {booking.venueDetails.venueType && (
                    <p className="text-xs text-gray-500 mt-1">Venue Type: {booking.venueDetails.venueType}</p>
                  )}
                </div>
              </div>
              {booking.venueDetails.additionalInfo && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="font-medium text-gray-900 text-sm">Additional Info</p>
                  <p className="text-gray-600 text-sm">{booking.venueDetails.additionalInfo}</p>
                </div>
              )}
            </div>
          </div>

          {/* Event Details */}
          {(booking.eventDescription || booking.specialRequests) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Event Details</h3>
              <div className="space-y-3">
                {booking.eventDescription && (
                  <div>
                    <p className="font-medium text-gray-900 mb-1 text-sm">Event Description</p>
                    <p className="text-gray-600 bg-gray-50 p-2 rounded-lg text-sm">{booking.eventDescription}</p>
                  </div>
                )}
                {booking.specialRequests && (
                  <div>
                    <p className="font-medium text-gray-900 mb-1 text-sm">Special Requests</p>
                    <p className="text-gray-600 bg-gray-50 p-2 rounded-lg text-sm">{booking.specialRequests}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Booking History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking History</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Booking Created</p>
                  <p className="text-xs text-gray-600">
                    {new Date(booking.bookingDate).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              {booking.status === 'cancelled' && booking.cancelledAt && (
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Booking Cancelled</p>
                    <p className="text-xs text-gray-600">
                      {new Date(booking.cancelledAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {booking.cancellationReason && (
                      <p className="text-xs text-red-600 mt-1">Reason: {booking.cancellationReason}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cancel Form Modal */}
        {showCancelForm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {showProviderActions ? 'Reject Booking' : 'Cancel Booking'}
              </h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for {showProviderActions ? 'rejecting' : 'cancelling'} this booking:
              </p>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter reason..."
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowCancelForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={handleCancel}
                  disabled={!cancellationReason.trim() || submitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : (showProviderActions ? 'Reject' : 'Cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentPackageBookingDetailsModal;