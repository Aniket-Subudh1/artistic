'use client';

import React, { useState, useEffect } from 'react';
import { Booking, BOOKING_STATUSES, EVENT_TYPES } from '@/types/booking';
import { 
  X, Calendar, Clock, MapPin, User, DollarSign, Package, 
  Star, CheckCircle, XCircle, AlertCircle, PlayCircle,
  Users, Wrench, Settings, Timer, CreditCard, Phone, Mail,
  ArrowRight, Heart, BadgeCheck, Sparkles, Download,
  Share2, Edit3, MessageSquare, Camera, ExternalLink,
  Zap, Award, Shield, Info, ChevronDown, ChevronUp,
  Building, Navigation, CalendarDays, Banknote
} from 'lucide-react';

interface EnhancedBookingDetailsModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onCancel?: (booking: Booking, reason: string) => void;
}

export function EnhancedBookingDetailsModal({ 
  booking, 
  isOpen, 
  onClose, 
  onCancel 
}: EnhancedBookingDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'equipment' | 'payment'>('overview');
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['artist', 'event']);

  const status = BOOKING_STATUSES[booking.status];
  const eventType = EVENT_TYPES[booking.eventType];
  
  const isMultiDay = booking.isMultiDay && booking.eventDates && booking.eventDates.length > 1;
  const eventDate = isMultiDay ? new Date(booking.eventDates![0].date) : new Date(booking.eventDate);
  const lastEventDate = isMultiDay ? new Date(booking.eventDates![booking.eventDates!.length - 1].date) : eventDate;
  
  const bookingDate = new Date(booking.bookingDate);
  const isUpcoming = eventDate > new Date();
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  // Helper functions for date and time formatting
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

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KWD'
    }).format(amount);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleCancel = async () => {
    if (onCancel && cancelReason.trim()) {
      try {
        await onCancel(booking, cancelReason.trim());
        setShowCancelForm(false);
        setCancelReason('');
        onClose();
      } catch (error) {
        console.error('Error cancelling booking:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-start gap-4">
            {/* Artist Photo */}
            <div className="relative w-16 h-16 flex-shrink-0">
              {booking.artist?.profilePicture ? (
                <img 
                  src={booking.artist.profilePicture} 
                  alt={booking.artist.fullName || 'Artist'}
                  className="w-full h-full object-cover rounded-lg border-2 border-white/30"
                />
              ) : (
                <div className="w-full h-full bg-white/20 rounded-lg border-2 border-white/30 flex items-center justify-center">
                  <User className="h-8 w-8 text-white/80" />
                </div>
              )}
              {booking.status === 'confirmed' && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
              )}
            </div>

            {/* Header Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm border border-white/30">
                  {booking.status === 'confirmed' && <CheckCircle className="h-3 w-3" />}
                  {booking.status === 'pending' && <AlertCircle className="h-3 w-3" />}
                  {booking.status === 'cancelled' && <XCircle className="h-3 w-3" />}
                  {booking.status === 'completed' && <BadgeCheck className="h-3 w-3" />}
                  {status.label}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm border border-white/30">
                  {eventType.value === 'private' ? <Users className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                  {eventType.label}
                </span>
                {isUpcoming && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 backdrop-blur-sm border border-green-300/30">
                    <PlayCircle className="h-3 w-3" />
                    Upcoming
                  </span>
                )}
              </div>
              
              <h2 className="text-xl font-bold mb-2 truncate">
                {booking.artist?.fullName || 'Artist Booking'}
              </h2>
              <div className="flex items-center gap-4 text-white/90 text-sm flex-wrap">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {isMultiDay 
                    ? `${formatShortDate(eventDate)} - ${formatShortDate(lastEventDate)}, ${lastEventDate.getFullYear()}`
                    : formatDate(eventDate)
                  }
                </div>
                <div className="flex items-center gap-1">
                  <Timer className="h-4 w-4" />
                  {Math.round(totalHours)}h total
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {formatCurrency(booking.totalPrice)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 flex-shrink-0">
          <div className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: Info },
              { id: 'timeline', label: 'Timeline', icon: Calendar },
              { id: 'equipment', label: 'Equipment', icon: Package },
              { id: 'payment', label: 'Payment', icon: CreditCard }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Artist Information */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
                <div 
                  className="flex items-center justify-between cursor-pointer mb-4"
                  onClick={() => toggleSection('artist')}
                >
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600" />
                    Artist Information
                  </h3>
                  {expandedSections.includes('artist') ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                
                {expandedSections.includes('artist') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Full Name</label>
                        <p className="text-gray-900 font-semibold">{booking.artist?.fullName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Artist Type</label>
                        <p className="text-gray-900">{booking.artist?.artistType}</p>
                      </div>
                      {booking.artist?.location && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Location</label>
                          <p className="text-gray-900 flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {booking.artist.location.city}, {booking.artist.location.state}
                          </p>
                        </div>
                      )}
                    </div>
                    {booking.artist?.bio && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Bio</label>
                        <p className="text-gray-700 text-sm bg-white rounded-lg p-4 border border-gray-200 max-h-32 overflow-y-auto">
                          {booking.artist.bio}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Event Information */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
                <div 
                  className="flex items-center justify-between cursor-pointer mb-4"
                  onClick={() => toggleSection('event')}
                >
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    Event Details
                  </h3>
                  {expandedSections.includes('event') ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                
                {expandedSections.includes('event') && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Event Type</label>
                        <p className="text-gray-900 flex items-center gap-1">
                          {eventType.value === 'private' ? <Users className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                          {eventType.label}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Duration</label>
                        <p className="text-gray-900 flex items-center gap-1">
                          <Timer className="h-4 w-4 text-gray-400" />
                          {Math.round(totalHours)} hours {isMultiDay && `(${booking.eventDates?.length} days)`}
                        </p>
                      </div>
                    </div>
                    
                    {booking.eventDescription && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Event Description</label>
                        <p className="text-gray-700 bg-white rounded-lg p-4 border border-gray-200 max-h-24 overflow-y-auto">
                          {booking.eventDescription}
                        </p>
                      </div>
                    )}
                    
                    {booking.specialRequests && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Special Requests</label>
                        <p className="text-gray-700 bg-white rounded-lg p-4 border border-gray-200 max-h-24 overflow-y-auto">
                          {booking.specialRequests}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Venue Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Building className="h-5 w-5 text-blue-600" />
                  Venue Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Address</label>
                      <p className="text-gray-900">{booking.venueDetails.address}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">City & State</label>
                      <p className="text-gray-900">{booking.venueDetails.city}, {booking.venueDetails.state}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {booking.venueDetails.venueType && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Venue Type</label>
                        <p className="text-gray-900">{booking.venueDetails.venueType}</p>
                      </div>
                    )}
                    {booking.venueDetails.postalCode && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Postal Code</label>
                        <p className="text-gray-900">{booking.venueDetails.postalCode}</p>
                      </div>
                    )}
                  </div>
                </div>
                {booking.venueDetails.additionalInfo && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-600">Additional Information</label>
                    <p className="text-gray-700 bg-white rounded-lg p-4 border border-gray-200 mt-2 max-h-20 overflow-y-auto">
                      {booking.venueDetails.additionalInfo}
                    </p>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              {booking.userDetails && (
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <Phone className="h-5 w-5 text-gray-600" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-gray-900">{booking.userDetails.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900 flex items-center gap-1 truncate">
                        <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{booking.userDetails.email}</span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900 flex items-center gap-1">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {booking.userDetails.phone}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                  Performance Schedule
                </h3>
                
                {isMultiDay ? (
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {booking.eventDates?.map((day, index) => {
                      const dayDate = new Date(day.date);
                      const startTime = formatTime(day.startTime);
                      const endTime = formatTime(day.endTime);
                      const dayHours = calculateHoursDifference(day.startTime, day.endTime);
                      
                      return (
                        <div key={index} className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">Day {index + 1}</h4>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {Math.round(dayHours)} hours
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Date:</span>
                              <div className="font-semibold text-gray-900">
                                {formatFullDate(dayDate)}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Start:</span>
                              <div className="font-semibold text-gray-900">{startTime}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">End:</span>
                              <div className="font-semibold text-gray-900">{endTime}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <div className="font-semibold text-gray-900">
                          {formatFullDate(eventDate)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Start Time:</span>
                        <div className="font-semibold text-gray-900">{formatTime(booking.startTime)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">End Time:</span>
                        <div className="font-semibold text-gray-900">{formatTime(booking.endTime)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <div className="font-semibold text-gray-900">{Math.round(totalHours)} hours</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Booking Timeline */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Booking Created</div>
                      <div className="text-sm text-gray-600">{formatDate(bookingDate)} at {bookingDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>
                    </div>
                  </div>
                  {booking.status === 'confirmed' && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Booking Confirmed</div>
                        <div className="text-sm text-gray-600">Artist accepted your booking</div>
                      </div>
                    </div>
                  )}
                  {booking.cancelledAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <XCircle className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Booking Cancelled</div>
                        <div className="text-sm text-gray-600">
                          {formatDate(new Date(booking.cancelledAt))} at {new Date(booking.cancelledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </div>
                        {booking.cancellationReason && (
                          <div className="text-sm text-gray-700 mt-2 bg-red-50 p-3 rounded border border-red-100 max-h-16 overflow-y-auto">
                            Reason: {booking.cancellationReason}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Equipment Tab */}
          {activeTab === 'equipment' && (
            <div className="space-y-6">
              {hasEquipment ? (
                <>
                  {/* Provider Packages */}
                  {booking.selectedEquipmentPackages && booking.selectedEquipmentPackages.length > 0 && (
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Package className="h-5 w-5 text-orange-600" />
                        Equipment Packages
                      </h3>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {booking.selectedEquipmentPackages.map((pkg, index) => (
                          <div key={index} className="bg-white rounded-xl p-4 border border-orange-200 shadow-sm">
                            <div className="flex items-start gap-4">
                              {pkg.coverImage && (
                                <img 
                                  src={pkg.coverImage} 
                                  alt={pkg.name}
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-gray-900 truncate">{pkg.name}</h4>
                                  <span className="text-lg font-bold text-gray-900 flex-shrink-0 ml-2">
                                    {formatCurrency(pkg.totalPrice)}
                                  </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{pkg.description}</p>
                                
                                {pkg.items && pkg.items.length > 0 && (
                                  <div className="space-y-2">
                                    <h5 className="font-medium text-gray-900 text-sm">Package Items:</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                      {pkg.items.map((item, itemIndex) => (
                                        <div key={itemIndex} className="flex items-center justify-between bg-gray-50 rounded-lg p-2 text-sm">
                                          <span className="text-gray-700 truncate">
                                            {(item.equipmentId as any)?.name || 'Equipment'} x{item.quantity}
                                          </span>
                                          <span className="text-gray-900 font-medium flex-shrink-0 ml-2">
                                            {formatCurrency(((item.equipmentId as any)?.pricePerDay || 0) * item.quantity)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Packages */}
                  {booking.selectedCustomPackages && booking.selectedCustomPackages.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        Custom Equipment Packages
                      </h3>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {booking.selectedCustomPackages.map((pkg, index) => (
                          <div key={index} className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-900 flex items-center gap-2 truncate">
                                <Settings className="h-4 w-4 text-purple-600 flex-shrink-0" />
                                {pkg.name}
                              </h4>
                              <span className="text-lg font-bold text-gray-900 flex-shrink-0 ml-2">
                                {formatCurrency(pkg.totalPrice)}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{pkg.description}</p>
                            
                            {pkg.items && pkg.items.length > 0 && (
                              <div className="space-y-2">
                                <h5 className="font-medium text-gray-900 text-sm">Custom Items:</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                  {pkg.items.map((item, itemIndex) => (
                                    <div key={itemIndex} className="flex items-center justify-between bg-purple-50 rounded-lg p-2 text-sm">
                                      <span className="text-gray-700 truncate">
                                        {item.equipment.name} x{item.quantity}
                                      </span>
                                      <span className="text-gray-900 font-medium flex-shrink-0 ml-2">
                                        {formatCurrency(item.equipment.pricePerDay * item.quantity)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Equipment Selected</h3>
                  <p className="text-gray-600">This booking is for artist services only.</p>
                </div>
              )}
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Banknote className="h-5 w-5 text-green-600" />
                  Payment Breakdown
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Artist Fee ({Math.round(totalHours)} hours)</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(booking.artistPrice)}</span>
                      </div>
                      
                      {booking.equipmentPrice && booking.equipmentPrice > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Equipment & Packages</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(booking.equipmentPrice)}</span>
                        </div>
                      )}
                      
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between items-center text-lg">
                          <span className="font-semibold text-gray-900">Total Amount</span>
                          <span className="font-bold text-green-600">{formatCurrency(booking.totalPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Payment Status</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                        booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {booking.paymentStatus || 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Refund Information */}
                  {booking.refundAmount && booking.refundAmount > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Refund Amount</span>
                        <span className="font-semibold text-blue-700">{formatCurrency(booking.refundAmount)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="text-sm text-gray-600 truncate">
            Booking ID: {booking._id}
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            {canCancel && !showCancelForm && (
              <button
                onClick={() => setShowCancelForm(true)}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm"
              >
                Cancel
              </button>
            )}
            
            <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              Download
            </button>
            
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>

        {/* Cancel Form Overlay */}
        {showCancelForm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Booking</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for cancellation
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please provide a reason for cancelling this booking..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowCancelForm(false)}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Keep Booking
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={!cancelReason.trim()}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}