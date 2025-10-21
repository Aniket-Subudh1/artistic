'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Calendar, Clock, MapPin, User, DollarSign, Package, 
  Star, Eye, MoreHorizontal, Palette, Music, Camera,
  Settings, Wrench, FileText, ChevronDown, ChevronUp
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Booking, BOOKING_STATUSES } from '@/types/booking';

interface EnhancedBookingCardProps {
  booking: Booking;
  onViewDetails: (booking: Booking) => void;
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

export function EnhancedBookingCard({ booking, onViewDetails, onCancel }: EnhancedBookingCardProps) {
  const [showEquipmentDetails, setShowEquipmentDetails] = useState(false);
  const [showSlotDetails, setShowSlotDetails] = useState(false);

  const statusInfo = BOOKING_STATUSES[booking.status];
  const isUpcoming = new Date(booking.eventDate) > new Date();
  
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

  // Render artist section
  const renderArtistSection = () => {
    if (!booking.artist || booking.bookingType === 'equipment_only') return null;

    return (
      <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-500">
        <div className="flex-shrink-0">
          {(booking.artist.profilePicture || booking.artist.profileImage) ? (
            <Image
              src={booking.artist.profilePicture || booking.artist.profileImage || ''}
              alt={booking.artist.stageName || booking.artist.fullName}
              width={56}
              height={56}
              className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover ring-2 sm:ring-4 ring-white shadow-lg"
            />
          ) : (
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
              {(booking.artist.stageName || booking.artist.fullName).charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
              {booking.artist.stageName || booking.artist.fullName}
            </h3>
            {booking.artist.yearsOfExperience > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 w-fit">
                {booking.artist.yearsOfExperience}y exp
              </span>
            )}
          </div>
          
          <p className="text-xs sm:text-sm text-gray-600 mt-1">{booking.artist.artistType}</p>
          
          {booking.artist.skills && booking.artist.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {booking.artist.skills.slice(0, 2).map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700"
                >
                  {skill}
                </span>
              ))}
              {booking.artist.skills.length > 2 && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                  +{booking.artist.skills.length - 2} more
                </span>
              )}
            </div>
          )}
          
          {booking.artist.pricing && (
            <div className="flex items-center space-x-2 mt-2">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              <span className="text-xs sm:text-sm font-medium text-green-600">
                ${booking.artistPrice.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render slot details
  const renderSlotDetails = () => {
    const slots = booking.isMultiDay && booking.eventDates ? booking.eventDates : [
      { date: booking.eventDate, startTime: booking.startTime, endTime: booking.endTime }
    ];

    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 sm:p-4 border-l-4 border-green-500">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowSlotDetails(!showSlotDetails)}
        >
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
            <h4 className="text-xs sm:text-sm font-semibold text-gray-900">
              Performance Schedule {booking.isMultiDay ? `(${slots.length} days)` : ''}
            </h4>
          </div>
          {showSlotDetails ? 
            <ChevronUp className="h-4 w-4 text-gray-500 flex-shrink-0" /> : 
            <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
          }
        </div>

        {showSlotDetails && (
          <div className="mt-3 space-y-2">
            {slots.map((slot, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 px-3 bg-white rounded-md shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <div className="text-xs sm:text-sm font-medium text-gray-900">
                    {format(parseISO(slot.date), 'MMM dd, yyyy')}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {slot.startTime} - {slot.endTime}
                  </div>
                </div>
                <div className="text-xs text-gray-500 self-start sm:self-auto">
                  {calculateDuration()}
                </div>
              </div>
            ))}
          </div>
        )}

        {!showSlotDetails && (
          <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <span>{format(parseISO(booking.eventDate), 'MMM dd, yyyy')}</span>
            <span>{booking.startTime} - {booking.endTime}</span>
            <span className="text-green-600 font-medium">Duration: {calculateDuration()}</span>
          </div>
        )}
      </div>
    );
  };

  // Render equipment section
  const renderEquipmentSection = () => {
    const hasEquipment = booking.equipmentPrice && booking.equipmentPrice > 0;
    const packages = booking.selectedEquipmentPackages || [];
    const customPackages = booking.selectedCustomPackages || [];
    const individualEquipments = booking.equipments || [];
    
    if (!hasEquipment && packages.length === 0 && customPackages.length === 0 && individualEquipments.length === 0) {
      return null;
    }

    const totalEquipmentItems = packages.length + customPackages.length + individualEquipments.length;

    return (
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border-l-4 border-orange-500">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowEquipmentDetails(!showEquipmentDetails)}
        >
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-orange-600" />
            <h4 className="text-sm font-semibold text-gray-900">
              Equipment & Packages ({totalEquipmentItems} items)
            </h4>
          </div>
          <div className="flex items-center space-x-2">
            {booking.equipmentPrice && booking.equipmentPrice > 0 && (
              <span className="text-sm font-medium text-orange-600">
                ${booking.equipmentPrice.toLocaleString()}
              </span>
            )}
            {showEquipmentDetails ? 
              <ChevronUp className="h-4 w-4 text-gray-500" /> : 
              <ChevronDown className="h-4 w-4 text-gray-500" />
            }
          </div>
        </div>

        {showEquipmentDetails && (
          <div className="mt-4 space-y-4">
            {/* Equipment Packages */}
            {packages.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Equipment Packages</h5>
                <div className="space-y-2">
                  {packages.map((pkg, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-orange-200">
                      <div className="flex items-start space-x-3">
                        {pkg.coverImage ? (
                          <Image
                            src={pkg.coverImage}
                            alt={pkg.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-md flex items-center justify-center">
                            <Package className="h-6 w-6 text-white" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h6 className="text-sm font-medium text-gray-900 truncate">{pkg.name}</h6>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{pkg.description}</p>
                          
                          {pkg.provider && (
                            <p className="text-xs text-blue-600 mt-1">
                              by {pkg.provider.companyName || pkg.provider.name}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {pkg.items?.length || 0} equipment items
                            </span>
                            <span className="text-sm font-medium text-orange-600">
                              ${pkg.totalPrice?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Package Items */}
                      {pkg.items && pkg.items.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {pkg.items.slice(0, 4).map((item, itemIndex) => {
                              const EquipIcon = getEquipmentIcon(item.equipment?.category || '');
                              return (
                                <div key={itemIndex} className="flex items-center space-x-2 text-xs">
                                  <EquipIcon className="h-3 w-3 text-gray-400" />
                                  <span className="text-gray-700 truncate">
                                    {item.quantity}x {item.equipment?.name}
                                  </span>
                                </div>
                              );
                            })}
                            {pkg.items.length > 4 && (
                              <div className="text-xs text-gray-500 col-span-full">
                                +{pkg.items.length - 4} more items
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Packages */}
            {customPackages.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Custom Packages</h5>
                <div className="space-y-2">
                  {customPackages.map((pkg, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-md flex items-center justify-center">
                          <Settings className="h-6 w-6 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h6 className="text-sm font-medium text-gray-900 truncate">{pkg.name}</h6>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              Custom
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{pkg.description}</p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {pkg.items?.length || 0} equipment items
                            </span>
                            <span className="text-sm font-medium text-purple-600">
                              ${pkg.totalPrice?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Custom Package Items */}
                      {pkg.items && pkg.items.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {pkg.items.slice(0, 4).map((item, itemIndex) => {
                              const EquipIcon = getEquipmentIcon(item.equipment?.category || '');
                              return (
                                <div key={itemIndex} className="flex items-center space-x-2 text-xs">
                                  <EquipIcon className="h-3 w-3 text-gray-400" />
                                  <span className="text-gray-700 truncate">
                                    {item.quantity}x {item.equipment?.name}
                                  </span>
                                </div>
                              );
                            })}
                            {pkg.items.length > 4 && (
                              <div className="text-xs text-gray-500 col-span-full">
                                +{pkg.items.length - 4} more items
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Individual Equipment */}
            {individualEquipments.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Individual Equipment</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {individualEquipments.map((item, index) => {
                    const EquipIcon = getEquipmentIcon(item.equipment?.category || '');
                    return (
                      <div key={index} className="bg-white rounded-lg p-2 border border-gray-200 flex items-center space-x-2">
                        <EquipIcon className="h-4 w-4 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-900 truncate">
                            {item.quantity}x {item.equipment?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.equipment?.category}
                          </div>
                        </div>
                        <div className="text-xs font-medium text-gray-700">
                          ${(item.equipment?.pricePerDay * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {!showEquipmentDetails && (
          <div className="mt-2 text-sm text-gray-600">
            {packages.length > 0 && <span>{packages.length} packages</span>}
            {packages.length > 0 && customPackages.length > 0 && <span>, </span>}
            {customPackages.length > 0 && <span>{customPackages.length} custom packages</span>}
            {(packages.length > 0 || customPackages.length > 0) && individualEquipments.length > 0 && <span>, </span>}
            {individualEquipments.length > 0 && <span>{individualEquipments.length} individual items</span>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${statusInfo.bgColor} ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              {booking.bookingType && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                  {booking.bookingType.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end">
            <div className="text-left sm:text-right">
              <div className="text-lg sm:text-xl font-bold text-gray-900">
                ${booking.totalPrice.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                Total Cost
              </div>
            </div>
          </div>
        </div>

        {/* Venue Info */}
        {booking.venueDetails && (
          <div className="flex items-center space-x-2 mt-3 text-sm text-gray-600">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {booking.venueDetails.address || `${booking.venueDetails.city}, ${booking.venueDetails.country}`}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Artist Section */}
        {renderArtistSection()}

        {/* Slot Details */}
        {renderSlotDetails()}

        {/* Equipment Section */}
        {renderEquipmentSection()}

        {/* Event Details */}
        {(booking.eventDescription || booking.specialRequests) && (
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            {booking.eventDescription && (
              <div className="mb-2 last:mb-0">
                <h5 className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Event Description</h5>
                <p className="text-sm text-gray-600 line-clamp-3 sm:line-clamp-2">{booking.eventDescription}</p>
              </div>
            )}
            {booking.specialRequests && (
              <div>
                <h5 className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Special Requests</h5>
                <p className="text-sm text-gray-600 line-clamp-3 sm:line-clamp-2">{booking.specialRequests}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-gray-500 order-2 sm:order-1">
            Booked on {format(parseISO(booking.bookingDate), 'MMM dd, yyyy')}
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 order-1 sm:order-2">
            <button
              onClick={() => onViewDetails(booking)}
              className="inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </button>
            
            {booking.status === 'pending' && onCancel && (
              <button
                onClick={() => onCancel(booking, '')}
                className="inline-flex items-center justify-center px-4 py-2.5 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}