'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Calendar, Clock, MapPin, User, Phone, Mail, 
  Package, CreditCard, ArrowLeft, AlertCircle, CheckCircle,
  DollarSign, Users, Star, Camera
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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Package Not Found</h2>
          <p className="text-gray-600 mb-4">The equipment package you're looking for doesn't exist.</p>
          <button
            onClick={() => router.back()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const numberOfDays = calculateNumberOfDays();
  const totalPrice = calculateTotalPrice();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Book Equipment Package</h1>
          <p className="text-gray-600 mt-2">Complete your booking for {packageData.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Package Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
              {/* Package Image */}
              <div className="mb-6">
                {packageData.coverImage || (packageData.images && packageData.images.length > 0) ? (
                  <img
                    src={packageData.coverImage || packageData.images![0]}
                    alt={packageData.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Package Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{packageData.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{packageData.description}</p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Price per day:</span>
                    <span className="text-lg font-semibold text-purple-600">
                      ${packageData.totalPrice.toLocaleString()}
                    </span>
                  </div>
                  
                  {numberOfDays > 0 && (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Number of days:</span>
                        <span className="text-sm font-medium">{numberOfDays}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-base font-medium text-gray-900">Total Price:</span>
                        <span className="text-xl font-bold text-purple-600">
                          ${totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Equipment Included:</h4>
                  <div className="space-y-2">
                    {packageData.items.map((item, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                        {item.quantity}x {item.equipmentId.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Provider Info */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Provided by:</h4>
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {packageData.createdBy.firstName} {packageData.createdBy.lastName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Date Selection */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <Calendar className="h-5 w-5 inline mr-2" />
                  Select Dates
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Availability Status */}
                {(formData.startDate && formData.endDate) && (
                  <div className="mt-4 p-4 rounded-lg border">
                    {availability.checking ? (
                      <div className="flex items-center text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Checking availability...
                      </div>
                    ) : availability.available ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Package is available for selected dates
                      </div>
                    ) : (
                      <div className="text-red-600">
                        <div className="flex items-center mb-2">
                          <AlertCircle className="h-5 w-5 mr-2" />
                          Package is not available for selected dates
                        </div>
                        {availability.conflicts.length > 0 && (
                          <div className="text-sm">
                            <p>Conflicting bookings:</p>
                            <ul className="list-disc list-inside ml-4">
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
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <User className="h-5 w-5 inline mr-2" />
                  Contact Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.userDetails.name}
                      onChange={(e) => updateFormData('userDetails', 'name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.userDetails.email}
                      onChange={(e) => updateFormData('userDetails', 'email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.userDetails.phone}
                      onChange={(e) => updateFormData('userDetails', 'phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Venue Details */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <MapPin className="h-5 w-5 inline mr-2" />
                  Venue Details
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.venueDetails.address}
                      onChange={(e) => updateFormData('venueDetails', 'address', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Street address"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.venueDetails.city}
                        onChange={(e) => updateFormData('venueDetails', 'city', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={formData.venueDetails.state}
                        onChange={(e) => updateFormData('venueDetails', 'state', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.venueDetails.country}
                        onChange={(e) => updateFormData('venueDetails', 'country', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={formData.venueDetails.postalCode}
                        onChange={(e) => updateFormData('venueDetails', 'postalCode', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Venue Type
                      </label>
                      <select
                        value={formData.venueDetails.venueType}
                        onChange={(e) => updateFormData('venueDetails', 'venueType', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Info
                    </label>
                    <textarea
                      value={formData.venueDetails.additionalInfo}
                      onChange={(e) => updateFormData('venueDetails', 'additionalInfo', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Any specific venue details or instructions..."
                    />
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Event Details (Optional)
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Description
                    </label>
                    <textarea
                      value={formData.eventDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, eventDescription: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Tell us about your event..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests
                    </label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Any special requirements or requests..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Ready to Book?</h3>
                    <p className="text-gray-600 text-sm">Review your details and submit your booking request.</p>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={submitting || !availability.available || availability.checking}
                    className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Book Package
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Simple Notifications */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
            <button
              onClick={() => setError('')}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {success}
            <button
              onClick={() => setSuccess('')}
              className="ml-4 text-white hover:text-gray-200"
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