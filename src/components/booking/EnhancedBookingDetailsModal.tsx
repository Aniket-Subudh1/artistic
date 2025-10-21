'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Calendar, Clock, MapPin, User, DollarSign, Package, 
  Star, X, Phone, Mail, FileText, ChevronDown, ChevronUp,
  Settings, Wrench, Music, Palette, Camera, CheckCircle,
  AlertCircle, CreditCard, Users
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Booking, BOOKING_STATUSES } from '@/types/booking';

interface EnhancedBookingDetailsModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onCancel?: (booking: Booking, reason: string) => void;
}

// Equipment category icons mapping
const EQUIPMENT_ICONS: Record<string, any> = {
  'audio': Music,
  'lighting': Palette,
  'camera': Camera,
  'video': Camera,
  'stage': Settings,
  'sound': Music,
  'lighting equipment': Palette,
  'audio equipment': Music,
  'camera equipment': Camera,
  'default': Wrench
};

export function EnhancedBookingDetailsModal({ 
  booking, 
  isOpen, 
  onClose, 
  onCancel 
}: EnhancedBookingDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'equipment' | 'venue'>('overview');
  const [showAllEquipment, setShowAllEquipment] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (!isOpen) return null;

  const statusInfo = BOOKING_STATUSES[booking.status];
  
  // Calculate performance duration
  const calculateDuration = () => {
    if (booking.isMultiDay && booking.eventDates) {
      return booking.eventDates.length > 1 
        ? `${booking.eventDates.length} days` 
        : 'Multi-day event';
    }
    
    if (booking.totalHours) {
      return `${booking.totalHours} hours`;
    }
    
    const start = new Date(`2000-01-01T${booking.startTime}`);
    const end = new Date(`2000-01-01T${booking.endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return hours > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}` : `${minutes}m`;
  };

  // Get equipment type icon
  const getEquipmentIcon = (category: string) => {
    const IconComponent = EQUIPMENT_ICONS[category.toLowerCase()] || EQUIPMENT_ICONS.default;
    return IconComponent;
  };

  const handleCancel = () => {
    if (onCancel && cancelReason.trim()) {
      onCancel(booking, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      onClose();
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'equipment', label: 'Equipment', icon: Package },
    { id: 'venue', label: 'Venue & Contact', icon: MapPin },
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Booking Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Booking Summary</h3>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.bgColor} ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Booking ID</p>
            <p className="text-sm text-gray-900 font-mono">#{booking._id.slice(-8)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Booking Date</p>
            <p className="text-sm text-gray-900">{format(parseISO(booking.bookingDate), 'PPP')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Event Type</p>
            <p className="text-sm text-gray-900 capitalize">{booking.eventType}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Booking Type</p>
            <p className="text-sm text-gray-900 capitalize">{booking.bookingType?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Artist Information */}
      {booking.artist && booking.bookingType !== 'equipment_only' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Artist Information</h3>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {(booking.artist.profilePicture || booking.artist.profileImage) ? (
                <Image
                  src={booking.artist.profilePicture || booking.artist.profileImage || ''}
                  alt={booking.artist.stageName || booking.artist.fullName}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-xl object-cover ring-4 ring-white shadow-lg"
                />
              ) : (
                <div className="h-20 w-20 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {(booking.artist.stageName || booking.artist.fullName).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="text-xl font-semibold text-gray-900">
                  {booking.artist.stageName || booking.artist.fullName}
                </h4>
                {booking.artist.yearsOfExperience > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {booking.artist.yearsOfExperience} years experience
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mb-3">{booking.artist.artistType}</p>
              
              {booking.artist.bio && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{booking.artist.bio}</p>
              )}
              
              {booking.artist.skills && booking.artist.skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {booking.artist.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {booking.artist.location && (
                <div className="mt-3 flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {booking.artist.location.city}, {booking.artist.location.country}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pricing Breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Breakdown</h3>
        
        <div className="space-y-3">
          {booking.artistPrice > 0 && (
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">Artist Fee</span>
              </div>
              <span className="text-sm font-medium text-gray-900">${booking.artistPrice.toLocaleString()}</span>
            </div>
          )}
          
          {booking.equipmentPrice && booking.equipmentPrice > 0 && (
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-gray-600">Equipment Fee</span>
              </div>
              <span className="text-sm font-medium text-gray-900">${booking.equipmentPrice.toLocaleString()}</span>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-base font-semibold text-gray-900">Total Amount</span>
              </div>
              <span className="text-lg font-bold text-green-600">${booking.totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details */}
      {(booking.eventDescription || booking.specialRequests) && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
          
          {booking.eventDescription && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{booking.eventDescription}</p>
            </div>
          )}
          
          {booking.specialRequests && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Special Requests</h4>
              <p className="text-sm text-gray-600 bg-yellow-50 rounded-lg p-3 border border-yellow-200">{booking.specialRequests}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderScheduleTab = () => {
    const slots = booking.isMultiDay && booking.eventDates ? booking.eventDates : [
      { date: booking.eventDate, startTime: booking.startTime, endTime: booking.endTime }
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Schedule</h3>
          
          <div className="space-y-4">
            {slots.map((slot, index) => (
              <div key={index} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {booking.isMultiDay ? index + 1 : '1'}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-base font-semibold text-gray-900">
                        {booking.isMultiDay ? `Day ${index + 1}` : 'Performance Day'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {format(parseISO(slot.date), 'EEEE, MMMM do, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Duration: {calculateDuration()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Schedule Summary</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Total {booking.isMultiDay ? `${slots.length} day${slots.length > 1 ? 's' : ''}` : 'duration'}: {calculateDuration()}
                  {booking.totalHours && ` (${booking.totalHours} hours total)`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEquipmentTab = () => {
    const packages = booking.selectedEquipmentPackages || [];
    const customPackages = booking.selectedCustomPackages || [];
    const individualEquipments = booking.equipments || [];
    
    const hasEquipment = packages.length > 0 || customPackages.length > 0 || individualEquipments.length > 0;

    if (!hasEquipment) {
      return (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Equipment Booked</h3>
          <p className="text-gray-600">This booking doesn't include any equipment or packages.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Equipment Packages */}
        {packages.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Packages ({packages.length})</h3>
            
            <div className="space-y-4">
              {packages.map((pkg, index) => (
                <div key={index} className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-start space-x-4">
                    {pkg.coverImage ? (
                      <Image
                        src={pkg.coverImage}
                        alt={pkg.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-lg object-cover border-2 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-lg flex items-center justify-center border-2 border-white shadow-md">
                        <Package className="h-8 w-8 text-white" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-base font-semibold text-gray-900">{pkg.name}</h4>
                        <span className="text-lg font-bold text-orange-600">${pkg.totalPrice?.toLocaleString()}</span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                      
                      {pkg.provider && (
                        <div className="bg-white rounded-lg p-3 mb-3 border border-orange-100">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {pkg.provider.companyName || pkg.provider.name}
                              </p>
                              <p className="text-xs text-gray-600">{pkg.provider.email}</p>
                              {pkg.provider.businessDescription && (
                                <p className="text-xs text-gray-500 mt-1">{pkg.provider.businessDescription}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {pkg.items && pkg.items.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Package Contents ({pkg.items.length} items)</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {pkg.items.slice(0, showAllEquipment ? pkg.items.length : 6).map((item, itemIndex) => {
                              const EquipIcon = getEquipmentIcon(item.equipment?.category || '');
                              return (
                                <div key={itemIndex} className="bg-white rounded-md p-2 border border-gray-100 flex items-center space-x-2">
                                  <EquipIcon className="h-4 w-4 text-gray-400" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-900 truncate">
                                      {item.quantity}x {item.equipment?.name}
                                    </p>
                                    <p className="text-xs text-gray-500">{item.equipment?.category}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {!showAllEquipment && pkg.items.length > 6 && (
                            <button
                              onClick={() => setShowAllEquipment(true)}
                              className="mt-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                            >
                              Show all {pkg.items.length} items
                            </button>
                          )}
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
        {customPackages.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Packages ({customPackages.length})</h3>
            
            <div className="space-y-4">
              {customPackages.map((pkg, index) => (
                <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center border-2 border-white shadow-md">
                      <Settings className="h-8 w-8 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-base font-semibold text-gray-900">{pkg.name}</h4>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            Custom
                          </span>
                        </div>
                        <span className="text-lg font-bold text-purple-600">${pkg.totalPrice?.toLocaleString()}</span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                      
                      {pkg.items && pkg.items.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Package Contents ({pkg.items.length} items)</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {pkg.items.map((item, itemIndex) => {
                              const EquipIcon = getEquipmentIcon(item.equipment?.category || '');
                              return (
                                <div key={itemIndex} className="bg-white rounded-md p-2 border border-gray-100 flex items-center space-x-2">
                                  <EquipIcon className="h-4 w-4 text-gray-400" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-900 truncate">
                                      {item.quantity}x {item.equipment?.name}
                                    </p>
                                    <p className="text-xs text-gray-500">{item.equipment?.category}</p>
                                  </div>
                                </div>
                              );
                            })}
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

        {/* Individual Equipment */}
        {individualEquipments.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Equipment ({individualEquipments.length})</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {individualEquipments.map((item, index) => {
                const EquipIcon = getEquipmentIcon(item.equipment?.category || '');
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                          <EquipIcon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">{item.equipment?.name}</h4>
                        <p className="text-xs text-gray-600 mb-2">{item.equipment?.category}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Quantity: {item.quantity}</span>
                          <span className="text-sm font-medium text-gray-900">
                            ${(item.equipment?.pricePerDay * item.quantity).toLocaleString()}
                          </span>
                        </div>
                        
                        {item.equipment?.description && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.equipment.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderVenueTab = () => (
    <div className="space-y-6">
      {/* Venue Information */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Venue Information</h3>
        
        <div className="space-y-4">
          {booking.venueDetails?.address && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Address</p>
              <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                {booking.venueDetails.address}
                {booking.venueDetails.city && `, ${booking.venueDetails.city}`}
                {booking.venueDetails.state && `, ${booking.venueDetails.state}`}
                {booking.venueDetails.country && `, ${booking.venueDetails.country}`}
                {booking.venueDetails.postalCode && ` ${booking.venueDetails.postalCode}`}
              </p>
            </div>
          )}
          
          {booking.venueDetails?.venueType && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Venue Type</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                {booking.venueDetails.venueType}
              </span>
            </div>
          )}
          
          {booking.venueDetails?.additionalInfo && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Additional Information</p>
              <p className="text-sm text-gray-900 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                {booking.venueDetails.additionalInfo}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      {booking.userDetails && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{booking.userDetails.name}</p>
                <p className="text-xs text-gray-600">Event Organizer</p>
              </div>
            </div>
            
            {booking.userDetails.email && (
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-900">{booking.userDetails.email}</p>
                  <p className="text-xs text-gray-600">Email Address</p>
                </div>
              </div>
            )}
            
            {booking.userDetails.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-900">{booking.userDetails.phone}</p>
                  <p className="text-xs text-gray-600">Phone Number</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <p className="text-sm text-gray-600 mt-1">
                #{booking._id.slice(-8)} • {format(parseISO(booking.bookingDate), 'MMM dd, yyyy')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'schedule' && renderScheduleTab()}
            {activeTab === 'equipment' && renderEquipmentTab()}
            {activeTab === 'venue' && renderVenueTab()}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Status: <span className={`font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                {booking.status === 'pending' && onCancel && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-4 py-2 border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors"
                  >
                    Cancel Booking
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900">Cancel Booking</h3>
              </div>
              
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Reason
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Please provide a reason for cancellation..."
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancel}
                  disabled={!cancelReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}