'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Image from 'next/image';
import { 
  CheckCircle, 
  Calendar, 
  CreditCard, 
  ArrowRight,
  Home,
  Loader2,
  MapPin,
  Users,
  Music
} from 'lucide-react';
import { EventPaymentService } from '@/services/event-payment.service';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function EventPaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  
  const [verifying, setVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState('');
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventData, setEventData] = useState<any>(null);
  const hasProcessedRef = useRef(false); 

  const bookingId = searchParams.get('bookingId');
  const trackId = searchParams.get('trackId') || searchParams.get('track_id');
  const sessionId = searchParams.get('sessionId');
  const invoiceId = searchParams.get('invoiceId');

  useEffect(() => {
    if (!hasProcessedRef.current) {
      hasProcessedRef.current = true;
      handleEventCreation();
    }
  }, [bookingId, trackId]);

  const resolveLocale = () => {
    // Prefer dynamic route param, fallback to first pathname segment, then 'en'
    const paramLocale: any = (params as any)?.locale;
    if (paramLocale) {
      return Array.isArray(paramLocale) ? paramLocale[0] : paramLocale;
    }
    if (typeof window !== 'undefined') {
      const seg = window.location.pathname.split('/')[1];
      if (seg && seg.length === 2) return seg; // basic locale heuristic
    }
    return 'en';
  };

  const handleEventCreation = async () => {
    if (!bookingId || !trackId) {
      setVerificationError('Missing payment information');
      setVerifying(false);
      return;
    }

    setVerifying(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const createdEventId = await EventPaymentService.handlePaymentSuccess(trackId, bookingId, token);
      setEventId(createdEventId);
      const locale = resolveLocale();
      setTimeout(() => {
        router.replace(`/${locale}/dashboard/venue-owner/events`);
      }, 600);
      
    } catch (error) {
      console.error('Event creation failed:', error);
      setVerificationError(error instanceof Error ? error.message : 'Event creation failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleRetry = () => {
    const locale = resolveLocale();
    router.push(`/${locale}/dashboard/venue-owner/events/create`);
  };

  const handleViewEvent = () => {
    const locale = resolveLocale();
    router.push(`/${locale}/dashboard/venue-owner/events`);
  };

  if (verifying) {
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
        <div className="relative z-10 flex items-center justify-center min-h-screen pt-20">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-12 text-center max-w-md">
            <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3">Creating Your Event</h2>
            <p className="text-gray-600">Please wait while we verify your payment and create your event...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (verificationError) {
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
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/80 via-white/50 to-orange-50/80"></div>
        </div>
        <Navbar />
        <div className="relative z-10 flex items-center justify-center min-h-screen pt-20 px-4">
          <Card className="max-w-2xl w-full bg-white/70 backdrop-blur-xl border-white/30">
            <CardHeader className="text-center pb-4">
              <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Event Creation Failed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{verificationError}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">What happened?</h3>
                <p className="text-gray-600 text-sm">
                  Your payment was processed, but we encountered an issue creating your event. 
                  Don't worry - your payment is safe and we'll help you resolve this.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Transaction Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  {trackId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Track ID:</span>
                      <span className="font-mono text-gray-900">{trackId}</span>
                    </div>
                  )}
                  {bookingId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="font-mono text-gray-900">{bookingId}</span>
                    </div>
                  )}
                  {sessionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Session ID:</span>
                      <span className="font-mono text-gray-900 text-xs">{sessionId}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Next Steps</h3>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                  <li>Please contact support with the transaction details above</li>
                  <li>Our team will create your event manually</li>
                  <li>You'll receive a confirmation email within 24 hours</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleViewEvent}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => window.location.href = 'mailto:support@artistic.com?subject=Event Creation Issue&body=Track ID: ' + trackId}
                  className="flex-1 bg-gradient-to-r from-[#391C71] to-[#5B2C87] hover:from-[#2D1559] hover:to-[#4A2370]"
                >
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Success state
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
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-white/50 to-emerald-50/80"></div>
      </div>
      <Navbar />
      <div className="relative z-10 container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Event Created Successfully! 🎉</h1>
            <p className="text-xl text-gray-600">
              Your payment has been processed and your event is now live.
            </p>
          </div>

          {/* Event Details Card (eventId intentionally not shown after auto-redirect policy) */}
          <Card className="bg-white/70 backdrop-blur-xl border-white/30 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-mono text-sm text-gray-900">Event Created</p>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Active
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment Confirmed</p>
                    <p className="text-xs text-gray-600">Transaction processed successfully</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Music className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Artists & Equipment</p>
                    <p className="text-xs text-gray-600">Booked and confirmed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Details */}
          <Card className="bg-white/70 backdrop-blur-xl border-white/30 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trackId && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Track ID</span>
                    <span className="font-mono text-sm text-gray-900">{trackId}</span>
                  </div>
                )}
                {sessionId && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Session ID</span>
                    <span className="font-mono text-xs text-gray-900">{sessionId}</span>
                  </div>
                )}
                {invoiceId && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Invoice ID</span>
                    <span className="font-mono text-sm text-gray-900">{invoiceId}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <p className="text-gray-700">View and manage your event details</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <p className="text-gray-700">Monitor ticket sales and bookings</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <p className="text-gray-700">Communicate with booked artists and equipment providers</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <Button
              onClick={handleViewEvent}
              className="flex-1 bg-gradient-to-r from-[#391C71] to-[#5B2C87] hover:from-[#2D1559] hover:to-[#4A2370] text-white py-6 text-lg"
            >
              Go To Events
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={() => {
                const locale = resolveLocale();
                router.push(`/${locale}/dashboard/venue-owner/events`);
              }}
              variant="outline"
              className="px-8 py-6"
            >
              Create Another Event
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
