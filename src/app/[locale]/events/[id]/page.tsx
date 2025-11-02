'use client';

import React, { use, useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Tag, 
  Mail, 
  Phone,
  Share2,
  Heart,
  Star,
  ChevronLeft,
  AlertCircle,
  Loader2,
  Ticket,
  Info,
  ArrowRight,
  Eye,
  Download,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { eventService, Event } from '@/services/event.service';
import { 
  EventPrivacyType,
  PRIVACY_TYPE_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  PRIVACY_TYPE_COLORS
} from '@/types/event';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import QRCodeLib from 'qrcode';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';

interface EventDetailsPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default function EventDetailsPage({ params }: EventDetailsPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    fetchEvent();
    generateQRCode();
  }, [resolvedParams.id]);

  const generateQRCode = async () => {
    try {
      const currentUrl = window.location.href;
      const qrCode = await QRCodeLib.toDataURL(currentUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#391C71',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(qrCode);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const eventData = await eventService.getEventById(resolvedParams.id);
      setEvent(eventData);
    } catch (error: any) {
      console.error('Error fetching event:', error);
      setError(error.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeEvent = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleShareEvent = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.name,
          text: event.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeUrl && event) {
      const link = document.createElement('a');
      link.download = `${event.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-event-qr.png`;
      link.href = qrCodeUrl;
      link.click();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date TBA';
      }
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date TBA';
    }
  };

  const formatTime = (timeString: string) => {
    try {
      if (!timeString || typeof timeString !== 'string') {
        return 'Time TBA';
      }
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      if (isNaN(date.getTime())) {
        return 'Time TBA';
      }
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Time TBA';
    }
  };

  const getAvailabilityInfo = () => {
    if (!event) return null;
    
    const availableTickets = event.availableTickets || (event.totalCapacity - event.soldTickets);
    const availabilityPercentage = (availableTickets / event.totalCapacity) * 100;
    
    if (availabilityPercentage === 0) {
      return { status: 'sold-out', label: 'Sold Out', color: 'bg-red-500 text-white', bgColor: 'bg-red-100 border-red-200' };
    } else if (availabilityPercentage < 10) {
      return { status: 'few-left', label: `Only ${availableTickets} left`, color: 'bg-orange-500 text-white', bgColor: 'bg-orange-100 border-orange-200' };
    } else if (availabilityPercentage < 50) {
      return { status: 'filling-fast', label: 'Filling Fast', color: 'bg-yellow-500 text-white', bgColor: 'bg-yellow-100 border-yellow-200' };
    } else {
      return { status: 'available', label: `${availableTickets} available`, color: 'bg-green-500 text-white', bgColor: 'bg-green-100 border-green-200' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <Image
            src="/design.png"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-white/50 to-pink-50/80"></div>
        </div>
        <Navbar />
        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="flex-1 flex justify-center items-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#391C71] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading event details...</p>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <Image
            src="/design.png"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-white/50 to-pink-50/80"></div>
        </div>
        <Navbar />
        <div className="relative z-10 text-center py-20">
          <div className="max-w-md mx-auto bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
            <p className="text-red-500 text-xl mb-4">{error || 'Event not found'}</p>
            <button
              onClick={() => router.back()}
              className="bg-[#391C71] text-white px-6 py-3 rounded-full hover:bg-[#5B2C87] transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const availability = getAvailabilityInfo();
  const canBook = event.status === 'published' && 
                  event.visibility !== 'private' && 
                  event.allowBooking && 
                  event.openBookingLayoutId &&
                  availability?.status !== 'sold-out';

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/design.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-white/50 to-pink-50/80"></div>
      </div>
      
      <Navbar />
      
      {/* Cover Section */}
      <div className="relative z-10 pt-20">
        <div className="h-80 relative overflow-hidden">
          {event.coverPhoto ? (
            <Image
              src={event.coverPhoto}
              alt={event.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#391C71] to-[#5B2C87]" />
          )}
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="absolute top-6 left-6 rtl:left-auto rtl:right-6 bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-colors shadow-lg"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Event Profile Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 w-32 h-32 bg-gradient-to-bl rtl:bg-gradient-to-br from-[#391C71]/10 to-transparent rounded-bl-full rtl:rounded-bl-none rtl:rounded-br-full"></div>
              <div className="absolute bottom-0 left-0 rtl:left-auto rtl:right-0 w-24 h-24 bg-gradient-to-tr rtl:bg-gradient-to-tl from-purple-100/50 to-transparent rounded-tr-full rtl:rounded-tr-none rtl:rounded-tl-full"></div>
              
              <div className="flex flex-col lg:flex-row items-start gap-8 relative z-10">
                
                {/* Event Image */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-3xl overflow-hidden border-4 border-white/50 shadow-xl">
                    <Image
                      src={event.coverPhoto || '/placeholder-event.jpg'}
                      alt={event.name}
                      width={160}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Event Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-[#391C71] text-white px-3 py-1 rounded-full text-sm font-medium">
                      {STATUS_LABELS[event.status]}
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                      {event.performanceType}
                    </Badge>
                   
                  </div>

                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {event.name}
                  </h1>

                  <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Event Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-semibold text-gray-900">{formatDate(event.startDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-semibold text-gray-900">{formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
                      </div>
                    </div>

                    {(event.venue?.name ) && (
                      <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Venue</p>
                          <p className="font-semibold text-gray-900">{event.venue?.name || event.venueOwnerId?.businessName || 'Venue TBA'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4">
                    {canBook && (
                      <Link href={`/events/${event._id}/book`}>
                        <button className="bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
                          <Ticket className="w-5 h-5" />
                          Book Now
                        </button>
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLikeEvent}
                      className="bg-white/50 backdrop-blur-sm border border-white/30 text-gray-700 px-6 py-3 rounded-full font-medium hover:bg-white/70 transition-all duration-300 flex items-center gap-2"
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      {isLiked ? 'Liked' : 'Like'}
                    </button>
                    
                    <button
                      onClick={handleShareEvent}
                      className="bg-white/50 backdrop-blur-sm border border-white/30 text-gray-700 px-6 py-3 rounded-full font-medium hover:bg-white/70 transition-all duration-300 flex items-center gap-2"
                    >
                      <Share2 className="w-5 h-5" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Artists Section */}
            {event.artists.length > 0 && (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#391C71]/10 to-transparent rounded-bl-full"></div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#391C71] rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  Featured Artists
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.artists.map((artist, index) => (
                    <div key={index} className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/30 hover:bg-white/70 transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12 border-2 border-white/50">
                          <AvatarImage src={artist.artistPhoto} alt={artist.artistName} />
                          <AvatarFallback className="bg-[#391C71] text-white text-sm font-bold">
                            {artist.artistName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg">{artist.artistName}</h4>
                          <p className="text-gray-600 text-sm capitalize">{event.performanceType}</p>
                          {/* Hide artist fee on event details page as requested */}
                          {artist.notes ? (
                            <p className="text-gray-700 text-sm mt-2 leading-relaxed">{artist.notes}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event Details */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#391C71]/10 to-transparent rounded-bl-full"></div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-[#391C71] rounded-full flex items-center justify-center">
                  <Info className="w-4 h-4 text-white" />
                </div>
                About This Event
              </h3>
              
              <p className="text-gray-700 text-lg leading-relaxed mb-6">{event.description}</p>
              
              {(event as any).additionalInfo && (
                <div className="bg-blue-50/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-200/50 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Additional Information</h4>
                  <p className="text-blue-800">{(event as any).additionalInfo}</p>
                </div>
              )}

              {event.tags && event.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <Badge key={index} className="bg-[#391C71]/10 text-[#391C71] px-3 py-1 rounded-full text-sm border border-[#391C71]/20">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Venue Information */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#391C71]/10 to-transparent rounded-bl-full"></div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-[#391C71] rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                Venue Information
              </h3>
              
              {(event.venue && (event.venue.name || event.venue.address)) ? (
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                  {event.venueOwnerId?.businessName && (
                    <h4 className="font-semibold text-gray-900 text-xl mb-1">{event.venueOwnerId.businessName}</h4>
                  )}
                  <p className="text-gray-600 mb-3">
                    {event.venue.name}{event.venue.name && event.venue.address ? ', ' : ''}{event.venue.address}
                    {event.venue.city ? `, ${event.venue.city}` : ''}
                    {event.venue.state ? `, ${event.venue.state}` : ''}
                    {event.venue.country ? `, ${event.venue.country}` : ''}
                  </p>
                  <Badge className="bg-[#391C71] text-white px-3 py-1 rounded-full text-sm">
                    {event.venue.venueType || 'Venue'}
                  </Badge>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Venue information not available</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - QR & Share */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 sticky top-24 relative overflow-hidden">
              
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#391C71]/10 to-transparent rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-100/50 to-transparent rounded-tr-full"></div>
              
              <div className="text-center space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Share Event</h3>
                  <p className="text-gray-600 text-sm">Scan QR code to share this event</p>
                </div>

                {/* QR Code */}
                {qrCodeUrl && (
                  <div className="flex justify-center">
                    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
                      <Image
                        src={qrCodeUrl}
                        alt="Event QR Code"
                        width={180}
                        height={180}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleShareEvent}
                    className="w-full bg-[#391C71] text-white py-3 rounded-full font-semibold hover:bg-[#5B2C87] transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Event
                  </button>
                  
                  <button
                    onClick={handleDownloadQR}
                    disabled={!qrCodeUrl}
                    className="w-full bg-white/50 backdrop-blur-sm border border-white/30 text-gray-700 py-3 rounded-full font-medium hover:bg-white/70 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    Download QR
                  </button>
                </div>

                {/* Event Stats */}
                <div className="space-y-3 pt-6 border-t border-white/30">
                  <h4 className="font-semibold text-gray-900">Event Stats</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 text-sm">Views</span>
                      </div>
                      <span className="font-semibold text-gray-900">{event.viewCount}</span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 text-sm">Likes</span>
                      </div>
                      <span className="font-semibold text-gray-900">{event.likeCount}</span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 text-sm">Sold</span>
                      </div>
                      <span className="font-semibold text-gray-900">{event.soldTickets}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                {(event.contactEmail || event.contactPhone) && (
                  <div className="space-y-3 pt-6 border-t border-white/30">
                    <h4 className="font-semibold text-gray-900">Contact</h4>
                    
                    <div className="space-y-2">
                      {event.contactEmail && (
                        <a
                          href={`mailto:${event.contactEmail}`}
                          className="flex items-center gap-3 bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-white/30 hover:bg-white/70 transition-all duration-300"
                        >
                          <Mail className="w-4 h-4 text-blue-500" />
                          <span className="text-blue-600 text-sm font-medium">{event.contactEmail}</span>
                        </a>
                      )}
                      
                      {event.contactPhone && (
                        <a
                          href={`tel:${event.contactPhone}`}
                          className="flex items-center gap-3 bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-white/30 hover:bg-white/70 transition-all duration-300"
                        >
                          <Phone className="w-4 h-4 text-green-500" />
                          <span className="text-green-600 text-sm font-medium">{event.contactPhone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}