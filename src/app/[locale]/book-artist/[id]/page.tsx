'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRouter as useI18nRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useAuthLogic } from '@/hooks/useAuth';
import { ArtistService, Artist } from '@/services/artist.service';
import { BookingService } from '@/services/booking.service';
import { equipmentPackagesService, EquipmentPackage } from '@/services/equipment-packages.service';
import { 
  customEquipmentPackagesService, 
  CustomEquipmentPackage 
} from '@/services/custom-equipment-packages.service';
import { CreateCustomPackageModal } from '@/components/equipment-provider/CreateCustomPackageModal';
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
import { TranslatedDataWrapper } from '@/components/ui/TranslatedDataWrapper';
import { TermsAndConditionsModal } from '@/components/booking/TermsAndConditionsModal';
import { CartService } from '@/services/cart.service';
import { PaymentService, PaymentInitiateRequest } from '@/services/payment.service';
import { TermsAndConditionsService, TermsAndConditions, TermsType } from '@/services/terms-and-conditions.service';
import { CountryCodeDropdown, Country, getDefaultCountry, formatPhoneNumber } from '@/components/ui/CountryCodeDropdown';

interface BookingFormData {
  // Artist booking dates
  artistEventDates: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
  
  // Equipment booking dates (can be different from artist dates)
  equipmentEventDates: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
  
  // Multi-day booking support (legacy - uses same dates for both)
  eventDates: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
  
  // Legacy single date support (for backward compatibility)
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
  selectedCustomPackages: string[];
}

interface AvailabilityData {
  [date: string]: number[]; // date -> array of unavailable hours
}

