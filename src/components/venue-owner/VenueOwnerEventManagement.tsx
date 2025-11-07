'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  MapPin,
  Users, 
  Search, 
  Filter,
  MoreHorizontal,
  X,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { eventService, Event, EventFilters } from '@/services/event.service';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

export default function VenueOwnerEventManagement() {
  const router = useRouter();
  const { user } = useAuth();
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') || undefined : undefined;
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState<EventFilters>({
    page: 1,
    limit: 10,
    search: '',
    status: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  // Delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  // Cancel confirmation
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [eventToCancel, setEventToCancel] = useState<Event | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    loadEvents();
  }, [filters]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await eventService.getMyEventsAsVenueOwner(filters, token);
      
      setEvents(response.events || []);
      setPagination({
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.pages || 0,
      });
    } catch (err: any) {
      console.error('❌ Failed to load events:', err);
      console.error('Error details:', err.response || err.message);
      setError(err.message || 'Failed to load events');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ 
      ...prev, 
      status: status === 'all' ? undefined : status as any,
      page: 1 
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleCreateEvent = () => {
    router.push('/dashboard/venue-owner/events/create');
  };

  const handleEditEvent = (eventId: string) => {
    router.push(`/dashboard/venue-owner/events/${eventId}/edit`);
  };

  const handleViewEvent = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleDeleteEvent = async (event: Event) => {
    try {
      setActionLoading(true);
      await eventService.deleteEventAsVenueOwner(event._id, token);
      setShowDeleteDialog(false);
      setEventToDelete(null);
      loadEvents();
    } catch (err: any) {
      console.error('Failed to delete event:', err);
      setError(err.message || 'Failed to delete event. You can only delete your own events.');
      setShowErrorModal(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelEvent = async () => {
    if (!eventToCancel || !cancelReason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }

    try {
      setActionLoading(true);
      await eventService.cancelEventAsVenueOwner(eventToCancel._id, cancelReason, token);
      setShowCancelDialog(false);
      setEventToCancel(null);
      setCancelReason('');
      loadEvents();
    } catch (err: any) {
      console.error('Failed to cancel event:', err);
      setError(err.message || 'Failed to cancel event');
      setShowErrorModal(true);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      published: { color: 'bg-green-100 text-green-800', label: 'Published' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Completed' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Events</h1>
        <Button onClick={handleCreateEvent}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search events..."
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.status || 'all'}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setFilters({ page: 1, limit: 10, search: '', status: undefined })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Events List</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No events found</p>
              <Button onClick={handleCreateEvent} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Event
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event._id}>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{event.name}</p>
                              {event.createdByRole === 'admin' && (
                                <Badge variant="secondary" className="text-xs">
                                  Admin Event
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {event.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{formatDate(event.startDate)}</p>
                            <p className="text-gray-500">
                              {event.startTime} - {event.endTime}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-1 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">
                              {event.venue?.name || event.venue?.city || 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {event.visibility}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white">
                              <DropdownMenuItem onClick={() => handleViewEvent(event._id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              
                              {/* Only allow edit/delete/cancel for events created by venue owner */}
                              {event.createdByRole === 'venue_owner' && (
                                <>
                                  {event.status === 'draft' && (
                                    <DropdownMenuItem onClick={() => handleEditEvent(event._id)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                  )}

                                  {(event.status === 'draft' || event.status === 'published') && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEventToCancel(event);
                                          setShowCancelDialog(true);
                                        }}
                                        className="text-orange-600"
                                      >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel Event
                                      </DropdownMenuItem>
                                    </>
                                  )}

                                  {event.status === 'draft' && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEventToDelete(event);
                                          setShowDeleteDialog(true);
                                        }}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </>
                                  )}
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
                  Showing {events.length} of {pagination.total} events
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{eventToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setEventToDelete(null);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => eventToDelete && handleDeleteEvent(eventToDelete)}
              disabled={actionLoading}
            >
              {actionLoading ? 'Deleting...' : 'Delete Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Cancel Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel "{eventToCancel?.name}"? Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelDialog(false);
                setEventToCancel(null);
                setCancelReason('');
              }}
              disabled={actionLoading}
            >
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelEvent}
              disabled={actionLoading || !cancelReason.trim()}
            >
              {actionLoading ? 'Cancelling...' : 'Cancel Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Error
            </DialogTitle>
            <DialogDescription>{error}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowErrorModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
