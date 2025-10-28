'use client';

import React from 'react';
import { Booking, BOOKING_STATUSES, EVENT_TYPES } from '@/types/booking';
import { 
  Calendar, Clock, MapPin, User, DollarSign, Package, 
  Star, CheckCircle, XCircle, AlertCircle, PlayCircle,
  Users, Wrench, Settings, Timer, CreditCard, Eye,
  ArrowRight, Heart, BadgeCheck, Sparkles, X
} from 'lucide-react';
// Using built-in Date methods instead of date-fns

interface EnhancedBookingCardProps {
  booking: Booking;
  onViewDetails: (booking: Booking) => void;
  onCancel?: (booking: Booking, reason: string) => void;
  className?: string;
}

export function EnhancedBookingCard({ booking, onViewDetails, onCancel, className = '' }: EnhancedBookingCardProps) {
  const status = BOOKING_STATUSES[booking.status];
  const eventType = EVENT_TYPES[booking.eventType];
  
  // Handle multi-day vs single-day bookings
  const isMultiDay = booking.isMultiDay && booking.eventDates && booking.eventDates.length > 1;
  const eventDate = isMultiDay ? new Date(booking.eventDates![0].date) : new Date(booking.eventDate);
  const lastEventDate = isMultiDay ? new Date(booking.eventDates![booking.eventDates!.length - 1].date) : eventDate;
  
  const bookingDate = new Date(booking.bookingDate);
  const isUpcoming = eventDate > new Date();
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  const calculateHoursDifference = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  // Calculate total hours
  const totalHours = isMultiDay 
    ? booking.totalHours || booking.eventDates?.reduce((total, day) => {
        return total + calculateHoursDifference(day.startTime, day.endTime);
      }, 0) || 0
    : calculateHoursDifference(booking.startTime, booking.endTime);

  const hasEquipment = (booking.selectedEquipmentPackages && booking.selectedEquipmentPackages.length > 0) ||
                      (booking.selectedCustomPackages && booking.selectedCustomPackages.length > 0) ||
                      (booking.equipments && booking.equipments.length > 0);

  const equipmentCount = (booking.selectedEquipmentPackages?.length || 0) + 
                        (booking.selectedCustomPackages?.length || 0);

  // Calculate equipment duration in days
  const equipmentDays = isMultiDay 
    ? booking.eventDates?.length || 1
    : 1;

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
    return timeObj.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
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
            <span className={`
              inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium 
              ${eventType.bgColor} ${eventType.color}
            `}>
              {eventType.value === 'private' ? <Users className="h-3 w-3" /> : <Star className="h-3 w-3" />}
              {eventType.label}
            </span>
            
            {isMultiDay && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                <Calendar className="h-3 w-3" />
                {booking.eventDates?.length}D
              </span>
            )}
          </div>
        </div>

        {/* Booking Type Badge */}
        <div className="mb-3">
          <span className={`
            inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium 
            ${hasEquipment 
              ? (booking.bookingType === 'combined' || booking.bookingType === 'artist' || (!booking.bookingType && hasEquipment)) 
                ? 'bg-gradient-to-r from-purple-100 to-orange-100 text-purple-700'
                : 'bg-orange-100 text-orange-700'
              : 'bg-purple-100 text-purple-700'
            }
          `}>
            {hasEquipment ? (
              booking.bookingType === 'combined' || (!booking.bookingType && hasEquipment) ? (
                <>
                  <User className="h-3 w-3" />
                  <Package className="h-3 w-3" />
                  Artist + Equipment
                </>
              ) : booking.bookingType === 'equipment_only' ? (
                <>
                  <Package className="h-3 w-3" />
                  Equipment Only
                </>
              ) : (
                <>
                  <User className="h-3 w-3" />
                  <Package className="h-3 w-3" />
                  Artist + Equipment
                </>
              )
            ) : (
              <>
                <User className="h-3 w-3" />
                Artist Only
              </>
            )}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 flex-1 flex flex-col">
        {/* Artist Section */}
        <div className="flex items-center gap-3 mb-4">
          {/* Artist Photo */}
          <div className="relative w-12 h-12 flex-shrink-0">
            {booking.artist?.profilePicture ? (
              <img 
                src={booking.artist.profilePicture} 
                alt={booking.artist.fullName || 'Artist'}
                className="w-full h-full object-cover rounded-lg border border-gray-200"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg border border-gray-200 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-500" />
              </div>
            )}
          </div>

          {/* Artist Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-sm group-hover:text-blue-600 transition-colors">
              {booking.artist?.stageName || booking.artist?.fullName || 'Artist Name'}
            </h3>
            <p className="text-xs text-gray-600 truncate">
              {booking.artist?.artistType || 'Artist'}
            </p>
            {booking.artist?.location && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{booking.artist.location.city}, {booking.artist.location.state}</span>
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

        {/* Event Schedule */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <h4 className="font-medium text-gray-900 text-sm">Event Schedule</h4>
            <div className="ml-auto flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              <Timer className="h-3 w-3" />
              {totalHours}h
            </div>
          </div>
          
          {isMultiDay ? (
            <div className="text-sm">
              <div className="font-medium text-purple-700 mb-1">
                {formatShortDate(eventDate)} - {formatShortDate(lastEventDate)}, {lastEventDate.getFullYear()}
              </div>
              <div className="text-xs text-gray-600">
                {booking.eventDates?.length} days • Multiple time slots
              </div>
            </div>
          ) : (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-xs">Date:</span>
                  <span className="font-medium text-gray-900 text-xs">
                    {formatDate(eventDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-xs">Time:</span>
                  <span className="font-medium text-gray-900 text-xs">
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </span>
                </div>
              </div>
          )}
        </div>

        {/* Equipment Section */}
        {hasEquipment && (
          <div className="bg-orange-50 rounded-lg p-3 mb-3 border border-orange-100">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-orange-500" />
              <h4 className="font-medium text-gray-900 text-sm">Equipment</h4>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  <Timer className="h-3 w-3" />
                  {equipmentDays}d
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                  <Wrench className="h-3 w-3" />
                  {equipmentCount}
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              {/* Provider Packages (show all) */}
              {booking.selectedEquipmentPackages?.map((pkg, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white rounded p-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Package className="h-3 w-3 text-orange-600 flex-shrink-0" />
                    <span className="font-medium text-gray-900 truncate">{pkg.name}</span>
                  </div>
                  <span className="text-gray-900 font-semibold ml-2 flex-shrink-0">
                    {formatCurrency(pkg.totalPrice)}
                  </span>
                </div>
              ))}
              
              {/* Custom Packages (show all) */}
              {booking.selectedCustomPackages?.map((pkg, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white rounded p-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Settings className="h-3 w-3 text-amber-600 flex-shrink-0" />
                    <span className="font-medium text-gray-900 truncate">{pkg.name}</span>
                  </div>
                  <span className="text-gray-900 font-semibold ml-2 flex-shrink-0">
                    {formatCurrency(pkg.totalPrice)}
                  </span>
                </div>
              ))}

            </div>
          </div>
        )}

        {/* Venue Information */}
        <div className="bg-emerald-50 rounded-lg p-3 mb-4 border border-emerald-100">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-emerald-500" />
            <h4 className="font-medium text-gray-900 text-sm">Venue</h4>
          </div>
          <div className="text-sm">
            <div className="font-medium text-xs text-gray-900">
              {booking.venueDetails.city}, {booking.venueDetails.state}
            </div>
            <div className="text-gray-600 text-xs truncate mt-0.5">
              {booking.venueDetails.address}
            </div>
            {booking.venueDetails.venueType && (
              <div className="text-xs text-emerald-700 mt-1">
                {booking.venueDetails.venueType}
              </div>
            )}
          </div>
        </div>

        {/* Price Breakdown (if needed) */}
        {booking.artistPrice !== booking.totalPrice && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Artist:</span>
                <span className="font-medium text-gray-900">{formatCurrency(booking.artistPrice)}</span>
              </div>
              {booking.equipmentPrice && booking.equipmentPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Equipment:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(booking.equipmentPrice)}</span>
                </div>
              )}
            </div>
          </div>
        )}
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
            <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Booked {formatDate(bookingDate)}
          </div>
          {booking.paymentStatus && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
              booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              <CreditCard className="h-3 w-3" />
              {booking.paymentStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}