export default function BookArtistPage() {
  const params = useParams();
  const router = useRouter();
  const i18nRouter = useI18nRouter();
  const t = useTranslations();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthLogic();
  const artistId = params.id as string;

  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<AvailabilityData>({});
  const [equipmentPackages, setEquipmentPackages] = useState<EquipmentPackage[]>([]);
  const [customPackages, setCustomPackages] = useState<CustomEquipmentPackage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [step, setStep] = useState(1);
  const [isMultiDayBooking, setIsMultiDayBooking] = useState(false);
  const [isArtistMultiDay, setIsArtistMultiDay] = useState(false);
  const [isEquipmentMultiDay, setIsEquipmentMultiDay] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({ show: false, title: '', message: '' });
  
  const [formData, setFormData] = useState<BookingFormData>({
    // New flexible multi-day support
    artistEventDates: [],
    equipmentEventDates: [],
    // Legacy multi-day booking support (for backward compatibility)
    eventDates: [],
    // Legacy single date support (for backward compatibility)
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
    selectedCustomPackages: [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Terms and Conditions Modal State
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [terms, setTerms] = useState<TermsAndConditions | null>(null);
  const [termsLoading, setTermsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Create Custom Package Modal State
  const [showCreatePackageModal, setShowCreatePackageModal] = useState(false);

  // Country code state
  const [selectedCountry, setSelectedCountry] = useState<Country>(getDefaultCountry());

  // Handler for when a custom package is created
  const handlePackageCreated = async () => {
    setShowCreatePackageModal(false);
    // Refresh custom packages
    if (isAuthenticated) {
      try {
        const customPackagesData = await customEquipmentPackagesService.getAllCustomPackages();
        setCustomPackages(Array.isArray(customPackagesData) ? customPackagesData : []);
      } catch (error) {
        console.error('Failed to refresh custom packages:', error);
        setCustomPackages([]);
      }
    }
  };

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
      
      // Fetch equipment packages
      try {
        const packages = await equipmentPackagesService.getPublicPackages();
        setEquipmentPackages(packages);
      } catch (packageError) {
        console.error('Equipment packages fetch failed:', packageError);
        // Continue without packages
      }

      // Fetch custom packages if user is authenticated
      if (isAuthenticated) {
        try {
          const customPackagesData = await customEquipmentPackagesService.getAllCustomPackages();
          setCustomPackages(Array.isArray(customPackagesData) ? customPackagesData : []);
        } catch (customPackageError) {
          console.error('Custom packages fetch failed:', customPackageError);
          // Continue without custom packages
          setCustomPackages([]);
        }
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
   
    setAvailability({});
  };

  const fetchDateAvailability = async (dateStr: string) => {
    try {
      const response: any = await BookingService.getArtistDateAvailability(artistId, dateStr);
      
      // Update availability state with this date's data
      setAvailability(prev => ({
        ...prev,
        [dateStr]: response.unavailableHours || []
      }));
      
      return response;
    } catch (error: any) {
      throw error;
    }
  };

  const handleMonthChange = async (month: number, year: number) => {
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (stepNumber === 1) {
      if (isMultiDayBooking) {
        // Multi-day booking validation
        if (!formData.eventDates || formData.eventDates.length === 0) {
          newErrors.eventDate = 'Event dates are required';
        } else {
          // Check each day has required time slots
          for (let i = 0; i < formData.eventDates.length; i++) {
            const dayData = formData.eventDates[i];
            if (!dayData.date) {
              newErrors.eventDate = 'All event dates are required';
              break;
            }
            if (!dayData.startTime) {
              newErrors.startTime = 'Start time is required for all days';
              break;
            }
            if (!dayData.endTime) {
              newErrors.endTime = 'End time is required for all days';
              break;
            }
            
            // Check availability for this day
            if (dayData.date && availability[dayData.date]) {
              const startHour = parseInt(dayData.startTime.split(':')[0]);
              const endHour = parseInt(dayData.endTime.split(':')[0]);
              const unavailableHours = availability[dayData.date];
              
              for (let hour = startHour; hour < endHour; hour++) {
                if (unavailableHours.includes(hour)) {
                  newErrors.timeSlot = `Selected time slot is not available on ${dayData.date}`;
                  break;
                }
              }
              if (newErrors.timeSlot) break;
            }
          }
        }
      } else {
        // Single-day booking validation
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

  const handleAddToCart = async () => {
    // No terms needed for adding to cart; just validate and add items
    try {
      setAddingToCart(true);
      const items: Array<{ bookingDate: string; startTime: string; endTime: string }> = [];
      if (isMultiDayBooking && formData.eventDates.length > 0) {
        for (const d of formData.eventDates) {
          if (!d.date || !d.startTime || !d.endTime) continue;
          items.push({ bookingDate: d.date, startTime: d.startTime, endTime: d.endTime });
        }
      } else {
        if (!formData.eventDate || !formData.startTime || !formData.endTime) {
          setErrorModal({ show: true, title: 'Missing details', message: 'Select date and time before adding to cart.' });
          setAddingToCart(false);
          return;
        }
        items.push({ bookingDate: formData.eventDate, startTime: formData.startTime, endTime: formData.endTime });
      }

      if (items.length === 0) {
        setErrorModal({ show: true, title: 'No slots selected', message: 'Please choose at least one date and time.' });
        setAddingToCart(false);
        return;
      }

      // Calculate per-day price approximations using pricing API for accuracy
      // We'll compute rate per hour and multiply by hours for each day
      let ratePerHour = 0;
      try {
        const pricing = await BookingService.calculateBookingPricing(
          items.length > 1
            ? {
                artistId,
                eventType: 'private',
                isMultiDay: true,
                eventDates: items.map((i) => ({ date: i.bookingDate, startTime: i.startTime, endTime: i.endTime })),
              }
            : {
                artistId,
                eventType: 'private',
                eventDate: items[0].bookingDate,
                startTime: items[0].startTime,
                endTime: items[0].endTime,
              },
        );
        ratePerHour = pricing.artistFee.totalHours > 0 ? pricing.artistFee.amount / pricing.artistFee.totalHours : 0;
      } catch {}

      for (const i of items) {
        const startH = parseInt(i.startTime.split(':')[0]);
        const endH = parseInt(i.endTime.split(':')[0]);
        const hours = Math.max(1, endH - startH);
        const totalPrice = ratePerHour > 0 ? Math.round(ratePerHour * hours) : (artist?.pricePerHour || 0) * hours;
        await CartService.addToCart({
          artistId, // profile id
          bookingDate: i.bookingDate,
          startTime: i.startTime,
          endTime: i.endTime,
          hours,
          totalPrice,
          selectedEquipmentPackages: formData.selectedEquipmentPackages || [],
          selectedCustomPackages: formData.selectedCustomPackages || [],
          isEquipmentMultiDay: isEquipmentMultiDay,
          equipmentEventDates: isEquipmentMultiDay && formData.equipmentEventDates.length > 0 ? formData.equipmentEventDates : undefined,
          userDetails: {
            ...formData.userDetails,
            phone: formatPhoneNumber(selectedCountry.code, formData.userDetails.phone),
          },
          venueDetails: formData.venueDetails,
        });
      }

      // Redirect back to artist listing for additional selections
      i18nRouter.push('/artists');
    } catch (error: any) {
      const msg = error?.data?.message || error?.message || 'Unable to add to cart.';
      setErrorModal({ show: true, title: 'Add to Cart Failed', message: msg });
    } finally {
      setAddingToCart(false);
    }
  };

  const processBooking = async () => {
    try {
      setSubmitting(true);
      
      // Use new optimized pricing calculation
      const pricingData = {
        artistId,
        eventType: 'private' as const,
        isMultiDay: isMultiDayBooking,
        ...(isMultiDayBooking ? {
          eventDates: formData.eventDates
        } : {
          eventDate: formData.eventDate,
          startTime: formData.startTime,
          endTime: formData.endTime
        }),
        selectedEquipmentPackages: formData.selectedEquipmentPackages,
        selectedCustomPackages: formData.selectedCustomPackages
      };

      let pricingResponse;
      try {
        // Single API call for complete pricing calculation
        pricingResponse = await BookingService.calculateBookingPricing(pricingData);
      } catch (error) {
        
        // Fallback to legacy calculation if new endpoint fails
        let totalHours = 0;
        let totalArtistPrice = 0;
        
        if (isMultiDayBooking && formData.eventDates.length > 0) {
          formData.eventDates.forEach(dayData => {
            const startHour = parseInt(dayData.startTime.split(':')[0]);
            const endHour = parseInt(dayData.endTime.split(':')[0]);
            const dayHours = endHour - startHour;
            totalHours += dayHours;
          });
          
          const fallbackResponse = await ArtistService.calculateBookingCost(
            artistId, 'private', 8, totalHours
          );
          totalArtistPrice = fallbackResponse.totalCost;
        } else {
          const startHour = parseInt(formData.startTime.split(':')[0]);
          const endHour = parseInt(formData.endTime.split(':')[0]);
          totalHours = endHour - startHour;
          
          const fallbackResponse = await ArtistService.calculateBookingCost(
            artistId, 'private', startHour, totalHours
          );
          totalArtistPrice = fallbackResponse.totalCost;
        }
        
        // Create fallback pricing response structure
        pricingResponse = {
          artistFee: { amount: totalArtistPrice, totalHours },
          equipmentFee: { amount: 0 },
          totalAmount: totalArtistPrice
        };
      }

      let bookingData: any;
      
      if (isMultiDayBooking && formData.eventDates.length > 0) {
        // Multi-day booking data structure with independent equipment scheduling
        bookingData = {
          artistId,
          eventType: 'private' as const,
          // New flexible multi-day format
          isArtistMultiDay: true,
          artistEventDates: formData.eventDates,
          isEquipmentMultiDay: isEquipmentMultiDay,
          equipmentEventDates: isEquipmentMultiDay && formData.equipmentEventDates.length > 0 
            ? formData.equipmentEventDates 
            : formData.eventDates, // Fallback to artist dates if no separate equipment dates
          // Legacy fields for backward compatibility
          isMultiDay: true,
          eventDates: formData.eventDates,
          totalHours: pricingResponse.artistFee.totalHours,
          artistPrice: pricingResponse.artistFee.amount,
          userDetails: {
            ...formData.userDetails,
            phone: formatPhoneNumber(selectedCountry.code, formData.userDetails.phone)
          },
          venueDetails: formData.venueDetails,
          eventDescription: formData.eventDescription,
          specialRequests: formData.specialRequests,
          selectedEquipmentPackages: formData.selectedEquipmentPackages,
          selectedCustomPackages: formData.selectedCustomPackages,
        };
      } else {
        // Single-day booking data structure
        
        // Check availability before booking (respects cooldown, max hours, etc.)
        try {
          const startHour = parseInt(formData.startTime.split(':')[0]);
          const endHour = parseInt(formData.endTime.split(':')[0]);
          const hours = endHour - startHour;
          
          const availabilityCheck = await ArtistService.checkAvailability(
            artistId,
            formData.eventDate,
            startHour,
            hours
          );
          
          if (!availabilityCheck.isAvailable) {
            throw new Error(`Booking not available: ${availabilityCheck.reason}`);
          }
        } catch (error: any) {
          throw new Error(`Availability check failed: ${error.message}`);
        }
        
        bookingData = {
          artistId,
          eventType: 'private' as const,
          eventDate: formData.eventDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          artistPrice: pricingResponse.artistFee.amount,
          // New flexible multi-day format (for single-day, these are false)
          isArtistMultiDay: false,
          isEquipmentMultiDay: isEquipmentMultiDay,
          equipmentEventDates: isEquipmentMultiDay && formData.equipmentEventDates.length > 0 
            ? formData.equipmentEventDates 
            : undefined,
          userDetails: {
            ...formData.userDetails,
            phone: formatPhoneNumber(selectedCountry.code, formData.userDetails.phone)
          },
          venueDetails: formData.venueDetails,
          eventDescription: formData.eventDescription,
          specialRequests: formData.specialRequests,
          selectedEquipmentPackages: formData.selectedEquipmentPackages,
          selectedCustomPackages: formData.selectedCustomPackages,
        };
      }
      
      // Add total pricing to booking data
      bookingData.equipmentPrice = pricingResponse.equipmentFee.amount;
      bookingData.totalPrice = pricingResponse.totalAmount;
      
    

      const response = await BookingService.createArtistBooking(bookingData);
      
      // Extract booking ID robustly from various response shapes
      const bookingId =
        (response as any)?.data?._id ||
        (response as any)?._id ||
        (response as any)?.id ||
        (response as any)?.bookingId ||
        (response as any)?.data?.booking?._id;

      if (!bookingId) {
        console.error('Unable to determine bookingId from response:', response);
        throw new Error('Unable to create booking: missing booking ID');
      }

      // Prefer server-provided payment link if available
      const serverPaymentLink = (response as any)?.paymentLink;
      if (serverPaymentLink) {
        PaymentService.redirectToPayment(serverPaymentLink);
        return;
      }

      // Fallback: initiate payment from client  
      const paymentData: PaymentInitiateRequest = {
        bookingId,
        amount: pricingResponse.totalAmount,
        type: 'artist', // Use 'artist' type for both artist-only and combined bookings
        description: formData.selectedEquipmentPackages.length > 0 || formData.selectedCustomPackages.length > 0
          ? `Artist & Equipment Booking: ${artist?.user?.firstName || artist?.stageName || 'Artist'}`
          : `Artist Booking: ${artist?.user?.firstName || artist?.stageName || 'Artist'}`,
        customerMobile: formatPhoneNumber(selectedCountry.code, formData.userDetails.phone),
      };

      const paymentResponse = await PaymentService.initiatePayment(paymentData);
      if (!paymentResponse?.paymentLink) {
        throw new Error('Payment link not received from server');
      }
      
      PaymentService.redirectToPayment(paymentResponse.paymentLink);
    } catch (error: any) {
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('bookArtistForm.artistNotFound')}</h2>
            <p className="text-gray-600 mb-4">{t('bookArtistForm.artistNotFoundDesc')}</p>
            <button
              onClick={() => router.back()}
              className="bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-6 py-3 rounded-full hover:from-[#5B2C87] hover:to-[#391C71] transition-colors shadow-lg"
            >
              {t('bookArtistForm.goBack')}
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
              {t('bookArtistForm.backToProfile')}
            </button>
            
            <TranslatedDataWrapper 
              data={artist}
              translateFields={['stageName', 'category', 'bio', 'description', 'specialization', 'skills', 'experience', 'about', 'genre', 'style', 'performPreference', 'musicLanguages', 'awards', 'genres']}
              preserveFields={['pricePerHour', 'profileImage', 'country', 'contactNumber', 'email', '_id', 'user', 'yearsOfExperience', 'youtubeLink', 'createdAt', 'updatedAt']}
              showLoadingOverlay={false}
            >
              {(translatedArtist, isTranslating) => (
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                  {/* Artist Image */}
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-2xl transform rotate-3"></div>
                    <Image
                      src={artist.profileImage || '/default-avatar.png'}
                      alt={(translatedArtist as Artist).stageName}
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">{t('bookArtistForm.title')} {(translatedArtist as Artist).stageName}</h1>
                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      <div className="inline-flex items-center bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                        <User className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                        {(translatedArtist as Artist).category || 'Artist'}
                      </div>
                      <div className="bg-gradient-to-r from-[#391C71]/10 to-purple-100 text-[#391C71] px-4 py-2 rounded-full text-sm font-bold border border-[#391C71]/20">
                        {artist.pricePerHour} KWD/hour
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{artist.user.firstName} {artist.user.lastName}</p>
                  </div>
                </div>
              )}
            </TranslatedDataWrapper>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 rtl:left-auto rtl:right-0 w-20 h-20 bg-gradient-to-br rtl:bg-gradient-to-bl from-[#391C71]/20 to-transparent rounded-br-full rtl:rounded-br-none rtl:rounded-bl-full"></div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-2 mr-3 rtl:mr-0 rtl:ml-3">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              {t('bookArtistForm.bookingProgress')}
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
                  <div className="ml-4 rtl:ml-0 rtl:mr-4 hidden sm:block">
                    <p className={`text-sm font-bold ${
                      stepNumber <= step ? 'text-[#391C71]' : 'text-gray-500'
                    }`}>
                      {stepNumber === 1 && t('bookArtistForm.step1')}
                      {stepNumber === 2 && t('bookArtistForm.step2')}
                      {stepNumber === 3 && t('bookArtistForm.step3')}
                      {stepNumber === 4 && t('bookArtistForm.step4')}
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
          <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 w-28 h-28 bg-gradient-to-bl rtl:bg-gradient-to-br from-[#391C71]/10 to-transparent rounded-bl-full rtl:rounded-bl-none rtl:rounded-br-full"></div>
          <div className="relative z-10">
            {step === 1 && (
              <DateTimeStep
                formData={formData}
                setFormData={setFormData}
                availability={availability}
                errors={errors}
                setErrors={setErrors}
                isMultiDayBooking={isMultiDayBooking}
                setIsMultiDayBooking={setIsMultiDayBooking}
                onMonthChange={handleMonthChange}
                artistId={artistId}
                artist={artist}
                fetchDateAvailability={fetchDateAvailability}
                t={t}
              />
            )}
            
            {step === 2 && (
              <EventDetailsStep
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                selectedCountry={selectedCountry}
                setSelectedCountry={setSelectedCountry}
                t={t}
              />
            )}
            
            {step === 3 && (
              <EquipmentStep
                formData={formData}
                setFormData={setFormData}
                equipmentPackages={equipmentPackages}
                customPackages={customPackages}
                errors={errors}
                onCreateCustomPackage={() => setShowCreatePackageModal(true)}
                isMultiDayBooking={isMultiDayBooking}
                isEquipmentMultiDay={isEquipmentMultiDay}
                setIsEquipmentMultiDay={setIsEquipmentMultiDay}
                t={t}
              />
            )}
            
            {step === 4 && (
              <ReviewStep
                formData={formData}
                artist={artist}
                equipmentPackages={equipmentPackages}
                customPackages={customPackages}
                isMultiDayBooking={isMultiDayBooking}
                isEquipmentMultiDay={isEquipmentMultiDay}
                t={t}
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
                {t('bookArtistForm.previous')}
              </button>
              
              {step < 4 ? (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white rounded-2xl hover:from-[#5B2C87] hover:to-[#391C71] hover:shadow-xl hover:scale-105 font-bold transition-all duration-300 shadow-lg flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative z-10">{t('bookArtistForm.next')}</span>
                  <ArrowLeft className="w-4 h-4 rotate-180 relative z-10" />
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="px-8 py-3 bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white rounded-2xl hover:from-[#5B2C87] hover:to-[#391C71] hover:shadow-xl hover:scale-105 font-bold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    {addingToCart ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white relative z-10"></div>
                        <span className="relative z-10">{t('bookArtistForm.addingToCart') || 'Adding to Cart'}</span>
                      </>
                    ) : (
                      <>
                        <Package className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">{t('bookArtistForm.addToCart') || 'Add to Cart'}</span>
                      </>
                    )}
                  </button>

                  {/* Book Now */}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-emerald-600 hover:to-green-500 hover:shadow-xl hover:scale-105 font-bold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white relative z-10"></div>
                        <span className="relative z-10">{t('bookArtistForm.processing')}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">{t('bookArtistForm.completeBooking')}</span>
                      </>
                    )}
                  </button>
                </div>
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

      {/* Create Custom Package Modal */}
      <CreateCustomPackageModal
        isOpen={showCreatePackageModal}
        onClose={() => setShowCreatePackageModal(false)}
        onPackageCreated={handlePackageCreated}
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
  t: any; // Translation function
}

interface EventDetailsStepProps extends StepProps {
  selectedCountry: Country;
  setSelectedCountry: (country: Country) => void;
}

function DateTimeStep({ formData, setFormData, availability, errors, setErrors, isMultiDayBooking, setIsMultiDayBooking, onMonthChange, artistId, artist, fetchDateAvailability, t }: StepProps & { 
  availability: AvailabilityData;
  setErrors: (errors: { [key: string]: string }) => void;
  isMultiDayBooking: boolean;
  setIsMultiDayBooking: (value: boolean) => void;
  onMonthChange: (month: number, year: number) => Promise<void>;
  artistId: string;
  artist: Artist | null;
  fetchDateAvailability: (date: string) => Promise<any>;
}) {
  const [isMultiDay, setIsMultiDay] = useState(isMultiDayBooking);
  const [focusedDate, setFocusedDate] = useState<string>(''); // Track which date is currently being viewed in calendar

  const clearValidationErrors = () => {
    // Clear any existing validation errors when user makes selections
    setErrors({});
  };

  const handleDateSelect = async (date: string) => {
    // Clear validation errors when date is selected
    clearValidationErrors();
    
    // Fetch availability for this specific date
    try {
      await fetchDateAvailability(date);
      
      if (isMultiDay) {
        // Multi-day mode: Add to eventDates array if not exists, or focus on existing date
        const existingDate = formData.eventDates.find(d => d.date === date);
        if (!existingDate) {
          setFormData({ 
            ...formData, 
            eventDates: [...formData.eventDates, { date, startTime: '', endTime: '' }]
          });
        }
        setFocusedDate(date); // Set this date as focused for calendar display
      } else {
        // Single-day mode: Set eventDate
        setFormData({ ...formData, eventDate: date });
      }
    } catch (error) {
      // Still set the date even if availability fetch fails
      if (isMultiDay) {
        const existingDate = formData.eventDates.find(d => d.date === date);
        if (!existingDate) {
          setFormData({ 
            ...formData, 
            eventDates: [...formData.eventDates, { date, startTime: '', endTime: '' }]
          });
        }
        setFocusedDate(date); // Set this date as focused for calendar display
      } else {
        setFormData({ ...formData, eventDate: date });
      }
    }
  };

  const handleTimeSelect = (startTime: string, endTime: string, totalCost?: number) => {
    // Clear validation errors when time is selected
    clearValidationErrors();
    
    if (isMultiDay && focusedDate) {
      // Multi-day mode: Update the focused date's time
      updateMultiDayTime(focusedDate, startTime, endTime);
    } else if (!isMultiDay) {
      setFormData({ 
        ...formData, 
        startTime, 
        endTime 
      });
    }
    
    // Optional: Store the dynamic pricing cost if provided
    if (totalCost !== undefined) {
      console.log('Dynamic pricing cost received:', totalCost);
      // You could store this in state if needed for display
    }
  };

  const handleMultiDayToggle = () => {
    const newIsMultiDay = !isMultiDay;
    setIsMultiDay(newIsMultiDay);
    setIsMultiDayBooking(newIsMultiDay); // Update parent state
    
    // Clear validation errors when switching modes
    clearValidationErrors();
    
    // Clear existing selections when switching modes
    if (!isMultiDay) {
      // Switching to multi-day: move single date to array
      if (formData.eventDate) {
        setFormData({
          ...formData,
          eventDates: [{ date: formData.eventDate, startTime: formData.startTime, endTime: formData.endTime }],
          eventDate: '',
          startTime: '',
          endTime: ''
        });
        setFocusedDate(formData.eventDate); // Focus on the moved date
      }
    } else {
      // Switching to single-day: clear multi-day data
      setFormData({
        ...formData,
        eventDates: [],
        eventDate: '',
        startTime: '',
        endTime: ''
      });
      setFocusedDate(''); // Clear focused date
    }
  };

  const removeDateFromMultiDay = (dateToRemove: string) => {
    const newEventDates = formData.eventDates.filter(d => d.date !== dateToRemove);
    setFormData({
      ...formData,
      eventDates: newEventDates
    });
    
    // If we removed the focused date, focus on the first remaining date
    if (focusedDate === dateToRemove) {
      const newFocusedDate = newEventDates.length > 0 ? newEventDates[0].date : '';
      setFocusedDate(newFocusedDate);
      if (newFocusedDate) {
        fetchDateAvailability(newFocusedDate);
      }
    }
  };

  const updateMultiDayTime = (date: string, startTime: string, endTime: string) => {
    // Clear validation errors when time is updated
    clearValidationErrors();
    
    // Basic validation: ensure end time is after start time
    if (startTime && endTime) {
      const startHour = parseInt(startTime.split(':')[0]);
      const endHour = parseInt(endTime.split(':')[0]);
      
      if (endHour <= startHour) {
        // Reset end time if it's not after start time
        endTime = '';
      }
    }
    
    setFormData({
      ...formData,
      eventDates: formData.eventDates.map(d => 
        d.date === date ? { ...d, startTime, endTime } : d
      )
    });
  };

  const handleMonthChange = async (month: number, year: number) => {
    await onMonthChange(month, year);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{t('bookArtistForm.dateTime')}</h2>
        
        {/* Multi-day booking toggle */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="text-sm font-medium text-gray-700">{t('bookArtistForm.singleDay')}</span>
          <button
            onClick={handleMultiDayToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isMultiDay ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isMultiDay ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm font-medium text-gray-700">{t('bookArtistForm.multipleDays')}</span>
        </div>
      </div>

      {/* Multi-day mode info */}
      {isMultiDay && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 mr-2 rtl:mr-0 rtl:ml-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-800 font-medium">{t('bookArtistForm.multiDayBooking')}</p>
              <p className="text-blue-700 text-sm mt-1">
                {t('bookArtistForm.multiDayInfo', { hours: artist?.maximumPerformanceHours || 4 })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected dates display for multi-day */}
      {isMultiDay && formData.eventDates.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">{t('bookArtistForm.selectedDates')}</h3>
          <p className="text-sm text-gray-600">{t('bookArtistForm.clickToEditTime')}</p>
          {formData.eventDates.map((dateItem, index) => (
            <div 
              key={dateItem.date} 
              className={`rounded-lg p-4 border cursor-pointer transition-all ${
                focusedDate === dateItem.date 
                  ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-200' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => {
                setFocusedDate(dateItem.date);
                fetchDateAvailability(dateItem.date);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className={`font-medium ${focusedDate === dateItem.date ? 'text-purple-900' : 'text-gray-900'}`}>
                        {t('bookArtistForm.day')} {index + 1}: {dateItem.date}
                      </span>
                      {focusedDate === dateItem.date && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          {t('bookArtistForm.editing')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <select
                        value={dateItem.startTime ? dateItem.startTime.split(':')[0] : ''}
                        onChange={(e) => updateMultiDayTime(dateItem.date, `${e.target.value}:00`, dateItem.endTime)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="">{t('bookArtistForm.startHour')}</option>
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}:00
                          </option>
                        ))}
                      </select>
                      <span className="text-gray-500">{t('bookArtistForm.to')}</span>
                      <select
                        value={dateItem.endTime ? dateItem.endTime.split(':')[0] : ''}
                        onChange={(e) => updateMultiDayTime(dateItem.date, dateItem.startTime, `${e.target.value}:00`)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        disabled={!dateItem.startTime}
                      >
                        <option value="">{t('bookArtistForm.endHour')}</option>
                        {Array.from({ length: 24 }, (_, i) => {
                          const startHour = dateItem.startTime ? parseInt(dateItem.startTime.split(':')[0]) : -1;
                          const maxHours = artist?.maximumPerformanceHours || 8;
                          
                          // Only show hours that are:
                          // 1. After the start time
                          // 2. Within the maximum performance hours limit
                          if (i > startHour && i <= startHour + maxHours && i <= 23) {
                            return (
                              <option key={i} value={i.toString().padStart(2, '0')}>
                                {i.toString().padStart(2, '0')}:00
                              </option>
                            );
                          }
                          return null;
                        })}
                      </select>
                      {dateItem.startTime && dateItem.endTime && (
                        <span className="text-xs text-gray-500 ml-2 rtl:ml-0 rtl:mr-2">
                          ({parseInt(dateItem.endTime.split(':')[0]) - parseInt(dateItem.startTime.split(':')[0])} {t('bookArtistForm.hrs')})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeDateFromMultiDay(dateItem.date)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <AvailabilityCalendar
        availability={availability}
        selectedDate={
          isMultiDay 
            ? (focusedDate || (formData.eventDates.length > 0 ? formData.eventDates[0].date : ''))
            : formData.eventDate
        }
        selectedStartTime={
          isMultiDay 
            ? (formData.eventDates.find(d => d.date === focusedDate)?.startTime || '')
            : formData.startTime
        }
        selectedEndTime={
          isMultiDay 
            ? (formData.eventDates.find(d => d.date === focusedDate)?.endTime || '')
            : formData.endTime
        }
        onDateSelect={handleDateSelect}
        onTimeSelect={handleTimeSelect}
        onMonthChange={handleMonthChange}
        artistProfileId={artistId}
        performanceType="private"
        maxDuration={artist?.maximumPerformanceHours || 4}
        showPricing={true}
        userRole="user"
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

function EventDetailsStep({ formData, setFormData, errors, selectedCountry, setSelectedCountry, t }: EventDetailsStepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">{t('bookArtistForm.eventDetails')}</h2>
      
      {/* User Details */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('bookArtistForm.userDetails')}</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('bookArtistForm.name')}
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
              {t('bookArtistForm.email')}
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
              {t('bookArtistForm.phone')}
            </label>
            <div className="flex">
              <CountryCodeDropdown
                selectedCountry={selectedCountry}
                onCountrySelect={setSelectedCountry}
                buttonClassName="border-r-0 rounded-r-none"
              />
              <input
                type="tel"
                value={formData.userDetails.phone}
                onChange={(e) => setFormData({
                  ...formData,
                  userDetails: { ...formData.userDetails, phone: e.target.value }
                })}
                className="flex-1 px-3 py-2 border border-gray-300 border-l-0 rounded-r-lg focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter phone number"
              />
            </div>
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
        </div>
      </div>
      
      {/* Venue Details */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('bookArtistForm.venueDetails')}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('bookArtistForm.address')}
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
              {t('bookArtistForm.city')}
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
              {t('bookArtistForm.state')}
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
              {t('bookArtistForm.country')}
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
              {t('bookArtistForm.postalCode')}
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('bookArtistForm.additionalInfo')}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('bookArtistForm.eventDescription')}
            </label>
            <textarea
              rows={3}
              value={formData.eventDescription}
              onChange={(e) => setFormData({ ...formData, eventDescription: e.target.value })}
              placeholder={t('bookArtistForm.eventDescriptionPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('bookArtistForm.specialRequests')}
            </label>
            <textarea
              rows={3}
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              placeholder={t('bookArtistForm.specialRequestsPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function EquipmentStep({ 
  formData, 
  setFormData, 
  equipmentPackages, 
  customPackages, 
  errors,
  onCreateCustomPackage,
  isMultiDayBooking,
  isEquipmentMultiDay,
  setIsEquipmentMultiDay,
  t
}: StepProps & { 
  equipmentPackages: EquipmentPackage[];
  customPackages: CustomEquipmentPackage[];
  onCreateCustomPackage?: () => void;
  isMultiDayBooking: boolean;
  isEquipmentMultiDay: boolean;
  setIsEquipmentMultiDay: (value: boolean) => void;
}) {
  const [activePackageTab, setActivePackageTab] = useState<'regular' | 'custom'>('regular');

  const calculateEquipmentPrice = () => {
    let total = 0;
    
   
    
    let equipmentDays = 1; 
    
    if (isEquipmentMultiDay && formData.equipmentEventDates.length > 0) {
      equipmentDays = formData.equipmentEventDates.length;
    }
    else if (!isEquipmentMultiDay && isMultiDayBooking && formData.eventDates.length > 0) {
    
      equipmentDays = 1;
    }
    
    formData.selectedEquipmentPackages.forEach(packageId => {
      const pkg = equipmentPackages.find(p => p._id === packageId);
      if (pkg) {
      
        total += pkg.totalPrice * (isEquipmentMultiDay ? equipmentDays : 1);
      }
    });
    
    formData.selectedCustomPackages.forEach(packageId => {
      const customPkg = (Array.isArray(customPackages) ? customPackages : []).find(p => p._id === packageId);
      if (customPkg) {
        total += customPkg.totalPricePerDay * equipmentDays;
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

  const toggleCustomPackageSelection = (packageId: string) => {
    const currentSelection = [...formData.selectedCustomPackages];
    const index = currentSelection.indexOf(packageId);
    
    if (index > -1) {
      currentSelection.splice(index, 1);
    } else {
      currentSelection.push(packageId);
    }
    
    setFormData({
      ...formData,
      selectedCustomPackages: currentSelection
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{t('bookArtistForm.equipmentOptional')}</h2>
        <div className="text-right">
          <p className="text-sm text-gray-600">{t('bookArtistForm.selectedEquipmentCost')}</p>
          <p className="text-lg font-semibold text-purple-600">{calculateEquipmentPrice()} KWD</p>
          {(formData.selectedEquipmentPackages.length > 0 || formData.selectedCustomPackages.length > 0) && (
            <p className="text-xs text-gray-500">
              {isEquipmentMultiDay 
                ? `Equipment rental: ${formData.equipmentEventDates.length > 0 ? formData.equipmentEventDates.length : 1} day(s)`
                : 'Equipment: Standard rental (1 event)'
              }
            </p>
          )}
        </div>
      </div>
      
      <p className="text-gray-600">
        {t('bookArtistForm.enhanceEvent')}
      </p>

      {/* Equipment Multi-Day Selection */}
      {(formData.selectedEquipmentPackages.length > 0 || formData.selectedCustomPackages.length > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Equipment Rental Duration</h3>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isEquipmentMultiDay}
                onChange={(e) => setIsEquipmentMultiDay(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
              />
              <span className="text-gray-700 font-medium">
                Rent equipment for different duration than artist performance
              </span>
            </label>
            
            {isEquipmentMultiDay && (
              <div className="ml-7 p-4 bg-white rounded border border-blue-200 space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    Equipment can be rented for different dates/duration than the artist performance
                  </p>
                  
                  {/* Equipment Dates List */}
                  {formData.equipmentEventDates.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <h4 className="font-medium text-gray-800">Equipment Rental Dates:</h4>
                      {formData.equipmentEventDates.map((dateSlot, index) => (
                        <div key={index} className="bg-gray-50 rounded border p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-gray-800">Equipment Day {index + 1}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newDates = formData.equipmentEventDates.filter((_, i) => i !== index);
                                setFormData({
                                  ...formData,
                                  equipmentEventDates: newDates
                                });
                              }}
                              className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                              title="Remove this date"
                            >
                              × Remove
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                              <input
                                type="date"
                                value={dateSlot.date}
                                onChange={(e) => {
                                  const updatedDates = [...formData.equipmentEventDates];
                                  updatedDates[index] = { ...updatedDates[index], date: e.target.value };
                                  setFormData({
                                    ...formData,
                                    equipmentEventDates: updatedDates
                                  });
                                }}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                                min={new Date().toISOString().split('T')[0]}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                              <input
                                type="time"
                                value={dateSlot.startTime}
                                onChange={(e) => {
                                  const updatedDates = [...formData.equipmentEventDates];
                                  updatedDates[index] = { ...updatedDates[index], startTime: e.target.value };
                                  setFormData({
                                    ...formData,
                                    equipmentEventDates: updatedDates
                                  });
                                }}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
                              <input
                                type="time"
                                value={dateSlot.endTime}
                                onChange={(e) => {
                                  const updatedDates = [...formData.equipmentEventDates];
                                  updatedDates[index] = { ...updatedDates[index], endTime: e.target.value };
                                  setFormData({
                                    ...formData,
                                    equipmentEventDates: updatedDates
                                  });
                                }}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Equipment Date */}
                  <div className="border border-dashed border-gray-300 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      {formData.equipmentEventDates.length === 0 ? 'Set Equipment Rental Dates' : 'Add Another Date'}
                    </h4>
                    
                    <AddEquipmentDateForm 
                      onAddDate={(newDate) => {
                        setFormData({
                          ...formData,
                          equipmentEventDates: [...formData.equipmentEventDates, newDate]
                        });
                      }}
                      existingDatesCount={formData.equipmentEventDates.length}
                    />

                    {formData.equipmentEventDates.length === 0 && (
                      <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm text-blue-800 mb-2">
                          💡 <strong>Equipment Rental Options:</strong>
                        </p>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Set different dates from your artist performance</li>
                          <li>• Rent for longer or shorter duration</li>
                          <li>• Add setup/breakdown time if needed</li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Comparison Summary */}
                  {formData.equipmentEventDates.length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h5 className="text-sm font-medium text-green-800 mb-2">📋 Booking Summary Comparison</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="font-medium text-green-700 mb-1">Artist Performance:</p>
                          {isMultiDayBooking && formData.eventDates.length > 0 ? (
                            <ul className="text-green-600 space-y-1">
                              {formData.eventDates.map((date, index) => (
                                <li key={index}>Day {index + 1}: {date.date} • {date.startTime}-{date.endTime}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-green-600">{formData.eventDate} • {formData.startTime}-{formData.endTime}</p>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-green-700 mb-1">Equipment Rental:</p>
                          <ul className="text-green-600 space-y-1">
                            {formData.equipmentEventDates.map((date, index) => (
                              <li key={index}>Day {index + 1}: {date.date} • {date.startTime}-{date.endTime}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        // Copy artist dates as starting point
                        if (isMultiDayBooking && formData.eventDates.length > 0) {
                          setFormData({
                            ...formData,
                            equipmentEventDates: [...formData.eventDates]
                          });
                        } else if (formData.eventDate) {
                          setFormData({
                            ...formData,
                            equipmentEventDates: [{
                              date: formData.eventDate,
                              startTime: formData.startTime,
                              endTime: formData.endTime
                            }]
                          });
                        }
                      }}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                    >
                      Copy from Artist Dates
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          equipmentEventDates: []
                        });
                      }}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      disabled={formData.equipmentEventDates.length === 0}
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {!isEquipmentMultiDay && (formData.selectedEquipmentPackages.length > 0 || formData.selectedCustomPackages.length > 0) && (
              <div className="ml-7 text-sm text-gray-600">
                Equipment will be rented for the same duration as artist performance
                {isMultiDayBooking && formData.eventDates.length > 0 && (
                  <span className="font-medium text-blue-700">
                    {' '}({formData.eventDates.length} days)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Package Type Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 max-w-md">
        <button
          onClick={() => setActivePackageTab('regular')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activePackageTab === 'regular'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Package className="w-4 h-4" />
          {t('bookArtistForm.providerPackagesTab')} ({equipmentPackages.length})
        </button>
        <button
          onClick={() => setActivePackageTab('custom')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activePackageTab === 'custom'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          {t('bookArtistForm.customPackagesTab')} ({Array.isArray(customPackages) ? customPackages.length : 0})
        </button>
      </div>
      
      {activePackageTab === 'regular' ? (
        /* Provider Packages */
        equipmentPackages.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{t('bookArtistForm.noEquipmentAvailable')}</p>
          </div>
        ) : (
          <TranslatedDataWrapper 
            data={equipmentPackages}
            translateFields={['name', 'description', 'category', 'features', 'specifications', 'adminNotes']}
            preserveFields={['totalPrice', 'coverImage', 'imageUrl', '_id', 'createdBy', 'status', 'visibility', 'roleRef', 'createdAt', 'updatedAt', 'pricePerDay', 'quantity', 'images', 'items']}
            showLoadingOverlay={false}
          >
            {(translatedPackages, isTranslating) => (
              <div className="grid md:grid-cols-2 gap-6">
                {(translatedPackages as EquipmentPackage[]).map((pkg) => (
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
                <p className="text-lg font-bold text-purple-600">{pkg.totalPrice} KWD</p>
                <p className="text-xs text-gray-500">
                  {pkg.items.length} {t('bookArtistForm.itemsIncluded')}
                </p>
              </div>
              
              {/* Package Items */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">{t('bookArtistForm.includes')}</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {pkg.items.slice(0, 3).map((item, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                      {item.quantity}x {item.equipmentId.name}
                    </li>
                  ))}
                  {pkg.items.length > 3 && (
                    <li className="text-purple-600">
                      +{pkg.items.length - 3} {t('bookArtistForm.moreItems')}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
            )}
          </TranslatedDataWrapper>
        )
      ) : (
        /* Custom Packages */
        <div className="space-y-4">
          {/* Create Custom Package Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">{t('bookArtistForm.yourCustomPackages')}</h3>
            <button
              onClick={() => onCreateCustomPackage?.()}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white rounded-lg hover:from-[#5B2C87] hover:to-[#391C71] font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              {t('bookArtistForm.createPackage')}
            </button>
          </div>

          {(Array.isArray(customPackages) ? customPackages : []).length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">{t('bookArtistForm.noCustomPackages')}</p>
              <button
                onClick={() => onCreateCustomPackage?.()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white rounded-xl hover:from-[#5B2C87] hover:to-[#391C71] font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                {t('bookArtistForm.createFirstPackage')}
              </button>
            </div>
          ) : (
            <TranslatedDataWrapper
              data={Array.isArray(customPackages) ? customPackages : []}
              translateFields={['name', 'description']}
              preserveFields={['_id', 'totalPricePerDay', 'items']}
            >
              {(translatedCustomPackages) => (
                <div className="grid md:grid-cols-2 gap-6">
                  {translatedCustomPackages.map((pkg) => (
              <div
                key={pkg._id}
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  formData.selectedCustomPackages.includes(pkg._id)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleCustomPackageSelection(pkg._id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                  <div className="flex items-center">
                    {formData.selectedCustomPackages.includes(pkg._id) ? (
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
                
                <div className="space-y-2">
                  <p className="text-lg font-bold text-purple-600">{pkg.totalPricePerDay} KWD/day</p>
                  <p className="text-xs text-gray-500">
                    {pkg.items.length} {t('bookArtistForm.itemsIncluded')}
                  </p>
                </div>
                
                {/* Package Items Preview */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">{t('bookArtistForm.equipmentLabel')}</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {pkg.items.slice(0, 3).map((item, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                        {item.quantity}x {item.equipmentId.name}
                      </li>
                    ))}
                    {pkg.items.length > 3 && (
                      <li className="text-purple-600">
                        +{pkg.items.length - 3} {t('bookArtistForm.moreItems')}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>
                )}
              </TranslatedDataWrapper>
            )}
        </div>
      )}
      
      {(formData.selectedEquipmentPackages.length > 0 || formData.selectedCustomPackages.length > 0) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-green-800 font-medium">
              {formData.selectedEquipmentPackages.length + formData.selectedCustomPackages.length} {t('bookArtistForm.packagesSelected')}
            </p>
          </div>
          {formData.selectedEquipmentPackages.length > 0 && (
            <p className="text-green-700 text-sm">
              {t('bookArtistForm.providerPackagesCount')} {formData.selectedEquipmentPackages.length}
            </p>
          )}
          {formData.selectedCustomPackages.length > 0 && (
            <p className="text-green-700 text-sm">
              {t('bookArtistForm.customPackagesCount')} {formData.selectedCustomPackages.length}
            </p>
          )}
          <p className="text-green-700 text-sm font-medium">
            {t('bookArtistForm.totalEquipmentCostLabel')} {calculateEquipmentPrice()} KWD
          </p>
        </div>
      )}
    </div>
  );
}

function ReviewStep({ 
  formData, 
  artist, 
  equipmentPackages, 
  customPackages, 
  isMultiDayBooking,
  isEquipmentMultiDay,
  t 
}: { 
  formData: BookingFormData; 
  artist: Artist; 
  equipmentPackages: EquipmentPackage[];
  customPackages: CustomEquipmentPackage[];
  isMultiDayBooking: boolean;
  isEquipmentMultiDay: boolean;
  t: any;
}) {
  const [artistPrice, setArtistPrice] = useState<number>(0);
  const [isDynamicPricing, setIsDynamicPricing] = useState<boolean>(false);
  const [loadingPrice, setLoadingPrice] = useState<boolean>(false);
  
  // Calculate booking details based on single or multi-day
  const bookingDetails = isMultiDayBooking 
    ? formData.eventDates.map(dateItem => {
        const startHour = parseInt(dateItem.startTime.split(':')[0]);
        const endHour = parseInt(dateItem.endTime.split(':')[0]);
        const hours = endHour - startHour;
        return { 
          date: dateItem.date, 
          startTime: dateItem.startTime, 
          endTime: dateItem.endTime, 
          startHour, 
          hours 
        };
      })
    : [{
        date: formData.eventDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        startHour: parseInt(formData.startTime.split(':')[0]),
        hours: parseInt(formData.endTime.split(':')[0]) - parseInt(formData.startTime.split(':')[0])
      }];
  
  const totalHours = bookingDetails.reduce((sum, detail) => sum + detail.hours, 0);
  
  // Calculate artist price using optimized backend pricing
  useEffect(() => {
    const calculateArtistPrice = async () => {
      if (bookingDetails.some(detail => !detail.startTime || !detail.endTime)) {
        setLoadingPrice(false);
        return;
      }
      
      // Add a slight delay before showing loading spinner to avoid flash
      const loadingTimer = setTimeout(() => {
        setLoadingPrice(true);
      }, 300);
      try {
        // Use new optimized pricing calculation
        const pricingData = {
          artistId: artist._id,
          eventType: 'private' as const,
          ...(isMultiDayBooking ? {
            eventDates: bookingDetails.map(detail => ({
              date: detail.date,
              startTime: detail.startTime,
              endTime: detail.endTime
            }))
          } : {
            eventDate: bookingDetails[0].date,
            startTime: bookingDetails[0].startTime,
            endTime: bookingDetails[0].endTime
          }),
          selectedEquipmentPackages: [], // Equipment calculated separately below
          selectedCustomPackages: []
        };

        const pricingResponse = await BookingService.calculateBookingPricing(pricingData);
        
        setArtistPrice(pricingResponse.artistFee.amount);
        setIsDynamicPricing(true);
        
      } catch (error) {
        // Fallback to legacy pricing if new endpoint fails
        try {
          if (isMultiDayBooking) {
            
            const pricingResponse = await ArtistService.calculateBookingCost(
              artist._id,
              'private',
              8, // Standard start time for pricing calculation
              totalHours // Use total hours to get correct pricing tier
            );
            
            setArtistPrice(pricingResponse.totalCost);
            setIsDynamicPricing(true);
          } else {
            // For single-day bookings, use the day-specific calculation
            const detail = bookingDetails[0];
            const pricingResponse = await ArtistService.calculateBookingCost(
              artist._id,
              'private',
              detail.startHour,
              detail.hours
            );
            
            setArtistPrice(pricingResponse.totalCost);
            setIsDynamicPricing(true);
          }
        } catch (legacyError) {
          // Final fallback to static pricing
          const legacyPrice = (artist.pricePerHour || 0) * totalHours;
          setArtistPrice(legacyPrice);
          setIsDynamicPricing(false);
        }
      }
      
      // Clear the loading timer and set loading to false
      clearTimeout(loadingTimer);
      setLoadingPrice(false);
    };
    
    calculateArtistPrice();
  }, [bookingDetails, artist._id, artist.pricePerHour, totalHours, isMultiDayBooking]);
  
  // Get selected packages
  const selectedPackages = equipmentPackages.filter(pkg => 
    formData.selectedEquipmentPackages.includes(pkg._id)
  );
  const selectedCustomPackages = (Array.isArray(customPackages) ? customPackages : []).filter(pkg => 
    formData.selectedCustomPackages.includes(pkg._id)
  );
  
  // Calculate equipment price using the exact same logic as EquipmentStep
  const calculateEquipmentPrice = () => {
    let total = 0;
    
    let equipmentDays = 1; 
    
    if (isEquipmentMultiDay && formData.equipmentEventDates.length > 0) {
      equipmentDays = formData.equipmentEventDates.length;
    }
    else if (!isEquipmentMultiDay && isMultiDayBooking && formData.eventDates.length > 0) {
      equipmentDays = 1;
    }
    
    formData.selectedEquipmentPackages.forEach(packageId => {
      const pkg = equipmentPackages.find(p => p._id === packageId);
      if (pkg) {
        total += pkg.totalPrice * (isEquipmentMultiDay ? equipmentDays : 1);
      }
    });
    
    formData.selectedCustomPackages.forEach(packageId => {
      const customPkg = (Array.isArray(customPackages) ? customPackages : []).find(p => p._id === packageId);
      if (customPkg) {
        total += customPkg.totalPricePerDay * equipmentDays;
      }
    });
    
    return total;
  };
  
  const equipmentPrice = calculateEquipmentPrice();
  
  const totalPrice = artistPrice + equipmentPrice;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">{t('bookArtistForm.reviewYourBooking')}</h2>
      
      {/* Booking Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('bookArtistForm.bookingSummary')}</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>{t('bookArtistForm.artistLabel')}</span>
            <span className="font-medium">{artist.stageName}</span>
          </div>
          
          {/* Multi-day or single-day display */}
          {isMultiDayBooking ? (
            <>
              <div className="flex justify-between">
                <span>{t('bookArtistForm.bookingType')}</span>
                <span className="font-medium">{t('bookArtistForm.multiDay')} ({bookingDetails.length} {t('bookArtistForm.daysLabel')})</span>
              </div>
              {bookingDetails.map((detail, index) => (
                <div key={detail.date} className="pl-4 border-l-2 border-purple-200 space-y-2">
                  <div className="flex justify-between">
                    <span>{t('bookArtistForm.dayLabel')} {index + 1}:</span>
                    <span className="font-medium">{detail.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('bookArtistForm.timeLabel')}</span>
                    <span className="font-medium">{detail.startTime} - {detail.endTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('bookArtistForm.durationLabel')}</span>
                    <span className="font-medium">{detail.hours} {t('bookArtistForm.hours')}</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-medium">{t('bookArtistForm.totalDuration')}</span>
                <span className="font-medium">{totalHours} {t('bookArtistForm.hours')}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span>{t('bookArtistForm.dateLabel')}</span>
                <span className="font-medium">{formData.eventDate}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('bookArtistForm.timeLabel')}</span>
                <span className="font-medium">{formData.startTime} - {formData.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('bookArtistForm.durationLabel')}</span>
                <span className="font-medium">{totalHours} {t('bookArtistForm.hours')}</span>
              </div>
            </>
          )}
          
          <div className="flex justify-between">
            <span>{t('bookArtistForm.venueLabel')}</span>
            <span className="font-medium">{formData.venueDetails.city}, {formData.venueDetails.state}</span>
          </div>
        </div>
      </div>
      
      {/* Pricing */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('bookArtistForm.pricingLabel')}</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            {loadingPrice ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 rtl:-ml-0 rtl:-mr-1 mr-3 rtl:mr-0 rtl:ml-3 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('bookArtistForm.calculatingArtistFee')}
              </span>
            ) : isDynamicPricing ? (
              <span>
                {t('bookArtistForm.artistFeeLabel')} ({totalHours} {t('bookArtistForm.hoursDynamicPricing')}):
                <div className="text-xs text-gray-500 mt-1">
                  {isMultiDayBooking 
                    ? `${bookingDetails.length} ${t('bookArtistForm.daysVariableRates')}`
                    : `${t('bookArtistForm.hours')} ${bookingDetails[0]?.startHour}:00 - ${bookingDetails[0]?.startHour + bookingDetails[0]?.hours}:00 ${t('bookArtistForm.hoursVariableRates')}`
                  }
                </div>
              </span>
            ) : (
              <span>{t('bookArtistForm.artistFeeLabel')} ({totalHours} {t('bookArtistForm.artistFeeHourly', { price: artist.pricePerHour })}):</span>
            )}
            <span className="font-medium">
              {loadingPrice ? '...' : `${artistPrice} KWD`}
            </span>
          </div>
          {(selectedPackages.length > 0 || selectedCustomPackages.length > 0) && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">{t('bookArtistForm.equipmentPackagesLabel')}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                  📦 {selectedPackages.length + selectedCustomPackages.length} items
                  {(isEquipmentMultiDay && formData.equipmentEventDates.length > 0) && (
                    <> • {formData.equipmentEventDates.length} day{formData.equipmentEventDates.length !== 1 ? 's' : ''}</>
                  )}
                  {(!isEquipmentMultiDay && isMultiDayBooking && formData.eventDates.length > 0) && (
                    <> • {formData.eventDates.length} day{formData.eventDates.length !== 1 ? 's' : ''}</>
                  )}
                  {(!isEquipmentMultiDay && !isMultiDayBooking) && (
                    <> • 1 day</>
                  )}
                </span>
              </div>
              {selectedPackages.map(pkg => (
                <div key={pkg._id} className="flex justify-between text-sm pl-4">
                  <span>• {pkg.name} ({t('bookArtistForm.providerLabel')}):</span>
                  <span>{pkg.totalPrice} KWD</span>
                </div>
              ))}
              {selectedCustomPackages.map(pkg => (
                <div key={pkg._id} className="flex justify-between text-sm pl-4">
                  <span>• {pkg.name} ({t('bookArtistForm.customLabel')}):</span>
                  <span>{pkg.totalPricePerDay} KWD</span>
                </div>
              ))}
              <div className="flex justify-between font-medium text-purple-600">
                <span>{t('bookArtistForm.equipmentSubtotal')}</span>
                <span>{equipmentPrice} KWD</span>
              </div>
            </div>
          )}
          <div className="border-t pt-3 flex justify-between text-lg font-bold">
            <span>{t('bookArtistForm.totalLabel')}</span>
            <span>{totalPrice} KWD</span>
          </div>
        </div>
      </div>
      
      {/* Contact Details */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('bookArtistForm.contactDetailsLabel')}</h3>
        
        <div className="space-y-2">
          <p><span className="font-medium">{t('bookArtistForm.nameLabel')}</span> {formData.userDetails.name}</p>
          <p><span className="font-medium">{t('bookArtistForm.emailLabel')}</span> {formData.userDetails.email}</p>
          <p><span className="font-medium">{t('bookArtistForm.phoneLabel')}</span> {formData.userDetails.phone}</p>
        </div>
      </div>
      
      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mr-2 rtl:mr-0 rtl:ml-2 mt-0.5" />
          <div>
            <p className="text-blue-800 font-medium mb-2">{t('bookArtistForm.importantNotice')}</p>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• {t('bookArtistForm.bookingSubjectApproval')}</li>
              <li>• {t('bookArtistForm.paymentAfterConfirmation')}</li>
              <li>• {t('bookArtistForm.cancellationPolicy')}</li>
              <li>• {t('bookArtistForm.confirmationEmail')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add Equipment Date Form Component
interface AddEquipmentDateFormProps {
  onAddDate: (date: { date: string; startTime: string; endTime: string }) => void;
  existingDatesCount: number;
}

function AddEquipmentDateForm({ onAddDate, existingDatesCount }: AddEquipmentDateFormProps) {
  const [newDate, setNewDate] = useState({
    date: '',
    startTime: '09:00',
    endTime: '18:00'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDate.date) {
      onAddDate(newDate);
      setNewDate({
        date: '',
        startTime: '09:00', 
        endTime: '18:00'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={newDate.date}
            onChange={(e) => setNewDate(prev => ({ ...prev, date: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input
            type="time"
            value={newDate.startTime}
            onChange={(e) => setNewDate(prev => ({ ...prev, startTime: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input
            type="time"
            value={newDate.endTime}
            onChange={(e) => setNewDate(prev => ({ ...prev, endTime: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            min={newDate.startTime}
            required
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Adding equipment rental day {existingDatesCount + 1}
        </p>
        <button
          type="submit"
          disabled={!newDate.date}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Equipment Date
        </button>
      </div>
    </form>
  );
}