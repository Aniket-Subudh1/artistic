'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign,
  Star,
  Music,
  Eye,
  Heart,
  Share2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Event } from '@/services/event.service';

interface EventCardProps {
  event: Event;
  className?: string;
  showFullDetails?: boolean;
}

export default function EventCard({ event, className = '', showFullDetails = false }: EventCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: Event['status']) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getVisibilityColor = (visibility: Event['visibility']) => {
    const colors = {
      private: 'bg-purple-100 text-purple-800',
      public: 'bg-green-100 text-green-800',
      international: 'bg-blue-100 text-blue-800',
      workshop: 'bg-orange-100 text-orange-800',
    };
    return colors[visibility] || 'bg-gray-100 text-gray-800';
  };

  const isBookable = () => {
    if (!event.allowBooking) return false;
    if (event.status !== 'published') return false;
    if (event.visibility === 'private') return false;
    if (event.availableTickets <= 0) return false;
    
    const now = new Date();
    if (event.bookingStartDate && new Date(event.bookingStartDate) > now) return false;
    if (event.bookingEndDate && new Date(event.bookingEndDate) < now) return false;
    
    return true;
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}>
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={event.coverPhoto || '/placeholder-event.jpg'}
          alt={event.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-event.jpg';
          }}
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={getStatusColor(event.status)}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </Badge>
        </div>

        {/* Visibility Badge */}
        <div className="absolute top-3 right-3">
          <Badge className={getVisibilityColor(event.visibility)}>
            {event.visibility.charAt(0).toUpperCase() + event.visibility.slice(1)}
          </Badge>
        </div>

        {/* Action Buttons Overlay */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="outline" className="bg-white/80 hover:bg-white">
            <Heart className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" className="bg-white/80 hover:bg-white">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Price Badge */}
        {event.pricing?.basePrice && (
          <div className="absolute bottom-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
            From ${event.pricing.basePrice}
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Event Title and Description */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {event.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {event.description}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Music className="h-3 w-3" />
            <span>{event.performanceType}</span>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          {/* Date and Time */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{formatDate(event.startDate)}</span>
            {event.startDate !== event.endDate && (
              <>
                <span>-</span>
                <span>{formatDate(event.endDate)}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
          </div>

          {/* Venue */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="truncate">{event.venue.name}, {event.venue.city}</span>
          </div>

          {/* Ticket Availability */}
          {event.allowBooking && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4 text-gray-400" />
              <span>
                {event.availableTickets > 0 
                  ? `${event.availableTickets} tickets available`
                  : 'Sold out'
                }
              </span>
            </div>
          )}
        </div>

        {/* Artists Preview */}
        {event.artists && event.artists.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-700 mb-2">Featured Artists</div>
            <div className="flex items-center gap-2">
              {event.artists.slice(0, 3).map((artist, index) => (
                <div key={index} className="flex items-center gap-1">
                  {artist.artistPhoto && (
                    <img
                      src={artist.artistPhoto}
                      alt={artist.artistName}
                      className="w-6 h-6 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-artist.jpg';
                      }}
                    />
                  )}
                  <span className="text-xs text-gray-600 truncate max-w-20">
                    {artist.artistName}
                  </span>
                </div>
              ))}
              {event.artists.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{event.artists.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{event.viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>{event.likeCount}</span>
            </div>
          </div>
          <div className="text-right">
            {event.soldTickets} / {event.totalCapacity} sold
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href={`/events/${event._id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </Link>
          
          {isBookable() ? (
            <Link href={`/events/${event._id}/book`} className="flex-1">
              <Button size="sm" className="w-full">
                <DollarSign className="h-4 w-4 mr-1" />
                Book Now
              </Button>
            </Link>
          ) : (
            <Button size="sm" disabled className="flex-1">
              {event.availableTickets <= 0 ? 'Sold Out' : 'Not Available'}
            </Button>
          )}
        </div>

        {/* Additional Info for Full Details */}
        {showFullDetails && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-medium text-gray-700">Organizer:</span>
                <div className="text-gray-600">{event.createdBy.name}</div>
              </div>
              {event.contactEmail && (
                <div>
                  <span className="font-medium text-gray-700">Contact:</span>
                  <div className="text-gray-600">{event.contactEmail}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
