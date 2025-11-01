'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Users, Star, Filter, Search, Eye, Heart } from 'lucide-react';
import { eventService, Event, EventFilters } from '@/services/event.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EventListingProps {
  performanceType?: string;
  showFilters?: boolean;
  limit?: number;
  className?: string;
}

export default function EventListing({ 
  performanceType, 
  showFilters = true, 
  limit = 12,
  className = '' 
}: EventListingProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit,
    total: 0,
    pages: 0,
  });

  // Filter states
  const [filters, setFilters] = useState<EventFilters>({
    page: 1,
    limit,
    performanceType,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPerformanceType, setSelectedPerformanceType] = useState(performanceType || '');
  const [cities, setCities] = useState<string[]>([]);
  const [performanceTypes, setPerformanceTypes] = useState<string[]>([]);

  // Load initial data
  useEffect(() => {
    loadEvents();
    if (showFilters) {
      loadFilterOptions();
    }
  }, []);

  // Load events when filters change
  useEffect(() => {
    loadEvents();
  }, [filters]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (performanceType) {
        response = await eventService.getEventsByPerformanceType(performanceType, filters);
      } else {
        response = await eventService.getPublicEvents(filters);
      }

      setEvents(response.events);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Failed to load events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const [citiesResponse, typesResponse] = await Promise.all([
        eventService.getEventCities(),
        eventService.getPerformanceTypes(),
      ]);
      setCities(citiesResponse.cities);
      setPerformanceTypes(typesResponse.performanceTypes);
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm || undefined,
      city: selectedCity || undefined,
      performanceType: selectedPerformanceType || undefined,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const formatEventDate = (event: Event) => {
    return eventService.formatEventDate(event);
  };

  const getEventStatusColor = (status: Event['status']) => {
    return eventService.getEventStatusColor(status);
  };

  if (loading && events.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        {showFilters && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="h-10 bg-gray-200 rounded-xl"></div>
                <div className="h-10 bg-gray-200 rounded-xl"></div>
                <div className="h-10 bg-gray-200 rounded-xl"></div>
                <div className="h-10 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
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
      <div className={`text-center py-12 ${className}`}>
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters */}
      {showFilters && (
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#391C71]/10 to-transparent rounded-bl-full"></div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-[#391C71] rounded-full flex items-center justify-center">
              <Filter className="w-4 h-4 text-white" />
            </div>
            Filter Events
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:bg-white/70 transition-all duration-300"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/70 transition-all duration-300">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {!performanceType && (
              <Select value={selectedPerformanceType} onValueChange={setSelectedPerformanceType}>
                <SelectTrigger className="bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/70 transition-all duration-300">
                  <SelectValue placeholder="Performance Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {performanceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button 
              onClick={handleSearch} 
              className="w-full bg-[#391C71] text-white rounded-xl hover:bg-[#5B2C87] transition-colors flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </div>
      )}

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 max-w-md mx-auto">
            <div className="text-gray-500 mb-4 text-lg font-semibold">No events found</div>
            <p className="text-sm text-gray-400">
              Try adjusting your search criteria or check back later for new events.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                    <Badge 
                      className={`${event.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'} text-white px-3 py-1 rounded-full text-xs font-medium`}
                    >
                      {event.status}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/90 text-gray-700 px-3 py-1 rounded-full text-xs border border-white/50">
                      {eventService.getVisibilityLabel(event.visibility)}
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
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="h-3 w-3 text-purple-600" />
                      </div>
                      <span>
                        {event.availableTickets} / {event.totalCapacity} available
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <Clock className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="capitalize">{event.performanceType}</span>
                    </div>

                    {event.pricing.basePrice > 0 && (
                      <div className="text-lg font-bold text-[#391C71]">
                        From {event.pricing.basePrice} KWD
                      </div>
                    )}
                  </div>

                  {event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {event.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} className="bg-[#391C71]/10 text-[#391C71] px-2 py-1 rounded-full text-xs border border-[#391C71]/20">
                          {tag}
                        </Badge>
                      ))}
                      {event.tags.length > 3 && (
                        <Badge className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          +{event.tags.length - 3}
                        </Badge>
                      )}
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
                        disabled={!eventService.isEventBookable(event)}
                        className={`px-4 py-2 rounded-full transition-colors ${
                          eventService.isEventBookable(event) 
                            ? 'bg-[#391C71] text-white hover:bg-[#5B2C87]' 
                            : 'bg-gray-500 text-white cursor-not-allowed'
                        }`}
                      >
                        {eventService.isEventBookable(event) ? 'Book Now' : 'View Details'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-2 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="bg-white/50 border-white/30 rounded-xl hover:bg-white/70 transition-all duration-300 disabled:opacity-50"
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
                        className={pagination.page === page 
                          ? 'bg-[#391C71] text-white rounded-xl hover:bg-[#5B2C87]'
                          : 'bg-white/50 border-white/30 rounded-xl hover:bg-white/70 transition-all duration-300'
                        }
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
                  className="bg-white/50 border-white/30 rounded-xl hover:bg-white/70 transition-all duration-300 disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {loading && events.length > 0 && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#391C71] mx-auto"></div>
        </div>
      )}
    </div>
  );
}