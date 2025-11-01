'use client';

import React, { use, useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  Loader2,
  AlertCircle,
  CheckCircle,
  Ticket,
  CreditCard,
  User,
  Mail,
  Phone,
  Lock,
  Star,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { eventService, Event } from '@/services/event.service';
import SeatBookingInterface from '@/components/public/SeatBookingInterface';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';

interface BookingPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default function BookingPage({ params }: BookingPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<'seats' | 'details' | 'payment' | 'confirmation'>('seats');
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  useEffect(() => {
    fetchEvent();
  }, [resolvedParams.id]);

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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date TBA';
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Date TBA';
    }
  };

  const formatTime = (timeString: string) => {
    try {
      if (!timeString || typeof timeString !== 'string') return 'Time TBA';
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      if (isNaN(date.getTime())) return 'Time TBA';
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Time TBA';
    }
  };

  const handleCustomerInfoSubmit = () => {
    if (!customerInfo.fullName || !customerInfo.email || !customerInfo.phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    setBookingStep('payment');
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
            <div className="text-center bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#391C71] mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading event details...</p>
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
            <div className="text-red-500 mb-4">
              <AlertCircle className="w-16 h-16 mx-auto mb-4" />
              <p className="text-xl font-semibold">{error || 'This event is not available for booking.'}</p>
            </div>
            <Link href={`/events/${resolvedParams.id}`}>
              <Button className="bg-[#391C71] text-white px-6 py-3 rounded-full hover:bg-[#5B2C87] transition-colors flex items-center gap-2 mx-auto">
                <ChevronLeft className="h-4 w-4" />
                Back to Event
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const canBook = event.status === 'published' && 
                  event.visibility !== 'private' && 
                  event.allowBooking && 
                  event.openBookingLayoutId;

  if (!canBook) {
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
            <div className="text-orange-500 mb-4">
              <AlertCircle className="w-16 h-16 mx-auto mb-4" />
              <p className="text-xl font-semibold mb-2">Booking Not Available</p>
              <p className="text-gray-600 text-sm mb-4">
                This event is currently not available for booking. It may be a private event, not yet published, or booking may be disabled.
              </p>
            </div>
            <Link href={`/events/${resolvedParams.id}`}>
              <Button className="bg-[#391C71] text-white px-8 py-3 rounded-full hover:bg-[#5B2C87] transition-colors flex items-center gap-2 mx-auto">
                <ChevronLeft className="h-4 w-4" />
                Back to Event
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
      
      {bookingStep === 'seats' ? (
        // Redesigned: Left seat map with right sidebar (no 16:9 cropping)
        <div className="relative z-10 pt-24 pb-12">
          <div className="max-w-[1500px] mx-auto px-6">
            <div className="mb-4 flex items-center justify-between">
              <Link href={`/events/${event._id}`}>
                <Button variant="ghost" className="text-gray-700 hover:bg-white/50 flex items-center gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back to Event
                </Button>
              </Link>
              <div className="text-sm text-gray-600">Selected: {selectedSeats.length}</div>
            </div>

            {/* Seat booking interface handles the 2-column layout and sidebar */}
            <SeatBookingInterface 
              event={event} 
              layoutId={event.openBookingLayoutId!}
              onSeatsSelected={setSelectedSeats}
              onBookingComplete={() => setBookingStep('details')}
              fullScreen={false}
            />
          </div>
        </div>
      ) : (
        // Details and other steps with proper layout
        <div className="relative z-10 pt-20">
          {/* Header */}
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 mb-6">
              <div className="flex items-center justify-between">
                <Button 
                  onClick={() => setBookingStep('seats')}
                  variant="ghost" 
                  className="text-gray-700 hover:bg-white/50 transition-all duration-300 flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Seat Selection
                </Button>
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(event.startDate)} • {formatTime(event.startTime)}
                  </p>
                </div>
                <div className="w-32"></div> {/* Spacer for center alignment */}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-6 pb-20">
            {bookingStep === 'details' && (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
                <div className="bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white p-8">
                  <h2 className="text-3xl font-bold text-center">Booking Details</h2>
                  <p className="text-center text-white/90 text-lg mt-2">Please provide your information to complete the booking</p>
                </div>
                
                <div className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Customer Information Form */}
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#391C71] rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        Your Information
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700 mb-2 block">
                            Full Name *
                          </Label>
                          <Input
                            id="fullName"
                            value={customerInfo.fullName}
                            onChange={(e) => setCustomerInfo({...customerInfo, fullName: e.target.value})}
                            placeholder="Enter your full name"
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-[#391C71] transition-colors bg-white/70 backdrop-blur-sm"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">
                            Email Address *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={customerInfo.email}
                            onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                            placeholder="Enter your email address"
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-[#391C71] transition-colors bg-white/70 backdrop-blur-sm"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 mb-2 block">
                            Phone Number *
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                            placeholder="Enter your phone number"
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-[#391C71] transition-colors bg-white/70 backdrop-blur-sm"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="specialRequests" className="text-sm font-semibold text-gray-700 mb-2 block">
                            Special Requests (Optional)
                          </Label>
                          <textarea
                            id="specialRequests"
                            value={customerInfo.specialRequests}
                            onChange={(e) => setCustomerInfo({...customerInfo, specialRequests: e.target.value})}
                            placeholder="Any special requests or accommodations needed..."
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-[#391C71] transition-colors bg-white/70 backdrop-blur-sm min-h-[100px] resize-none"
                            rows={4}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Booking Summary */}
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#391C71] rounded-full flex items-center justify-center">
                          <Ticket className="h-4 w-4 text-white" />
                        </div>
                        Booking Summary
                      </h3>
                      
                      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                        <div className="space-y-4">
                          <div className="border-b border-gray-200 pb-4">
                            <h4 className="font-semibold text-gray-900 text-lg">{event.name}</h4>
                            <div className="text-sm text-gray-600 mt-2 space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(event.startDate)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{formatTime(event.startTime)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{event.venue.name}, {event.venue.city}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h5 className="font-medium text-gray-900">Selected Seats ({selectedSeats.length})</h5>
                            {selectedSeats.map((seat, index) => (
                              <div key={index} className="flex justify-between text-sm bg-gray-50 rounded-lg p-2">
                                <span>Seat {seat.id || index + 1}</span>
                                <span className="font-medium">{seat.price || 0} KWD</span>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-gray-200 pt-4">
                            <div className="flex justify-between text-lg font-bold text-gray-900">
                              <span>Total</span>
                              <span>{selectedSeats.reduce((total, seat) => total + (seat.price || 0), 0)} KWD</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleCustomerInfoSubmit}
                        className="w-full bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-[#5B2C87] hover:to-[#391C71] transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                      >
                        Proceed to Payment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}