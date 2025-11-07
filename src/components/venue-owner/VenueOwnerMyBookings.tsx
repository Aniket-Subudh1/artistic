'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MoreHorizontal,
  TrendingUp,
  AlertCircle,
  Ticket,
  Table2,
  Box,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  VenueOwnerBookingService,
  VenueOwnerBooking,
  VenueOwnerBookingsResponse,
} from '@/services/venue-owner-booking.service';
import { useAuth } from '@/hooks/useAuth';
import { eventService } from '@/services/event.service';

export default function VenueOwnerMyBookings() {
  const { user } = useAuth();
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('authToken') || undefined
      : undefined;

  const [bookings, setBookings] = useState<VenueOwnerBooking[]>([]);
  const [stats, setStats] = useState<VenueOwnerBookingsResponse['stats'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myEvents, setMyEvents] = useState<any[]>([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bookingTypeFilter, setBookingTypeFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Detail dialog
  const [selectedBooking, setSelectedBooking] = useState<VenueOwnerBooking | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    loadMyEvents();
    loadStats();
  }, []);

  useEffect(() => {
    loadBookings();
  }, [
    selectedEvent,
    statusFilter,
    bookingTypeFilter,
    paymentStatusFilter,
    pagination.page,
  ]);

  const loadMyEvents = async () => {
    if (!token) return;

    try {
      const response = await eventService.getMyEventsAsVenueOwner(
        { status: 'published', limit: 100 },
        token
      );
      setMyEvents(response.events || []);
    } catch (err: any) {
      console.error('Failed to load events:', err);
    }
  };

  const loadStats = async () => {
    if (!token) return;

    try {
      const statsData = await VenueOwnerBookingService.getBookingStats(token);
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadBookings = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await VenueOwnerBookingService.getVenueOwnerBookings(
        {
          eventId: selectedEvent === 'all' ? undefined : selectedEvent,
          status: statusFilter === 'all' ? undefined : statusFilter,
          bookingType: bookingTypeFilter === 'all' ? undefined : (bookingTypeFilter as any),
          paymentStatus: paymentStatusFilter === 'all' ? undefined : paymentStatusFilter,
          searchTerm: searchTerm.trim() || undefined,
          page: pagination.page,
          limit: pagination.limit,
        },
        token
      );

      setBookings(response.bookings);
      setPagination(response.pagination);
      if (response.stats) {
        setStats(response.stats);
      }
    } catch (err: any) {
      console.error('Failed to load bookings:', err);
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
    loadBookings();
  };

  const handleExportBookings = async () => {
    if (!token) return;

    try {
      const blob = await VenueOwnerBookingService.exportBookings(
        {
          eventId: selectedEvent === 'all' ? undefined : selectedEvent,
          status: statusFilter === 'all' ? undefined : statusFilter,
          startDate: undefined,
          endDate: undefined,
        },
        token
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `venue-bookings-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Failed to export bookings:', err);
      alert('Failed to export bookings. Please try again.');
    }
  };

  const handleViewDetails = async (booking: VenueOwnerBooking) => {
    setSelectedBooking(booking);
    setShowDetailDialog(true);
  };

  const handleUpdateStatus = async (
    bookingId: string,
    status: 'confirmed' | 'cancelled' | 'refunded',
    reason?: string
  ) => {
    if (!token) return;

    try {
      await VenueOwnerBookingService.updateBookingStatus(bookingId, status, reason, token);
      loadBookings();
      loadStats();
      setShowDetailDialog(false);
    } catch (err: any) {
      console.error('Failed to update booking status:', err);
      alert('Failed to update booking status. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      refunded: 'bg-gray-100 text-gray-800 border-gray-300',
      used: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getBookingTypeIcon = (type: string) => {
    switch (type) {
      case 'ticket':
        return <Ticket className="h-4 w-4" />;
      case 'table':
        return <Table2 className="h-4 w-4" />;
      case 'booth':
        return <Box className="h-4 w-4" />;
      default:
        return <Ticket className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Updated default currency from USD to KWD (Kuwaiti Dinar) and locale to en-KW
  const formatCurrency = (amount: number, currency: string = 'KWD') => {
    return new Intl.NumberFormat('en-KW', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">
            Manage all bookings for your events
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportBookings}
            disabled={bookings.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.totalBookings}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.pendingBookings}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.confirmedBookings}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.cancelledBookings}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by booking ref, customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>

            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder="All Events" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Events</SelectItem>
                {myEvents.map((event) => (
                  <SelectItem key={event._id} value={event._id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="used">Used</SelectItem>
              </SelectContent>
            </Select>

            <Select value={bookingTypeFilter} onValueChange={setBookingTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Booking Type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ticket">Tickets</SelectItem>
                <SelectItem value="table">Tables</SelectItem>
                <SelectItem value="booth">Booths</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={paymentStatusFilter}
              onValueChange={setPaymentStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Payment Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
              <Button onClick={loadBookings} className="mt-4">
                Retry
              </Button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No bookings found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking Ref</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Tickets</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking._id}>
                        <TableCell className="font-mono text-sm">
                          {booking.bookingReference}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">
                              {booking.eventId.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(booking.eventId.startDate).toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">
                              {booking.customerInfo.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {booking.customerInfo.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getBookingTypeIcon(booking.bookingType)}
                            <span className="capitalize">{booking.bookingType}</span>
                          </div>
                        </TableCell>
                        <TableCell>{booking.totalTickets}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(
                            booking.paymentInfo.total,
                            booking.paymentInfo.currency
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getPaymentStatusColor(
                              booking.paymentStatus
                            )}
                          >
                            {booking.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(booking.createdAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white">
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(booking)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {booking.status === 'pending' && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(booking._id, 'confirmed')
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Confirm
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(
                                        booking._id,
                                        'cancelled',
                                        'Cancelled by venue owner'
                                      )
                                    }
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} bookings
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination({ ...pagination, page: pagination.page - 1 })
                    }
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination({ ...pagination, page: pagination.page + 1 })
                    }
                    disabled={pagination.page >= pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Booking Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Reference: {selectedBooking?.bookingReference}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              {/* Event Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Event Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="font-medium">{selectedBooking.eventId.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedBooking.eventId.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(
                        selectedBooking.eventId.startDate
                      ).toLocaleDateString()}{' '}
                      - {new Date(selectedBooking.eventId.endDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {selectedBooking.eventId.startTime} -{' '}
                      {selectedBooking.eventId.endTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Customer Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{selectedBooking.customerInfo.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{selectedBooking.customerInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{selectedBooking.customerInfo.phone}</span>
                  </div>
                  {selectedBooking.customerInfo.specialRequests && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700">
                        Special Requests:
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedBooking.customerInfo.specialRequests}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Booking Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  {/* Seats */}
                  {selectedBooking.seats && selectedBooking.seats.length > 0 && (
                    <div>
                      <p className="font-medium text-sm mb-2">
                        Seats ({selectedBooking.seats.length})
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedBooking.seats.map((seat, idx) => (
                          <div
                            key={idx}
                            className="text-sm bg-white p-2 rounded border"
                          >
                            <p>
                              {seat.rowLabel} - {seat.seatNumber}
                            </p>
                            <p className="text-gray-600">{seat.categoryName}</p>
                            <p className="font-medium">
                              {formatCurrency(seat.price)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tables */}
                  {selectedBooking.tables && selectedBooking.tables.length > 0 && (
                    <div>
                      <p className="font-medium text-sm mb-2">
                        Tables ({selectedBooking.tables.length})
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedBooking.tables.map((table, idx) => (
                          <div
                            key={idx}
                            className="text-sm bg-white p-2 rounded border"
                          >
                            <p>{table.tableName}</p>
                            <p className="text-gray-600">
                              {table.seatCount} seats
                            </p>
                            <p className="font-medium">
                              {formatCurrency(table.price)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Booths */}
                  {selectedBooking.booths && selectedBooking.booths.length > 0 && (
                    <div>
                      <p className="font-medium text-sm mb-2">
                        Booths ({selectedBooking.booths.length})
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedBooking.booths.map((booth, idx) => (
                          <div
                            key={idx}
                            className="text-sm bg-white p-2 rounded border"
                          >
                            <p>{booth.boothName}</p>
                            <p className="font-medium">
                              {formatCurrency(booth.price)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Payment Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>
                      {formatCurrency(
                        selectedBooking.paymentInfo.subtotal,
                        selectedBooking.paymentInfo.currency
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Fee:</span>
                    <span>
                      {formatCurrency(
                        selectedBooking.paymentInfo.serviceFee,
                        selectedBooking.paymentInfo.currency
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span>
                      {formatCurrency(
                        selectedBooking.paymentInfo.tax,
                        selectedBooking.paymentInfo.currency
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300 font-semibold">
                    <span>Total:</span>
                    <span>
                      {formatCurrency(
                        selectedBooking.paymentInfo.total,
                        selectedBooking.paymentInfo.currency
                      )}
                    </span>
                  </div>
                  <div className="pt-2">
                    <Badge
                      className={getPaymentStatusColor(
                        selectedBooking.paymentStatus
                      )}
                    >
                      Payment Status: {selectedBooking.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedBooking.status === 'pending' && (
                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailDialog(false)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      if (
                        confirm(
                          'Are you sure you want to cancel this booking?'
                        )
                      ) {
                        handleUpdateStatus(
                          selectedBooking._id,
                          'cancelled',
                          'Cancelled by venue owner'
                        );
                      }
                    }}
                  >
                    Cancel Booking
                  </Button>
                  <Button
                    onClick={() =>
                      handleUpdateStatus(selectedBooking._id, 'confirmed')
                    }
                  >
                    Confirm Booking
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
