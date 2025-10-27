'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRouter as useI18nRouter } from '@/i18n/routing';
import Image from 'next/image';
import { 
  Calendar, Clock, MapPin, User, Phone, Mail, 
  Package, CreditCard, ArrowLeft, AlertCircle, CheckCircle,
  DollarSign, Users, Lock, Tag
} from 'lucide-react';
import { 
  customEquipmentPackagesService, 
  CustomEquipmentPackage 
} from '@/services/custom-equipment-packages.service';
import { BookingService } from '@/services/booking.service';
import { PaymentService, PaymentInitiateRequest } from '@/services/payment.service';
import { CountryCodeDropdown, Country, getDefaultCountry, formatPhoneNumber } from '@/components/ui/CountryCodeDropdown';

// Equipment-only booking interface (for custom packages)
interface EquipmentBookingRequest {
  equipments?: Array<{ equipmentId: string; quantity: number }>;
  packages?: string[];
  // Backend expects this name for custom user packages
  userEquipmentPackages?: string[];
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  address?: string;
  isMultiDay?: boolean;
  equipmentDates?: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
}

// Equipment booking service
class EquipmentBookingService {
  static async createEquipmentBooking(data: EquipmentBookingRequest): Promise<{ _id: string; [key: string]: any }> {
    return apiRequest('/bookings/equipment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Import apiRequest
import { apiRequest } from '@/lib/api-config';
import { TermsAndConditionsService, TermsAndConditions, TermsType } from '@/services/terms-and-conditions.service';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TermsAndConditionsModal } from '@/components/booking/TermsAndConditionsModal';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';

interface FormData {
  eventDate: string;
  isMultiDay: boolean;
  eventDates: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
  userDetails: {
    name: string;
    email: string;
    phone: string;
  };
  venueDetails: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    venueType?: string;
    additionalInfo?: string;
  };
  eventDescription?: string;
  specialRequests?: string;
}

const BookCustomPackagePage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const i18nRouter = useI18nRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthLogic();
  
