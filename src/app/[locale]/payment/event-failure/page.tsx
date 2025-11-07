'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Image from 'next/image';
import { 
  XCircle, 
  RefreshCw, 
  Home,
  AlertTriangle,
  CreditCard,
  HelpCircle
} from 'lucide-react';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function EventPaymentFailurePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  
  const [retrying, setRetrying] = useState(false);

  const bookingId = searchParams.get('bookingId');
  const trackId = searchParams.get('trackId') || searchParams.get('track_id');
  const error = searchParams.get('error');
  const cancelled = searchParams.get('cancelled');

  const getErrorMessage = () => {
    if (cancelled === '1' || cancelled === 'true') {
      return 'You cancelled the payment process.';
    }
    if (error) {
      return error;
    }
    return 'The payment could not be processed. Please try again.';
  };

  const resolveLocale = () => {
    const paramLocale: any = (params as any)?.locale;
    if (paramLocale) return Array.isArray(paramLocale) ? paramLocale[0] : paramLocale;
    if (typeof window !== 'undefined') {
      const seg = window.location.pathname.split('/')[1];
      if (seg && seg.length === 2) return seg;
    }
    return 'en';
  };

  const handleRetryPayment = async () => {
    setRetrying(true);
    
    // Check if we have saved form data in localStorage
    const savedEventData = localStorage.getItem('pendingEventData');
    const locale = resolveLocale();
    
    if (savedEventData) {
      // Redirect back to event creation form with saved data
      router.push(`/${locale}/dashboard/venue-owner/events/create?retry=1`);
    } else {
      // No saved data, just go to create page
      router.push(`/${locale}/dashboard/venue-owner/events/create`);
    }
  };

  const handleGoHome = () => {
    const locale = resolveLocale();
    router.push(`/${locale}/dashboard/venue-owner/events`);
  };

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
      <div className="relative z-10 container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto">
          {/* Error Header */}
          <div className="text-center mb-8">
            <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Failed</h1>
            <p className="text-xl text-gray-600">
              {cancelled === '1' ? 'Payment was cancelled' : 'We couldn\'t process your payment'}
            </p>
          </div>

          {/* Error Details */}
          <Card className="bg-white/70 backdrop-blur-xl border-white/30 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                What Happened?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">
                  {getErrorMessage()}
                </AlertDescription>
              </Alert>

              {bookingId && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Transaction Reference</p>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Booking ID:</span>
                      <span className="font-mono text-sm text-gray-900">{bookingId}</span>
                    </div>
                    {trackId && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Track ID:</span>
                        <span className="font-mono text-sm text-gray-900">{trackId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Possible Reasons */}
          <Card className="bg-white/70 backdrop-blur-xl border-white/30 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                Common Reasons for Payment Failure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Insufficient funds in your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Card details entered incorrectly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Payment method not supported or expired</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Bank declined the transaction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Payment cancelled by user</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 mb-6">
            <CardHeader>
              <CardTitle>What Should You Do?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <p className="text-gray-700">Check your payment method and account balance</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <p className="text-gray-700">Try again with the same or different payment method</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <p className="text-gray-700">Contact your bank if the problem persists</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  4
                </div>
                <p className="text-gray-700">Reach out to our support team for assistance</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleRetryPayment}
              disabled={retrying}
              className="bg-gradient-to-r from-[#391C71] to-[#5B2C87] hover:from-[#2D1559] hover:to-[#4A2370] text-white py-6"
            >
              {retrying ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Retry Payment
                </>
              )}
            </Button>
            
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="py-6"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Button>
            
            <Button
              onClick={() => window.location.href = 'mailto:support@artistic.com?subject=Payment Issue&body=Booking ID: ' + bookingId + '%0ATrack ID: ' + trackId}
              variant="outline"
              className="py-6"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Contact Support
            </Button>
          </div>

          {/* Additional Help */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Need immediate help?{' '}
              <a href="mailto:support@artistic.com" className="text-purple-600 hover:text-purple-700 underline">
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
