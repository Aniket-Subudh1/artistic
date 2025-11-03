'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Calendar,
  Package,
  MapPin,
  DollarSign,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  BarChart3,
  Building,
  Wrench,
  Activity,
  Box
} from 'lucide-react';
import { AdminService } from '@/services/admin.service';

interface EquipmentBooking {
  _id: string;
  bookingSource?: 'combined' | 'standalone';
  displayDate?: string;
  equipmentBookingId?: {
    _id: string;
    equipments: Array<{
      equipmentId: {
        _id: string;
        name: string;
        category: string;
        price: number;
        specifications?: any;
        images?: string[];
      } | null;
      quantity: number;
    }>;
    packages?: Array<{
      _id: string;
      name: string;
      description: string;
      totalPrice: number;
      coverImage?: string;
      items?: any[];
      createdBy?: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        roleProfile?: {
          _id: string;
          companyName: string;
          businessDescription: string;
        };
      };
    }>;
    totalPrice: number;
  };
  packageId?: {
    _id: string;
    name: string;
    description: string;
    totalPrice: number;
    coverImage?: string;
    items?: any[];
    createdBy: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      roleProfile?: {
        _id: string;
        companyName: string;
        businessDescription: string;
      };
    };
  };
  bookedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  date?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  numberOfDays?: number;
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

interface EquipmentBookingMetrics {
  totalRevenue: number;
  combinedEquipmentRevenue: number;
  packageRevenue: number;
  equipmentTypeBreakdown: Array<{ _id: string; bookings: number; revenue: number }>;
  providerPerformance: Array<{
    _id: string;
    providerName: string;
    totalRevenue: number;
    totalBookings: number;
    avgRating?: number;
  }>;
  monthlyTrends: Array<{ _id: { year: number; month: number }; revenue: number; bookings: number }>;
  utilizationStats: {
    avgDuration: number;
    totalBookingDays: number;
  };
}