  const [packageData, setPackageData] = useState<CustomEquipmentPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    eventDate: '',
    isMultiDay: false,
    eventDates: [],
    userDetails: {
      name: user?.firstName + ' ' + user?.lastName || '',
      email: user?.email || '',
      phone: '',
    },
    venueDetails: {
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      venueType: '',
      additionalInfo: '',
    },
    eventDescription: '',
    specialRequests: '',
  });

  const [availability, setAvailability] = useState<{
    available: boolean;
    conflicts: string[];
  }>({ available: true, conflicts: [] });
  
  const [termsData, setTermsData] = useState<TermsAndConditions | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Country code state
  const [selectedCountry, setSelectedCountry] = useState<Country>(getDefaultCountry());

  useEffect(() => {
    const fetchPackageData = async () => {
      if (!id || typeof id !== 'string') {
        setError('Invalid package ID');
        setLoading(false);
        return;
      }

      try {
        const data = await customEquipmentPackagesService.getCustomPackageById(id);
        setPackageData(data);
      } catch (error: any) {
        console.error('Error fetching package:', error);
        setError('Package not found or you don\'t have permission to book it');
      } finally {
        setLoading(false);
      }
    };

    fetchPackageData();
  }, [id]);

  // Load terms and conditions
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const terms = await TermsAndConditionsService.getEquipmentBookingTerms();
        setTermsData(terms);
      } catch (error) {
        console.error('Error fetching terms:', error);
      }
    };
    
    fetchTerms();
  }, []);

  // Update user details when user loads
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        userDetails: {
          ...prev.userDetails,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        }
      }));
    }
  }, [user]);

  // Require authentication to access booking page
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
      i18nRouter.push(`/auth/signin?returnUrl=${encodeURIComponent(currentPath)}`);
      return;
    }
  }, [authLoading, isAuthenticated, i18nRouter]);

  const calculateDays = () => {
    if (formData.isMultiDay) {
      return formData.eventDates.length || 0;
    }
    return formData.eventDate ? 1 : 0;
  };

  const calculateTotalPrice = () => {
    if (!packageData) return 0;
    const days = calculateDays();
    return packageData.totalPricePerDay * days;
  };

  // Add a new date to multi-day booking
  const addEventDate = () => {
    setFormData(prev => ({
      ...prev,
      eventDates: [
        ...prev.eventDates,
        { date: '', startTime: '09:00', endTime: '17:00' }
      ]
    }));
  };

  // Remove a date from multi-day booking
  const removeEventDate = (index: number) => {
    setFormData(prev => ({
      ...prev,
      eventDates: prev.eventDates.filter((_, i) => i !== index)
    }));
  };

  // Update a specific event date
  const updateEventDate = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      eventDates: prev.eventDates.map((date, i) => 
        i === index ? { ...date, [field]: value } : date
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
      i18nRouter.push(`/auth/signin?returnUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (!packageData) return;

    // Validate required fields
    if (formData.isMultiDay) {
      if (formData.eventDates.length === 0) {
        setError('Please add at least one event date for multi-day booking');
        return;
      }
      const invalidDate = formData.eventDates.find(date => !date.date || !date.startTime || !date.endTime);
      if (invalidDate) {
        setError('Please fill in all dates and times for multi-day booking');
        return;
      }
    } else {
      if (!formData.eventDate) {
        setError('Please select an event date');
        return;
      }
    }

    if (!formData.userDetails.phone || !formData.venueDetails.address) {
      setError('Please fill in all required contact and venue information');
      return;
    }

    // Check if terms need to be accepted
    if (termsData && !termsAccepted) {
      setShowTermsModal(true);
      return;
    }

    // If terms have been accepted, proceed with booking
    await processBooking();
  };

  const processBooking = async () => {
    if (!packageData) return;
    
    setSubmitting(true);
    setError('');

    try {
      console.log('Starting booking process...');
      
      // Format phone number with country code
      const formattedPhone = formatPhoneNumber(selectedCountry.code, formData.userDetails.phone);
      
      const bookingData: EquipmentBookingRequest = {
        // Use backend-expected field name for custom packages
        userEquipmentPackages: [packageData._id],
        equipments: [], // No individual equipment items
        packages: [], // No regular packages
        date: formData.isMultiDay ? formData.eventDates[0]?.date || '' : formData.eventDate,
        startTime: formData.isMultiDay ? formData.eventDates[0]?.startTime || '09:00' : '09:00',
        endTime: formData.isMultiDay ? formData.eventDates[0]?.endTime || '18:00' : '18:00',
        totalPrice: calculateTotalPrice(),
        address: `${formData.venueDetails.address}, ${formData.venueDetails.city}, ${formData.venueDetails.state}, ${formData.venueDetails.country}`,
        isMultiDay: formData.isMultiDay,
        equipmentDates: formData.isMultiDay ? formData.eventDates : undefined,
      };

      console.log('Creating booking with data:', JSON.stringify(bookingData, null, 2));

      // First create the booking
      const response = await EquipmentBookingService.createEquipmentBooking(bookingData);

      console.log('Booking created:', response);

      // Extract bookingId robustly from different possible response shapes
      const bookingId =
        (response && (response as any)._id) ||
        (response as any)?.id ||
        (response as any)?.bookingId ||
        (response as any)?.booking?._id ||
        (response as any)?.data?._id ||
        (response as any)?.data?.booking?._id;

      if (!bookingId) {
        console.error('Unable to determine bookingId from response:', response);
        throw new Error('Unable to create booking: missing booking ID');
      }

      // Prefer server-provided payment link (backend initiates payment)
      const paymentLink = (response as any)?.paymentLink;
      if (paymentLink) {
        console.log('Redirecting to payment gateway (server-provided link):', paymentLink);
        PaymentService.redirectToPayment(paymentLink);
        return;
      }

      // Fallback: initiate payment from client if link not provided
      const paymentData: PaymentInitiateRequest = {
        bookingId,
        amount: calculateTotalPrice(),
        // Backend treats custom package equipment booking as 'equipment'
        type: 'equipment',
        description: `Custom Equipment Package: ${packageData.name}`,
        customerMobile: formattedPhone,
      };

      console.log('No paymentLink in response. Initiating payment from client with:', paymentData);
      const paymentResponse = await PaymentService.initiatePayment(paymentData);
      if (!paymentResponse?.paymentLink) {
        throw new Error('Payment link not received from server');
      }
      PaymentService.redirectToPayment(paymentResponse.paymentLink);
      
    } catch (err: any) {
      console.error('Error in booking process:', err);
      setError(err.message || 'Failed to process booking and payment');
      setSubmitting(false);
    }
  };

  const handleTermsAccept = () => {
    setTermsAccepted(true);
    setShowTermsModal(false);
    // Proceed with booking after accepting terms
    processBooking();
  };

  const handleTermsDecline = () => {
    setShowTermsModal(false);
    setTermsAccepted(false);
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
        <div className="relative z-10 flex items-center justify-center min-h-screen pt-20">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8">
            <LoadingSpinner />
            <p className="text-gray-700 mt-4 text-center font-medium">Loading package details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !packageData) {
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
        <div className="relative z-10 text-center py-20 pt-32">
          <div className="max-w-md mx-auto bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Package Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/dashboard/user/custom-packages')}
              className="bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-6 py-3 rounded-2xl hover:from-[#5B2C87] hover:to-[#391C71] transition-all duration-300 shadow-lg font-semibold"
            >
              Back to Custom Packages
            </button>
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
      
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 mb-8 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#391C71]/10 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100/50 to-transparent rounded-tr-full"></div>
          
          <div className="relative z-10">
            <button
              onClick={() => router.back()}
              className="flex items-center bg-white/90 backdrop-blur-sm text-[#391C71] hover:text-[#5B2C87] mb-6 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Custom Packages
            </button>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-2xl p-3">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Book Custom Equipment Package</h1>
                <p className="text-gray-600 text-lg mt-2">
                  Complete your booking for <span className="font-semibold text-[#391C71]">{packageData?.name}</span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Private Package Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <Lock className="w-5 h-5 text-blue-600 mr-2" />
            <p className="text-blue-800 text-sm">
              This is your private custom package. Only you can see and book it.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Package Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Package Profile Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#391C71]/20 to-transparent rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-100/50 to-transparent rounded-tr-full"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  
                  {/* Package Image Placeholder */}
                  <div className="lg:w-48 lg:h-48 w-32 h-32 mx-auto lg:mx-0 relative overflow-hidden rounded-3xl shadow-2xl border-4 border-white group">
                    <div className="w-full h-full bg-gradient-to-br from-[#391C71] to-[#5B2C87] flex items-center justify-center">
                      <Package className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  
                  {/* Package Info */}
                  <div className="flex-1 text-center lg:text-left">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                      {packageData?.name}
                    </h1>
                    
                    <p className="text-gray-600 mb-4 text-base leading-relaxed">
                      {packageData?.description}
                    </p>
                    
                    {/* Custom Package Badge */}
                    <div className="inline-flex items-center bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg mb-6">
                      <Lock className="w-4 h-4 mr-2" />
                      Custom Equipment Package
                    </div>
                  </div>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="text-center p-3 bg-gradient-to-r from-[#391C71]/10 to-purple-100 rounded-2xl border border-[#391C71]/20">
                    <div className="text-2xl font-bold text-[#391C71] mb-1">{packageData?.items.length || 0}</div>
                    <div className="text-xs text-gray-600 font-medium">Equipment Items</div>
                    <Package className="w-4 h-4 text-[#391C71] mx-auto mt-2" />
                  </div>
                  <div className="text-center p-3 bg-gradient-to-r from-[#391C71]/10 to-purple-100 rounded-2xl border border-[#391C71]/20">
                    <div className="text-2xl font-bold text-[#391C71] mb-1">{packageData?.totalPricePerDay || 0}</div>
                    <div className="text-xs text-gray-600 font-medium">KWD Per Day</div>
                    <div className="text-base text-[#391C71] mx-auto mt-1">💰</div>
                  </div>
                </div>

                {/* Created by Info */}
                <div className="mb-8">
                  <div className="flex items-center bg-gradient-to-r from-[#391C71]/10 to-purple-100 border border-[#391C71]/20 rounded-2xl p-3">
                    <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-2 mr-3">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Created by</div>
                      <div className="text-base font-bold text-gray-900">
                        {packageData?.createdBy.firstName} {packageData?.createdBy.lastName}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Display */}
                <div className="bg-gradient-to-r from-[#391C71] to-[#5B2C87] rounded-2xl p-6 text-white">
                  <div className="text-center">
                    <p className="text-sm opacity-90 mb-2">Total Package Price</p>
                    <p className="text-3xl font-bold">{packageData?.totalPricePerDay} KWD/day</p>
                    {calculateDays() > 0 && (
                      <p className="text-sm opacity-90 mt-2">
                        {calculateDays()} day{calculateDays() !== 1 ? 's' : ''} = {calculateTotalPrice()} KWD
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Equipment Items Section */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#391C71]/20 to-transparent rounded-br-full"></div>
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-2 mr-3">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  Equipment Items ({packageData?.items.length || 0})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packageData?.items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-[#391C71]/5 to-purple-50 rounded-2xl p-4 border border-[#391C71]/10 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-center gap-4">
                        {/* Equipment Image */}
                        <div className="w-16 h-16 bg-gradient-to-br from-[#391C71]/20 to-purple-200 rounded-xl flex items-center justify-center">
                          {item.equipmentId.images && item.equipmentId.images.length > 0 ? (
                            <Image
                              src={item.equipmentId.images[0]}
                              alt={item.equipmentId.name}
                              width={64}
                              height={64}
                              className="object-cover rounded-xl"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-[#391C71]" />
                          )}
                        </div>
                        
                        {/* Equipment Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{item.equipmentId.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Tag className="w-3 h-3" />
                            <span>{item.equipmentId.category}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-semibold text-[#391C71]">
                              {item.pricePerDay} KWD/day
                            </span>
                            <span className="bg-[#391C71] text-white px-2 py-1 rounded-full text-xs">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {packageData?.notes && (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-br-full"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full p-2 mr-3">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                    Package Notes
                  </h3>
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-4">
                    <p className="text-yellow-800 text-sm leading-relaxed">{packageData.notes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 sticky top-24 relative overflow-hidden">
              
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#391C71]/10 to-transparent rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-100/50 to-transparent rounded-tr-full"></div>
              
              <div className="relative z-10">
                {/* Booking Form Header */}
                <div className="text-center mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-center">
                    <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-2 mr-3">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    Book Package
                  </h3>
                  
                  {/* Private Package Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center mb-6">
                    <Lock className="w-4 h-4 text-blue-600 mr-2" />
                    <p className="text-blue-800 text-xs">
                      This is your private custom package.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form Section */}
        <div className="mt-8">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-28 h-28 bg-gradient-to-br from-[#391C71]/10 to-transparent rounded-br-full"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-purple-100/20 to-transparent rounded-tl-full"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Booking</h2>
                <p className="text-gray-600">Fill in your event details to book this custom package</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <p className="text-green-700">{success}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Event Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#391C71]/10 to-transparent rounded-bl-full"></div>
                
                <div className="relative z-10">
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-2xl p-2 mr-3">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    Event Details
                  </h3>
                
                {/* Multi-day toggle */}
                <div className="mb-6">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isMultiDay}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          isMultiDay: e.target.checked,
                          eventDates: e.target.checked ? [{ date: '', startTime: '09:00', endTime: '17:00' }] : []
                        }));
                      }}
                      className="w-5 h-5 text-[#391C71] rounded focus:ring-[#391C71] focus:ring-2"
                    />
                    <span className="text-gray-700 font-medium">This is a multi-day event</span>
                  </label>
                </div>

                {!formData.isMultiDay ? (
                  /* Single Day Event */
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Event Date *
                      </label>
                      <input
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg text-gray-900 font-medium placeholder-gray-500 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  /* Multi-day Event */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-gray-700">
                        Event Dates & Times *
                      </label>
                      <button
                        type="button"
                        onClick={addEventDate}
                        className="bg-[#391C71] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#5B2C87] transition-colors"
                      >
                        + Add Date
                      </button>
                    </div>
                    
                    {formData.eventDates.map((eventDate, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-gray-50/80 rounded-xl">
                        <div className="flex-1">
                          <input
                            type="date"
                            value={eventDate.date}
                            onChange={(e) => updateEventDate(index, 'date', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71]"
                            required
                          />
                        </div>
                        <div className="w-24">
                          <input
                            type="time"
                            value={eventDate.startTime}
                            onChange={(e) => updateEventDate(index, 'startTime', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] text-sm"
                          />
                        </div>
                        <span className="text-gray-500 text-sm">to</span>
                        <div className="w-24">
                          <input
                            type="time"
                            value={eventDate.endTime}
                            onChange={(e) => updateEventDate(index, 'endTime', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] text-sm"
                          />
                        </div>
                        {formData.eventDates.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEventDate(index)}
                            className="text-red-500 hover:text-red-700 font-medium text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                  <div className="mt-4">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Event Description
                    </label>
                    <textarea
                      rows={4}
                      value={formData.eventDescription}
                      onChange={(e) => setFormData({...formData, eventDescription: e.target.value})}
                      placeholder="Tell us about your event..."
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg text-gray-900 placeholder-gray-500 resize-none transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-100/30 to-transparent rounded-br-full"></div>
                
                <div className="relative z-10">
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-2xl p-2 mr-3">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    Contact Information
                  </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.userDetails.name}
                      onChange={(e) => setFormData({
                        ...formData,
                        userDetails: {...formData.userDetails, name: e.target.value}
                      })}
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg text-gray-900 font-medium placeholder-gray-500 transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Phone Number *
                    </label>
                    <div className="flex items-stretch rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm ring-1 ring-gray-300 focus-within:ring-2 focus-within:ring-[#391C71] shadow-lg">
                      <CountryCodeDropdown
                        selectedCountry={selectedCountry}
                        onCountrySelect={setSelectedCountry}
                        buttonClassName="px-4 py-3 bg-transparent border-0 rounded-none"
                      />
                      <input
                        type="tel"
                        value={formData.userDetails.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          userDetails: {...formData.userDetails, phone: e.target.value}
                        })}
                        placeholder="Your phone number"
                        className="flex-1 px-4 py-3 bg-transparent border-0 focus:outline-none text-gray-900 font-medium placeholder-gray-500"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                  <div className="mt-4">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.userDetails.email}
                      onChange={(e) => setFormData({
                        ...formData,
                        userDetails: {...formData.userDetails, email: e.target.value}
                      })}
                      className="w-full px-4 py-3 bg-gray-100/80 backdrop-blur-sm border border-gray-300 rounded-2xl shadow-lg text-gray-700 font-medium"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Venue Details */}
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-6 relative overflow-hidden lg:col-span-2">
                <div className="absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-tl from-[#391C71]/10 to-transparent rounded-tl-full"></div>
                
                <div className="relative z-10">
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-2xl p-2 mr-3">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    Venue Details
                  </h3>
                
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Venue Address *
                      </label>
                      <input
                        type="text"
                        value={formData.venueDetails.address}
                        onChange={(e) => setFormData({
                          ...formData,
                          venueDetails: {...formData.venueDetails, address: e.target.value}
                        })}
                        placeholder="Street address where the equipment will be delivered"
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg text-gray-900 font-medium placeholder-gray-500 transition-all duration-200"
                        required
                      />
                    </div>
                  
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          City *
                        </label>
                        <input
                          type="text"
                          value={formData.venueDetails.city}
                          onChange={(e) => setFormData({
                            ...formData,
                            venueDetails: {...formData.venueDetails, city: e.target.value}
                          })}
                          className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg text-gray-900 font-medium placeholder-gray-500 transition-all duration-200"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          State/Province *
                        </label>
                        <input
                          type="text"
                          value={formData.venueDetails.state}
                          onChange={(e) => setFormData({
                            ...formData,
                            venueDetails: {...formData.venueDetails, state: e.target.value}
                          })}
                          className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg text-gray-900 font-medium placeholder-gray-500 transition-all duration-200"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Country *
                        </label>
                        <input
                          type="text"
                          value={formData.venueDetails.country}
                          onChange={(e) => setFormData({
                            ...formData,
                            venueDetails: {...formData.venueDetails, country: e.target.value}
                          })}
                          className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg text-gray-900 font-medium placeholder-gray-500 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={formData.venueDetails.postalCode}
                          onChange={(e) => setFormData({
                            ...formData,
                            venueDetails: {...formData.venueDetails, postalCode: e.target.value}
                          })}
                          className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg text-gray-900 font-medium placeholder-gray-500 transition-all duration-200"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Venue Type
                        </label>
                        <select
                          value={formData.venueDetails.venueType}
                          onChange={(e) => setFormData({
                            ...formData,
                            venueDetails: {...formData.venueDetails, venueType: e.target.value}
                          })}
                          className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg text-gray-900 font-medium appearance-none transition-all duration-200"
                        >
                          <option value="">Select venue type</option>
                          <option value="outdoor">Outdoor</option>
                          <option value="indoor">Indoor</option>
                          <option value="hotel">Hotel</option>
                          <option value="banquet_hall">Banquet Hall</option>
                          <option value="conference_center">Conference Center</option>
                          <option value="warehouse">Warehouse</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Additional Information
                      </label>
                      <textarea
                        rows={4}
                        value={formData.venueDetails.additionalInfo}
                        onChange={(e) => setFormData({
                          ...formData,
                          venueDetails: {...formData.venueDetails, additionalInfo: e.target.value}
                        })}
                        placeholder="Any special instructions for delivery or setup..."
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg text-gray-900 placeholder-gray-500 resize-none transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-6 relative overflow-hidden lg:col-span-2">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-100/30 to-transparent rounded-bl-full"></div>
                
                <div className="relative z-10">
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-2xl p-2 mr-3">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    Special Requests
                  </h3>
                  <textarea
                    rows={4}
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                    placeholder="Any special requirements or requests for your booking..."
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg text-gray-900 placeholder-gray-500 resize-none transition-all duration-200"
                  />
                </div>
              </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-[#391C71] to-[#5B2C87] hover:from-[#5B2C87] hover:to-[#391C71] text-white px-8 py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-lg font-bold shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-white/20"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Proceed to Payment
                    </>
                  )}
                </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

        {/* Terms and Conditions Modal */}
        {termsData && (
          <TermsAndConditionsModal
            isOpen={showTermsModal}
            onClose={() => setShowTermsModal(false)}
            onAccept={handleTermsAccept}
            onDecline={handleTermsDecline}
            terms={termsData}
          />
        )}

        <Footer />
      </div>
  );
};

export default BookCustomPackagePage;