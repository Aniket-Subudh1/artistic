'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Calendar, Clock, MapPin, User, Phone, Mail, 
  Package, CreditCard, ArrowLeft, AlertCircle, CheckCircle,
  DollarSign, Users, Lock
} from 'lucide-react';
import { 
  customEquipmentPackagesService, 
  CustomEquipmentPackage 
} from '@/services/custom-equipment-packages.service';
import { BookingService } from '@/services/booking.service';
import { CountryCodeDropdown, Country, getDefaultCountry, formatPhoneNumber } from '@/components/ui/CountryCodeDropdown';

// Equipment-only booking interface (for custom packages)
interface EquipmentBookingRequest {
  equipments?: Array<{ equipmentId: string; quantity: number }>;
  packages?: string[];
  customPackages?: string[];
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  address?: string;
}

// Equipment booking service
class EquipmentBookingService {
  static async createEquipmentBooking(data: EquipmentBookingRequest) {
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
  const { user } = useAuthLogic();
  
  const [packageData, setPackageData] = useState<CustomEquipmentPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    eventDate: '',
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

  const calculateDays = () => {
    return 1;
  };

  const calculateTotalPrice = () => {
    if (!packageData) return 0;
    return packageData.totalPricePerDay;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!packageData) return;

    // Validate required fields
    if (!formData.eventDate) {
      setError('Please select an event date');
      return;
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
      // Format phone number with country code
      const formattedPhone = formatPhoneNumber(selectedCountry.code, formData.userDetails.phone);
      
      const bookingData: EquipmentBookingRequest = {
        customPackages: [packageData._id],
        equipments: [], // No individual equipment items
        packages: [], // No regular packages
        date: formData.eventDate,
        startTime: '09:00', // Default time since we only need date
        endTime: '18:00', // Default time since we only need date
        totalPrice: calculateTotalPrice(),
        address: `${formData.venueDetails.address}, ${formData.venueDetails.city}, ${formData.venueDetails.state}, ${formData.venueDetails.country}`,
      };

      // Set the formatted phone number in form data for the booking
      const bookingFormData = {
        ...formData,
        userDetails: {
          ...formData.userDetails,
          phone: formattedPhone
        }
      };

      const response = await EquipmentBookingService.createEquipmentBooking(bookingData);
      setSuccess('Custom package booking created successfully!');
      
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
          {/* Package Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 sticky top-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#391C71]/10 to-transparent rounded-br-full"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-purple-100/20 to-transparent rounded-tl-full"></div>
              
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{packageData?.name}</h2>
              
              <p className="text-gray-600 mb-6">{packageData?.description}</p>

              {/* Pricing */}
              <div className="bg-gradient-to-r from-[#391C71] to-[#5B2C87] rounded-xl p-6 text-white mb-6">
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

              {/* Equipment Items */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Equipment Included</h3>
                <div className="space-y-3">
                  {packageData?.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.equipmentId.name}</p>
                        <p className="text-sm text-gray-600">{item.equipmentId.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {item.quantity}x {item.pricePerDay} KWD
                        </p>
                        <p className="text-sm text-gray-600">per day</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

                {/* Notes */}
                {packageData?.notes && (
                  <div className="mt-6 p-4 bg-yellow-50/80 backdrop-blur-sm border border-yellow-200/50 rounded-2xl shadow-lg">
                    <h4 className="font-bold text-yellow-800 mb-2">Your Notes</h4>
                    <p className="text-yellow-700 text-sm">{packageData.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-28 h-28 bg-gradient-to-br from-[#391C71]/10 to-transparent rounded-br-full"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-purple-100/20 to-transparent rounded-tl-full"></div>
              
              <div className="relative z-10">
                <form onSubmit={handleSubmit} className="space-y-8">
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
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#391C71]/10 to-transparent rounded-bl-full"></div>
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-2xl p-2 mr-3">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    Event Details
                  </h3>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-transparent shadow-lg text-gray-900 font-medium placeholder-gray-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                  <div className="mt-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Event Description
                    </label>
                    <textarea
                      rows={4}
                      value={formData.eventDescription}
                      onChange={(e) => setFormData({...formData, eventDescription: e.target.value})}
                      placeholder="Tell us about your event..."
                      className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-transparent shadow-lg text-gray-900 placeholder-gray-500 resize-none transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-100/30 to-transparent rounded-br-full"></div>
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
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
                      className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-transparent shadow-lg text-gray-900 font-medium placeholder-gray-500 transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Phone Number *
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
                          userDetails: {...formData.userDetails, phone: e.target.value}
                        })}
                        placeholder="Your phone number"
                        className="flex-1 px-6 py-4 bg-white/80 backdrop-blur-sm border border-white/50 border-l-0 rounded-r-2xl focus:ring-2 focus:ring-[#391C71] focus:border-transparent shadow-lg text-gray-900 font-medium placeholder-gray-500 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                  <div className="mt-6">
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
                      className="w-full px-6 py-4 bg-gray-100/80 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg text-gray-700 font-medium"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Venue Details */}
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-8 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-tl from-[#391C71]/10 to-transparent rounded-tl-full"></div>
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
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
                        className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-transparent shadow-lg text-gray-900 font-medium placeholder-gray-500 transition-all duration-200"
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
                          className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-transparent shadow-lg text-gray-900 font-medium placeholder-gray-500 transition-all duration-200"
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
                          className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-transparent shadow-lg text-gray-900 font-medium placeholder-gray-500 transition-all duration-200"
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
                          className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-transparent shadow-lg text-gray-900 font-medium placeholder-gray-500 transition-all duration-200"
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
                          className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-transparent shadow-lg text-gray-900 font-medium placeholder-gray-500 transition-all duration-200"
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
                          className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-transparent shadow-lg text-gray-900 font-medium appearance-none transition-all duration-200"
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
                        className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-transparent shadow-lg text-gray-900 placeholder-gray-500 resize-none transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-100/30 to-transparent rounded-bl-full"></div>
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
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
                    className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl focus:ring-2 focus:ring-[#391C71] focus:border-transparent shadow-lg text-gray-900 placeholder-gray-500 resize-none transition-all duration-200"
                  />
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
                      Book Custom Package
                    </>
                  )}
                </button>
                </div>
              </form>
            </div>
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