const AdminEquipmentBookingManagement = () => {
  const [bookings, setBookings] = useState<EquipmentBooking[]>([]);
  const [metrics, setMetrics] = useState<EquipmentBookingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<EquipmentBooking | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Pagination
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // View modes
  const [viewMode, setViewMode] = useState<'list' | 'packages' | 'analytics'>('list');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getEquipmentBookings({
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
      setError('Failed to fetch equipment bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentPage, pageSize, statusFilter, searchTerm, startDate, endDate]);

  // Load detailed info when a booking is selected
  useEffect(() => {
    const loadDetails = async () => {
      if (!selectedBooking) { setDetail(null); return; }
      try {
        setDetailLoading(true);
        if (selectedBooking.bookingSource === 'combined') {
          const res = await AdminService.getCombinedBookingDetails(selectedBooking._id);
          setDetail(res);
        } else {
          const res = await AdminService.getEquipmentPackageBookingDetails(selectedBooking._id);
          setDetail(res);
        }
      } catch (e) {
        console.error('Failed to load equipment booking details', e);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
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
      case 'completed':
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
    if (!timeString) return 'N/A';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get package info from booking
  const getPackageInfo = (booking: EquipmentBooking) => {
    if (booking.packageId) {
      // Standalone package booking
      return {
        name: booking.packageId.name,
        coverImage: booking.packageId.coverImage,
        provider: booking.packageId.createdBy?.roleProfile?.companyName || 
                 `${booking.packageId.createdBy?.firstName} ${booking.packageId.createdBy?.lastName}`,
        items: booking.packageId.items
      };
    } else if (booking.bookingSource === 'combined') {
      // Custom package booking
      return {
        name: 'Custom Package',
        coverImage: null,
        provider: booking.bookedBy ? `${booking.bookedBy.firstName} ${booking.bookedBy.lastName}` : 'Customer',
        items: booking.equipmentBookingId?.equipments || []
      };
    } else if (booking.equipmentBookingId?.packages && booking.equipmentBookingId.packages.length > 0) {
      // Combined booking with equipment packages
      const firstPackage = booking.equipmentBookingId.packages[0];
      return {
        name: firstPackage.name,
        coverImage: firstPackage.coverImage,
        provider: firstPackage.createdBy?.roleProfile?.companyName || 
                 `${firstPackage.createdBy?.firstName} ${firstPackage.createdBy?.lastName}`,
        items: firstPackage.items
      };
    } else if (booking.equipmentBookingId?.equipments && booking.equipmentBookingId.equipments.length > 0) {
      // Individual equipment booking
      const validEquipment = booking.equipmentBookingId.equipments.filter(eq => eq.equipmentId?.name);
      const equipmentNames = validEquipment
        .map(eq => `${eq.equipmentId!.name} (${eq.quantity}x)`) // Safe after filter
        .join(', ');
      
      return {
        name: equipmentNames || 'Equipment Booking',
        coverImage: validEquipment[0]?.equipmentId?.images?.[0],
        provider: 'Equipment Provider',
        items: booking.equipmentBookingId.equipments
      };
    }
    return {
      name: 'Unknown Equipment',
      coverImage: null,
      provider: 'Unknown Provider',
      items: []
    };
  };

  const exportBookings = () => {
    const csvContent = [
      ['Booking ID', 'Type', 'Provider/Package', 'Customer Name', 'Date Range', 'Status', 'Amount', 'Duration', 'Created'].join(','),
      ...bookings.map(booking => {
        const packageInfo = getPackageInfo(booking);
        return [
          booking._id,
          booking.bookingSource || 'package',
          packageInfo.name,
          booking.userDetails?.name || `${booking.bookedBy.firstName} ${booking.bookedBy.lastName}`,
          booking.startDate ? `${formatDate(booking.startDate)} - ${formatDate(booking.endDate || booking.startDate)}` 
            : formatDate(booking.displayDate || booking.date || ''),
          booking.status,
          booking.totalPrice,
          booking.numberOfDays ? `${booking.numberOfDays} days` : 'N/A',
          formatDate(booking.createdAt)
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `equipment-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const renderMetricsCards = () => {
    if (!metrics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(metrics.totalRevenue)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Package Revenue</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(metrics.packageRevenue)}
              </p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Duration</p>
              <p className="text-3xl font-bold text-gray-900">
                {metrics.utilizationStats.avgDuration.toFixed(1)} days
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Providers</p>
              <p className="text-3xl font-bold text-gray-900">
                {metrics.providerPerformance.length}
              </p>
            </div>
            <Building className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>
    );
  };

  const renderAnalyticsView = () => {
    if (!metrics) return null;

    return (
      <div className="space-y-8">
        {renderMetricsCards()}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Equipment Type Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Type Performance</h3>
            <div className="space-y-3">
              {metrics.equipmentTypeBreakdown.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Wrench className="w-4 h-4 text-gray-600" />
                    <span className="capitalize text-sm font-medium text-gray-700">
                      {item._id || 'Unknown'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{item.bookings} bookings</p>
                    <p className="text-xs text-gray-600">{formatCurrency(item.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Equipment Providers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Equipment Providers</h3>
            <div className="space-y-3">
              {metrics.providerPerformance.slice(0, 5).map((provider, index) => (
                <div key={provider._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full text-xs font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {provider.providerName || 'Unknown Provider'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(provider.totalRevenue)}
                    </p>
                    <p className="text-xs text-gray-600">{provider.totalBookings} bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Revenue Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
            <div className="space-y-3">
              {metrics.monthlyTrends.map((month) => (
                <div key={`${month._id.year}-${month._id.month}`} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(month.revenue)}
                    </p>
                    <p className="text-xs text-gray-600">{month.bookings} bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Utilization Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilization Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Average Booking Duration</span>
                <span className="text-sm font-semibold text-gray-900">
                  {metrics.utilizationStats.avgDuration.toFixed(1)} days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Booking Days</span>
                <span className="text-sm font-semibold text-gray-900">
                  {metrics.utilizationStats.totalBookingDays} days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Revenue Split</span>
                <div className="text-right">
                  <p className="text-xs text-gray-600">
                    Packages: {formatCurrency(metrics.packageRevenue)}
                  </p>
                  <p className="text-xs text-gray-600">
                    Combined: {formatCurrency(metrics.combinedEquipmentRevenue)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPackagesView = () => {
    // Show all bookings that have equipment packages (standalone or combined)
    const packageBookings = bookings.filter(booking => 
      booking.packageId || 
      (booking.equipmentBookingId?.packages && booking.equipmentBookingId.packages.length > 0) ||
      booking.bookingSource === 'standalone' ||
      booking.bookingSource === 'combined'
    );

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Equipment Package Bookings</h3>
          <p className="text-sm text-gray-600 mt-1">
            Showing {packageBookings.length} package bookings (standalone and combined)
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packageBookings.map((booking) => {
              const packageInfo = getPackageInfo(booking);
              return (
                <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {packageInfo.name}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        {booking.packageId?.description?.substring(0, 100) ||
                         booking.equipmentBookingId?.packages?.[0]?.description?.substring(0, 100) ||
                         'Equipment package booking'}
                        {((booking.packageId?.description && booking.packageId.description.length > 100) ||
                          (booking.equipmentBookingId?.packages?.[0]?.description && 
                           booking.equipmentBookingId.packages[0].description.length > 100)) ? '...' : ''}
                      </p>
                      <div className="text-xs text-blue-600 font-medium">
                        {booking.bookingSource === 'combined' ? 'Combined Booking' : 'Package Booking'}
                      </div>
                    </div>
                    <span className={getStatusBadge(booking.status)}>
                      {booking.status}
                    </span>
                  </div>
                  
                  {packageInfo.coverImage && (
                    <img
                      src={packageInfo.coverImage}
                      alt={packageInfo.name}
                      className="w-full h-32 object-cover rounded-md mb-3"
                    />
                  )}
                  
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Customer:</span>
                      <span className="font-medium">
                        {booking.userDetails?.name || `${booking.bookedBy.firstName} ${booking.bookedBy.lastName}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">
                        {booking.numberOfDays ? `${booking.numberOfDays} days` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Date Range:</span>
                      <span className="font-medium">
                        {booking.startDate ? 
                          `${formatDate(booking.startDate)} - ${formatDate(booking.endDate || booking.startDate)}` :
                          formatDate(booking.displayDate || booking.date || '')
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Provider:</span>
                      <span className="font-medium">
                        {packageInfo.provider}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(booking.totalPrice)}
                    </span>
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {packageBookings.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No package bookings found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search filters or date range.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Equipment Bookings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipment/Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-gray-200">
              {bookings.map((booking) => {
                const packageInfo = getPackageInfo(booking);
                return (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {packageInfo.coverImage ? (
                            <img
                              className="h-10 w-10 rounded object-cover"
                              src={packageInfo.coverImage}
                              alt={packageInfo.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-gray-300 flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {packageInfo.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.bookingSource === 'combined' ? 'Custom Package' : 
                             booking.packageId ? 'Standard Package' : 'Individual Equipment'} • {booking.bookingType || 'equipment'}
                          </div>
                        </div>
                      </div>
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.userDetails?.name || 
                       (booking.bookedBy?.firstName && booking.bookedBy?.lastName 
                        ? `${booking.bookedBy.firstName} ${booking.bookedBy.lastName}` 
                        : 'Customer Details Pending')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.userDetails?.email || booking.bookedBy?.email || 'Email pending'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {packageInfo.provider}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.startDate ? 
                        `${formatDate(booking.startDate)} - ${formatDate(booking.endDate || booking.startDate)}` :
                        formatDate(booking.displayDate || booking.date || '')
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.numberOfDays ? `${booking.numberOfDays} days` : '1 day'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.bookingSource === 'combined' ? 'Custom Package' : 
                       booking.packageId ? 'Standard Package' : 'Individual Equipment'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(booking.status)}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipment Booking Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and monitor all equipment bookings including packages and individual equipment rentals.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={exportBookings}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setViewMode('list')}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            viewMode === 'list'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          List View
        </button>
        <button
          onClick={() => setViewMode('packages')}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            viewMode === 'packages'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Package View
        </button>
        <button
          onClick={() => setViewMode('analytics')}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            viewMode === 'analytics'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search bookings..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'analytics' && renderAnalyticsView()}
      {viewMode === 'packages' && renderPackagesView()}
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
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Equipment Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {detailLoading && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
              {!detailLoading && detail && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Cost Breakdown</h4>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Equipment Cost</p>
                      <p className="text-sm font-semibold">{formatCurrency(detail.breakdown?.equipmentCost || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Platform Fee</p>
                      <p className="text-sm font-semibold">{formatCurrency(detail.breakdown?.platformFee || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-sm font-semibold">{formatCurrency(detail.breakdown?.total || 0)}</p>
                    </div>
                  </div>
                </div>
              )}
              {/* Package/Equipment Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Equipment/Package Information</h4>
                {(() => {
                  const packageInfo = getPackageInfo(selectedBooking);
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Name</p>
                        <p className="text-sm text-gray-900">
                          {packageInfo.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Type</p>
                        <p className="text-sm text-gray-900 capitalize">
                          {selectedBooking.bookingSource || 'package'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-700">Description</p>
                        <p className="text-sm text-gray-900">
                          {selectedBooking.packageId?.description || 
                           selectedBooking.equipmentBookingId?.packages?.[0]?.description || 
                           'No description available'}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Provider Information */}
              {(selectedBooking.packageId?.createdBy || selectedBooking.equipmentBookingId?.packages?.[0]?.createdBy) && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Provider Information</h4>
                  {(() => {
                    const provider = selectedBooking.packageId?.createdBy || 
                                   selectedBooking.equipmentBookingId?.packages?.[0]?.createdBy;
                    return provider ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Company</p>
                          <p className="text-sm text-gray-900">
                            {provider.roleProfile?.companyName || 
                             `${provider.firstName} ${provider.lastName}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Email</p>
                          <p className="text-sm text-gray-900">
                            {provider.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Phone</p>
                          <p className="text-sm text-gray-900">
                            {provider.phoneNumber}
                          </p>
                        </div>
                        {provider.roleProfile?.businessDescription && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Business Description</p>
                            <p className="text-sm text-gray-900">
                              {provider.roleProfile.businessDescription}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {/* Customer Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Name</p>
                    <p className="text-sm text-gray-900">
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

              {/* Booking Details */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Booking Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Start Date</p>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedBooking.startDate || selectedBooking.displayDate || selectedBooking.date || '')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">End Date</p>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedBooking.endDate || selectedBooking.startDate || selectedBooking.displayDate || selectedBooking.date || '')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Duration</p>
                    <p className="text-sm text-gray-900">
                      {selectedBooking.numberOfDays ? `${selectedBooking.numberOfDays} days` : '1 day'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <span className={getStatusBadge(selectedBooking.status)}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Booking Type</p>
                    <p className="text-sm text-gray-900 font-semibold">
                      {selectedBooking.bookingSource === 'combined' ? 'Custom Package' : 
                       selectedBooking.packageId ? 'Standard Package' : 'Individual Equipment'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Venue Details */}
              {selectedBooking.venueDetails && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Venue Information</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Address</p>
                      <p className="text-sm text-gray-900">
                        {selectedBooking.venueDetails.address || 'Address to be confirmed'}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">City</p>
                        <p className="text-sm text-gray-900">
                          {selectedBooking.venueDetails.city || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">State</p>
                        <p className="text-sm text-gray-900">
                          {selectedBooking.venueDetails.state || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Country</p>
                        <p className="text-sm text-gray-900">
                          {selectedBooking.venueDetails.country || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Equipment/Package Items */}
              {(() => {
                console.log('=== BOOKING DEBUG INFO ===');
                console.log('Selected Booking Structure:', JSON.stringify(selectedBooking, null, 2));
                console.log('Booking Source:', selectedBooking.bookingSource);
                console.log('Package Items:', selectedBooking.packageId?.items);
                console.log('Equipment Booking Items:', selectedBooking.equipmentBookingId?.equipments);
                console.log('Combined Package Items:', selectedBooking.equipmentBookingId?.packages);
                
                // Check what's in equipmentBookingId for custom packages
                if (selectedBooking.bookingSource === 'combined' && selectedBooking.equipmentBookingId) {
                  console.log('CUSTOM PACKAGE DEBUG:');
                  console.log('- equipmentBookingId.equipments:', selectedBooking.equipmentBookingId.equipments);
                  console.log('- equipmentBookingId.packages:', selectedBooking.equipmentBookingId.packages);
                  console.log('- equipmentBookingId.customPackages:', (selectedBooking.equipmentBookingId as any).customPackages);
                  
                  if (selectedBooking.equipmentBookingId.equipments) {
                    selectedBooking.equipmentBookingId.equipments.forEach((item: any, i: number) => {
                      console.log(`Equipment ${i}:`, item);
                      console.log(`Equipment ${i} equipmentId:`, item.equipmentId);
                      console.log(`Equipment ${i} name:`, item.equipmentId?.name);
                    });
                  }
                  
                  if ((selectedBooking.equipmentBookingId as any).customPackages) {
                    (selectedBooking.equipmentBookingId as any).customPackages.forEach((pkg: any, i: number) => {
                      console.log(`Custom Package ${i}:`, pkg);
                      console.log(`Custom Package ${i} items:`, pkg.items);
                      if (pkg.items) {
                        pkg.items.forEach((item: any, j: number) => {
                          console.log(`Custom Package ${i} Item ${j}:`, item);
                          console.log(`Custom Package ${i} Item ${j} equipmentId:`, item.equipmentId);
                        });
                      }
                    });
                  }
                }
                
                if (selectedBooking.equipmentBookingId?.packages) {
                  selectedBooking.equipmentBookingId.packages.forEach((pkg: any, i: number) => {
                    console.log(`Package ${i} items:`, pkg.items);
                    if (pkg.items) {
                      pkg.items.forEach((item: any, j: number) => {
                        console.log(`Item ${j}:`, item);
                        console.log(`Item ${j} equipmentId:`, item.equipmentId);
                      });
                    }
                  });
                }
                console.log('========================');
                
                // Check for standard package items first
                if (selectedBooking.packageId?.items && selectedBooking.packageId.items.length > 0) {
                  return (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Package Items ({selectedBooking.packageId.items.length} items)</h4>
                      <div className="space-y-2">
                        {selectedBooking.packageId.items.map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900">
                                {item.equipmentId?.name || item.name || 'Equipment Item'}
                              </span>
                              {item.equipmentId?.category && (
                                <p className="text-xs text-gray-600 mt-1">Category: {item.equipmentId.category}</p>
                              )}
                              {item.equipmentId?.specifications && (
                                <p className="text-xs text-gray-600">Specifications available</p>
                              )}
                            </div>
                            <span className="text-sm text-gray-600 font-medium bg-gray-200 px-2 py-1 rounded">
                              Qty: {item.quantity || 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                
                // Check for equipment package items in combined bookings (packages array)
                if (selectedBooking.equipmentBookingId?.packages && selectedBooking.equipmentBookingId.packages.length > 0) {
                  const allPackageItems = selectedBooking.equipmentBookingId.packages.flatMap(pkg => pkg.items || []);
                  if (allPackageItems.length > 0) {
                    return (
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Package Items ({allPackageItems.length} items)</h4>
                        <div className="space-y-2">
                          {allPackageItems.map((item: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {item.equipmentId?.name || item.name || 'Equipment Item'}
                                </span>
                                {item.equipmentId?.category && (
                                  <p className="text-xs text-gray-600 mt-1">Category: {item.equipmentId.category}</p>
                                )}
                                {item.equipmentId?.specifications && (
                                  <p className="text-xs text-gray-600">Specifications available</p>
                                )}
                              </div>
                              <span className="text-sm text-gray-600 font-medium bg-gray-200 px-2 py-1 rounded">
                                Qty: {item.quantity || 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                }
                
                // Check for custom package items in combined bookings (customPackages array)
                if (selectedBooking.bookingSource === 'combined' && (selectedBooking.equipmentBookingId as any)?.customPackages && (selectedBooking.equipmentBookingId as any).customPackages.length > 0) {
                  console.log('Processing customPackages:', (selectedBooking.equipmentBookingId as any).customPackages);
                  
                  // Check if customPackages are properly populated (objects) or just IDs (strings)
                  const customPackages = (selectedBooking.equipmentBookingId as any).customPackages;
                  const firstPackage = customPackages[0];
                  
                  if (typeof firstPackage === 'string') {
                    console.log('Custom packages are not populated - showing fallback message');
                    return (
                      <div className="text-sm text-gray-600">
                        <p>Custom Package (ID: {firstPackage})</p>
                        <p className="text-xs text-orange-600 mt-1">Equipment details not loaded - please refresh</p>
                      </div>
                    );
                  }
                  
                  const allCustomPackageItems = customPackages.flatMap((pkg: any) => pkg.items || []);
                  if (allCustomPackageItems.length > 0) {
                    return (
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Custom Package Items ({allCustomPackageItems.length} items)</h4>
                        <div className="space-y-2">
                          {allCustomPackageItems.map((item: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {item.equipmentId?.name || 'Equipment Item'}
                                </span>
                                {item.equipmentId?.category && (
                                  <p className="text-xs text-gray-600 mt-1">Category: {item.equipmentId.category}</p>
                                )}
                                {item.equipmentId?.pricePerDay && (
                                  <p className="text-xs text-gray-600">Price: {item.equipmentId.pricePerDay} KWD/day</p>
                                )}
                                {item.equipmentId?.specifications && (
                                  <p className="text-xs text-gray-600">Specifications available</p>
                                )}
                              </div>
                              <span className="text-sm text-gray-600 font-medium bg-gray-200 px-2 py-1 rounded">
                                Qty: {item.quantity || 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                }
                
                // Fallback: Check for custom package items in combined bookings (equipments array) - for backward compatibility
                if (selectedBooking.bookingSource === 'combined' && selectedBooking.equipmentBookingId?.equipments && selectedBooking.equipmentBookingId.equipments.length > 0) {
                  const validEquipment = selectedBooking.equipmentBookingId.equipments.filter(item => item.equipmentId);
                  if (validEquipment.length > 0) {
                    return (
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Equipment Items ({validEquipment.length} items)</h4>
                        <div className="space-y-2">
                          {validEquipment.map((item: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {item.equipmentId?.name || 'Equipment Item'}
                                </span>
                                {item.equipmentId?.category && (
                                  <p className="text-xs text-gray-600 mt-1">Category: {item.equipmentId.category}</p>
                                )}
                                {item.equipmentId?.specifications && (
                                  <p className="text-xs text-gray-600">Specifications available</p>
                                )}
                              </div>
                              <span className="text-sm text-gray-600 font-medium bg-gray-200 px-2 py-1 rounded">
                                Qty: {item.quantity || 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                }
                
                // Check for individual equipment items
                if (selectedBooking.equipmentBookingId?.equipments && selectedBooking.equipmentBookingId.equipments.length > 0) {
                  const validEquipment = selectedBooking.equipmentBookingId.equipments.filter(item => item.equipmentId);
                  if (validEquipment.length > 0) {
                    return (
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Equipment Items ({validEquipment.length} items)</h4>
                        <div className="space-y-2">
                          {validEquipment.map((item: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {item.equipmentId?.name || 'Equipment Item'}
                                </span>
                                {item.equipmentId?.category && (
                                  <p className="text-xs text-gray-600 mt-1">Category: {item.equipmentId.category}</p>
                                )}
                                {item.equipmentId?.specifications && (
                                  <p className="text-xs text-gray-600">Specifications available</p>
                                )}
                              </div>
                              <span className="text-sm text-gray-600 font-medium bg-gray-200 px-2 py-1 rounded">
                                Qty: {item.quantity || 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                }
                
                // Show message if no items found
                return (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Equipment/Package Items</h4>
                    <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <p className="text-sm text-gray-600 text-center">No equipment or package items found for this booking</p>
                    </div>
                  </div>
                );
              })()}

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

export default AdminEquipmentBookingManagement;