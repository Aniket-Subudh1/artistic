'use client';

import React, { useState } from 'react';
import { Booking, BOOKING_STATUSES, EVENT_TYPES } from '@/types/booking';
import { 
  Calendar, Clock, MapPin, User, DollarSign, Phone, Mail, Package, 
  X, CreditCard, AlertCircle, CheckCircle, XCircle, Music 
} from 'lucide-react';
import { format } from 'date-fns';

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onCancel?: (booking: Booking, reason: string) => void;
}

export function BookingDetailsModal({ booking, isOpen, onClose, onCancel }: BookingDetailsModalProps) {
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !booking) return null;

  const status = BOOKING_STATUSES[booking.status];
  const eventType = EVENT_TYPES[booking.eventType];
  const eventDate = new Date(booking.eventDate);
  const bookingDate = new Date(booking.bookingDate);
  const isUpcoming = eventDate > new Date();
  const canCancel = (booking.status === 'pending' || booking.status === 'confirmed') && isUpcoming;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KWD'
    }).format(amount);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const timeObj = new Date();
    timeObj.setHours(parseInt(hours), parseInt(minutes));
    return format(timeObj, 'h:mm a');
  };

  // Calculate booking duration in hours
  const calculateBookingHours = () => {
    const startHour = parseInt(booking.startTime.split(':')[0]);
    const endHour = parseInt(booking.endTime.split(':')[0]);
    return endHour - startHour;
  };

  const bookingHours = calculateBookingHours();

  // Calculate artist fee if not provided or is 0
  const getArtistFee = () => {
    if (booking.artistPrice && booking.artistPrice > 0) {
      return booking.artistPrice;
    }
    // Fallback calculation if artistPrice is 0 or missing
    if (booking.artist?.pricing?.hourlyRate) {
      return booking.artist.pricing.hourlyRate * bookingHours;
    }
    return 0;
  };

  const artistFee = getArtistFee();

  const handleCancelSubmit = async () => {
    if (!cancelReason.trim() || !onCancel) return;
    
    setIsSubmitting(true);
    try {
      await onCancel(booking, cancelReason);
      setShowCancelForm(false);
      setCancelReason('');
      onClose();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = () => {
    switch (booking.status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-4">
            {getStatusIcon()}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
              <p className="text-sm text-gray-600">Booking ID: {booking._id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Status and Type */}
          <div className="p-6 bg-gray-50">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`
                inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border-2
                ${status.bgColor} ${status.color}
              `}>
                {status.label}
              </span>
              <span className={`
                inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
                ${eventType.bgColor} ${eventType.color}
              `}>
                {eventType.label}
              </span>
              
              {/* Booking Type Indicator */}
              {booking.artist && booking.selectedEquipmentPackages && booking.selectedEquipmentPackages.length > 0 && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200">
                  Combined Booking
                </span>
              )}
              {booking.artist && (!booking.selectedEquipmentPackages || booking.selectedEquipmentPackages.length === 0) && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  Artist Only
                </span>
              )}
              {!booking.artist && booking.selectedEquipmentPackages && booking.selectedEquipmentPackages.length > 0 && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                  Equipment Only
                </span>
              )}
              
              {isUpcoming && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  Upcoming Event
                </span>
              )}
            </div>
          </div>

          {/* Artist Information */}
          {booking.artist && (
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Artist Information</h3>
              <div className="flex items-start gap-4">
                {booking.artist?.profilePicture && (
                  <img
                    src={booking.artist.profilePicture}
                    alt={booking.artist.fullName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-900 mb-1">
                    {booking.artist?.fullName || 'Artist Name'}
                  </h4>
                  <p className="text-gray-600 mb-2 flex items-center">
                    <Music className="w-4 h-4 mr-1" />
                    {booking.artist?.artistType || 'Artist'}
                  </p>
                  {booking.artist?.bio && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{booking.artist.bio}</p>
                  )}
                  {booking.artist?.location && (
                    <p className="text-sm text-gray-500 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {booking.artist.location.city}, {booking.artist.location.state}
                    </p>
                  )}
                  {booking.artist?.pricing?.hourlyRate && (
                    <p className="text-sm font-medium text-green-600 mt-2 flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      ${booking.artist.pricing.hourlyRate}/hour
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Event Details */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date and Time */}
              <div className="space-y-3">
                {booking.isMultiDay && booking.eventDates && booking.eventDates.length > 1 ? (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium text-gray-900">Multi-Day Event</p>
                        <p className="text-purple-600 text-sm font-medium">
                          {booking.eventDates.length} days total
                        </p>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                      {booking.eventDates.map((eventDay, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-700">Day {index + 1}:</span>
                          <span className="font-medium">
                            {format(new Date(eventDay.date), 'MMM d')} • {formatTime(eventDay.startTime)} - {formatTime(eventDay.endTime)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Event Date</p>
                        <p className="text-gray-600">{format(eventDate, 'EEEE, MMMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Event Time</p>
                        <p className="text-gray-600">
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Location */}
              <div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Venue Details</p>
                    <div className="text-gray-600 space-y-1">
                      <p>{booking.venueDetails.address}</p>
                      <p>
                        {booking.venueDetails.city}, {booking.venueDetails.state}
                      </p>
                      <p>{booking.venueDetails.country}</p>
                      {booking.venueDetails.postalCode && (
                        <p>{booking.venueDetails.postalCode}</p>
                      )}
                      {booking.venueDetails.venueType && (
                        <p className="text-sm text-gray-500">
                          Venue Type: {booking.venueDetails.venueType}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Description */}
            {booking.eventDescription && (
              <div className="mt-6">
                <p className="font-medium text-gray-900 mb-2">Event Description</p>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                  {booking.eventDescription}
                </p>
              </div>
            )}

            {/* Special Requests */}
            {booking.specialRequests && (
              <div className="mt-4">
                <p className="font-medium text-gray-900 mb-2">Special Requests</p>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                  {booking.specialRequests}
                </p>
              </div>
            )}
          </div>

          {/* Contact Information */}
          {booking.userDetails && (
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Contact Person</p>
                    <p className="text-gray-600">{booking.userDetails.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-gray-600">{booking.userDetails.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-600">{booking.userDetails.email}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Equipment Packages */}
          {((booking.selectedEquipmentPackages && booking.selectedEquipmentPackages.length > 0) ||
            (booking.selectedCustomPackages && booking.selectedCustomPackages.length > 0)) && (
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Packages</h3>
              
              {/* Standard Equipment Packages */}
              {booking.selectedEquipmentPackages && booking.selectedEquipmentPackages.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">📦 Standard Packages</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {booking.selectedEquipmentPackages.map((pkg) => (
                      <div key={pkg._id} className="border border-blue-200 rounded-lg p-4 bg-blue-50 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <Package className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 truncate">{pkg.name}</h5>
                            {pkg.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{pkg.description}</p>
                            )}
                            
                            {/* Equipment Items in Package */}
                            {pkg.items && pkg.items.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-700 mb-1">Equipment Included:</p>
                                <div className="space-y-1 max-h-20 overflow-y-auto">
                                  {pkg.items.map((item, idx) => (
                                    <div key={idx} className="text-xs text-gray-600 flex justify-between">
                                      <span>{item.equipmentId?.name || 'Equipment Item'}</span>
                                      <span>×{item.quantity}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-lg font-semibold text-gray-900">
                                {formatCurrency((pkg.totalPrice || 0) * bookingHours)}
                              </span>
                              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">
                                {bookingHours} hour{bookingHours !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Equipment Packages */}
              {booking.selectedCustomPackages && booking.selectedCustomPackages.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">🛠️ Custom Packages</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {booking.selectedCustomPackages.map((packageId, index) => (
                      <div key={packageId} className="border border-purple-200 rounded-lg p-4 bg-purple-50 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <Package className="h-5 w-5 text-purple-500 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900">Custom Package #{index + 1}</h5>
                            <p className="text-sm text-gray-600 mt-1">
                              Tailored equipment selection based on your specific requirements
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-sm text-purple-600 font-medium">Custom Pricing</span>
                              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">
                                {bookingHours} hour{bookingHours !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Equipment Total */}
              {booking.equipmentPrice && booking.equipmentPrice > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Equipment Subtotal:</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(booking.equipmentPrice)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Information */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
            
            {/* Booking Summary */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Booking Includes:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                {booking.artist && (
                  <div className="flex items-center">
                    <span>✓ Artist services for {bookingHours} hour{bookingHours !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {booking.selectedEquipmentPackages && booking.selectedEquipmentPackages.length > 0 && (
                  <div className="flex items-center">
                    <span>✓ {booking.selectedEquipmentPackages.length} equipment package{booking.selectedEquipmentPackages.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <span>✓ Event setup and coordination</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                {/* Artist Fee */}
                {(artistFee > 0 || booking.artist) && (
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-gray-600">
                        Artist Fee ({bookingHours} hour{bookingHours !== 1 ? 's' : ''}):
                      </span>
                      {booking.artist?.pricing?.hourlyRate && artistFee === booking.artist.pricing.hourlyRate * bookingHours && (
                        <span className="text-xs text-gray-500">
                          ${booking.artist.pricing.hourlyRate}/hour × {bookingHours} hour{bookingHours !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">{formatCurrency(artistFee)}</span>
                  </div>
                )}
                
                {/* Equipment Fee */}
                {booking.equipmentPrice && booking.equipmentPrice > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Equipment Packages:</span>
                    <span className="font-medium">{formatCurrency(booking.equipmentPrice)}</span>
                  </div>
                )}
                
                {/* Subtotal if there are multiple components */}
                {artistFee > 0 && booking.equipmentPrice && booking.equipmentPrice > 0 && (
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(artistFee + (booking.equipmentPrice || 0))}</span>
                    </div>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(booking.totalPrice)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Payment Status: {booking.paymentStatus || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Timeline */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">
                  Booking Created: {format(bookingDate, 'PPP p')}
                </span>
              </div>
              {booking.cancelledAt && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-gray-600">
                    Cancelled: {format(new Date(booking.cancelledAt), 'PPP p')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Cancellation Section */}
          {booking.status === 'cancelled' && booking.cancellationReason && (
            <div className="p-6 border-b border-gray-100 bg-red-50">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Cancellation Details</h3>
              <p className="text-red-700 mb-2">Reason: {booking.cancellationReason}</p>
              {booking.refundAmount && (
                <p className="text-red-700">
                  Refund Amount: {formatCurrency(booking.refundAmount)}
                </p>
              )}
            </div>
          )}

          {/* Cancel Form */}
          {showCancelForm && (
            <div className="p-6 bg-red-50 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-red-900 mb-4">Cancel Booking</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for cancellation *
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows={3}
                    placeholder="Please provide a reason for cancelling this booking..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelSubmit}
                    disabled={!cancelReason.trim() || isSubmitting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
                  </button>
                  <button
                    onClick={() => setShowCancelForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Keep Booking
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Last updated: {booking.updatedAt ? format(new Date(booking.updatedAt), 'PPP p') : 'N/A'}
          </div>
          <div className="flex gap-3">
            {canCancel && onCancel && !showCancelForm && (
              <button
                onClick={() => setShowCancelForm(true)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Cancel Booking
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
