'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  MapPin,
  DollarSign,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  BarChart3,
  Users,
  Star,
  Activity,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { AdminService } from '@/services/admin.service';

interface ArtistBooking {
  _id: string;
  artistBookingId?: {
    _id: string;
    artistId?: {
      _id: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      phoneNumber?: string;
      profilePicture?: string;
      roleProfile?: {
        _id: string;
        stageName?: string;
        artistType?: string;
        about?: string;
        pricePerHour?: number;
        profileImage?: string;
        availability?: any;
        gender?: string;
        yearsOfExperience?: number;
        skills?: string[];
      };
    };
    date: string;
    startTime: string;
    endTime: string;
    price: number;
    artistType?: 'private' | 'public';
  };
  bookedBy?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
  bookingType: string;
  userDetails?: {
    name: string;
    email: string;
    phone: string;
  };
  venueDetails?: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  eventDescription?: string;
  createdAt: string;
}

interface BookingMetrics {
  totalRevenue: number;
  statusBreakdown: Array<{ _id: string; count: number; revenue: number }>;
  artistTypeBreakdown: Array<{ _id: string; count: number; revenue: number }>;
  monthlyRevenue: Array<{ _id: { year: number; month: number }; revenue: number; bookings: number }>;
  topArtists: Array<{
    _id: string;
    artistName: string;
    totalRevenue: number;
    totalBookings: number;
    avgRating?: number;
  }>;
  avgBookingValue: number;
}

