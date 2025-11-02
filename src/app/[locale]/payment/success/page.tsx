'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  CheckCircle, 
  Package, 
  Calendar, 
  CreditCard, 
  ArrowRight,
  Download,
  Home,
  Plus
} from 'lucide-react';
import { PaymentService } from '@/services/payment.service';
import { EventPaymentService } from '@/services/event-payment.service';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const PaymentSuccessPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // We rely on server-side verification and redirects now
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [eventCreated, setEventCreated] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  const [isEventPayment, setIsEventPayment] = useState(false);

  const bookingId = searchParams.get('bookingId');
  const type = searchParams.get('type');
  const trackId = searchParams.get('trackId') || searchParams.get('track_id');
  const sessionId = searchParams.get('sessionId');
  const invoiceId = searchParams.get('invoiceId');

  useEffect(() => {
    // Just read and display the callback params; verification already happened on backend
    const allParams = PaymentService.getPaymentCallbackParams();
    setPaymentDetails(allParams);

    // Check if this is an event creation payment
    if (bookingId && type && EventPaymentService.isEventPayment(bookingId, type)) {
      setIsEventPayment(true);
      handleEventCreation(bookingId, trackId || '');
    }
  }, [bookingId, type, trackId]);

  const handleEventCreation = async (comboBookingId: string, trackId: string) => {
    setVerifying(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const createdEventId = await EventPaymentService.handlePaymentSuccess(
        trackId,
        comboBookingId,
        token
      );
      setEventId(createdEventId);
      setEventCreated(true);
    } catch (error) {
      console.error('Event creation failed:', error);
      setVerificationError(error instanceof Error ? error.message : 'Event creation failed');
    } finally {
      setVerifying(false);
    }
  };

  const getBookingTypeText = (type: string | null) => {
    if (isEventPayment) {
      return 'Event Creation';
    }
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

  const getDashboardPath = (type: string | null) => {
    if (isEventPayment) {
      return '/dashboard/venue_owner/events';
    }
    switch (type) {
      case 'equipment-package':
      case 'custom-equipment-package':
      case 'equipment':
        return '/dashboard/user/bookings';
      default:
        return '/dashboard/user';
    }
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
            <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-4 w-16 h-16 mx-auto mb-6">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <LoadingSpinner />
            <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
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
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-white/50 to-pink-50/80"></div>
        </div>
        <Navbar />
        <div className="relative z-10 flex items-center justify-center min-h-screen pt-20">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-12 text-center max-w-md">
            <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-6">
              <CreditCard className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment Verification Failed</h2>
            <p className="text-gray-600 mb-6">{verificationError}</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard/user/bookings')}
                className="w-full bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-6 py-3 rounded-2xl hover:from-[#5B2C87] hover:to-[#391C71] transition-all duration-300 shadow-lg font-semibold"
              >
                View My Bookings
              </button>
              <button
                onClick={() => router.push('/packages')}
                className="w-full bg-white/80 backdrop-blur-sm text-[#391C71] px-6 py-3 rounded-2xl hover:bg-white border border-[#391C71]/20 transition-all duration-300 shadow-lg font-semibold"
              >
                Browse Packages
              </button>
            </div>
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
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-12">
        {/* Success Header */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-12 mb-8 relative overflow-hidden text-center">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-100/50 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#391C71]/10 to-transparent rounded-tr-full"></div>
          
          <div className="relative z-10">
            {/* Success Icon */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-6 w-24 h-24 mx-auto mb-8 shadow-2xl">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-xl text-gray-600 mb-6">
              {isEventPayment 
                ? (eventCreated 
                  ? 'Your event has been created successfully and payment processed.'
                  : verifying 
                    ? 'Payment confirmed. Creating your event...'
                    : 'Payment confirmed for event creation.')
                : `Your ${getBookingTypeText(type)} booking has been confirmed and payment processed successfully.`
              }
            </p>
            
            {verificationError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
                <p className="font-medium">Error:</p>
                <p className="text-sm">{verificationError}</p>
              </div>
            )}
            
            {bookingId && (
              <div className="bg-gradient-to-r from-[#391C71]/10 to-purple-100 rounded-2xl p-4 inline-block border border-[#391C71]/20">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {isEventPayment ? 'Payment ID' : 'Booking ID'}
                </p>
                <p className="text-lg font-bold text-[#391C71] font-mono">{bookingId}</p>
              </div>
            )}

            {eventId && (
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-4 inline-block border border-green-200 mt-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Event ID</p>
                <p className="text-lg font-bold text-green-700 font-mono">{eventId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Details */}
        {paymentDetails && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#391C71]/20 to-transparent rounded-br-full"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-3 mr-4">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                Payment Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paymentDetails.total_price && (
                  <div className="bg-gradient-to-r from-[#391C71]/5 to-purple-50 rounded-2xl p-4 border border-[#391C71]/10">
                    <p className="text-sm font-medium text-gray-600 mb-1">Amount Paid</p>
                    <p className="text-xl font-bold text-[#391C71]">
                      {paymentDetails.total_price} {paymentDetails.currency_type || 'KWD'}
                    </p>
                  </div>
                )}
                
                {paymentDetails.payment_method && (
                  <div className="bg-gradient-to-r from-[#391C71]/5 to-purple-50 rounded-2xl p-4 border border-[#391C71]/10">
                    <p className="text-sm font-medium text-gray-600 mb-1">Payment Method</p>
                    <p className="text-lg font-semibold text-gray-900">{paymentDetails.payment_method}</p>
                  </div>
                )}
                
                {paymentDetails.transaction_date && (
                  <div className="bg-gradient-to-r from-[#391C71]/5 to-purple-50 rounded-2xl p-4 border border-[#391C71]/10">
                    <p className="text-sm font-medium text-gray-600 mb-1">Transaction Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(paymentDetails.transaction_date).toLocaleString()}
                    </p>
                  </div>
                )}
                
                {paymentDetails.invoice_id && (
                  <div className="bg-gradient-to-r from-[#391C71]/5 to-purple-50 rounded-2xl p-4 border border-[#391C71]/10">
                    <p className="text-sm font-medium text-gray-600 mb-1">Invoice ID</p>
                    <p className="text-lg font-semibold text-gray-900 font-mono">{paymentDetails.invoice_id}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#391C71]/10 to-transparent rounded-bl-full"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-3 mr-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              What's Next?
            </h3>
            
            <div className="space-y-4 mb-8">
              {isEventPayment ? (
                <>
                  <div className="flex items-start bg-white/50 rounded-xl p-4 border border-white/20">
                    <div className="bg-green-100 rounded-full p-2 mr-4 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Event Created</p>
                      <p className="text-sm text-gray-600">
                        {eventCreated 
                          ? 'Your event has been created successfully and is now live.'
                          : 'Your event is being created after payment confirmation.'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start bg-white/50 rounded-xl p-4 border border-white/20">
                    <div className="bg-blue-100 rounded-full p-2 mr-4 flex-shrink-0">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Artists & Equipment Booked</p>
                      <p className="text-sm text-gray-600">Artists and equipment providers have been notified about your event bookings.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start bg-white/50 rounded-xl p-4 border border-white/20">
                    <div className="bg-purple-100 rounded-full p-2 mr-4 flex-shrink-0">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Event Management</p>
                      <p className="text-sm text-gray-600">You can now manage your event, ticket sales, and bookings from your dashboard.</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start bg-white/50 rounded-xl p-4 border border-white/20">
                    <div className="bg-green-100 rounded-full p-2 mr-4 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Booking Confirmed</p>
                      <p className="text-sm text-gray-600">Your booking is now confirmed and the equipment provider has been notified.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start bg-white/50 rounded-xl p-4 border border-white/20">
                    <div className="bg-blue-100 rounded-full p-2 mr-4 flex-shrink-0">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Equipment Preparation</p>
                      <p className="text-sm text-gray-600">The equipment provider will prepare your items for the scheduled delivery/pickup.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start bg-white/50 rounded-xl p-4 border border-white/20">
                    <div className="bg-purple-100 rounded-full p-2 mr-4 flex-shrink-0">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Receipt & Invoice</p>
                      <p className="text-sm text-gray-600">You'll receive a detailed receipt and invoice via email shortly.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push(getDashboardPath(type))}
                className="flex-1 bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-6 py-4 rounded-2xl hover:from-[#5B2C87] hover:to-[#391C71] hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#391C71] focus:ring-offset-2 transition-all duration-300 shadow-lg font-semibold flex items-center justify-center gap-3"
              >
                {isEventPayment ? (
                  <>
                    <Calendar className="w-5 h-5" />
                    Manage My Events
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5" />
                    View My Bookings
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              
              <button
                onClick={() => router.push(isEventPayment ? '/dashboard/venue_owner/create-event' : '/packages')}
                className="flex-1 bg-white/80 backdrop-blur-sm text-[#391C71] px-6 py-4 rounded-2xl hover:bg-white border border-[#391C71]/20 hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg font-semibold flex items-center justify-center gap-3"
              >
                {isEventPayment ? (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Another Event
                  </>
                ) : (
                  <>
                    <Home className="w-5 h-5" />
                    Browse More Packages
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentSuccessPage;