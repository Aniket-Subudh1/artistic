import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  Package,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Info,
  Plus,
  Minus,
  Loader2
} from 'lucide-react';
import { BookingService, PricingCalculationRequest, PricingCalculationResponse } from '@/services/booking.service';
import { equipmentPackagesService, EquipmentPackage } from '@/services/equipment-packages.service';
import { 
  customEquipmentPackagesService, 
  CustomEquipmentPackage 
} from '@/services/custom-equipment-packages.service';
import { ArtistService, Artist } from '@/services/artist.service';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { CountryCodeDropdown, Country, getDefaultCountry, formatPhoneNumber } from '@/components/ui/CountryCodeDropdown';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TermsAndConditionsModal } from './TermsAndConditionsModal';

export interface UnifiedBookingFormData {
  // Event details
  eventType: 'private' | 'public';
  isMultiDay?: boolean;
  eventDates: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
  // Legacy single date support
  eventDate: string;
  startTime: string;
  endTime: string;
  
  // User details
  userDetails: {
    name: string;
    email: string;
    phone: string;
  };
  
  // Venue details
  venueDetails: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    venueType: string;
    additionalInfo: string;
  };
  
  // Booking specific
  eventDescription: string;
  specialRequests: string;
  selectedEquipmentPackages: string[];
  selectedCustomPackages: string[];
}

export interface UnifiedBookingProps {
  // Primary booking target
  artistId?: string;
  artist?: Artist;
  equipmentPackageId?: string;
  equipmentPackage?: EquipmentPackage;
  
  // Booking type
  bookingType: 'artist' | 'equipment' | 'combined';
  
  // Callbacks
  onBookingComplete?: (bookingData: any) => void;
  onPricingUpdate?: (pricing: PricingCalculationResponse) => void;
  
  // UI customization
  showArtistSelection?: boolean;
  showEquipmentSelection?: boolean;
  preselectedPackages?: string[];
}