const AdminArtistBookingManagement = () => {
  const [bookings, setBookings] = useState<ArtistBooking[]>([]);
  const [metrics, setMetrics] = useState<BookingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<ArtistBooking | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Pagination
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // View modes
  const [viewMode, setViewMode] = useState<'list' | 'schedule' | 'analytics'>('list');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getArtistBookings({
        page: currentPage,
        limit: pageSize,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      setBookings(response.bookings);
      setMetrics(response.metrics);
      setTotalPages(response.pagination.total);
      setTotalCount(response.pagination.count);
      setError(null);
    } catch (err) {
      setError('Failed to fetch artist bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentPage, pageSize, statusFilter, searchTerm, startDate, endDate]);

  // Fetch detailed info when a booking is selected
  useEffect(() => {
    const loadDetails = async () => {
      if (!selectedBooking) { setDetail(null); return; }
      try {
        setDetailLoading(true);
        const res = await AdminService.getCombinedBookingDetails(selectedBooking._id);
        setDetail(res);
      } catch (e) {
        console.error('Failed to load booking details', e);
      } finally {
        setDetailLoading(false);
      }
    };
    loadDetails();
  }, [selectedBooking]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBookings();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleRowExpansion = (bookingId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(bookingId)) {
      newExpanded.delete(bookingId);
    } else {
      newExpanded.add(bookingId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'confirmed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KW', {
      style: 'currency',
      currency: 'KWD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportBookings = () => {
    const csvContent = [
      ['Booking ID', 'Artist Name', 'Customer Name', 'Date', 'Time', 'Status', 'Amount', 'Venue', 'Created'].join(','),
      ...bookings.map(booking => [
        booking._id,
        booking.artistBookingId?.artistId?.roleProfile?.stageName || 
         (booking.artistBookingId?.artistId?.firstName && booking.artistBookingId?.artistId?.lastName
          ? `${booking.artistBookingId.artistId.firstName} ${booking.artistBookingId.artistId.lastName}`
          : 'Artist Name Unavailable'),
        booking.userDetails?.name || 
         (booking.bookedBy?.firstName && booking.bookedBy?.lastName 
          ? `${booking.bookedBy.firstName} ${booking.bookedBy.lastName}` 
          : 'N/A'),
        booking.date,
        `${booking.startTime} - ${booking.endTime}`,
        booking.status,
        booking.totalPrice,
        `${booking.venueDetails?.city || 'N/A'}, ${booking.venueDetails?.state || 'N/A'}`,
        formatDate(booking.createdAt)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `artist-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const renderMetricsCards = () => {
    if (!metrics) return null;

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Revenue</p>
              <p className="text-sm md:text-lg font-bold text-gray-900">
                {formatCurrency(metrics.totalRevenue)}
              </p>
            </div>
            <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Avg Booking</p>
              <p className="text-sm md:text-lg font-bold text-gray-900">
                {formatCurrency(metrics.avgBookingValue)}
              </p>
            </div>
            <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Active Artists</p>
              <p className="text-sm md:text-lg font-bold text-gray-900">
                {metrics.topArtists.length}
              </p>
            </div>
            <Users className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Bookings</p>
              <p className="text-sm md:text-lg font-bold text-gray-900">{totalCount}</p>
            </div>
            <Activity className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
          </div>
        </div>
      </div>
    );
  };

  const renderAnalyticsView = () => {
    if (!metrics) return null;

    return (
      <div className="space-y-4">
        {renderMetricsCards()}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Status Breakdown */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Booking Status Breakdown</h3>
            <div className="space-y-2">
              {metrics.statusBreakdown.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(item._id)}
                    <span className="capitalize text-xs font-medium text-gray-700">
                      {item._id}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-900">{item.count} bookings</p>
                    <p className="text-xs text-gray-600">{formatCurrency(item.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Artist Type Breakdown */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Artist Type Performance</h3>
            <div className="space-y-2">
              {metrics.artistTypeBreakdown.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <span className="capitalize text-xs font-medium text-gray-700">
                    {item._id || 'Unknown'}
                  </span>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-900">{item.count} bookings</p>
                    <p className="text-xs text-gray-600">{formatCurrency(item.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Artists */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Performing Artists</h3>
            <div className="space-y-2">
              {metrics.topArtists.slice(0, 5).map((artist, index) => (
                <div key={artist._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-5 h-5 bg-blue-100 rounded-full text-xs font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <span className="text-xs font-medium text-gray-700 truncate max-w-[8rem]">
                      {artist.artistName}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-900">
                      {formatCurrency(artist.totalRevenue)}
                    </p>
                    <p className="text-xs text-gray-600">{artist.totalBookings} bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Revenue Trend */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Monthly Revenue Trend</h3>
            <div className="space-y-2">
              {metrics.monthlyRevenue.map((month) => (
                <div key={`${month._id.year}-${month._id.month}`} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">
                    {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-900">
                      {formatCurrency(month.revenue)}
                    </p>
                    <p className="text-xs text-gray-600">{month.bookings} bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderScheduleView = () => {
    // Group bookings by date
    const groupedBookings = bookings.reduce((acc, booking) => {
      const date = booking.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(booking);
      return acc;
    }, {} as Record<string, ArtistBooking[]>);

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Artist Schedule View</h3>
        </div>
        <div className="p-3">
          {Object.entries(groupedBookings).map(([date, dateBookings]) => (
            <div key={date} className="mb-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">
                {formatDate(date)} ({dateBookings.length} bookings)
              </h4>
              <div className="space-y-2">
                {dateBookings
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((booking) => (
                  <div key={booking._id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      {booking.artistBookingId?.artistId?.roleProfile?.profileImage ? (
                        <img
                          className="h-8 w-8 rounded-full object-cover"
                          src={booking.artistBookingId.artistId.roleProfile.profileImage}
                          alt={booking.artistBookingId.artistId.roleProfile.stageName || 'Artist'}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold ${booking.artistBookingId?.artistId?.roleProfile?.profileImage ? 'hidden' : ''}`}>
                        {booking.artistBookingId?.artistId?.roleProfile?.stageName 
                          ? booking.artistBookingId.artistId.roleProfile.stageName.charAt(0).toUpperCase()
                          : booking.artistBookingId?.artistId?.firstName 
                            ? booking.artistBookingId.artistId.firstName.charAt(0).toUpperCase()
                            : <User className="h-4 w-4" />
                        }
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {booking.artistBookingId?.artistId?.roleProfile?.stageName || 
                           (booking.artistBookingId?.artistId?.firstName && booking.artistBookingId?.artistId?.lastName
                            ? `${booking.artistBookingId.artistId.firstName} ${booking.artistBookingId.artistId.lastName}`
                            : 'Artist Name Unavailable')}
                        </p>
                        <span className={getStatusBadge(booking.status)}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {booking.venueDetails?.city || 'N/A'}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {formatCurrency(booking.totalPrice)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {booking.userDetails?.name || 
                         (booking.bookedBy?.firstName && booking.bookedBy?.lastName 
                          ? `${booking.bookedBy.firstName} ${booking.bookedBy.lastName}` 
                          : 'N/A')}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    return (
      <>
        {/* Mobile Card Layout */}
        <div className="lg:hidden">
          <div className="space-y-2">
            {bookings.map((booking) => (
              <div key={booking._id} className="border border-gray-200 rounded-lg p-3 space-y-2">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0">
                      {booking.artistBookingId?.artistId?.roleProfile?.profileImage ? (
                        <img
                          className="h-8 w-8 rounded-full object-cover"
                          src={booking.artistBookingId.artistId.roleProfile.profileImage}
                          alt={booking.artistBookingId.artistId.roleProfile.stageName || 'Artist'}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs ${booking.artistBookingId?.artistId?.roleProfile?.profileImage ? 'hidden' : ''}`}>
                        {booking.artistBookingId?.artistId?.roleProfile?.stageName 
                          ? booking.artistBookingId.artistId.roleProfile.stageName.charAt(0).toUpperCase()
                          : booking.artistBookingId?.artistId?.firstName 
                            ? booking.artistBookingId.artistId.firstName.charAt(0).toUpperCase()
                            : <User className="h-4 w-4" />
                        }
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {booking.artistBookingId?.artistId?.roleProfile?.stageName || 
                         (booking.artistBookingId?.artistId?.firstName && booking.artistBookingId?.artistId?.lastName
                          ? `${booking.artistBookingId.artistId.firstName} ${booking.artistBookingId.artistId.lastName}`
                          : 'Artist Pending')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.artistBookingId?.artistType ? 
                          (booking.artistBookingId.artistType === 'private' ? 'Private' : 'Public') : 
                          'Service TBD'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleRowExpansion(booking._id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandedRows.has(booking._id) ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronRight className="w-4 h-4" />
                    }
                  </button>
                </div>

                {/* Summary Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-sm font-medium">{formatDate(booking.date)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-sm font-medium">{formatCurrency(booking.totalPrice).replace('KWD', '').trim()}</p>
                    </div>
                  </div>
                  <div>
                    <span className={getStatusBadge(booking.status)}>
                      {booking.status}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRows.has(booking._id) && (
                  <div className="border-t border-gray-100 pt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Customer</p>
                        <p className="font-medium">{booking.userDetails?.name || 
                         (booking.bookedBy?.firstName && booking.bookedBy?.lastName 
                          ? `${booking.bookedBy.firstName} ${booking.bookedBy.lastName}` 
                          : 'Pending')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Time</p>
                        <p className="font-medium">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Venue</p>
                        <p className="font-medium">{booking.venueDetails?.city || 'TBD'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Service Type</p>
                        <p className="font-medium">{booking.artistBookingId?.artistType || 'TBD'}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-1">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="flex-1 text-blue-600 hover:text-blue-900 inline-flex items-center justify-center py-1.5 text-sm border border-blue-200 rounded-md"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden lg:block bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Artist Bookings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                    Artist & Event
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Customer
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Date & Time
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Venue
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Service Type
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Status
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-2 py-2 whitespace-nowrap w-40">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-6 w-6">
                          {booking.artistBookingId?.artistId?.roleProfile?.profileImage ? (
                            <img
                              className="h-6 w-6 rounded-full object-cover"
                              src={booking.artistBookingId.artistId.roleProfile.profileImage}
                              alt={booking.artistBookingId.artistId.roleProfile.stageName || 'Artist'}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`h-6 w-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs ${booking.artistBookingId?.artistId?.roleProfile?.profileImage ? 'hidden' : ''}`}>
                            {booking.artistBookingId?.artistId?.roleProfile?.stageName 
                              ? booking.artistBookingId.artistId.roleProfile.stageName.charAt(0).toUpperCase()
                              : booking.artistBookingId?.artistId?.firstName 
                                ? booking.artistBookingId.artistId.firstName.charAt(0).toUpperCase()
                                : <User className="h-4 w-4" />
                            }
                          </div>
                        </div>
                        <div className="ml-2">
                          <div className="text-xs font-medium text-gray-900 truncate max-w-[8rem]">
                            {booking.artistBookingId?.artistId?.roleProfile?.stageName || 
                             (booking.artistBookingId?.artistId?.firstName && booking.artistBookingId?.artistId?.lastName
                              ? `${booking.artistBookingId.artistId.firstName} ${booking.artistBookingId.artistId.lastName}`
                              : 'Artist Pending')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.artistBookingId?.artistType ? 
                              (booking.artistBookingId.artistType === 'private' ? 'Private' : 'Public') : 
                              'TBD'} • {booking.bookingType}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap w-32">
                      <div className="text-xs text-gray-900 truncate max-w-[6rem]">
                        {booking.userDetails?.name || 
                         (booking.bookedBy?.firstName && booking.bookedBy?.lastName 
                          ? `${booking.bookedBy.firstName} ${booking.bookedBy.lastName}` 
                          : 'Pending')}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[6rem]">
                        {booking.userDetails?.email || booking.bookedBy?.email || 'Email pending'}
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap w-24">
                      <div className="text-xs text-gray-900">{formatDate(booking.date)}</div>
                      <div className="text-xs text-gray-500">
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap w-24">
                      <div className="text-xs text-gray-900 truncate max-w-[5rem]">
                        {booking.venueDetails?.city || 'TBD'}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[5rem]">
                        {booking.venueDetails?.state || 'Location TBD'}
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap w-20">
                      <div className="text-xs font-medium text-gray-900">
                        {booking.artistBookingId?.artistType ? 
                          (booking.artistBookingId.artistType === 'private' ? 'Private' : 'Public') : 
                          'Service'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.artistBookingId?.artistId?.roleProfile?.artistType || 'Entertainment'}
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap w-20">
                      <span className={getStatusBadge(booking.status)}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-center w-16">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Artist Booking Management</h1>
          <p className="mt-1 text-sm text-gray-700">
            Manage and monitor all artist bookings with detailed analytics and schedule views.
          </p>
        </div>
        <button
          onClick={exportBookings}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 self-start sm:self-auto"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex space-x-4 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setViewMode('list')}
          className={`py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap ${
            viewMode === 'list'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          List View
        </button>
        <button
          onClick={() => setViewMode('schedule')}
          className={`py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap ${
            viewMode === 'schedule'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Schedule View
        </button>
        <button
          onClick={() => setViewMode('analytics')}
          className={`py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap ${
            viewMode === 'analytics'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-lg shadow">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search bookings..."
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-2 top-2.5 h-3 w-3 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </form>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'analytics' && renderAnalyticsView()}
      {viewMode === 'schedule' && renderScheduleView()}
      {viewMode === 'list' && (
        <>
          {renderMetricsCards()}
          {renderListView()}
        </>
      )}

      {/* Pagination */}
      {viewMode !== 'analytics' && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalCount)}
                </span>{' '}
                of <span className="font-medium">{totalCount}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {detailLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
              {!detailLoading && detail && (
                <>
                  {/* Cost Breakdown */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Cost Breakdown</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
                      <div>
                        <p className="text-sm text-gray-600">Artist Cost</p>
                        <p className="text-sm font-semibold">{formatCurrency(detail.breakdown.artistCost || 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Equipment Cost</p>
                        <p className="text-sm font-semibold">{formatCurrency(detail.breakdown.equipmentCost || 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Platform Fee</p>
                        <p className="text-sm font-semibold">{formatCurrency(detail.breakdown.platformFee || 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-sm font-semibold">{formatCurrency(detail.breakdown.total || 0)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Equipment Summary (if any) */}
                  {detail.assignments?.equipment && (detail.assignments.equipment.equipments?.length > 0 || detail.assignments.equipment.packages?.length > 0 || detail.assignments.equipment.customPackages?.length > 0) && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Equipment Summary</h4>
                      <div className="space-y-2">
                        {detail.assignments.equipment.equipments?.map((eq:any, idx:number) => (
                          <div key={idx} className="text-sm text-gray-800 flex items-center justify-between">
                            <span>{eq.equipmentId?.name || 'Equipment'} ({eq.quantity}x)</span>
                            <span className="text-gray-600">{eq.equipmentId?.category || ''}</span>
                          </div>
                        ))}
                        {detail.assignments.equipment.packages?.map((pkg:any) => (
                          <div key={pkg._id} className="text-sm text-gray-800">
                            Package: <span className="font-medium">{pkg.name}</span> — {formatCurrency(pkg.totalPrice || 0)}
                          </div>
                        ))}
                        {detail.assignments.equipment.customPackages?.map((pkg:any) => (
                          <div key={pkg._id} className="text-sm text-gray-800">
                            Custom Package: <span className="font-medium">{pkg.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              {/* Artist Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Artist Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Stage Name</p>
                    <p className="text-sm text-gray-900">
                      {selectedBooking.artistBookingId?.artistId?.roleProfile?.stageName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Artist Type</p>
                    <p className="text-sm text-gray-900 capitalize">
                      {selectedBooking.artistBookingId?.artistType || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-sm text-gray-900">
                      {selectedBooking.artistBookingId?.artistId?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone</p>
                    <p className="text-sm text-gray-900">
                      {selectedBooking.artistBookingId?.artistId?.phoneNumber || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Customer Information</h4>
                <div className="bg-blue-50 p-4 rounded-lg border">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Name</p>
                      <p className="text-sm text-gray-900 font-medium">
                        {selectedBooking.userDetails?.name || 
                         (selectedBooking.bookedBy?.firstName && selectedBooking.bookedBy?.lastName 
                          ? `${selectedBooking.bookedBy.firstName} ${selectedBooking.bookedBy.lastName}` 
                          : 'Customer details pending')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <p className="text-sm text-gray-900">
                        {selectedBooking.userDetails?.email || selectedBooking.bookedBy?.email || 'Email pending confirmation'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Phone</p>
                      <p className="text-sm text-gray-900">
                        {selectedBooking.userDetails?.phone || selectedBooking.bookedBy?.phoneNumber || 'Phone pending confirmation'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Booking Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Date</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedBooking.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Time</p>
                    <p className="text-sm text-gray-900">
                      {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <span className={getStatusBadge(selectedBooking.status)}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Service Type</p>
                    <p className="text-sm text-gray-900 font-semibold">
                      {selectedBooking.artistBookingId?.artistType ? 
                        (selectedBooking.artistBookingId.artistType === 'private' ? 'Private Event' : 'Public Performance') : 
                        'Artist Service'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Venue Details */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Venue Information</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Address</p>
                    <p className="text-sm text-gray-900">
                      {selectedBooking.venueDetails?.address || 'Address to be confirmed'}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">City</p>
                      <p className="text-sm text-gray-900">
                        {selectedBooking.venueDetails?.city || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">State</p>
                      <p className="text-sm text-gray-900">
                        {selectedBooking.venueDetails?.state || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Country</p>
                      <p className="text-sm text-gray-900">
                        {selectedBooking.venueDetails?.country || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Artist Details */}
              {selectedBooking.artistBookingId?.artistId && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Artist Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center space-x-4 mb-3">
                      {selectedBooking.artistBookingId.artistId.roleProfile?.profileImage && (
                        <img 
                          src={selectedBooking.artistBookingId.artistId.roleProfile.profileImage} 
                          alt="Artist" 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900">
                          {selectedBooking.artistBookingId.artistId.roleProfile?.stageName || 
                           `${selectedBooking.artistBookingId.artistId.firstName} ${selectedBooking.artistBookingId.artistId.lastName}`}
                        </h5>
                        <p className="text-xs text-gray-600">
                          {selectedBooking.artistBookingId.artistId.roleProfile?.artistType || 'Artist'}
                        </p>
                      </div>
                    </div>
                    
                    {selectedBooking.artistBookingId.artistId.roleProfile?.about && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700">About</p>
                        <p className="text-sm text-gray-900 mt-1">
                          {selectedBooking.artistBookingId.artistId.roleProfile.about}
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedBooking.artistBookingId.artistId.roleProfile?.yearsOfExperience && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Experience</p>
                          <p className="text-sm text-gray-900">
                            {selectedBooking.artistBookingId.artistId.roleProfile.yearsOfExperience} years
                          </p>
                        </div>
                      )}
                      
                      {selectedBooking.artistBookingId.artistId.roleProfile?.skills && 
                       selectedBooking.artistBookingId.artistId.roleProfile.skills.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Skills</p>
                          <p className="text-sm text-gray-900">
                            {selectedBooking.artistBookingId.artistId.roleProfile.skills.slice(0, 3).join(', ')}
                            {selectedBooking.artistBookingId.artistId.roleProfile.skills.length > 3 && '...'}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700">Contact</p>
                      <p className="text-sm text-gray-900">
                        {selectedBooking.artistBookingId.artistId.email}
                      </p>
                      {selectedBooking.artistBookingId.artistId.phoneNumber && (
                        <p className="text-sm text-gray-900">
                          {selectedBooking.artistBookingId.artistId.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Event Description */}
              {selectedBooking.eventDescription && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Event Description</h4>
                  <p className="text-sm text-gray-900">{selectedBooking.eventDescription}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminArtistBookingManagement;