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
  Play,
  Pause,
  X,
  RefreshCw
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

interface EventManagementProps {
  userRole: 'admin' | 'venue_owner';
}

export default function EventManagement({ userRole }: EventManagementProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  // Get token from localStorage or user object
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') || undefined : undefined;
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Filter states
  const [filters, setFilters] = useState<EventFilters>({
    page: 1,
    limit: 10,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedVisibility, setSelectedVisibility] = useState('all');

  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; event: Event | null }>({
    open: false,
    event: null,
  });
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; event: Event | null; reason: string }>({
    open: false,
    event: null,
    reason: '',
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Load events
  useEffect(() => {
    loadEvents();
  }, [filters]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (userRole === 'admin') {
        response = await eventService.getEventsAsAdmin(filters, token);
      } else {
        response = await eventService.getMyEventsAsVenueOwner(filters, token);
      }

      setEvents(response.events);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Failed to load events:', err);
      setError(err.message || 'Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm || undefined,
      status: (selectedStatus === 'all' ? undefined : selectedStatus as 'draft' | 'published' | 'cancelled' | 'completed') || undefined,
      visibility: (selectedVisibility === 'all' ? undefined : selectedVisibility as 'private' | 'public' | 'international' | 'workshop') || undefined,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleCreateEvent = () => {
    router.push(`/dashboard/${userRole}/events/create`);
  };

  const handleEditEvent = (eventId: string) => {
    router.push(`/dashboard/${userRole}/events/${eventId}/edit`);
  };

  const handleViewEvent = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handlePublishEvent = async (event: Event) => {
    try {
      setActionLoading(true);
      setError(null);

      // Pre-publish validations to avoid backend 400s
      if (!event.artists || event.artists.length === 0) {
        setError('Add at least one artist to the event before publishing.');
        return;
      }

      if (!event.seatLayoutId) {
        setError('Assign a seat layout to the event before publishing.');
        return;
      }

      if (userRole === 'admin') {
        await eventService.publishEventAsAdmin(event._id, token);
          } else {
        await eventService.publishEventAsVenueOwner(event._id, token);
      }

      // Refresh events list
      await loadEvents();
    } catch (err: any) {
      console.error('Failed to publish event:', err);
      setError(err.message || 'Failed to publish event. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelEvent = async () => {
    if (!cancelDialog.event) return;

    try {
      setActionLoading(true);
      setError(null);

      if (userRole === 'admin') {
        await eventService.cancelEventAsAdmin(cancelDialog.event._id, cancelDialog.reason, token);
      } else {
        await eventService.cancelEventAsVenueOwner(cancelDialog.event._id, cancelDialog.reason, token);
      }

      setCancelDialog({ open: false, event: null, reason: '' });
      await loadEvents();
    } catch (err: any) {
      console.error('Failed to cancel event:', err);
      setError(err.message || 'Failed to cancel event. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteDialog.event) return;

    try {
      setActionLoading(true);
      setError(null);

      if (userRole === 'admin') {
        await eventService.deleteEventAsAdmin(deleteDialog.event._id, token);
          } else {
        await eventService.deleteEventAsVenueOwner(deleteDialog.event._id, token);
      }

      setDeleteDialog({ open: false, event: null });
      await loadEvents();
    } catch (err: any) {
      console.error('Failed to delete event:', err);
      setError(err.message || 'Failed to delete event. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRebuildOpenBooking = async (eventId: string) => {
    if (!token) {
      setError('Not authenticated');
      return;
    }
    try {
      setActionLoading(true);
      setError(null);
      if (userRole === 'admin') {
        await eventService.rebuildOpenBookingAsAdmin(eventId, token);
      } else {
        await eventService.rebuildOpenBookingAsVenueOwner(eventId, token);
      }
      await loadEvents();
    } catch (err: any) {
      console.error('Failed to rebuild open booking:', err);
      setError(err.message || 'Failed to rebuild open booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: Event['status']) => {
    const colors = {
      draft: 'gray',
      published: 'green',
      cancelled: 'red',
      completed: 'blue',
    };
    return colors[status] || 'gray';
  };

  const getVisibilityColor = (visibility: Event['visibility']) => {
    const colors = {
      private: 'red',
      public: 'green',
      international: 'blue',
      workshop: 'purple',
    };
    return colors[visibility] || 'gray';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && events.length === 0) {
    return (
            <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
                  </div>
          </CardContent>
        </Card>
                  </div>
    );
  }

                      return (
    <div className="space-y-6">
        {/* Header */}
          <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {userRole === 'admin' ? 'Event Management' : 'My Events'}
        </h1>
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
              </div>
              
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              
            <Select value={selectedVisibility} onValueChange={setSelectedVisibility}>
              <SelectTrigger>
                <SelectValue placeholder="Visibility" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">All Visibility</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                </SelectContent>
              </Select>

            <Button onClick={handleSearch} className="w-full">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            </div>
          </CardContent>
        </Card>

      {/* Events Table */}
      <Card>
        <CardContent className="p-0">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">No events found</div>
              <Button onClick={handleCreateEvent} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Event
              </Button>
                  </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Tickets</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{event.name}</div>
                        <div className="text-sm text-gray-600 line-clamp-1">
                          {event.description}
          </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {event.performanceType}
              </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <div>
                          <div>{formatDate(event.startDate)}</div>
                          <div className="text-gray-600">
                            {event.startTime} - {event.endTime}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4" />
                        <div>
                          <div>{event.venue.name}</div>
                          <div className="text-gray-600">
                            {event.venue.city}, {event.venue.state}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`bg-${getStatusColor(event.status)}-50 text-${getStatusColor(event.status)}-700 border-${getStatusColor(event.status)}-200`}
                      >
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`bg-${getVisibilityColor(event.visibility)}-50 text-${getVisibilityColor(event.visibility)}-700 border-${getVisibilityColor(event.visibility)}-200`}
                      >
                        {event.visibility}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4" />
                        <div>
                          <div>{event.soldTickets} / {event.totalCapacity}</div>
                          <div className="text-gray-600">
                            {event.availableTickets} available
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
              </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="end" 
                          className="bg-white border border-gray-200 shadow-lg min-w-[160px] z-[9999]"
                          sideOffset={5}
                          avoidCollisions={true}
                          collisionPadding={10}
                        >
                          <DropdownMenuItem 
                            onClick={() => setDeleteDialog({ open: true, event })}
                            className="text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                            <span className="text-red-600 font-medium">Delete</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewEvent(event._id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditEvent(event._id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {event.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handlePublishEvent(event)}>
                              <Play className="h-4 w-4 mr-2" />
                              Publish
                            </DropdownMenuItem>
                          )}
                          {event.status === 'published' && (
                            <DropdownMenuItem onClick={() => handleRebuildOpenBooking(event._id)}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Rebuild Open Booking
                            </DropdownMenuItem>
                          )}
                          {(event.status === 'published' || event.status === 'draft') && (
                            <DropdownMenuItem 
                              onClick={() => setCancelDialog({ open: true, event, reason: '' })}
                            >
                              <Pause className="h-4 w-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

        {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            >
              Previous
            </Button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={pagination.page === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              );
            })}
            </div>

            <Button
              variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            >
              Next
            </Button>
          </div>
        )}

      {/* Cancel Event Dialog */}
      <Dialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel "{cancelDialog.event?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason for cancellation</label>
              <Textarea
                value={cancelDialog.reason}
                onChange={(e) => setCancelDialog(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Please provide a reason for cancelling this event..."
                rows={3}
              />
      </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCancelDialog({ open: false, event: null, reason: '' })}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelEvent}
              disabled={actionLoading}
            >
              {actionLoading ? 'Cancelling...' : 'Cancel Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Event Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog.event?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialog({ open: false, event: null })}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDeleteEvent}
              disabled={actionLoading}
            >
              {actionLoading ? 'Deleting...' : 'Delete Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}