export const UnifiedBookingFlow: React.FC<UnifiedBookingProps> = ({
  artistId,
  artist,
  equipmentPackageId,
  equipmentPackage,
  bookingType,
  onBookingComplete,
  onPricingUpdate,
  showArtistSelection = false,
  showEquipmentSelection = true,
  preselectedPackages = []
}) => {
  const t = useTranslations('booking');
  
  // State management
  const [formData, setFormData] = useState<UnifiedBookingFormData>({
    eventType: 'private',
    isMultiDay: false,
    eventDates: [],
    eventDate: '',
    startTime: '',
    endTime: '',
    userDetails: {
      name: '',
      email: '',
      phone: ''
    },
    venueDetails: {
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      venueType: '',
      additionalInfo: ''
    },
    eventDescription: '',
    specialRequests: '',
    selectedEquipmentPackages: preselectedPackages,
    selectedCustomPackages: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState<PricingCalculationResponse | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  
  // Equipment data
  const [equipmentPackages, setEquipmentPackages] = useState<EquipmentPackage[]>([]);
  const [customPackages, setCustomPackages] = useState<CustomEquipmentPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  
  // Artist data (if needed)
  const [availableArtists, setAvailableArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(artist || null);
  
  // Terms and conditions
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Country code for phone
  const [selectedCountry, setSelectedCountry] = useState<Country>(getDefaultCountry());

  // Load equipment packages on mount
  useEffect(() => {
    loadEquipmentData();
  }, []);

  // Load artists if needed
  useEffect(() => {
    if (showArtistSelection) {
      loadAvailableArtists();
    }
  }, [showArtistSelection]);

  // Auto-calculate pricing when relevant fields change
  useEffect(() => {
    if (shouldCalculatePricing()) {
      calculatePricing();
    }
  }, [
    formData.eventDate,
    formData.startTime,
    formData.endTime,
    formData.eventDates,
    formData.selectedEquipmentPackages,
    formData.selectedCustomPackages,
    selectedArtist
  ]);

  const loadEquipmentData = async () => {
    try {
      setLoadingPackages(true);
      
      const [packagesResponse, customPackagesResponse] = await Promise.allSettled([
        equipmentPackagesService.getPublicPackages(),
        customEquipmentPackagesService.getAllCustomPackages()
      ]);

      if (packagesResponse.status === 'fulfilled') {
        setEquipmentPackages(packagesResponse.value);
      }

      if (customPackagesResponse.status === 'fulfilled') {
        setCustomPackages(customPackagesResponse.value);
      }
    } catch (error) {
      console.error('Failed to load equipment data:', error);
    } finally {
      setLoadingPackages(false);
    }
  };

  const loadAvailableArtists = async () => {
    try {
      const artists = await ArtistService.getAllArtists();
      setAvailableArtists(artists);
    } catch (error) {
      console.error('Failed to load artists:', error);
    }
  };

  const shouldCalculatePricing = (): boolean => {
    // For single day bookings
    if (formData.eventDate && formData.startTime && formData.endTime) {
      return true;
    }
    
    // For multi-day bookings
    if (formData.isMultiDay && formData.eventDates.length > 0) {
      return formData.eventDates.every(
        date => date.date && date.startTime && date.endTime
      );
    }
    
    return false;
  };

  const calculatePricing = async () => {
    if (!shouldCalculatePricing()) return;

    try {
      setPricingLoading(true);
      
      const pricingRequest: PricingCalculationRequest = {
        eventType: formData.eventType,
        selectedEquipmentPackages: formData.selectedEquipmentPackages,
        selectedCustomPackages: formData.selectedCustomPackages
      };

      // Add artist ID if available
      if (selectedArtist) {
        pricingRequest.artistId = selectedArtist._id;
      } else if (artistId) {
        pricingRequest.artistId = artistId;
      }

      // Add date information
      if (formData.isMultiDay) {
        pricingRequest.isMultiDay = true;
        pricingRequest.eventDates = formData.eventDates;
      } else {
        pricingRequest.eventDate = formData.eventDate;
        pricingRequest.startTime = formData.startTime;
        pricingRequest.endTime = formData.endTime;
      }

      const response = await BookingService.calculateBookingPricing(pricingRequest);
      setPricing(response);
      onPricingUpdate?.(response);
    } catch (error) {
      console.error('Pricing calculation failed:', error);
    } finally {
      setPricingLoading(false);
    }
  };

  const handleSubmitBooking = async () => {
    if (!termsAccepted) {
      setShowTermsModal(true);
      return;
    }

    if (!pricing) {
      await calculatePricing();
      if (!pricing) return;
    }

    try {
      setLoading(true);

      const bookingData = {
        artistId: selectedArtist?._id || artistId || '',
        eventType: formData.eventType,
        isMultiDay: formData.isMultiDay,
        eventDates: formData.isMultiDay ? formData.eventDates : undefined,
        eventDate: !formData.isMultiDay ? formData.eventDate : undefined,
        startTime: !formData.isMultiDay ? formData.startTime : undefined,
        endTime: !formData.isMultiDay ? formData.endTime : undefined,
        artistPrice: pricing.artistFee.amount,
        equipmentPrice: pricing.equipmentFee.amount,
        totalPrice: pricing.totalAmount,
        userDetails: formData.userDetails,
        venueDetails: formData.venueDetails,
        eventDescription: formData.eventDescription,
        specialRequests: formData.specialRequests,
        selectedEquipmentPackages: formData.selectedEquipmentPackages,
        selectedCustomPackages: formData.selectedCustomPackages
      };

      const result = await BookingService.createArtistBooking(bookingData);
      onBookingComplete?.(result);
    } catch (error) {
      console.error('Booking submission failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderDateTimeSelection();
      case 2:
        return renderArtistAndEquipmentSelection();
      case 3:
        return renderUserDetailsForm();
      case 4:
        return renderVenueDetailsForm();
      case 5:
        return renderBookingSummary();
      default:
        return null;
    }
  };

  const renderDateTimeSelection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">{t('selectDateTime')}</h3>
        
        {/* Event Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('eventType')}
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="private"
                checked={formData.eventType === 'private'}
                onChange={(e) => setFormData(prev => ({...prev, eventType: e.target.value as 'private' | 'public'}))}
                className="mr-2"
              />
              {t('privateEvent')}
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="public"
                checked={formData.eventType === 'public'}
                onChange={(e) => setFormData(prev => ({...prev, eventType: e.target.value as 'private' | 'public'}))}
                className="mr-2"
              />
              {t('publicEvent')}
            </label>
          </div>
        </div>

        {/* Multi-day toggle */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isMultiDay}
              onChange={(e) => setFormData(prev => ({...prev, isMultiDay: e.target.checked}))}
              className="mr-2"
            />
            {t('multiDayEvent')}
          </label>
        </div>

        {/* Date selection */}
        {formData.isMultiDay ? (
          <div>
            <h4 className="font-medium mb-4">{t('eventDates')}</h4>
            {/* Multi-day date selection UI */}
            {formData.eventDates.map((eventDate, index) => (
              <div key={index} className="border rounded p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{t('day')} {index + 1}</span>
                  <button
                    onClick={() => {
                      const newDates = [...formData.eventDates];
                      newDates.splice(index, 1);
                      setFormData(prev => ({...prev, eventDates: newDates}));
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Minus size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="date"
                    value={eventDate.date}
                    onChange={(e) => {
                      const newDates = [...formData.eventDates];
                      newDates[index] = {...newDates[index], date: e.target.value};
                      setFormData(prev => ({...prev, eventDates: newDates}));
                    }}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="time"
                    value={eventDate.startTime}
                    onChange={(e) => {
                      const newDates = [...formData.eventDates];
                      newDates[index] = {...newDates[index], startTime: e.target.value};
                      setFormData(prev => ({...prev, eventDates: newDates}));
                    }}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="time"
                    value={eventDate.endTime}
                    onChange={(e) => {
                      const newDates = [...formData.eventDates];
                      newDates[index] = {...newDates[index], endTime: e.target.value};
                      setFormData(prev => ({...prev, eventDates: newDates}));
                    }}
                    className="border rounded px-3 py-2"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  eventDates: [...prev.eventDates, { date: '', startTime: '', endTime: '' }]
                }));
              }}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <Plus size={16} className="mr-1" />
              {t('addDay')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('date')}
              </label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData(prev => ({...prev, eventDate: e.target.value}))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('startTime')}
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({...prev, startTime: e.target.value}))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('endTime')}
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({...prev, endTime: e.target.value}))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        )}

        {/* Live pricing display */}
        {pricing && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('estimatedTotal')}</span>
              <span className="text-lg font-semibold text-blue-600">
                {pricing.totalAmount.toFixed(3)} {pricing.currency}
              </span>
            </div>
            {pricingLoading && (
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Loader2 className="animate-spin mr-1" size={14} />
                {t('calculating')}...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderArtistAndEquipmentSelection = () => (
    <div className="space-y-6">
      {/* Artist Selection */}
      {showArtistSelection && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">{t('selectArtist')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableArtists.map((artist) => (
              <div
                key={artist._id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedArtist?._id === artist._id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedArtist(artist)}
              >
                {artist.profileImage && (
                  <img
                    src={artist.profileImage}
                    alt={artist.stageName}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}
                <h4 className="font-medium">{artist.stageName}</h4>
                <p className="text-sm text-gray-600">{artist.category}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equipment Selection */}
      {showEquipmentSelection && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">{t('selectEquipment')}</h3>
          
          {loadingPackages ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* Equipment Packages */}
              {equipmentPackages.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-3">{t('equipmentPackages')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {equipmentPackages.map((pkg) => (
                      <div
                        key={pkg._id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          formData.selectedEquipmentPackages.includes(pkg._id)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          const isSelected = formData.selectedEquipmentPackages.includes(pkg._id);
                          const newSelected = isSelected
                            ? formData.selectedEquipmentPackages.filter(id => id !== pkg._id)
                            : [...formData.selectedEquipmentPackages, pkg._id];
                          
                          setFormData(prev => ({
                            ...prev,
                            selectedEquipmentPackages: newSelected
                          }));
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{pkg.name}</h5>
                          {formData.selectedEquipmentPackages.includes(pkg._id) && (
                            <CheckCircle className="text-green-600" size={20} />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {Number(pkg.totalPrice).toFixed(3)} KWD/hr
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Packages */}
              {customPackages.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">{t('customPackages')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customPackages.map((pkg) => (
                      <div
                        key={pkg._id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          formData.selectedCustomPackages.includes(pkg._id)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          const isSelected = formData.selectedCustomPackages.includes(pkg._id);
                          const newSelected = isSelected
                            ? formData.selectedCustomPackages.filter(id => id !== pkg._id)
                            : [...formData.selectedCustomPackages, pkg._id];
                          
                          setFormData(prev => ({
                            ...prev,
                            selectedCustomPackages: newSelected
                          }));
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{pkg.name}</h5>
                          {formData.selectedCustomPackages.includes(pkg._id) && (
                            <CheckCircle className="text-green-600" size={20} />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                        <p className="text-lg font-semibold text-purple-600">
                          {pkg.totalPricePerDay.toFixed(3)} KWD/hr
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );

  const renderUserDetailsForm = () => (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">{t('userDetails')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <User className="inline mr-1" size={16} />
            {t('fullName')} *
          </label>
          <input
            type="text"
            value={formData.userDetails.name}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              userDetails: { ...prev.userDetails, name: e.target.value }
            }))}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Mail className="inline mr-1" size={16} />
            {t('email')} *
          </label>
          <input
            type="email"
            value={formData.userDetails.email}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              userDetails: { ...prev.userDetails, email: e.target.value }
            }))}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Phone className="inline mr-1" size={16} />
            {t('phone')} *
          </label>
          <div className="flex">
            <CountryCodeDropdown
              selectedCountry={selectedCountry}
              onCountrySelect={setSelectedCountry}
            />
            <input
              type="tel"
              value={formData.userDetails.phone}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                userDetails: { ...prev.userDetails, phone: e.target.value }
              }))}
              className="flex-1 border rounded-r px-3 py-2"
              placeholder={t('phoneNumber')}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderVenueDetailsForm = () => (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">{t('venueDetails')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="inline mr-1" size={16} />
            {t('address')} *
          </label>
          <input
            type="text"
            value={formData.venueDetails.address}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              venueDetails: { ...prev.venueDetails, address: e.target.value }
            }))}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('city')} *
          </label>
          <input
            type="text"
            value={formData.venueDetails.city}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              venueDetails: { ...prev.venueDetails, city: e.target.value }
            }))}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('state')} *
          </label>
          <input
            type="text"
            value={formData.venueDetails.state}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              venueDetails: { ...prev.venueDetails, state: e.target.value }
            }))}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('country')} *
          </label>
          <input
            type="text"
            value={formData.venueDetails.country}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              venueDetails: { ...prev.venueDetails, country: e.target.value }
            }))}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('postalCode')}
          </label>
          <input
            type="text"
            value={formData.venueDetails.postalCode}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              venueDetails: { ...prev.venueDetails, postalCode: e.target.value }
            }))}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('venueType')}
          </label>
          <select
            value={formData.venueDetails.venueType}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              venueDetails: { ...prev.venueDetails, venueType: e.target.value }
            }))}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">{t('selectVenueType')}</option>
            <option value="wedding">{t('wedding')}</option>
            <option value="corporate">{t('corporate')}</option>
            <option value="birthday">{t('birthday')}</option>
            <option value="concert">{t('concert')}</option>
            <option value="festival">{t('festival')}</option>
            <option value="other">{t('other')}</option>
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('eventDescription')}
          </label>
          <textarea
            value={formData.eventDescription}
            onChange={(e) => setFormData(prev => ({...prev, eventDescription: e.target.value}))}
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder={t('eventDescriptionPlaceholder')}
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('specialRequests')}
          </label>
          <textarea
            value={formData.specialRequests}
            onChange={(e) => setFormData(prev => ({...prev, specialRequests: e.target.value}))}
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder={t('specialRequestsPlaceholder')}
          />
        </div>
      </div>
    </div>
  );

  const renderBookingSummary = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">{t('bookingSummary')}</h3>
        
        {pricing && (
          <>
            {/* Artist Fee */}
            {pricing.artistFee.amount > 0 && (
              <div className="mb-4 p-4 bg-blue-50 rounded">
                <h4 className="font-medium text-blue-800 mb-2">{t('artistFee')}</h4>
                <div className="flex justify-between text-sm">
                  <span>{t('totalHours')}: {pricing.artistFee.totalHours}</span>
                  <span>{pricing.artistFee.amount.toFixed(3)} {pricing.currency}</span>
                </div>
              </div>
            )}
            
            {/* Equipment Fee */}
            {pricing.equipmentFee.amount > 0 && (
              <div className="mb-4 p-4 bg-green-50 rounded">
                <h4 className="font-medium text-green-800 mb-2">{t('equipmentFee')}</h4>
                {pricing.equipmentFee.packages.map((pkg, index) => (
                  <div key={index} className="flex justify-between text-sm mb-1">
                    <span>{pkg.name}</span>
                    <span>{pkg.price.toFixed(3)} {pricing.currency}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-semibold">
                <span>{t('totalAmount')}</span>
                <span className="text-green-600">
                  {pricing.totalAmount.toFixed(3)} {pricing.currency}
                </span>
              </div>
            </div>
          </>
        )}
        
        {/* Terms and Conditions */}
        <div className="mt-6 p-4 bg-yellow-50 rounded">
          <div className="flex items-start">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 mr-2"
              required
            />
            <div className="text-sm">
              {t('acceptTerms')}
              <button
                onClick={() => setShowTermsModal(true)}
                className="text-blue-600 hover:underline ml-1"
              >
                {t('termsAndConditions')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        if (formData.isMultiDay) {
          return formData.eventDates.length > 0 && 
            formData.eventDates.every(date => date.date && date.startTime && date.endTime);
        }
        return formData.eventDate && formData.startTime && formData.endTime;
      case 2:
        return true; // Equipment selection is optional
      case 3:
        return formData.userDetails.name && formData.userDetails.email && formData.userDetails.phone;
      case 4:
        return formData.venueDetails.address && formData.venueDetails.city && 
               formData.venueDetails.state && formData.venueDetails.country;
      case 5:
        return termsAccepted && pricing;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3, 4, 5].map((step) => (
            <React.Fragment key={step}>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep === step
                    ? 'bg-blue-600 text-white'
                    : currentStep > step
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {currentStep > step ? (
                  <CheckCircle size={20} />
                ) : (
                  step
                )}
              </div>
              {step < 5 && (
                <div
                  className={`w-12 h-1 ${
                    currentStep > step ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-center mt-2">
          <span className="text-sm text-gray-600">
            {t(`step${currentStep}`)}
          </span>
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('previous')}
        </button>
        
        {currentStep < 5 ? (
          <button
            onClick={() => setCurrentStep(prev => prev + 1)}
            disabled={!canProceedToNextStep()}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('next')}
          </button>
        ) : (
          <button
            onClick={handleSubmitBooking}
            disabled={!canProceedToNextStep() || loading}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading && <Loader2 className="animate-spin mr-2" size={16} />}
            {t('confirmBooking')}
          </button>
        )}
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <TermsAndConditionsModal
          isOpen={showTermsModal}
          onClose={() => setShowTermsModal(false)}
          onAccept={() => {
            setTermsAccepted(true);
            setShowTermsModal(false);
          }}
          onDecline={() => setShowTermsModal(false)}
          terms={null}
        />
      )}
    </div>
  );
};