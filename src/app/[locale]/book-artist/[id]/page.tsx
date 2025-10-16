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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Artist Not Found</h2>
          <p className="text-gray-600 mb-4">The artist you're looking for doesn't exist or is not available for booking.</p>
          <button
            onClick={() => router.back()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Artist Profile
          </button>
          
          <div className="flex items-center space-x-4">
            <Image
              src={artist.profileImage || '/default-avatar.png'}
              alt={artist.stageName}
              width={80}
              height={80}
              className="rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Book {artist.stageName}</h1>
              <p className="text-gray-600">{artist.category}</p>
              <p className="text-lg font-semibold text-purple-600">
                ${artist.pricePerHour}/hour
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex items-center ${stepNumber < 4 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNumber <= step
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {stepNumber < step ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    stepNumber <= step ? 'text-purple-600' : 'text-gray-500'
                  }`}>
                    {stepNumber === 1 && 'Date & Time'}
                    {stepNumber === 2 && 'Event Details'}
                    {stepNumber === 3 && 'Equipment'}
                    {stepNumber === 4 && 'Review & Book'}
                  </p>
                </div>
                {stepNumber < 4 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      stepNumber < step ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
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
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={step === 1}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {step < 4 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Error Modal */}
      {errorModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">{errorModal.title}</h3>
            </div>
            <p className="text-gray-600 mb-6">{errorModal.message}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setErrorModal({ show: false, title: '', message: '' })}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setErrorModal({ show: false, title: '', message: '' });
                  router.back();
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
      
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