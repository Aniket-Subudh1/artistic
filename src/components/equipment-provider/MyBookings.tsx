'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Filter, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Hash,
  Building,
  Truck,
  Calendar as CalendarIcon,
  FileText,
  MoreVertical,
  Download,
  RefreshCw
} from 'lucide-react';
import { EquipmentProviderService, EquipmentBookingItem, BookingFilters, BookingAnalytics } from '@/services/equipment-provider.service';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function MyBookings() {
  const [bookings, setBookings] = useState<EquipmentBookingItem[]>([]);
  const [analytics, setAnalytics] = useState<BookingAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters and pagination
  const [filters, setFilters] = useState<BookingFilters>({
    page: 1,
    limit: 10,
    status: 'confirmed' // show only confirmed bookings
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [stats, setStats] = useState({
    totalEquipmentBookings: 0,
    totalPackageBookings: 0,
    totalBookings: 0
  });

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('confirmed');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  // Date range filter (YYYY-MM-DD)
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  useEffect(() => {
    loadBookings();
    loadAnalytics();
  }, [filters]);

  const loadBookings = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await EquipmentProviderService.getMyBookings(filters);
      setBookings(data.bookings);
      setPagination(data.pagination);
      setStats(data.stats);
    } catch (error: any) {
      setError('Failed to load bookings: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const data = await EquipmentProviderService.getBookingAnalytics();
      setAnalytics(data);
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setFilters({
      ...filters,
      status: status === 'all' ? undefined : status,
      page: 1
    });
  };

  const handleSearch = () => {
    // Implement search functionality if needed
    loadBookings();
  };

  const applyDateFilter = () => {
    setFilters((prev) => ({
      ...prev,
      startDate: dateFrom || undefined,
      endDate: dateTo || undefined,
      page: 1,
    }));
  };

  const clearDateFilter = () => {
    setDateFrom('');
    setDateTo('');
    setFilters((prev) => ({
      ...prev,
      startDate: undefined,
      endDate: undefined,
      page: 1,
    }));
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    setError('');
    setSuccess('');
    try {
      await EquipmentProviderService.updateBookingStatus(bookingId, newStatus);
      setSuccess('Booking status updated successfully');
      await loadBookings();
    } catch (error: any) {
      setError('Failed to update booking status: ' + (error.message || 'Unknown error'));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Updated currency formatting to use Kuwaiti Dinar (KWD) instead of USD
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KW', {
      style: 'currency',
      currency: 'KWD'
    }).format(amount);
  };

  const getStatusBadge = (status?: string) => {
    const normalized = (status ?? '').toString().trim().toLowerCase();
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      unknown: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
    } as const;
    const key = (normalized in statusConfig ? normalized : 'unknown') as keyof typeof statusConfig;
    const config = statusConfig[key];
    const Icon = config.icon;
    const label = normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : 'Unknown';

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status?: string) => {
    const raw = (status ?? '').toString().trim();
    const normalized = raw.toLowerCase();
    // Map various backend variants to canonical payment states for coloring
    const canonical = normalized === 'confirmed' ? 'paid'
                    : normalized === 'cancel' ? 'failed'
                    : normalized;

    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800' },
      paid: { color: 'bg-green-100 text-green-800' },
      failed: { color: 'bg-red-100 text-red-800' },
      refunded: { color: 'bg-gray-100 text-gray-800' },
      unknown: { color: 'bg-gray-100 text-gray-800' },
    } as const;

    const key = (canonical in statusConfig ? canonical : 'unknown') as keyof typeof statusConfig;
    const config = statusConfig[key];

    const label = raw ? (raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()) : 'Unknown';

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <CreditCard className="w-3 h-3 mr-1" />
        {label}
      </span>
    );
  };

  const BookingCard = ({ booking }: { booking: EquipmentBookingItem }) => {
    const isExpanded = expandedBooking === booking._id;
    const customer: any = (booking as any).customer || null;
    const customerName = [customer?.firstName, customer?.lastName]
      .filter(Boolean)
      .join(' ');
    const customerEmail = customer?.email || (booking as any).userDetails?.email || '';
    const customerPhone = customer?.phoneNumber || (booking as any).userDetails?.phone || '';

    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  {booking.type === 'package' ? (
                    <Package className="w-6 h-6 text-purple-600" />
                  ) : (
                    <Truck className="w-6 h-6 text-purple-600" />
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {booking.type === 'package' ? 'Package Booking' : 'Equipment Booking'}
                  </h3>
                  <span className="text-sm text-gray-500">#{booking._id.slice(-8)}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {customerName || 'Unknown'}
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    {booking.type === 'package' 
                      ? `${formatDate(booking.startDate!)} - ${formatDate(booking.endDate!)}`
                      : formatDate(booking.date!)
                    }
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(booking.totalPrice)}
                </div>
                <div className="text-sm text-gray-500">
                  {booking.type === 'package' && booking.numberOfDays 
                    ? `${booking.numberOfDays} days`
                    : booking.startTime && booking.endTime 
                      ? `${booking.startTime} - ${booking.endTime}`
                      : ''
                  }
                </div>
              </div>
              <div className="flex flex-col space-y-1">
                {getStatusBadge(booking.status)}
                {getPaymentStatusBadge(booking.paymentStatus)}
              </div>
              <button
                onClick={() => setExpandedBooking(isExpanded ? null : booking._id)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-6 space-y-6">
            {/* Customer Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2 text-purple-600" />
                Customer Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm">{customerEmail || '—'}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm">{customerPhone || '—'}</span>
                  </div>
                </div>
                {booking.userDetails && (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{booking.userDetails.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{booking.userDetails.phone}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Venue/Delivery Information */}
            {(booking.venueDetails || booking.address) && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-purple-600" />
                  Delivery Location
                </h4>
                {booking.venueDetails ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">Address</div>
                        <div className="text-sm text-gray-600">
                          {booking.venueDetails.address}<br />
                          {booking.venueDetails.city}, {booking.venueDetails.state}<br />
                          {booking.venueDetails.country} {booking.venueDetails.postalCode}
                        </div>
                      </div>
                      {booking.venueDetails.venueType && (
                        <div>
                          <div className="text-sm font-medium text-gray-900 mb-1">Venue Type</div>
                          <div className="text-sm text-gray-600">{booking.venueDetails.venueType}</div>
                        </div>
                      )}
                    </div>
                    {booking.venueDetails.additionalInfo && (
                      <div className="mt-3">
                        <div className="text-sm font-medium text-gray-900 mb-1">Additional Information</div>
                        <div className="text-sm text-gray-600">{booking.venueDetails.additionalInfo}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">{booking.address}</div>
                  </div>
                )}
              </div>
            )}

            {/* Items/Package Details */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Package className="w-5 h-5 mr-2 text-purple-600" />
                {booking.type === 'package' ? 'Package Details' : 'Equipment Items & Packages'}
              </h4>
              
              {booking.type === 'package' && booking.package ? (
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-purple-900">{booking.package.name || 'Package'}</div>
                    <div className="text-purple-700 font-semibold">
                      {formatCurrency(booking.pricePerDay!)} / day
                    </div>
                  </div>
                  <div className="text-sm text-purple-700 mb-2">{booking.package.description}</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Duration:</span> {booking.numberOfDays} days
                    </div>
                    <div>
                      <span className="font-medium">Total:</span> {formatCurrency(booking.totalPrice)}
                    </div>
                  </div>
                  {booking.package.items && booking.package.items.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs font-medium text-purple-800 mb-2">Package Contents:</div>
                      <div className="space-y-2">
                        {booking.package.items.map((item: any, idx: number) => (
                          <div key={idx} className="bg-white rounded p-2 text-sm flex items-center justify-between">
                            <div>
                              <span className="font-medium text-gray-900">{item.equipmentId?.name || 'Equipment Item'}</span>
                              <span className="text-gray-600 ml-2">× {item.quantity}</span>
                            </div>
                            {item.equipmentId?.pricePerDay && (
                              <div className="text-purple-700 font-medium">
                                {formatCurrency((item.equipmentId.pricePerDay || 0) * item.quantity)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Regular Equipment Items */}
                  {booking.items && booking.items.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Individual Equipment</div>
                      <div className="space-y-3">
                        {booking.items.map((item, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {item.equipment?.name || 'Equipment Item'}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Quantity: {item.quantity}
                                </div>
                                {item.equipment?.category && (
                                  <div className="text-xs text-gray-500">
                                    Category: {item.equipment.category}
                                  </div>
                                )}
                              </div>
                              {item.equipment?.pricePerDay && (
                                <div className="text-right">
                                  <div className="font-semibold text-gray-900">
                                    {formatCurrency(item.equipment.pricePerDay * item.quantity)}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {formatCurrency(item.equipment.pricePerDay)} each
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Packages */}
                  {booking.customPackages && booking.customPackages.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Custom Equipment Packages</div>
                      <div className="space-y-3">
                        {booking.customPackages.map((customPackage, index) => (
                          <div key={index} className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <div className="font-medium text-orange-900">
                                  {customPackage.name || 'Custom Package'}
                                </div>
                                <div className="text-sm text-orange-700">
                                  {customPackage.description}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-orange-900">
                                  {formatCurrency(customPackage.totalPricePerDay)} / day
                                </div>
                                <div className="text-xs text-orange-600">Custom Package</div>
                              </div>
                            </div>
                            
                            {/* Custom Package Items */}
                            {customPackage.items && customPackage.items.length > 0 && (
                              <div>
                                <div className="text-xs font-medium text-orange-800 mb-2">Package Contents:</div>
                                <div className="grid grid-cols-1 gap-2">
                                  {customPackage.items.map((item, itemIndex) => (
                                    <div key={itemIndex} className="bg-white rounded p-2 text-sm">
                                      <div className="flex justify-between items-center">
                                        <div>
                                          <span className="font-medium text-gray-900">
                                            {item.equipmentId?.name || 'Equipment Item'}
                                          </span>
                                          <span className="text-gray-600 ml-2">
                                            × {item.quantity}
                                          </span>
                                        </div>
                                        <div className="text-orange-700 font-medium">
                                          {formatCurrency(item.pricePerDay * item.quantity)}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {customPackage.notes && (
                              <div className="mt-3 pt-2 border-t border-orange-200">
                                <div className="text-xs font-medium text-orange-800 mb-1">Notes:</div>
                                <div className="text-sm text-orange-700">{customPackage.notes}</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Standard Packages */}
                  {booking.packages && booking.packages.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Standard Equipment Packages</div>
                      <div className="space-y-3">
                        {booking.packages.map((packageItem, index) => (
                          <div key={index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-blue-900">
                                  {packageItem.name || 'Equipment Package'}
                                </div>
                                <div className="text-sm text-blue-700">
                                  {packageItem.description}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-blue-900">
                                  {formatCurrency(packageItem.totalPrice)}
                                </div>
                                <div className="text-xs text-blue-600">Standard Package</div>
                              </div>
                            </div>
                            {packageItem.items && packageItem.items.length > 0 && (
                              <div className="mt-3">
                                <div className="text-xs font-medium text-blue-800 mb-2">Items:</div>
                                <div className="grid grid-cols-1 gap-2">
                                  {packageItem.items.map((it: any, iIdx: number) => (
                                    <div key={iIdx} className="bg-white rounded p-2 text-sm flex items-center justify-between">
                                      <div>
                                        <span className="font-medium text-gray-900">{it.equipmentId?.name || 'Equipment Item'}</span>
                                        <span className="text-gray-600 ml-2">× {it.quantity}</span>
                                      </div>
                                      {it.equipmentId?.pricePerDay && (
                                        <div className="text-blue-700 font-medium">
                                          {formatCurrency((it.equipmentId.pricePerDay || 0) * it.quantity)}
                                        </div>
                                      )}
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

                  {/* No items message */}
                  {(!booking.items || booking.items.length === 0) && 
                   (!booking.customPackages || booking.customPackages.length === 0) && 
                   (!booking.packages || booking.packages.length === 0) && (
                    <div className="text-sm text-gray-500 italic">No items or packages details available</div>
                  )}
                </div>
              )}
            </div>

            {/* Schedule Information */}
            {booking.equipmentDates && booking.equipmentDates.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-purple-600" />
                  Schedule
                </h4>
                <div className="space-y-2">
                  {booking.equipmentDates.map((schedule, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="font-medium text-blue-900">
                            {formatDate(schedule.date)}
                          </span>
                        </div>
                        <div className="flex items-center text-blue-700">
                          <Clock className="w-4 h-4 mr-1" />
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event Description & Special Requests */}
            {(booking.eventDescription || booking.specialRequests) && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Event Details
                </h4>
                <div className="space-y-3">
                  {booking.eventDescription && (
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Event Description</div>
                      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                        {booking.eventDescription}
                      </div>
                    </div>
                  )}
                  {booking.specialRequests && (
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Special Requests</div>
                      <div className="bg-yellow-50 rounded-lg p-3 text-sm text-yellow-800">
                        {booking.specialRequests}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-500">
                Booked on {formatDate(booking.createdAt)}
              </div>
              <div className="flex space-x-3">
                {booking.status === 'pending' && booking.type === 'equipment' && (
                  <button
                    onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                    disabled={isUpdatingStatus}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm
                  </button>
                )}
                {/* Removed Mark Complete action per request */}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading && bookings.length === 0) {
    return <LoadingSpinner text="Loading bookings..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600">Manage your equipment and package bookings</p>
        </div>
        <button
          onClick={loadBookings}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Analytics Cards */}
      {!isLoadingAnalytics && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analytics.overview.totalRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.overview.totalBookingsThisMonth}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Equipment Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.overview.totalEquipment}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Packages</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.overview.totalPackages}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleStatusFilter('confirmed')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                statusFilter === 'confirmed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Confirmed
            </button>
          </div>
          {/* Date range controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-2 py-1 border rounded-md text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-2 py-1 border rounded-md text-sm"
              />
            </div>
            <button
              onClick={applyDateFilter}
              disabled={isLoading}
              className="px-3 py-1 rounded-md text-sm bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
            >
              Apply
            </button>
            {(filters.startDate || filters.endDate) && (
              <button
                onClick={clearDateFilter}
                disabled={isLoading}
                className="px-3 py-1 rounded-md text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-sm text-gray-600 ml-auto">
            Showing {bookings.length} of {pagination.total} bookings
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <LoadingSpinner text="Loading bookings..." />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">
              {statusFilter === 'all' 
                ? "You don't have any bookings yet." 
                : `No ${statusFilter} bookings found.`
              }
            </p>
          </div>
        ) : (
          bookings.map((booking) => (
            <BookingCard key={booking._id} booking={booking} />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setFilters({ ...filters, page: i + 1 })}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    pagination.page === i + 1
                      ? 'bg-purple-100 text-purple-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}