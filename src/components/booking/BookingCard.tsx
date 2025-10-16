'use client';

import React from 'react';
import { Booking, BOOKING_STATUSES, EVENT_TYPES } from '@/types/booking';
import { Calendar, Clock, MapPin, User, DollarSign, Phone, Mail, Package } from 'lucide-react';
import { format } from 'date-fns';

interface BookingCardProps {
  booking: Booking;
  onViewDetails: (booking: Booking) => void;
  onCancel?: (booking: Booking, reason: string) => void;
  className?: string;
}

export function BookingCard({ booking, onViewDetails, onCancel, className = '' }: BookingCardProps) {
  const status = BOOKING_STATUSES[booking.status];
  const eventType = EVENT_TYPES[booking.eventType];
  const eventDate = new Date(booking.eventDate);
  const bookingDate = new Date(booking.bookingDate);
  const isUpcoming = eventDate > new Date();
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const timeObj = new Date();
    timeObj.setHours(parseInt(hours), parseInt(minutes));
    return format(timeObj, 'h:mm a');
  };

  return (
    <div className={`
      bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md 
      transition-all duration-200 hover:border-gray-300 hover-lift
      ${className}
    `}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                ${status.bgColor} ${status.color}
              `}>
                {status.label}
              </span>
              <span className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${eventType.bgColor} ${eventType.color}
              `}>
                {eventType.label}
              </span>
              {isUpcoming && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  Upcoming
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {booking.artist?.fullName || 'Artist Name'}
            </h3>
            <p className="text-sm text-gray-600">
              {booking.artist?.artistType || 'Artist'}
            </p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(booking.totalPrice)}
            </p>
            <p className="text-xs text-gray-500">
              Booked {format(bookingDate, 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-6 space-y-4">
        {/* Date and Time */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{format(eventDate, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-sm text-gray-700">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">{booking.venueDetails.address}</p>
            <p className="text-gray-500">
              {booking.venueDetails.city}, {booking.venueDetails.state}, {booking.venueDetails.country}
            </p>
          </div>
        </div>

        {/* Contact */}
        {booking.userDetails && (
          <div className="flex items-center gap-4 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span>{booking.userDetails.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{booking.userDetails.phone}</span>
            </div>
          </div>
        )}

        {/* Equipment Packages */}
        {booking.selectedEquipmentPackages && booking.selectedEquipmentPackages.length > 0 && (
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <Package className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium">Equipment Packages:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {booking.selectedEquipmentPackages.map((pkg) => (
                  <span 
                    key={pkg._id}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700"
                  >
                    {pkg.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Artist Fee:</span>
            <span className="font-medium">{formatCurrency(booking.artistPrice)}</span>
          </div>
          {booking.equipmentPrice && booking.equipmentPrice > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Equipment:</span>
              <span className="font-medium">{formatCurrency(booking.equipmentPrice)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
            <span>Total:</span>
            <span>{formatCurrency(booking.totalPrice)}</span>
          </div>
        </div>

        {/* Event Description */}
        {booking.eventDescription && (
          <div className="text-sm">
            <p className="font-medium text-gray-700 mb-1">Event Description:</p>
            <p className="text-gray-600 line-clamp-2">{booking.eventDescription}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onViewDetails(booking)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            View Details
          </button>
          
          <div className="flex items-center gap-3">
            {canCancel && onCancel && isUpcoming && (
              <button
                onClick={() => onCancel(booking, 'Quick cancel from card')}
                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                Cancel Booking
              </button>
            )}
            
            {booking.status === 'confirmed' && isUpcoming && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-green-100 text-green-700">
                Confirmed
              </span>
            )}
            
            {booking.status === 'completed' && (
              <button className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors">
                Leave Review
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
