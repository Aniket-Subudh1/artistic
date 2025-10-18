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
  
  // Handle multi-day vs single-day bookings
  const isMultiDay = booking.isMultiDay && booking.eventDates && booking.eventDates.length > 1;
  const eventDate = isMultiDay ? new Date(booking.eventDates![0].date) : new Date(booking.eventDate);
  const lastEventDate = isMultiDay ? new Date(booking.eventDates![booking.eventDates!.length - 1].date) : eventDate;
  
  const bookingDate = new Date(booking.bookingDate);
  const isUpcoming = eventDate > new Date();
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

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

  return (
    <div className={`
      bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md 
      transition-all duration-200 hover:border-gray-300 hover-lift
      ${className}
    `}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start gap-4">
          {/* Artist Photo */}
          <div className="w-16 h-16 flex-shrink-0">
            {booking.artist?.profilePicture ? (
              <img 
                src={booking.artist.profilePicture} 
                alt={booking.artist.fullName || 'Artist'}
                className="w-full h-full object-cover rounded-xl border border-gray-200"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl border border-gray-200 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Artist Info and Status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
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
              {isMultiDay && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                  Multi-Day Event
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {booking.artist?.fullName || 'Artist Name'}
            </h3>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 font-medium">
                {booking.artist?.artistType || 'Artist'}
              </p>
              {booking.artist?.location && (
                <p className="text-xs text-gray-500">
                  📍 {booking.artist.location.city}, {booking.artist.location.state}
                </p>
              )}
              {booking.artist?.bio && (
                <p className="text-xs text-gray-500 line-clamp-1">
                  {booking.artist.bio}
                </p>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0">
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
        {isMultiDay ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-5 w-5 text-purple-500" />
              <span className="font-semibold text-purple-700">
                Multi-Day Event ({booking.eventDates!.length} days)
              </span>
            </div>
            
            {/* Detailed Day Breakdown */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
              <h4 className="font-medium text-gray-900 mb-3 text-sm">Performance Schedule:</h4>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {booking.eventDates!.map((eventDay, index) => {
                  const dayDate = new Date(eventDay.date);
                  const startTime = formatTime(eventDay.startTime);
                  const endTime = formatTime(eventDay.endTime);
                  const hours = Math.abs(new Date(`2000-01-01T${eventDay.endTime}`).getTime() - new Date(`2000-01-01T${eventDay.startTime}`).getTime()) / 36e5;
                  
                  return (
                    <div key={index} className="bg-white rounded-lg p-3 border border-purple-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">
                          Day {index + 1}
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {hours} hours
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium text-gray-900">
                            {format(dayDate, 'EEEE, MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium text-gray-900">
                            {startTime} - {endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <h4 className="font-medium text-gray-900 mb-3 text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Performance Details:
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold text-gray-900">
                  {format(eventDate, 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Time:</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="font-semibold text-gray-900">
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium text-blue-600">
                  {Math.abs(new Date(`2000-01-01T${booking.endTime}`).getTime() - new Date(`2000-01-01T${booking.startTime}`).getTime()) / 36e5} hours
                </span>
              </div>
            </div>
          </div>
        )}

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
        {((booking.selectedEquipmentPackages && booking.selectedEquipmentPackages.length > 0) ||
          (booking.selectedCustomPackages && booking.selectedCustomPackages.length > 0)) && (
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <Package className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium">Equipment Packages:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {/* Standard Equipment Packages */}
                {booking.selectedEquipmentPackages?.map((pkg) => (
                  <span 
                    key={pkg._id}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-700 border border-blue-200"
                  >
                    📦 {pkg.name}
                  </span>
                ))}
                {/* Custom Equipment Packages */}
                {booking.selectedCustomPackages?.map((packageId) => (
                  <span 
                    key={packageId}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-purple-100 text-purple-700 border border-purple-200"
                  >
                    🛠️ Custom Package
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
