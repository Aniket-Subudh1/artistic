'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  XCircle, 
  Package, 
  RefreshCw, 
  CreditCard, 
  ArrowLeft,
  Home,
  AlertTriangle
} from 'lucide-react';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';
import { PaymentService } from '@/services/payment.service';
import { EventPaymentService } from '@/services/event-payment.service';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const PaymentFailurePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [verifying, setVerifying] = useState<boolean>(true);
  const [verificationMessage, setVerificationMessage] = useState<string>('');

  const type = searchParams.get('type');
  const bookingId = searchParams.get('bookingId');
  const error = searchParams.get('error');
  const errorMessage = searchParams.get('error_message');

  useEffect(() => {
    // Check if this is an event creation payment - redirect to dedicated page
    if (bookingId && EventPaymentService.isEventPayment(bookingId, type || '')) {
      const params = new URLSearchParams(window.location.search);
      router.push(`/payment/event-failure?${params.toString()}`);
      return;
    }

    // Get all payment callback parameters for display and trigger backend verification
    const urlParams = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};
    for (const [key, value] of urlParams.entries()) {
      params[key] = value;
    }
    setPaymentDetails(params);

    // Always call backend verify on failure path (no trackId required when cancelled)
    if (bookingId && type) {
      PaymentService.verifyPayment({ bookingId, type, trackId: '', cancelled: true })
        .then((res) => setVerificationMessage(res.message))
        .catch((err) => {
          console.warn('Verification on failure page returned error:', err?.message || err);
        })
        .finally(() => setVerifying(false));
    } else {
      setVerifying(false);
    }
  }, [bookingId, type, router]);
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
            <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-4 w-16 h-16 mx-auto mb-6">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <LoadingSpinner />
            <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3">Finalizing Payment</h2>
            <p className="text-gray-600">Please wait while we confirm the cancellation status...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getBookingTypeText = (type: string | null) => {
    switch (type) {
      case 'equipment-package':
        return 'Equipment Package';
      case 'custom-equipment-package':
        return 'Custom Equipment Package';
      case 'equipment':
        return 'Equipment Rental';
      default:
        return 'Booking';
    }
  };

  const getRetryPath = (type: string | null, bookingId: string | null) => {
    if (!bookingId) return '/packages';
    
    switch (type) {
      case 'equipment-package':
        return `/book-package/${bookingId}`;
      case 'custom-equipment-package':
        return `/book-custom-package/${bookingId}`;
      default:
        return '/packages';
    }
  };

  const getErrorMessage = () => {
    if (errorMessage) return errorMessage;
    if (error) return `Payment failed: ${error}`;
    return 'Your payment could not be processed at this time.';
  };

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
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-12">
        {/* Failure Header */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-12 mb-8 relative overflow-hidden text-center">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-100/50 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#391C71]/10 to-transparent rounded-tr-full"></div>
          
          <div className="relative z-10">
            {/* Failure Icon */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-full p-6 w-24 h-24 mx-auto mb-8 shadow-2xl">
              <XCircle className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Failed</h1>
            <p className="text-xl text-gray-600 mb-6">
              Your {getBookingTypeText(type)} booking payment could not be processed.
            </p>
            
            <div className="bg-gradient-to-r from-red-50 to-red-100/50 rounded-2xl p-4 inline-block border border-red-200 max-w-md">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{getErrorMessage()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* What Happened */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#391C71]/20 to-transparent rounded-br-full"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-full p-3 mr-4">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              What Happened?
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start bg-white/50 rounded-xl p-4 border border-white/20">
                <div className="bg-red-100 rounded-full p-2 mr-4 flex-shrink-0">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Payment Processing Failed</p>
                  <p className="text-sm text-gray-600">The payment gateway was unable to process your payment. This could be due to insufficient funds, card issues, or technical problems.</p>
                </div>
              </div>
              
              <div className="flex items-start bg-white/50 rounded-xl p-4 border border-white/20">
                <div className="bg-yellow-100 rounded-full p-2 mr-4 flex-shrink-0">
                  <Package className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Booking Status</p>
                  <p className="text-sm text-gray-600">Your booking has been created but is pending payment confirmation. You can retry the payment or contact support.</p>
                </div>
              </div>
              
              {bookingId && (
                <div className="flex items-start bg-white/50 rounded-xl p-4 border border-white/20">
                  <div className="bg-blue-100 rounded-full p-2 mr-4 flex-shrink-0">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Booking Reference</p>
                    <p className="text-sm text-gray-600 mb-2">Keep this reference for support inquiries:</p>
                    <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded border">{bookingId}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Details */}
        {paymentDetails && Object.keys(paymentDetails).length > 0 && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#391C71]/10 to-transparent rounded-bl-full"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-3 mr-4">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                Transaction Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(paymentDetails)
                  .filter(([key]) => !['type', 'bookingId'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="bg-gradient-to-r from-[#391C71]/5 to-purple-50 rounded-2xl p-3 border border-[#391C71]/10">
                      <p className="text-xs font-medium text-gray-600 mb-1 uppercase">
                        {key.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 break-all">
                        {String(value)}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-[#391C71]/20 to-transparent rounded-br-full"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-3 mr-4">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
              What Can You Do?
            </h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start bg-white/50 rounded-xl p-4 border border-white/20">
                <div className="bg-green-100 rounded-full p-2 mr-4 flex-shrink-0">
                  <RefreshCw className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Retry Payment</p>
                  <p className="text-sm text-gray-600">Check your payment method and try again. Make sure you have sufficient funds and your card details are correct.</p>
                </div>
              </div>
              
              <div className="flex items-start bg-white/50 rounded-xl p-4 border border-white/20">
                <div className="bg-blue-100 rounded-full p-2 mr-4 flex-shrink-0">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Try Different Payment Method</p>
                  <p className="text-sm text-gray-600">Use a different credit card or payment method if the issue persists.</p>
                </div>
              </div>
              
              <div className="flex items-start bg-white/50 rounded-xl p-4 border border-white/20">
                <div className="bg-purple-100 rounded-full p-2 mr-4 flex-shrink-0">
                  <Package className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Contact Support</p>
                  <p className="text-sm text-gray-600">If the problem continues, contact our support team with your booking reference.</p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {bookingId && (
                <button
                  onClick={() => router.push(getRetryPath(type, bookingId))}
                  className="flex-1 bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-6 py-4 rounded-2xl hover:from-[#5B2C87] hover:to-[#391C71] hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#391C71] focus:ring-offset-2 transition-all duration-300 shadow-lg font-semibold flex items-center justify-center gap-3"
                >
                  <RefreshCw className="w-5 h-5" />
                  Retry Payment
                </button>
              )}
              
              <button
                onClick={() => router.push('/dashboard/user/bookings')}
                className="flex-1 bg-white/80 backdrop-blur-sm text-[#391C71] px-6 py-4 rounded-2xl hover:bg-white border border-[#391C71]/20 hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg font-semibold flex items-center justify-center gap-3"
              >
                <Package className="w-5 h-5" />
                View My Bookings
              </button>
              
              <button
                onClick={() => router.push('/packages')}
                className="flex-1 bg-white/80 backdrop-blur-sm text-[#391C71] px-6 py-4 rounded-2xl hover:bg-white border border-[#391C71]/20 hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg font-semibold flex items-center justify-center gap-3"
              >
                <Home className="w-5 h-5" />
                Browse Packages
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentFailurePage;