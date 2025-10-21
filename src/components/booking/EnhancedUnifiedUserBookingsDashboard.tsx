'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Booking, BookingFilters, BookingSummary, BOOKING_STATUSES, EquipmentPackageBooking } from '@/types/booking';
import { EnhancedBookingCard } from './EnhancedBookingCard';
import { EnhancedBookingDetailsModal } from './EnhancedBookingDetailsModal';
import { EnhancedEquipmentPackageBookingCard } from './EnhancedEquipmentPackageBookingCard';
import { EquipmentPackageBookingDetailsModal } from './EquipmentPackageBookingDetailsModal';
import { BookingService } from '@/services/booking.service';
import { equipmentPackageBookingService } from '@/services/equipment-package-booking.service';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Search, Filter, Calendar, TrendingUp, Clock, CheckCircle, 
  XCircle, DollarSign, RefreshCw, Plus, BarChart3, Package, User,
  SlidersHorizontal, ArrowUpDown, Grid3X3, List, Eye, Settings,
  Star, Zap, Activity, Award, Target, Sparkles, Heart, Layers
} from 'lucide-react';
import { format, isAfter, isBefore, parseISO } from 'date-fns';

type UnifiedBooking = {
  type: 'artist' | 'equipment';
  data: Booking | EquipmentPackageBooking;
  eventDate: Date;
  status: string;
  totalPrice: number;
};

type ViewMode = 'grid' | 'list';
type SortOption = 'date' | 'price' | 'status' | 'type';

