
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

  // Enhanced package type detection
  const isCustomPackage = !booking.packageId || booking.specialRequests?.includes('[CUSTOM PACKAGE]');
  const hasPackageData = booking.packageId && booking.packageId.name;
  const packageName = hasPackageData ? booking.packageId.name : 'Custom Equipment Package';
  const packageDescription = hasPackageData ? booking.packageId.description : 'Custom equipment package configured by user with specific requirements';

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

  // Safe currency formatting
  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'KWD 0.000';
    }
    return `KWD ${Number(amount).toFixed(3)}`;
  };

  // Calculate daily rate safely
  const calculateDailyRate = (): number => {
    const total = booking.totalPrice || 0;
    const days = booking.numberOfDays || 1;
    return total / days;
  };

  const dailyRate = calculateDailyRate();

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
              
              <div className={`border rounded-lg p-3 ${isCustomPackage ? 'border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50' : 'border-gray-200'}`}>
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                    {hasPackageData && (booking.packageId?.coverImage || (booking.packageId?.images && booking.packageId.images.length > 0)) ? (
                      <img 
                        src={booking.packageId.coverImage || booking.packageId.images![0]} 
                        alt={packageName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {isCustomPackage ? (
                          <MessageSquare className="h-6 w-6 text-orange-500" />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 flex-1">{packageName}</h4>
                      {isCustomPackage && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          <MessageSquare className="h-3 w-3" />
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{packageDescription}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <User className="h-4 w-4 mr-1" />
                      {hasPackageData && booking.packageId?.createdBy ? (
                        <>Provider: {booking.packageId.createdBy.firstName} {booking.packageId.createdBy.lastName}</>
                      ) : (
                        <>Configured by: User</>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipment Items - Conditional Display */}
              {hasPackageData && booking.packageId?.items && booking.packageId.items.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Equipment Included</h4>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        <Package className="h-3 w-3" />
                        {booking.packageId.items.length} items
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {booking.packageId.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          {/* Equipment Image */}
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {item.equipmentId?.images && item.equipmentId.images.length > 0 ? (
                              <img 
                                src={item.equipmentId.images[0]} 
                                alt={item.equipmentId.name || 'Equipment'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          
                          {/* Equipment Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-gray-900 text-sm mb-1">
                                  {item.equipmentId?.name || 'Equipment Item'}
                                </h5>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-4 text-xs text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Package className="h-3 w-3" />
                                      Category: {item.equipmentId?.category || 'Not specified'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <span className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        {item.quantity || 1}
                                      </span>
                                      Quantity: {item.quantity || 1}
                                    </span>
                                  </div>
                                  
                                  {/* Pricing Details */}
                                  <div className="flex items-center gap-4 text-xs">
                                    <span className="text-gray-600">
                                      Rate: <span className="font-semibold text-gray-900">
                                        {(item.equipmentId?.pricePerDay || 0).toLocaleString()} KWD/day
                                      </span>
                                    </span>
                                    <span className="text-gray-600">
                                      Subtotal: <span className="font-semibold text-blue-600">
                                        {((item.equipmentId?.pricePerDay || 0) * (item.quantity || 1)).toLocaleString()} KWD/day
                                      </span>
                                    </span>
                                  </div>
                                  
                                  {/* Total for rental period */}
                                  <div className="bg-blue-50 rounded-md p-2 mt-2">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-blue-700 font-medium">
                                        Total for {booking.numberOfDays} day{booking.numberOfDays !== 1 ? 's' : ''}:
                                      </span>
                                      <span className="font-bold text-blue-800">
                                        {(((item.equipmentId?.pricePerDay || 0) * (item.quantity || 1)) * booking.numberOfDays).toLocaleString()} KWD
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Package Total Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-2 text-sm">Package Summary</h5>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Daily Package Rate:</span>
                          <span className="font-semibold text-gray-900">
                            {booking.packageId.items.reduce((total, item) => 
                              total + ((item.equipmentId?.pricePerDay || 0) * (item.quantity || 1)), 0
                            ).toLocaleString()} KWD
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Rental Duration:</span>
                          <span className="font-semibold text-gray-900">
                            {booking.numberOfDays} day{booking.numberOfDays !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="border-t border-blue-200 pt-1 mt-2">
                          <div className="flex items-center justify-between text-base">
                            <span className="font-semibold text-blue-700">Total Package Cost:</span>
                            <span className="font-bold text-blue-800 text-lg">
                              {formatCurrency(booking.totalPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Custom Equipment Configuration</h4>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                      <MessageSquare className="h-3 w-3" />
                      Custom Package
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Custom Package Summary */}
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="h-5 w-5 text-orange-500" />
                        <span className="font-medium text-orange-700">Custom Package Information</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="bg-white rounded-lg p-3 border border-orange-200">
                          <div className="text-xs text-gray-600 mb-1">Package Type</div>
                          <div className="font-semibold text-orange-700">User Configured</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-orange-200">
                          <div className="text-xs text-gray-600 mb-1">Configuration Status</div>
                          <div className="font-semibold text-orange-700">Custom Setup</div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 border border-orange-200">
                        <h5 className="font-medium text-gray-900 mb-2 text-sm">Pricing Details</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Daily Rate:</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(dailyRate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-semibold text-gray-900">{booking.numberOfDays} day{booking.numberOfDays !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="border-t border-orange-200 pt-1 mt-2">
                            <div className="flex justify-between">
                              <span className="font-semibold text-orange-700">Total Cost:</span>
                              <span className="font-bold text-orange-800 text-lg">{formatCurrency(booking.totalPrice)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-orange-600 leading-relaxed mt-3">
                        This booking contains custom equipment configured by the user through the custom package builder. 
                        The specific equipment list and requirements were provided during the booking process.
                      </p>
                    </div>
                    
                    {/* Special Requirements */}
                    {booking.specialRequests && !booking.specialRequests.includes('[CUSTOM PACKAGE]') && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-blue-700 text-sm">Special Requirements</span>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <p className="text-sm text-gray-700 leading-relaxed">{booking.specialRequests}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Contact Information */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-700 text-sm">Equipment Details</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        For detailed equipment specifications and inventory list, please contact the customer directly 
                        or refer to the original custom package configuration provided during booking.
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                        <Clock className="h-3 w-3 mr-1" />
                        {booking.numberOfDays} day{booking.numberOfDays !== 1 ? 's' : ''} rental duration
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">Total Amount</p>
                    <p className="text-lg font-bold text-purple-600">{formatCurrency(booking.totalPrice)}</p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(dailyRate)} × {booking.numberOfDays} day{booking.numberOfDays !== 1 ? 's' : ''}
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