'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Calendar, Clock, MapPin, User, Phone, Mail, 
  Package, CreditCard, ArrowLeft, AlertCircle, CheckCircle,
  DollarSign, Users, Star, Camera, Sparkles
} from 'lucide-react';
import { equipmentPackagesService, EquipmentPackage } from '@/services/equipment-packages.service';
import { 
  equipmentPackageBookingService, 
  CreateEquipmentPackageBookingRequest 
} from '@/services/equipment-package-booking.service';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TermsAndConditionsModal } from '@/components/booking/TermsAndConditionsModal';
import { TermsAndConditionsService, TermsAndConditions, TermsType } from '@/services/terms-and-conditions.service';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';

interface FormData {
  startDate: string;
  endDate: string;
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
}

const BookEquipmentPackagePage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthLogic();
  
  const [packageData, setPackageData] = useState<EquipmentPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    startDate: '',
    endDate: '',
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
    checking: boolean;
  }>({
    available: true,
    conflicts: [],
    checking: false,
  });

  // Terms and Conditions Modal State
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [terms, setTerms] = useState<TermsAndConditions | null>(null);
  const [termsLoading, setTermsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        userDetails: {
          ...prev.userDetails,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        },
      }));
    }
  }, [user]);

  useEffect(() => {
    fetchPackage();
  }, [id]);

  useEffect(() => {
    if (formData.startDate && formData.endDate && packageData) {
      checkAvailability();
    }
  }, [formData.startDate, formData.endDate, packageData]);

  const fetchPackage = async () => {
    try {
      const pkg = await equipmentPackagesService.getPackageById(id as string);
      setPackageData(pkg);
    } catch (err: any) {
      setError('Failed to load package details');
      console.error('Error fetching package:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!packageData || !formData.startDate || !formData.endDate) return;

    setAvailability(prev => ({ ...prev, checking: true }));
    try {
      const result = await equipmentPackageBookingService.checkPackageAvailability(
        packageData._id,
        formData.startDate,
        formData.endDate
      );
      setAvailability({
        available: result.available,
        conflicts: result.conflicts,
        checking: false,
      });
    } catch (err) {
      setAvailability({
        available: false,
        conflicts: [],
        checking: false,
      });
    }
  };

  const calculateTotalPrice = () => {
    if (!packageData || !formData.startDate || !formData.endDate) return 0;
    
    return equipmentPackageBookingService.calculateTotalPrice(
      packageData.totalPrice,
      formData.startDate,
      formData.endDate
    );
  };

  const calculateNumberOfDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    return equipmentPackageBookingService.calculateNumberOfDays(
      formData.startDate,
      formData.endDate
    );
  };

  const validateForm = () => {
    if (!formData.startDate || !formData.endDate) {
      setError('Please select booking dates');
      return false;
    }

    if (!availability.available) {
      setError('Package is not available for selected dates');
      return false;
    }

    if (!formData.userDetails.name || !formData.userDetails.email || !formData.userDetails.phone) {
      setError('Please fill in all contact details');
      return false;
    }

    if (!formData.venueDetails.address || !formData.venueDetails.city || 
        !formData.venueDetails.state || !formData.venueDetails.country) {
      setError('Please fill in all venue details');
      return false;
    }

    return true;
  };

  const loadTermsAndConditions = async () => {
    setTermsLoading(true);
    try {
      // Load equipment booking terms
      const termsToLoad = await TermsAndConditionsService.getEquipmentBookingTerms();
      
      // Fallback to general booking terms if specific terms not found
      if (!termsToLoad) {
        const fallbackTerms = await TermsAndConditionsService.getGeneralBookingTerms();
        setTerms(fallbackTerms);
      } else {
        setTerms(termsToLoad);
      }
    } catch (error) {
      console.error('Error loading terms and conditions:', error);
      setTerms(null);
    } finally {
      setTermsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !packageData) return;

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
    if (!packageData) return; // Add null check
    
    setSubmitting(true);
    setError('');

    try {
      const bookingData: CreateEquipmentPackageBookingRequest = {
        packageId: packageData._id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        userDetails: formData.userDetails,
        venueDetails: formData.venueDetails,
        eventDescription: formData.eventDescription,
        specialRequests: formData.specialRequests,
      };

      const response = await equipmentPackageBookingService.createBooking(bookingData);
      setSuccess('Package booking created successfully!');
      
      // Redirect to booking details or dashboard after 2 seconds
      setTimeout(() => {
        router.push(`/dashboard/user/bookings`);
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
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

  const updateFormData = (section: keyof FormData, field: string, value: string) => {
    setFormData(prev => {
      const sectionData = prev[section];
      if (typeof sectionData === 'object' && sectionData !== null) {
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [field]: value,
          },
        };
      }
      return {
        ...prev,
        [section]: value,
      };
    });
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
        <div className="relative z-10 flex justify-center items-center h-96 pt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#391C71]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!packageData) {
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
            <Package className="h-16 w-16 text-[#391C71] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Package Not Found</h2>
            <p className="text-gray-600 mb-4">The equipment package you're looking for doesn't exist.</p>
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

  const numberOfDays = calculateNumberOfDays();
  const totalPrice = calculateTotalPrice();

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
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-8">
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
              Back to Packages
            </button>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-3">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Book Equipment Package</h1>
                <p className="text-gray-600 text-lg mt-2">Complete your booking for <span className="font-semibold text-[#391C71]">{packageData.name}</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Package Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 sticky top-6 relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#391C71]/20 to-transparent rounded-bl-full"></div>
              
              <div className="relative z-10">
                {/* Package Image */}
                <div className="mb-6">
                  <div className="relative">
                    {packageData.coverImage || (packageData.images && packageData.images.length > 0) ? (
                      <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-lg">
                        <Image
                          src={packageData.coverImage || packageData.images![0]}
                          alt={packageData.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-[#391C71]/20 to-purple-100 rounded-2xl flex items-center justify-center border border-[#391C71]/20">
                        <Package className="h-16 w-16 text-[#391C71]" />
                      </div>
                    )}
                    
                    {/* Verified Badge */}
                    <div className="absolute -top-2 -right-2 bg-[#391C71] rounded-full p-2 shadow-lg">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Package Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{packageData.name}</h3>
                    <div className="bg-gradient-to-r from-[#391C71]/10 to-purple-100 rounded-2xl p-3 border border-[#391C71]/20">
                      <p className="text-gray-700 text-sm leading-relaxed">{packageData.description}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#391C71]/5 to-purple-50 rounded-2xl p-4 border border-[#391C71]/10">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-600">Price per day:</span>
                      <div className="bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-3 py-1 rounded-full text-sm font-bold">
                        {packageData.totalPrice.toLocaleString()} KWD
                      </div>
                    </div>
                    
                    {numberOfDays > 0 && (
                      <>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium text-gray-600">Number of days:</span>
                          <span className="text-sm font-bold text-[#391C71]">{numberOfDays} days</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-[#391C71]/20">
                          <span className="text-base font-bold text-gray-900">Total Price:</span>
                          <span className="text-2xl font-bold text-[#391C71]">
                            {totalPrice.toLocaleString()} KWD
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-2 mr-3">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      Equipment Included
                    </h4>
                    <div className="space-y-3">
                      {packageData.items.map((item, index) => (
                        <div key={index} className="flex items-center bg-white/50 rounded-xl p-3 border border-white/20">
                          <div className="w-3 h-3 bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full mr-3 flex-shrink-0"></div>
                          <span className="text-sm font-medium text-gray-700">
                            {item.quantity}x {item.equipmentId.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Provider Info */}
                  <div className="bg-gradient-to-r from-[#391C71]/5 to-purple-50 rounded-2xl p-4 border border-[#391C71]/10">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                      <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-1.5 mr-2">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      Provided by
                    </h4>
                    <div className="text-sm font-medium text-[#391C71]">
                      {packageData.createdBy.firstName} {packageData.createdBy.lastName}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Date Selection */}
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#391C71]/10 to-transparent rounded-bl-full"></div>
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-3 mr-4">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    Select Dates
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg transition-all duration-200"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Availability Status */}
                {(formData.startDate && formData.endDate) && (
                  <div className="mt-6 p-4 rounded-2xl border border-white/20 bg-white/30 backdrop-blur-sm">
                    {availability.checking ? (
                      <div className="flex items-center text-[#391C71]">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#391C71] mr-3"></div>
                        <span className="font-medium">Checking availability...</span>
                      </div>
                    ) : availability.available ? (
                      <div className="flex items-center text-green-600">
                        <div className="bg-green-100 rounded-full p-1 mr-3">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <span className="font-semibold">Package is available for selected dates</span>
                      </div>
                    ) : (
                      <div className="text-red-600">
                        <div className="flex items-center mb-3">
                          <div className="bg-red-100 rounded-full p-1 mr-3">
                            <AlertCircle className="h-5 w-5" />
                          </div>
                          <span className="font-semibold">Package is not available for selected dates</span>
                        </div>
                        {availability.conflicts.length > 0 && (
                          <div className="bg-red-50 rounded-xl p-3 text-sm">
                            <p className="font-medium mb-2">Conflicting bookings:</p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                              {availability.conflicts.map((conflict, index) => (
                                <li key={index}>{conflict}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Contact Details */}
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-[#391C71]/20 to-transparent rounded-br-full"></div>
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-3 mr-4">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    Contact Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.userDetails.name}
                        onChange={(e) => updateFormData('userDetails', 'name', e.target.value)}
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg transition-all duration-200"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.userDetails.email}
                        onChange={(e) => updateFormData('userDetails', 'email', e.target.value)}
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg transition-all duration-200"
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.userDetails.phone}
                        onChange={(e) => updateFormData('userDetails', 'phone', e.target.value)}
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Venue Details */}
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#391C71]/10 to-transparent rounded-bl-full"></div>
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-3 mr-4">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    Venue Details
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Address
                      </label>
                      <input
                        type="text"
                        value={formData.venueDetails.address}
                        onChange={(e) => updateFormData('venueDetails', 'address', e.target.value)}
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg transition-all duration-200"
                        placeholder="Street address"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.venueDetails.city}
                          onChange={(e) => updateFormData('venueDetails', 'city', e.target.value)}
                          className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg transition-all duration-200"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          State
                        </label>
                        <input
                          type="text"
                          value={formData.venueDetails.state}
                          onChange={(e) => updateFormData('venueDetails', 'state', e.target.value)}
                          className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg transition-all duration-200"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Country
                        </label>
                        <input
                          type="text"
                          value={formData.venueDetails.country}
                          onChange={(e) => updateFormData('venueDetails', 'country', e.target.value)}
                          className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg transition-all duration-200"
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
                          onChange={(e) => updateFormData('venueDetails', 'postalCode', e.target.value)}
                          className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg transition-all duration-200"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Venue Type
                        </label>
                        <select
                          value={formData.venueDetails.venueType}
                          onChange={(e) => updateFormData('venueDetails', 'venueType', e.target.value)}
                          className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg transition-all duration-200"
                        >
                          <option value="">Select venue type</option>
                          <option value="outdoor">Outdoor</option>
                          <option value="indoor">Indoor</option>
                          <option value="hotel">Hotel</option>
                          <option value="restaurant">Restaurant</option>
                          <option value="conference_center">Conference Center</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Additional Info
                      </label>
                      <textarea
                        value={formData.venueDetails.additionalInfo}
                        onChange={(e) => updateFormData('venueDetails', 'additionalInfo', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg transition-all duration-200"
                        placeholder="Any specific venue details or instructions..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-[#391C71]/20 to-transparent rounded-br-full"></div>
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-3 mr-4">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    Event Details
                    <span className="ml-3 text-sm font-normal text-gray-600">(Optional)</span>
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Event Description
                      </label>
                      <textarea
                        value={formData.eventDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, eventDescription: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg transition-all duration-200 resize-none"
                        placeholder="Tell us about your event..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Special Requests
                      </label>
                      <textarea
                        value={formData.specialRequests}
                        onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] shadow-lg transition-all duration-200 resize-none"
                        placeholder="Any special requirements or requests..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#391C71]/20 to-transparent rounded-bl-full"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Book?</h3>
                      <p className="text-gray-600">Review your details and submit your booking request.</p>
                      {numberOfDays > 0 && (
                        <div className="mt-3 bg-gradient-to-r from-[#391C71]/10 to-purple-100 rounded-2xl p-3 border border-[#391C71]/20">
                          <p className="text-sm text-[#391C71] font-bold">
                            Total: {totalPrice.toLocaleString()} KWD for {numberOfDays} days
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <button
                      type="submit"
                      disabled={submitting || !availability.available || availability.checking}
                      className="bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-8 py-4 rounded-2xl font-bold hover:from-[#5B2C87] hover:to-[#391C71] hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#391C71] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 transition-all duration-300 shadow-lg min-w-[200px] relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white relative z-10"></div>
                          <span className="relative z-10">Processing...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 relative z-10" />
                          <span className="relative z-10">Book Package</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />

      {/* Glass Notifications */}
      {error && (
        <div className="fixed top-24 right-6 bg-white/90 backdrop-blur-xl text-red-600 p-6 rounded-3xl shadow-2xl border border-white/30 z-50 max-w-md">
          <div className="flex items-start">
            <div className="bg-red-100 rounded-full p-2 mr-4 flex-shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-1">Error</p>
              <p className="text-sm text-gray-700">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="ml-4 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {success && (
        <div className="fixed top-24 right-6 bg-white/90 backdrop-blur-xl text-green-600 p-6 rounded-3xl shadow-2xl border border-white/30 z-50 max-w-md">
          <div className="flex items-start">
            <div className="bg-green-100 rounded-full p-2 mr-4 flex-shrink-0">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-1">Success</p>
              <p className="text-sm text-gray-700">{success}</p>
            </div>
            <button
              onClick={() => setSuccess('')}
              className="ml-4 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              ×
            </button>
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
        subtitle="Please read and accept the terms and conditions to complete your equipment package booking."
        acceptButtonText="Accept & Complete Booking"
        declineButtonText="Cancel Booking"
      />
    </div>
  );
};

export default BookEquipmentPackagePage;