'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Filter, Calendar, 
  RefreshCw, Plus, AlertCircle, CheckCircle 
} from 'lucide-react';
import { EquipmentPackageBooking } from '@/types/booking';
import { 
  equipmentPackageBookingService,
  BookingListResponse 
} from '@/services/equipment-package-booking.service';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EquipmentPackageBookingCard } from './EquipmentPackageBookingCard';
import { EquipmentPackageBookingDetailsModal } from './EquipmentPackageBookingDetailsModal';

interface UserEquipmentPackageBookingsDashboardProps {
  userType?: 'customer' | 'provider';
}

const statusFilters = [
  { value: 'all', label: 'All Bookings', count: 0 },
  { value: 'pending', label: 'Pending', count: 0 },
  { value: 'confirmed', label: 'Confirmed', count: 0 },
  { value: 'completed', label: 'Completed', count: 0 },
  { value: 'cancelled', label: 'Cancelled', count: 0 },
];

export const UserEquipmentPackageBookingsDashboard: React.FC<UserEquipmentPackageBookingsDashboardProps> = ({
  userType = 'customer'
}) => {
  const [bookings, setBookings] = useState<EquipmentPackageBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;
  
  // Modal
  const [selectedBooking, setSelectedBooking] = useState<EquipmentPackageBooking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Status counts for filters
  const [statusCounts, setStatusCounts] = useState(statusFilters);

  useEffect(() => {
    fetchBookings();
  }, [currentPage, selectedStatus]);

  const fetchBookings = async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    }

    try {
      let response: BookingListResponse;
      
      if (userType === 'provider') {
        response = await equipmentPackageBookingService.getProviderBookings(
          selectedStatus === 'all' ? undefined : selectedStatus,
          currentPage,
          limit
        );
      } else {
        response = await equipmentPackageBookingService.getMyBookings(
          selectedStatus === 'all' ? undefined : selectedStatus,
          currentPage,
          limit
        );
      }

      setBookings(response.bookings);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
      
      // Update status counts if fetching all bookings
      if (selectedStatus === 'all') {
        updateStatusCounts(response.bookings);
      }
      
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateStatusCounts = (allBookings: EquipmentPackageBooking[]) => {
    const counts = allBookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setStatusCounts(prev =>
      prev.map(filter => ({
        ...filter,
        count: filter.value === 'all' ? allBookings.length : (counts[filter.value] || 0)
      }))
    );
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      await equipmentPackageBookingService.updateBookingStatus(bookingId, { 
        status: newStatus as any 
      });
      setSuccess('Booking status updated successfully');
      fetchBookings(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update booking status');
    }
  };

  const handleCancelBooking = async (bookingId: string, reason: string) => {
    try {
      await equipmentPackageBookingService.updateBookingStatus(bookingId, {
        status: 'cancelled',
        cancellationReason: reason
      });
      setSuccess('Booking cancelled successfully');
      fetchBookings(true);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking');
    }
  };

  const handleViewDetails = (booking: EquipmentPackageBooking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchBookings(true);
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = !searchTerm || 
      booking.packageId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking._id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || 
      booking.startDate.includes(dateFilter) || 
      booking.endDate.includes(dateFilter);
    
    return matchesSearch && matchesDate;
  });

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {userType === 'provider' ? 'Package Bookings' : 'My Package Bookings'}
          </h2>
          <p className="text-gray-600 mt-1">
            {userType === 'provider' 
              ? 'Manage bookings for your equipment packages'
              : 'Track your equipment package bookings'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {statusCounts.map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                setSelectedStatus(filter.value);
                setCurrentPage(1);
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                selectedStatus === filter.value
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {filter.label}
              {filter.count > 0 && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  selectedStatus === filter.value
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {filter.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by package name or booking ID..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-600">
            Showing {filteredBookings.length} of {totalItems} bookings
          </span>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
          <button
            onClick={() => setError('')}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-green-700">{success}</span>
          <button
            onClick={() => setSuccess('')}
            className="ml-auto text-green-500 hover:text-green-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {bookings.length === 0 ? 'No bookings found' : 'No matching bookings'}
          </h3>
          <p className="text-gray-600 mb-4">
            {bookings.length === 0 
              ? `You don't have any equipment package bookings yet.`
              : 'Try adjusting your search criteria to find specific bookings.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <EquipmentPackageBookingCard
              key={booking._id}
              booking={booking}
              onViewDetails={handleViewDetails}
              onCancel={userType === 'customer' ? (bookingId: string) => {
                // For customer cancellation, we'll handle this through the details modal
                const booking = bookings.find(b => b._id === bookingId);
                if (booking) {
                  setSelectedBooking(booking);
                  setShowDetailsModal(true);
                }
              } : undefined}
              showProviderView={userType === 'provider'}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <EquipmentPackageBookingDetailsModal
        booking={selectedBooking}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedBooking(null);
        }}
        onCancel={userType === 'customer' ? handleCancelBooking : undefined}
        onStatusUpdate={userType === 'provider' ? handleStatusUpdate : undefined}
        showProviderActions={userType === 'provider'}
      />
    </div>
  );
};

export default UserEquipmentPackageBookingsDashboard;