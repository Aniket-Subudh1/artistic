'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Booking, BookingFilters, BookingSummary, BOOKING_STATUSES } from '@/types/booking';
import { BookingCard } from './BookingCard';
import { BookingDetailsModal } from './BookingDetailsModal';
import { EnhancedBookingCard } from './EnhancedBookingCard';
import { EnhancedBookingDetailsModal } from './EnhancedBookingDetailsModal';
import { BookingService } from '@/services/booking.service';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Search, Filter, Calendar, TrendingUp, Clock, CheckCircle, 
  XCircle, DollarSign, RefreshCw, Plus, BarChart3 
} from 'lucide-react';
import { format, isAfter, isBefore, parseISO } from 'date-fns';

export function UserBookingsDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [filters, setFilters] = useState<BookingFilters>({
    status: 'all',
    eventType: 'all',
    searchTerm: ''
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summary, setSummary] = useState<BookingSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters]);

  const fetchBookings = async () => {
    try {
      setError(null);
      const data = await BookingService.getUserBookings();
      setBookings(data || []);
      calculateSummary(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const calculateSummary = (bookingsList: Booking[]) => {
    const now = new Date();
    const summary: BookingSummary = {
      total: bookingsList.length,
      pending: bookingsList.filter(b => b.status === 'pending').length,
      confirmed: bookingsList.filter(b => b.status === 'confirmed').length,
      completed: bookingsList.filter(b => b.status === 'completed').length,
      cancelled: bookingsList.filter(b => b.status === 'cancelled').length,
      totalSpent: bookingsList
        .filter(b => b.status === 'completed' || b.status === 'confirmed')
        .reduce((sum, b) => sum + b.totalPrice, 0),
      upcomingBookings: bookingsList.filter(b => 
        (b.status === 'confirmed' || b.status === 'pending') && 
        isAfter(new Date(b.eventDate), now)
      ).length
    };
    setSummary(summary);
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    // Event type filter
    if (filters.eventType && filters.eventType !== 'all') {
      filtered = filtered.filter(booking => booking.eventType === filters.eventType);
    }

    // Date range filter
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.eventDate);
        return (!start || isAfter(bookingDate, parseISO(start))) && 
               (!end || isBefore(bookingDate, parseISO(end)));
      });
    }

    // Search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.artist?.fullName?.toLowerCase().includes(searchTerm) ||
        booking.artist?.artistType?.toLowerCase().includes(searchTerm) ||
        booking.eventDescription?.toLowerCase().includes(searchTerm) ||
        booking.venueDetails.city.toLowerCase().includes(searchTerm) ||
        booking.venueDetails.address.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by event date (upcoming first, then by date)
    filtered.sort((a, b) => {
      const dateA = new Date(a.eventDate);
      const dateB = new Date(b.eventDate);
      const now = new Date();
      
      const aUpcoming = isAfter(dateA, now);
      const bUpcoming = isAfter(dateB, now);
      
      if (aUpcoming && !bUpcoming) return -1;
      if (!aUpcoming && bUpcoming) return 1;
      
      return aUpcoming ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });

    setFilteredBookings(filtered);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBookings();
  };

  const handleNewBooking = () => {
    router.push('/');
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCancelBooking = async (booking: Booking, reason: string) => {
    try {
      await BookingService.cancelBooking(booking._id, reason);
      // Update local state
      setBookings(prev => prev.map(b => 
        b._id === booking._id 
          ? { ...b, status: 'cancelled' as const, cancellationReason: reason, cancelledAt: new Date().toISOString() }
          : b
      ));
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KWD'
    }).format(amount);
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading your bookings..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600 mt-1">Manage and track all your event bookings</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="sm:inline">Refresh</span>
            </button>
            <button 
              onClick={handleNewBooking}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="sm:inline">New Booking</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover-lift">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{summary.total}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 rounded-full ml-3">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover-lift">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{summary.upcomingBookings}</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-50 rounded-full ml-3">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover-lift">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{summary.pending}</p>
              </div>
              <div className="p-2 sm:p-3 bg-yellow-50 rounded-full ml-3">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover-lift">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 break-words">{formatCurrency(summary.totalSpent)}</p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-50 rounded-full ml-3">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings by artist, event, or location..."
                value={filters.searchTerm || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Status Filter */}
            <div className="w-full">
              <select
                value={filters.status || 'all'}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option value="all">All Status</option>
                {Object.values(BOOKING_STATUSES).map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Type Filter */}
            <div className="w-full">
              <select
                value={filters.eventType || 'all'}
                onChange={(e) => setFilters(prev => ({ ...prev, eventType: e.target.value as any }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option value="all">All Events</option>
                <option value="private">Private Events</option>
                <option value="public">Public Events</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="w-full sm:col-span-2 lg:col-span-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  placeholder="Start date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value, end: prev.dateRange?.end || '' }
                  }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <input
                  type="date"
                  placeholder="End date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value, start: prev.dateRange?.start || '' }
                  }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.status !== 'all' || filters.eventType !== 'all' || filters.searchTerm) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            {filters.status && filters.status !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm">
                Status: {BOOKING_STATUSES[filters.status].label}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                  className="ml-1 hover:text-blue-900 text-base leading-none"
                  aria-label="Remove status filter"
                >
                  ×
                </button>
              </span>
            )}
            {filters.eventType && filters.eventType !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs sm:text-sm">
                Type: {filters.eventType === 'private' ? 'Private' : 'Public'}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, eventType: 'all' }))}
                  className="ml-1 hover:text-green-900 text-base leading-none"
                  aria-label="Remove event type filter"
                >
                  ×
                </button>
              </span>
            )}
            {filters.searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs sm:text-sm max-w-full">
                <span className="truncate">Search: "{filters.searchTerm}"</span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}
                  className="ml-1 hover:text-purple-900 text-base leading-none flex-shrink-0"
                  aria-label="Remove search filter"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchBookings}
              className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-4 sm:space-y-6">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
            <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto">
              {bookings.length === 0 
                ? "You haven't made any bookings yet. Start by browsing our talented artists!"
                : "No bookings match your current filters. Try adjusting your search criteria."
              }
            </p>
            <button 
              onClick={handleNewBooking}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Browse Artists
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-gray-600">
                Showing {filteredBookings.length} of {bookings.length} bookings
              </p>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              {filteredBookings.map((booking) => (
                <div key={booking._id} className="mobile-card-spacing">
                  <EnhancedBookingCard
                    booking={booking}
                    onViewDetails={handleViewDetails}
                    onCancel={handleCancelBooking}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <EnhancedBookingDetailsModal
          booking={selectedBooking}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBooking(null);
          }}
          onCancel={handleCancelBooking}
        />
      )}
    </div>
  );
}