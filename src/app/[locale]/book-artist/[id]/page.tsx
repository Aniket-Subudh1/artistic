'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRouter as useI18nRouter } from '@/i18n/routing';
import { useAuthLogic } from '@/hooks/useAuth';
import { ArtistService, Artist } from '@/services/artist.service';
import { BookingService } from '@/services/booking.service';
import { equipmentPackagesService, EquipmentPackage } from '@/services/equipment-packages.service';
import { AvailabilityCalendar } from '@/components/booking/AvailabilityCalendar';
import Image from 'next/image';
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  Package,
  CreditCard,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Info,
  Plus,
  Minus
} from 'lucide-react';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';
import { TermsAndConditionsModal } from '@/components/booking/TermsAndConditionsModal';
import { TermsAndConditionsService, TermsAndConditions, TermsType } from '@/services/terms-and-conditions.service';

interface BookingFormData {
  eventDate: string;
  startTime: string;
  endTime: string;
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
    postalCode: string;
    venueType: string;
    additionalInfo: string;
  };
  eventDescription: string;
  specialRequests: string;
  selectedEquipmentPackages: string[];
}

interface AvailabilityData {
  [date: string]: number[]; // date -> array of unavailable hours
}

export default function BookArtistPage() {
  const params = useParams();
  const router = useRouter();
  const i18nRouter = useI18nRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthLogic();
  const artistId = params.id as string;

  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<AvailabilityData>({});
  const [equipmentPackages, setEquipmentPackages] = useState<EquipmentPackage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [errorModal, setErrorModal] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({ show: false, title: '', message: '' });
  
  const [formData, setFormData] = useState<BookingFormData>({
    eventDate: '',
    startTime: '',
    endTime: '',
    userDetails: {
      name: user ? `${user.firstName} ${user.lastName}` : '',
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
    selectedEquipmentPackages: [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Terms and Conditions Modal State
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [terms, setTerms] = useState<TermsAndConditions | null>(null);
  const [termsLoading, setTermsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Check authentication
  useEffect(() => {
    // Only redirect if auth loading is complete and user is not authenticated
    if (!authLoading && !isAuthenticated) {
      const currentPath = window.location.pathname;
      i18nRouter.push(`/auth/signin?returnUrl=${encodeURIComponent(currentPath)}`);
      return;
    }
  }, [authLoading, isAuthenticated, i18nRouter]);

  // Fetch artist data
  useEffect(() => {
    if (!authLoading && isAuthenticated && artistId) {
      fetchArtistData();
    }
  }, [authLoading, isAuthenticated, artistId]);

  // Update user details when user data is available
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

  const fetchArtistData = async () => {
    try {
      setLoading(true);
      
      // First fetch artist data
      const artistData = await ArtistService.getArtistById(artistId);
      setArtist(artistData);
      
      // Then try to fetch availability - don't fail the whole page if this fails
      try {
        const currentDate = new Date();
        await fetchAvailability(currentDate.getMonth() + 1, currentDate.getFullYear());
      } catch (availabilityError) {
        console.error('Availability fetch failed:', availabilityError);
        // Error is already handled in fetchAvailability
      }
      
      // Fetch equipment packages
      try {
        const packages = await equipmentPackagesService.getPublicPackages();
        setEquipmentPackages(packages);
      } catch (packageError) {
        console.error('Equipment packages fetch failed:', packageError);
        // Continue without packages
      }
      
    } catch (error) {
      console.error('Error fetching artist data:', error);
      setErrorModal({
        show: true,
        title: 'Error Loading Artist',
        message: 'Unable to load artist information. Please try again or go back.'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async (month: number, year: number) => {
    try {
      console.log('🔍 Fetching availability for artist:', artistId, 'month:', month, 'year:', year);
      const response = await BookingService.getArtistAvailability(artistId, month, year);
      console.log('📅 Availability response:', response);
      console.log('🚫 Unavailable slots:', response.unavailableSlots);
      setAvailability(response.unavailableSlots);
    } catch (error: any) {
      console.error('❌ Error fetching availability:', error);
      
      // Handle different types of errors
      let errorTitle = 'Error Loading Availability';
      let errorMessage = 'Unable to load artist availability. Please try again.';
      
      if (error.message === 'Artist not found') {
        errorTitle = 'Artist Not Found';
        errorMessage = 'The artist you\'re looking for could not be found.';
      } else if (error.message === 'Artist not available for private bookings') {
        errorTitle = 'Artist Not Available';
        errorMessage = 'This artist is not available for private bookings. Please choose another artist.';
      } else if (error.message === 'Artist not found or not available for private bookings') {
        errorTitle = 'Artist Not Available';
        errorMessage = 'This artist is either not found or not available for private bookings.';
      }
      
      setErrorModal({
        show: true,
        title: errorTitle,
        message: errorMessage
      });
    }
  };

  const handleMonthChange = async (month: number, year: number) => {
    try {
      await fetchAvailability(month, year);
    } catch (error) {
      console.error('Error fetching availability for new month:', error);
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (stepNumber === 1) {
      if (!formData.eventDate) newErrors.eventDate = 'Event date is required';
      if (!formData.startTime) newErrors.startTime = 'Start time is required';
      if (!formData.endTime) newErrors.endTime = 'End time is required';
      
      // Check if selected time slots are available
      if (formData.eventDate && availability[formData.eventDate]) {
        const startHour = parseInt(formData.startTime.split(':')[0]);
        const endHour = parseInt(formData.endTime.split(':')[0]);
        const unavailableHours = availability[formData.eventDate];
        
        for (let hour = startHour; hour < endHour; hour++) {
          if (unavailableHours.includes(hour)) {
            newErrors.timeSlot = 'Selected time slot is not available';
            break;
          }
        }
      }
    }

    if (stepNumber === 2) {
      if (!formData.userDetails.name) newErrors.name = 'Name is required';
      if (!formData.userDetails.email) newErrors.email = 'Email is required';
      if (!formData.userDetails.phone) newErrors.phone = 'Phone is required';
      if (!formData.venueDetails.address) newErrors.address = 'Address is required';
      if (!formData.venueDetails.city) newErrors.city = 'City is required';
      if (!formData.venueDetails.state) newErrors.state = 'State is required';
      if (!formData.venueDetails.country) newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loadTermsAndConditions = async () => {
    setTermsLoading(true);
    try {
      // Determine which terms to load based on booking type
      let termsToLoad: TermsAndConditions | null = null;
      
      if (formData.selectedEquipmentPackages.length > 0) {
        // Combined artist + equipment booking - load artist terms which should cover both
        termsToLoad = await TermsAndConditionsService.getArtistBookingTerms();
        
        // If artist terms don't exist, try equipment terms as fallback
        if (!termsToLoad) {
          termsToLoad = await TermsAndConditionsService.getEquipmentBookingTerms();
        }
      } else {
        // Artist-only booking
        termsToLoad = await TermsAndConditionsService.getArtistBookingTerms();
      }
      
      // Final fallback to general booking terms
      if (!termsToLoad) {
        termsToLoad = await TermsAndConditionsService.getGeneralBookingTerms();
      }
      
      setTerms(termsToLoad);
    } catch (error) {
      console.error('Error loading terms and conditions:', error);
      setTerms(null);
    } finally {
      setTermsLoading(false);
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    // If terms haven't been accepted yet, show the terms modal
    if (!termsAccepted) {
      await loadTermsAndConditions();
      setShowTermsModal(true);
      return;
    }

    // If terms have been accepted, proceed with booking
    await processBooking();
  };

  const processBooking = async () => {
    try {
      setSubmitting(true);
      
      // Calculate pricing
      const artistPrice = artist?.pricePerHour || 0;
      const startHour = parseInt(formData.startTime.split(':')[0]);
      const endHour = parseInt(formData.endTime.split(':')[0]);
      const hours = endHour - startHour;
      const totalArtistPrice = artistPrice * hours;
      
      // Calculate equipment price
      let equipmentPrice = 0;
      formData.selectedEquipmentPackages.forEach(packageId => {
        const pkg = equipmentPackages.find(p => p._id === packageId);
        if (pkg) {
          equipmentPrice += pkg.totalPrice;
        }
      });
      
      const bookingData = {
        artistId,
        eventType: 'private' as const,
        eventDate: formData.eventDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        artistPrice: totalArtistPrice,
        equipmentPrice,
        totalPrice: totalArtistPrice + equipmentPrice,
        userDetails: formData.userDetails,
        venueDetails: formData.venueDetails,
        eventDescription: formData.eventDescription,
        specialRequests: formData.specialRequests,
        selectedEquipmentPackages: formData.selectedEquipmentPackages,
      };

      const response = await BookingService.createArtistBooking(bookingData);
      
      // Redirect to success page or booking confirmation
      i18nRouter.push('/dashboard/user/bookings');
    } catch (error: any) {
      console.error('Error creating booking:', error);
      setErrorModal({
        show: true,
        title: 'Booking Failed',
        message: error.message || 'Unable to create booking. Please try again or contact support.'
      });
    } finally {
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
    // Reset submitting state since booking was cancelled
    setSubmitting(false);
  };

  const handleTermsClose = () => {
    setShowTermsModal(false);
    // Reset submitting state since booking was cancelled
    setSubmitting(false);
  };

  // Show loading while auth is being resolved
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If auth is loaded and user is not authenticated, don't render (redirect will happen)
  if (!authLoading && !isAuthenticated) {
    return null;
  }

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
        <div className="relative z-10 flex justify-center items-center h-96 pt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#391C71]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!artist) {
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
          <div className="max-w-md mx-auto bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Artist Not Found</h2>
            <p className="text-gray-600 mb-4">The artist you're looking for doesn't exist or is not available for booking.</p>
            <button
              onClick={() => router.back()}
              className="bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-6 py-3 rounded-full hover:from-[#5B2C87] hover:to-[#391C71] transition-colors shadow-lg"
            >
              Go Back
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
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-8">
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
              Back to Artist Profile
            </button>
            
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Artist Image */}
              <div className="relative w-24 h-24 flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-2xl transform rotate-3"></div>
                <Image
                  src={artist.profileImage || '/default-avatar.png'}
                  alt={artist.stageName}
                  width={96}
                  height={96}
                  className="object-cover rounded-2xl border-4 border-white shadow-lg relative z-10"
                />
                {/* Verified Badge */}
                <div className="absolute -top-2 -right-2 bg-[#391C71] rounded-full p-2 shadow-lg z-20">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Book {artist.stageName}</h1>
                <div className="flex flex-wrap items-center gap-4 mb-3">
                  <div className="inline-flex items-center bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    <User className="w-4 h-4 mr-2" />
                    {artist.category || 'Artist'}
                  </div>
                  <div className="bg-gradient-to-r from-[#391C71]/10 to-purple-100 text-[#391C71] px-4 py-2 rounded-full text-sm font-bold border border-[#391C71]/20">
                    {artist.pricePerHour} KWD/hour
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{artist.user.firstName} {artist.user.lastName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#391C71]/20 to-transparent rounded-br-full"></div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-2 mr-3">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              Booking Progress
            </h2>
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`flex items-center ${stepNumber < 4 ? 'flex-1' : ''}`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg ${
                      stepNumber <= step
                        ? 'bg-gradient-to-br from-[#391C71] to-[#5B2C87] text-white'
                        : 'bg-white/50 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {stepNumber < step ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <div className="ml-4 hidden sm:block">
                    <p className={`text-sm font-bold ${
                      stepNumber <= step ? 'text-[#391C71]' : 'text-gray-500'
                    }`}>
                      {stepNumber === 1 && 'Date & Time'}
                      {stepNumber === 2 && 'Event Details'}
                      {stepNumber === 3 && 'Equipment'}
                      {stepNumber === 4 && 'Review & Book'}
                    </p>
                  </div>
                  {stepNumber < 4 && (
                    <div
                      className={`flex-1 h-1 mx-4 rounded-full ${
                        stepNumber < step 
                          ? 'bg-gradient-to-r from-[#391C71] to-[#5B2C87]' 
                          : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#391C71]/10 to-transparent rounded-bl-full"></div>
          <div className="relative z-10">
            {step === 1 && (
              <DateTimeStep
                formData={formData}
                setFormData={setFormData}
                availability={availability}
                errors={errors}
                onMonthChange={handleMonthChange}
                artistId={artistId}
              />
            )}
            
            {step === 2 && (
              <EventDetailsStep
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
            )}
            
            {step === 3 && (
              <EquipmentStep
                formData={formData}
                setFormData={setFormData}
                equipmentPackages={equipmentPackages}
                errors={errors}
              />
            )}
            
            {step === 4 && (
              <ReviewStep
                formData={formData}
                artist={artist}
                equipmentPackages={equipmentPackages}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-white/20">
              <button
                onClick={handlePrevious}
                disabled={step === 1}
                className="px-8 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl text-gray-700 hover:bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
              
              {step < 4 ? (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white rounded-2xl hover:from-[#5B2C87] hover:to-[#391C71] hover:shadow-xl hover:scale-105 font-bold transition-all duration-300 shadow-lg flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative z-10">Next Step</span>
                  <ArrowLeft className="w-4 h-4 rotate-180 relative z-10" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-emerald-600 hover:to-green-500 hover:shadow-xl hover:scale-105 font-bold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white relative z-10"></div>
                      <span className="relative z-10">Booking...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">Confirm Booking</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Error Modal */}
      {errorModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 max-w-md w-full mx-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-red-100/50 to-transparent rounded-bl-full"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="bg-red-100 rounded-full p-2 mr-4">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{errorModal.title}</h3>
              </div>
              <div className="bg-red-50/50 rounded-2xl p-4 mb-6 border border-red-100">
                <p className="text-gray-700 leading-relaxed">{errorModal.message}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setErrorModal({ show: false, title: '', message: '' })}
                  className="flex-1 px-6 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl text-gray-700 hover:bg-white/70 font-semibold transition-all duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setErrorModal({ show: false, title: '', message: '' });
                    router.back();
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white rounded-2xl hover:from-[#5B2C87] hover:to-[#391C71] font-bold transition-all duration-200 shadow-lg"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms and Conditions Modal */}
      <TermsAndConditionsModal
        isOpen={showTermsModal}
        onClose={handleTermsClose}
        onAccept={handleTermsAccept}
        onDecline={handleTermsDecline}
        terms={terms}
        loading={termsLoading}
        title="Terms and Conditions"
        subtitle={
          formData.selectedEquipmentPackages.length > 0
            ? "Please read and accept the terms and conditions to complete your artist and equipment package booking."
            : "Please read and accept the terms and conditions to complete your artist booking."
        }
        acceptButtonText="Accept & Complete Booking"
        declineButtonText="Cancel Booking"
      />
      
      <Footer />
    </div>
  );
}

// Step Components
interface StepProps {
  formData: BookingFormData;
  setFormData: (data: BookingFormData) => void;
  errors: { [key: string]: string };
}

function DateTimeStep({ formData, setFormData, availability, errors, onMonthChange, artistId }: StepProps & { 
  availability: AvailabilityData;
  onMonthChange: (month: number, year: number) => Promise<void>;
  artistId: string;
}) {
  const handleDateSelect = (date: string) => {
    setFormData({ ...formData, eventDate: date });
  };

  const handleTimeSelect = (startTime: string, endTime: string) => {
    setFormData({ 
      ...formData, 
      startTime, 
      endTime 
    });
  };

  const handleMonthChange = async (month: number, year: number) => {
    await onMonthChange(month, year);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Select Date & Time</h2>
      
      <AvailabilityCalendar
        availability={availability}
        selectedDate={formData.eventDate}
        selectedStartTime={formData.startTime}
        selectedEndTime={formData.endTime}
        onDateSelect={handleDateSelect}
        onTimeSelect={handleTimeSelect}
        onMonthChange={handleMonthChange}
      />
      
      {errors.eventDate && <p className="text-red-500 text-sm mt-1">{errors.eventDate}</p>}
      {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
      {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
      {errors.timeSlot && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{errors.timeSlot}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function EventDetailsStep({ formData, setFormData, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Event Details</h2>
      
      {/* User Details */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.userDetails.name}
              onChange={(e) => setFormData({
                ...formData,
                userDetails: { ...formData.userDetails, name: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.userDetails.email}
              onChange={(e) => setFormData({
                ...formData,
                userDetails: { ...formData.userDetails, email: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.userDetails.phone}
              onChange={(e) => setFormData({
                ...formData,
                userDetails: { ...formData.userDetails, phone: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
        </div>
      </div>
      
      {/* Venue Details */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Venue Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.venueDetails.address}
              onChange={(e) => setFormData({
                ...formData,
                venueDetails: { ...formData.venueDetails, address: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              value={formData.venueDetails.city}
              onChange={(e) => setFormData({
                ...formData,
                venueDetails: { ...formData.venueDetails, city: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <input
              type="text"
              value={formData.venueDetails.state}
              onChange={(e) => setFormData({
                ...formData,
                venueDetails: { ...formData.venueDetails, state: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
            {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              value={formData.venueDetails.country}
              onChange={(e) => setFormData({
                ...formData,
                venueDetails: { ...formData.venueDetails, country: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code
            </label>
            <input
              type="text"
              value={formData.venueDetails.postalCode}
              onChange={(e) => setFormData({
                ...formData,
                venueDetails: { ...formData.venueDetails, postalCode: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      </div>
      
      {/* Additional Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Description
            </label>
            <textarea
              rows={3}
              value={formData.eventDescription}
              onChange={(e) => setFormData({ ...formData, eventDescription: e.target.value })}
              placeholder="Describe your event..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requests
            </label>
            <textarea
              rows={3}
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              placeholder="Any special requests or requirements..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function EquipmentStep({ formData, setFormData, equipmentPackages, errors }: StepProps & { equipmentPackages: EquipmentPackage[] }) {
  const calculateEquipmentPrice = () => {
    let total = 0;
    formData.selectedEquipmentPackages.forEach(packageId => {
      const pkg = equipmentPackages.find(p => p._id === packageId);
      if (pkg) {
        total += pkg.totalPrice;
      }
    });
    return total;
  };

  const togglePackageSelection = (packageId: string) => {
    const currentSelection = [...formData.selectedEquipmentPackages];
    const index = currentSelection.indexOf(packageId);
    
    if (index > -1) {
      currentSelection.splice(index, 1);
    } else {
      currentSelection.push(packageId);
    }
    
    setFormData({
      ...formData,
      selectedEquipmentPackages: currentSelection
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Equipment Packages (Optional)</h2>
        <div className="text-right">
          <p className="text-sm text-gray-600">Selected equipment cost</p>
          <p className="text-lg font-semibold text-purple-600">${calculateEquipmentPrice()}</p>
        </div>
      </div>
      
      <p className="text-gray-600">
        Enhance your event with professional equipment packages. All equipment will be delivered and set up at your venue.
      </p>
      
      {equipmentPackages.length === 0 ? (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No equipment packages available at the moment.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {equipmentPackages.map((pkg) => (
            <div
              key={pkg._id}
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                formData.selectedEquipmentPackages.includes(pkg._id)
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => togglePackageSelection(pkg._id)}
            >
              {pkg.coverImage && (
                <Image
                  src={pkg.coverImage}
                  alt={pkg.name}
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
              )}
              
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                <div className="flex items-center">
                  {formData.selectedEquipmentPackages.includes(pkg._id) ? (
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
              
              <div className="space-y-2">
                <p className="text-lg font-bold text-purple-600">${pkg.totalPrice}</p>
                <p className="text-xs text-gray-500">
                  {pkg.items.length} items included
                </p>
              </div>
              
              {/* Package Items */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Includes:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {pkg.items.slice(0, 3).map((item, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                      {item.quantity}x {item.equipmentId.name}
                    </li>
                  ))}
                  {pkg.items.length > 3 && (
                    <li className="text-purple-600">
                      +{pkg.items.length - 3} more items
                    </li>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {formData.selectedEquipmentPackages.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-green-800 font-medium">
              {formData.selectedEquipmentPackages.length} package(s) selected
            </p>
          </div>
          <p className="text-green-700 text-sm">
            Total equipment cost: ${calculateEquipmentPrice()}
          </p>
        </div>
      )}
    </div>
  );
}

function ReviewStep({ formData, artist, equipmentPackages }: { 
  formData: BookingFormData; 
  artist: Artist; 
  equipmentPackages: EquipmentPackage[] 
}) {
  const startHour = parseInt(formData.startTime.split(':')[0]);
  const endHour = parseInt(formData.endTime.split(':')[0]);
  const hours = endHour - startHour;
  const artistPrice = artist.pricePerHour * hours;
  
  // Calculate equipment price
  let equipmentPrice = 0;
  const selectedPackages = equipmentPackages.filter(pkg => 
    formData.selectedEquipmentPackages.includes(pkg._id)
  );
  selectedPackages.forEach(pkg => {
    equipmentPrice += pkg.totalPrice;
  });
  
  const totalPrice = artistPrice + equipmentPrice;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Review Your Booking</h2>
      
      {/* Booking Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Summary</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Artist:</span>
            <span className="font-medium">{artist.stageName}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span className="font-medium">{formData.eventDate}</span>
          </div>
          <div className="flex justify-between">
            <span>Time:</span>
            <span className="font-medium">{formData.startTime} - {formData.endTime}</span>
          </div>
          <div className="flex justify-between">
            <span>Duration:</span>
            <span className="font-medium">{hours} hours</span>
          </div>
          <div className="flex justify-between">
            <span>Venue:</span>
            <span className="font-medium">{formData.venueDetails.city}, {formData.venueDetails.state}</span>
          </div>
        </div>
      </div>
      
      {/* Pricing */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Artist Fee ({hours} hours × ${artist.pricePerHour}/hour):</span>
            <span className="font-medium">${artistPrice}</span>
          </div>
          {selectedPackages.length > 0 && (
            <div className="space-y-2">
              <div className="font-medium text-gray-700">Equipment Packages:</div>
              {selectedPackages.map(pkg => (
                <div key={pkg._id} className="flex justify-between text-sm pl-4">
                  <span>• {pkg.name}:</span>
                  <span>${pkg.totalPrice}</span>
                </div>
              ))}
              <div className="flex justify-between font-medium text-purple-600">
                <span>Equipment Subtotal:</span>
                <span>${equipmentPrice}</span>
              </div>
            </div>
          )}
          <div className="border-t pt-3 flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>${totalPrice}</span>
          </div>
        </div>
      </div>
      
      {/* Contact Details */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Details</h3>
        
        <div className="space-y-2">
          <p><span className="font-medium">Name:</span> {formData.userDetails.name}</p>
          <p><span className="font-medium">Email:</span> {formData.userDetails.email}</p>
          <p><span className="font-medium">Phone:</span> {formData.userDetails.phone}</p>
        </div>
      </div>
      
      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <p className="text-blue-800 font-medium mb-2">Important Notice</p>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Your booking is subject to artist approval</li>
              <li>• Payment will be processed after confirmation</li>
              <li>• Cancellation policy applies as per terms and conditions</li>
              <li>• You will receive a confirmation email shortly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}