export function EnhancedUnifiedUserBookingsDashboard() {
  const router = useRouter();
  const [artistBookings, setArtistBookings] = useState<Booking[]>([]);
  const [equipmentBookings, setEquipmentBookings] = useState<EquipmentPackageBooking[]>([]);
  const [unifiedBookings, setUnifiedBookings] = useState<UnifiedBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<UnifiedBooking[]>([]);
  const [filters, setFilters] = useState<BookingFilters>({
    status: 'all',
    eventType: 'all',
    searchTerm: ''
  });
  const [selectedArtistBooking, setSelectedArtistBooking] = useState<Booking | null>(null);
  const [selectedEquipmentBooking, setSelectedEquipmentBooking] = useState<EquipmentPackageBooking | null>(null);
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summary, setSummary] = useState<BookingSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Enhanced UI states
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedBookingTypes, setSelectedBookingTypes] = useState<string[]>(['artist', 'equipment']);

  useEffect(() => {
    fetchAllBookings();
  }, []);

  useEffect(() => {
    combineAndSortBookings();
  }, [artistBookings, equipmentBookings, sortBy]);

  useEffect(() => {
    applyFilters();
  }, [unifiedBookings, filters, selectedBookingTypes]);

  const fetchAllBookings = async () => {
    try {
      setError(null);
      
      const [artistData, equipmentData] = await Promise.all([
        BookingService.getUserBookings().catch(() => []),
        equipmentPackageBookingService.getMyBookings().then(res => res.bookings).catch(() => [])
      ]);

      setArtistBookings(artistData || []);
      setEquipmentBookings(equipmentData || []);
      calculateEnhancedSummary(artistData || [], equipmentData || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const combineAndSortBookings = () => {
    const unified: UnifiedBooking[] = [];

    // Add artist bookings
    artistBookings.forEach(booking => {
      const eventDate = new Date(booking.eventDate);
      unified.push({
        type: 'artist',
        data: booking,
        eventDate,
        status: booking.status,
        totalPrice: booking.totalPrice
      });
    });

    // Add equipment package bookings
    equipmentBookings.forEach(booking => {
      const eventDate = new Date(booking.startDate);
      unified.push({
        type: 'equipment',
        data: booking,
        eventDate,
        status: booking.status,
        totalPrice: booking.totalPrice
      });
    });

    // Enhanced sorting
    unified.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.totalPrice - a.totalPrice;
        case 'status':
          return a.status.localeCompare(b.status);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'date':
        default:
          const now = new Date();
          const aUpcoming = isAfter(a.eventDate, now);
          const bUpcoming = isAfter(b.eventDate, now);
          
          if (aUpcoming && !bUpcoming) return -1;
          if (!aUpcoming && bUpcoming) return 1;
          
          return aUpcoming ? a.eventDate.getTime() - b.eventDate.getTime() : b.eventDate.getTime() - a.eventDate.getTime();
      }
    });

    setUnifiedBookings(unified);
  };

  const calculateEnhancedSummary = (artistBookings: Booking[], equipmentBookings: EquipmentPackageBooking[]) => {
    const now = new Date();
    
    const artistStats = {
      total: artistBookings.length,
      upcoming: artistBookings.filter(b => isAfter(new Date(b.eventDate), now)).length,
      pending: artistBookings.filter(b => b.status === 'pending').length,
      confirmed: artistBookings.filter(b => b.status === 'confirmed').length,
      completed: artistBookings.filter(b => b.status === 'completed').length,
      cancelled: artistBookings.filter(b => b.status === 'cancelled').length,
      totalSpent: artistBookings.reduce((sum, b) => sum + b.totalPrice, 0)
    };

    const equipmentStats = {
      total: equipmentBookings.length,
      upcoming: equipmentBookings.filter(b => isAfter(new Date(b.startDate), now)).length,
      pending: equipmentBookings.filter(b => b.status === 'pending').length,
      confirmed: equipmentBookings.filter(b => b.status === 'confirmed').length,
      completed: equipmentBookings.filter(b => b.status === 'completed').length,
      cancelled: equipmentBookings.filter(b => b.status === 'cancelled').length,
      totalSpent: equipmentBookings.reduce((sum, b) => sum + b.totalPrice, 0)
    };

    setSummary({
      total: artistStats.total + equipmentStats.total,
      upcomingBookings: artistStats.upcoming + equipmentStats.upcoming,
      pending: artistStats.pending + equipmentStats.pending,
      totalSpent: artistStats.totalSpent + equipmentStats.totalSpent,
      confirmed: artistStats.confirmed + equipmentStats.confirmed,
      completed: artistStats.completed + equipmentStats.completed,
      cancelled: artistStats.cancelled + equipmentStats.cancelled
    });
  };

  const applyFilters = () => {
    let filtered = [...unifiedBookings];

    // Booking type filter
    filtered = filtered.filter(booking => selectedBookingTypes.includes(booking.type));

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    // Search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(booking => {
        if (booking.type === 'artist') {
          const artistBooking = booking.data as Booking;
          return (
            artistBooking.artist?.fullName?.toLowerCase().includes(searchTerm) ||
            artistBooking.artist?.artistType?.toLowerCase().includes(searchTerm) ||
            artistBooking.eventDescription?.toLowerCase().includes(searchTerm) ||
            artistBooking.venueDetails.city.toLowerCase().includes(searchTerm) ||
            artistBooking.venueDetails.address.toLowerCase().includes(searchTerm)
          );
        } else {
          const equipmentBooking = booking.data as EquipmentPackageBooking;
          return (
            equipmentBooking.packageId.name.toLowerCase().includes(searchTerm) ||
            equipmentBooking.eventDescription?.toLowerCase().includes(searchTerm) ||
            equipmentBooking.venueDetails.city.toLowerCase().includes(searchTerm) ||
            equipmentBooking.venueDetails.address.toLowerCase().includes(searchTerm)
          );
        }
      });
    }

    setFilteredBookings(filtered);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAllBookings();
  };

  const handleNewBooking = () => {
    router.push('/');
  };

  const handleViewArtistDetails = (booking: Booking) => {
    setSelectedArtistBooking(booking);
    setIsArtistModalOpen(true);
  };

  const handleViewEquipmentDetails = (booking: EquipmentPackageBooking) => {
    setSelectedEquipmentBooking(booking);
    setIsEquipmentModalOpen(true);
  };

  const handleCancelArtistBooking = async (booking: Booking, reason: string) => {
    try {
      await BookingService.cancelBooking(booking._id, reason);
      setArtistBookings(prev => prev.map(b => 
        b._id === booking._id 
          ? { ...b, status: 'cancelled' as const, cancellationReason: reason, cancelledAt: new Date().toISOString() }
          : b
      ));
    } catch (error) {
      console.error('Error cancelling artist booking:', error);
      throw error;
    }
  };

  const handleCancelEquipmentBooking = async (bookingId: string) => {
    console.log('Equipment booking cancellation requested for:', bookingId);
    alert('Equipment booking cancellation is not yet implemented. Please contact support.');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KWD'
    }).format(amount);
  };

  const toggleBookingType = (type: string) => {
    setSelectedBookingTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading your bookings..." />;
  }

  return (
    <div className="space-y-6 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Enhanced Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 rounded-2xl" />
        <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 shadow-lg p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Layers className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  My Bookings
                </h1>
              </div>
              <p className="text-gray-600">Manage and track all your event bookings with detailed insights</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 text-sm hover:shadow-md"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button 
                onClick={handleNewBooking}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4" />
                New Booking
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          {[
            {
              title: 'Total Bookings',
              value: summary.total,
              icon: BarChart3,
              gradient: 'from-blue-500 to-blue-600',
              bg: 'from-blue-50 to-blue-100',
              description: 'All time bookings'
            },
            {
              title: 'Upcoming Events',
              value: summary.upcomingBookings,
              icon: Calendar,
              gradient: 'from-green-500 to-emerald-600',
              bg: 'from-green-50 to-emerald-100',
              description: 'Events this month'
            },
            {
              title: 'Pending Approval',
              value: summary.pending,
              icon: Clock,
              gradient: 'from-yellow-500 to-amber-600',
              bg: 'from-yellow-50 to-amber-100',
              description: 'Awaiting confirmation'
            },
            {
              title: 'Total Spent',
              value: formatCurrency(summary.totalSpent),
              icon: DollarSign,
              gradient: 'from-purple-500 to-purple-600',
              bg: 'from-purple-50 to-purple-100',
              description: 'Lifetime spending'
            }
          ].map((stat, index) => (
            <div key={index} className="group h-full">
              <div className={`bg-gradient-to-br ${stat.bg} rounded-xl border border-white/60 shadow-sm hover:shadow-lg transition-all duration-300 p-4 lg:p-6 h-full min-h-[120px] flex flex-col justify-between`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2 truncate">{stat.title}</p>
                    <p className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-1 break-words">
                      {typeof stat.value === 'string' ? (
                        <span className="text-md sm:text-md lg:text-md xl:text-lg">{stat.value}</span>
                      ) : (
                        stat.value.toLocaleString()
                      )}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{stat.description}</p>
                  </div>
                  <div className={`p-2 lg:p-3 bg-gradient-to-r ${stat.gradient} rounded-lg shadow-md flex-shrink-0 ml-2`}>
                    <stat.icon className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 shadow-lg p-4 lg:p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings by artist, equipment, event, or location..."
              value={filters.searchTerm || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white/70 backdrop-blur-sm transition-all duration-200"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col xl:flex-row xl:items-center gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500 hidden sm:block" />
                <select
                  value={filters.status || 'all'}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white/70 backdrop-blur-sm min-w-0"
                >
                  <option value="all">All Status</option>
                  {Object.values(BOOKING_STATUSES).map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-gray-500 hidden sm:block" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white/70 backdrop-blur-sm min-w-0"
                >
                  <option value="date">Sort by Date</option>
                  <option value="price">Sort by Price</option>
                  <option value="status">Sort by Status</option>
                  <option value="type">Sort by Type</option>
                </select>
              </div>

              {/* Booking Type Filters */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBookingType('artist')}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedBookingTypes.includes('artist')
                      ? 'bg-purple-100 text-purple-700 border border-purple-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Artists</span>
                </button>
                <button
                  onClick={() => toggleBookingType('equipment')}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedBookingTypes.includes('equipment')
                      ? 'bg-orange-100 text-orange-700 border border-orange-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Equipment</span>
                </button>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Bookings Display */}
      <div className="space-y-6">
        {filteredBookings.length === 0 && !isLoading ? (
          <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-purple-100/50 rounded-2xl blur-3xl" />
              <div className="relative">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No bookings found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {filters.searchTerm || filters.status !== 'all' || selectedBookingTypes.length < 2
                    ? "Try adjusting your filters or search terms to find more bookings."
                    : "You haven't made any bookings yet. Start exploring our artists and equipment!"}
                </p>
                <button
                  onClick={handleNewBooking}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-5 w-5" />
                  Book Your First Event
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6' 
              : 'space-y-4'
            }
          `}>
            {filteredBookings.map((booking, index) => (
              <div key={`${booking.type}-${(booking.data as any)._id}`} className="relative">
                {/* Booking Type Badge */}
                <div className="absolute top-2 left-4 z-20">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shadow-sm border backdrop-blur-sm ${
                    booking.type === 'artist' 
                      ? 'bg-purple-100/95 text-purple-700 border-purple-200'
                      : 'bg-orange-100/95 text-orange-700 border-orange-200'
                  }`}>
                    {booking.type === 'artist' ? (
                      <>
                        <User className="h-3 w-3 mr-1" />
                        Artist
                      </>
                    ) : (
                      <>
                        <Package className="h-3 w-3 mr-1" />
                        Equipment
                      </>
                    )}
                  </span>
                </div>

                {/* Enhanced Booking Card */}
                <div className="pt-6">
                  {booking.type === 'artist' ? (
                    <EnhancedBookingCard
                      booking={booking.data as Booking}
                      onViewDetails={handleViewArtistDetails}
                      onCancel={handleCancelArtistBooking}
                      className="h-full"
                    />
                  ) : (
                    <EnhancedEquipmentPackageBookingCard
                      booking={booking.data as EquipmentPackageBooking}
                      onViewDetails={handleViewEquipmentDetails}
                      onCancel={handleCancelEquipmentBooking}
                      className="h-full"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Modals */}
      {selectedArtistBooking && (
        <EnhancedBookingDetailsModal
          booking={selectedArtistBooking}
          isOpen={isArtistModalOpen}
          onClose={() => {
            setIsArtistModalOpen(false);
            setSelectedArtistBooking(null);
          }}
          onCancel={handleCancelArtistBooking}
        />
      )}

      {selectedEquipmentBooking && (
        <EquipmentPackageBookingDetailsModal
          booking={selectedEquipmentBooking}
          isOpen={isEquipmentModalOpen}
          onClose={() => {
            setIsEquipmentModalOpen(false);
            setSelectedEquipmentBooking(null);
          }}
          onCancel={handleCancelEquipmentBooking}
        />
      )}
    </div>
  );
}