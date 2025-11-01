'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Users, ArrowRight, Star, Eye, Heart, Ticket } from 'lucide-react';
import { eventService, Event } from '@/services/event.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EventsWidgetProps {
  title?: string;
  performanceType?: string;
  limit?: number;
  showViewAll?: boolean;
  className?: string;
}

export default function EventsWidget({
  title = 'Upcoming Events',
  performanceType,
  limit = 6,
  showViewAll = true,
  className = ''
}: EventsWidgetProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, [performanceType, limit]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (performanceType) {
        response = await eventService.getEventsByPerformanceType(performanceType, { limit });
      } else {
        response = await eventService.getPublicEvents({ limit });
      }

      setEvents(response.events);
    } catch (err) {
      console.error('Failed to load events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (event: Event) => {
    return eventService.formatEventDate(event);
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          {showViewAll && (
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 animate-pulse">
              <div className="h-60 bg-gray-200 rounded-t-3xl"></div>
              <div className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 max-w-md mx-auto">
          <div className="text-red-500 mb-4 text-lg font-semibold">{error}</div>
          <Button 
            onClick={loadEvents} 
            className="bg-[#391C71] text-white px-6 py-3 rounded-full hover:bg-[#5B2C87] transition-colors"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 max-w-md mx-auto">
          <div className="text-gray-500 mb-4 text-lg font-semibold">No events available</div>
          <p className="text-sm text-gray-400">
            Check back later for exciting events!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {showViewAll && (
          <Link href={performanceType ? `/events/performance-type/${performanceType}` : '/events'}>
            <Button className="bg-[#391C71] text-white px-6 py-3 rounded-full hover:bg-[#5B2C87] transition-colors flex items-center gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event._id} className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden hover:bg-white/80 hover:scale-105 transition-all duration-300 group relative">
            
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#391C71]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative">
              <Image
                src={event.coverPhoto || '/placeholder-event.jpg'}
                alt={event.name}
                width={400}
                height={240}
                className="w-full h-60 object-cover"
              />
              <div className="absolute top-3 left-3">
                <Badge className="bg-white/90 text-gray-700 px-3 py-1 rounded-full text-xs border border-white/50">
                  {eventService.getVisibilityLabel(event.visibility)}
                </Badge>
              </div>
              <div className="absolute top-3 right-3">
                {event.pricing.basePrice > 0 && (
                  <Badge className="bg-[#391C71] text-white px-3 py-1 rounded-full text-xs font-medium">
                    From {event.pricing.basePrice} KWD
                  </Badge>
                )}
              </div>
              
              {/* Event status indicator */}
              <div className="absolute bottom-3 left-3">
                <Badge 
                  className={`${
                    event.status === 'published' ? 'bg-green-500' : 
                    event.status === 'draft' ? 'bg-yellow-500' : 'bg-gray-500'
                  } text-white px-3 py-1 rounded-full text-xs font-medium`}
                >
                  {event.status}
                </Badge>
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-[#391C71] transition-colors">
                {event.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {event.description}
              </p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-3 w-3 text-blue-600" />
                  </div>
                  <span>{formatEventDate(event)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-red-600" />
                  </div>
                  <span className="line-clamp-1">
                    {event.venue.name}, {event.venue.city}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="capitalize">{event.performanceType}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-3 w-3 text-purple-600" />
                  </div>
                  <span>
                    {event.availableTickets} / {event.totalCapacity} available
                  </span>
                </div>
              </div>

              {/* Progress bar for ticket availability */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-[#391C71] to-[#5B2C87] h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((event.totalCapacity - event.availableTickets) / event.totalCapacity) * 100}%` 
                  }}
                ></div>
              </div>

              {/* Tags */}
              {event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {event.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} className="bg-[#391C71]/10 text-[#391C71] px-2 py-1 rounded-full text-xs border border-[#391C71]/20">
                      {tag}
                    </Badge>
                  ))}
                  {event.tags.length > 2 && (
                    <Badge className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      +{event.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}

              {/* Artists preview */}
              {event.artists.length > 0 && (
                <div className="text-xs text-gray-500 mb-4 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
                  <span className="font-medium text-gray-700">Artists: </span>
                  {event.artists.slice(0, 2).map(artist => artist.artistName).join(', ')}
                  {event.artists.length > 2 && ` +${event.artists.length - 2} more`}
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-white/30">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{event.viewCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{event.likeCount || 0}</span>
                  </div>
                </div>
                
                <Link href={`/events/${event._id}`}>
                  <Button 
                    size="sm"
                    className="px-4 py-2 rounded-full transition-colors flex items-center gap-2 bg-[#391C71] text-white hover:bg-[#5B2C87]"
                  >
                    {eventService.isEventBookable(event) ? (
                      <>
                        <Ticket className="h-3 w-3" />
                        Book Now
                      </>
                    ) : (
                      'View Details'
                    )}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}