'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign,
  Upload,
  Image as ImageIcon,
  Plus,
  X,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Camera,
  Music,
  User,
  Settings,
  Layout
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ImageCropper } from '@/components/ui/ImageCropper';
import ArtistBookingFlow, { SelectedArtist } from './ArtistBookingFlow';
import EquipmentRentalFlow, { SelectedEquipment } from './EquipmentRentalFlow';

import { useAuth } from '@/hooks/useAuth';
import { eventService, CreateEventRequest, Event as AdminEvent } from '@/services/event.service';
import { EventPaymentService } from '@/services/event-payment.service';
import { venueLayoutService, VenueLayout } from '@/services/venue-layout.service';
import { Artist, ArtistService } from '@/services/artist.service';
import { Equipment, EquipmentService } from '@/services/equipment.service';
import { VenueProviderService, VenueProvider } from '@/services/venue-provider.service';

interface EventFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  visibility: 'private' | 'public' | 'international' | 'workshop';
  performanceType: string;
  venue: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    capacity?: number;
    venueType?: string;
    facilities?: string[];
  };
  seatLayoutId?: string;
  maxTicketsPerUser: number;
  allowBooking: boolean;
  bookingStartDate?: string;
  bookingEndDate?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactPerson?: string;
  termsAndConditions?: string;
  cancellationPolicy?: string;
}


const PERFORMANCE_TYPES = [
  'Music Concert', 'Theater', 'Dance', 'Comedy', 'Magic Show', 
  'Opera', 'Ballet', 'Jazz', 'Rock', 'Pop', 'Classical', 
  'Festival', 'Workshop', 'Conference', 'Exhibition', 'Other'
];

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public Event', description: 'Visible to everyone' },
  { value: 'private', label: 'Private Event', description: 'Invitation only' },
  { value: 'international', label: 'International Event', description: 'Global audience' },
  { value: 'workshop', label: 'Workshop', description: 'Educational event' },
];

interface EventCreationFormProps {
  userRole?: 'admin' | 'venue_owner';
  mode?: 'create' | 'edit';
  initialEventId?: string;
  initialEvent?: AdminEvent;
  onSaved?: (eventId: string) => void;
}

export default function EventCreationForm({ userRole = 'venue_owner', mode = 'create', initialEventId, initialEvent, onSaved }: EventCreationFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') || undefined : undefined;

  // Check for retry parameter to restore saved data
  const [retryMode, setRetryMode] = useState(false);

  // Form data state
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    visibility: 'public',
    performanceType: '',
    venue: {
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
    },
    maxTicketsPerUser: 10,
    allowBooking: true,
  });

  // Image handling
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string>('');
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string>('');

  // Artists and Equipment
  const [selectedArtists, setSelectedArtists] = useState<SelectedArtist[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment[]>([]);
  const [availableLayouts, setAvailableLayouts] = useState<VenueLayout[]>([]);
  const [venueOwners, setVenueOwners] = useState<VenueProvider[]>([]);
  const [selectedVenueOwnerId, setSelectedVenueOwnerId] = useState<string>('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [showArtistBooking, setShowArtistBooking] = useState(false);
  const [showEquipmentRental, setShowEquipmentRental] = useState(false);

  // Restore saved data on retry
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const isRetry = urlParams.get('retry') === '1';
    
    if (isRetry && mode === 'create') {
      const savedData = localStorage.getItem('pendingEventData');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData(parsed.formData);
          setSelectedArtists(parsed.selectedArtists || []);
          setSelectedEquipment(parsed.selectedEquipment || []);
          setCoverPhotoPreview(parsed.coverPhotoPreview || '');
          setRetryMode(true);
          
          console.log('✅ Restored saved event data for retry');
          
          // NOTE: coverPhoto File object cannot be restored from localStorage
          // User will need to re-upload if they want to change it
          // The backend still has the base64 from the first attempt
          
          // Show a warning message
          setError('Form data restored from previous payment attempt. Note: If you had uploaded a cover photo, you may need to upload it again.');
          setShowErrorModal(true);
          
          // Clear the retry parameter from URL
          window.history.replaceState({}, '', window.location.pathname);
        } catch (error) {
          console.error('Failed to restore saved event data:', error);
        }
      }
    }
  }, [mode]);

  // Prefill when editing
  useEffect(() => {
    if (mode === 'edit' && initialEvent) {
      console.log('========== EDIT MODE: Prefilling event data ==========');
      console.log('Full initialEvent:', initialEvent);
      
      // Extract seatLayoutId properly
      let extractedSeatLayoutId = '';
      if (initialEvent.seatLayoutId) {
        if (typeof initialEvent.seatLayoutId === 'string') {
          extractedSeatLayoutId = initialEvent.seatLayoutId;
        } else if (typeof initialEvent.seatLayoutId === 'object') {
          extractedSeatLayoutId = (initialEvent.seatLayoutId as any)?._id || '';
        }
      }
      console.log('Extracted seatLayoutId:', extractedSeatLayoutId);
      console.log('seatLayoutId type:', typeof initialEvent.seatLayoutId);
      console.log('seatLayoutId value:', initialEvent.seatLayoutId);
      
      setFormData({
        name: initialEvent.name,
        description: initialEvent.description,
        startDate: new Date(initialEvent.startDate).toISOString().slice(0,10),
        endDate: new Date(initialEvent.endDate).toISOString().slice(0,10),
        startTime: initialEvent.startTime,
        endTime: initialEvent.endTime,
        visibility: initialEvent.visibility,
        performanceType: initialEvent.performanceType,
        venue: {
          name: initialEvent.venue?.name || '',
          address: initialEvent.venue?.address || '',
          city: initialEvent.venue?.city || '',
          state: initialEvent.venue?.state || '',
          country: initialEvent.venue?.country || '',
          postalCode: initialEvent.venue?.postalCode,
          capacity: initialEvent.venue?.capacity,
          venueType: initialEvent.venue?.venueType,
          facilities: initialEvent.venue?.facilities,
        },
        seatLayoutId: extractedSeatLayoutId || undefined,
        maxTicketsPerUser: initialEvent.maxTicketsPerUser,
        allowBooking: initialEvent.allowBooking,
        bookingStartDate: initialEvent.bookingStartDate ? new Date(initialEvent.bookingStartDate).toISOString().slice(0,10) : undefined,
        bookingEndDate: initialEvent.bookingEndDate ? new Date(initialEvent.bookingEndDate).toISOString().slice(0,10) : undefined,
        contactEmail: initialEvent.contactEmail,
        contactPhone: initialEvent.contactPhone,
        contactPerson: initialEvent.contactPerson,
        termsAndConditions: initialEvent.termsAndConditions,
        cancellationPolicy: initialEvent.cancellationPolicy,
      });
      
      console.log('Form data after setting:', {
        seatLayoutId: extractedSeatLayoutId,
        startDate: new Date(initialEvent.startDate).toISOString().slice(0,10),
        endDate: new Date(initialEvent.endDate).toISOString().slice(0,10),
        startTime: initialEvent.startTime,
        endTime: initialEvent.endTime,
      });
      
      setCoverPhotoPreview(initialEvent.coverPhoto || '');
      
      // Handle artists - backend populates artistId with full artist object
      const mappedArtists = (initialEvent.artists || []).map(a => {
        console.log('Processing artist for edit:', a);
        
        // Extract artistId - handle both populated (object) and non-populated (string) cases
        let extractedArtistId = '';
        if (!a.isCustomArtist) {
          if (typeof a.artistId === 'string') {
            extractedArtistId = a.artistId;
          } else if (a.artistId && typeof a.artistId === 'object') {
            // Populated artist object
            extractedArtistId = (a.artistId as any)._id || '';
          }
        }
        
        return {
          artistId: extractedArtistId,
          artistName: a.isCustomArtist ? (a.customArtistName || '') : a.artistName,
          customArtistName: a.isCustomArtist ? (a.customArtistName || '') : undefined,
          artistPhoto: a.isCustomArtist ? a.customArtistPhoto : a.artistPhoto,
          isCustomArtist: a.isCustomArtist || false,
          fee: a.fee,
          notes: a.notes,
        } as SelectedArtist;
      });
      
      console.log('Mapped artists for edit:', mappedArtists);
      setSelectedArtists(mappedArtists);
      
      // Handle equipment - backend populates equipmentId with full equipment object
      const mappedEquipment = (initialEvent.equipment || []).map(e => {
        console.log('Processing equipment for edit:', e);
        
        // Extract equipmentId - handle both populated (object) and non-populated (string) cases
        let extractedEquipmentId = '';
        if (typeof e.equipmentId === 'string') {
          extractedEquipmentId = e.equipmentId;
        } else if (e.equipmentId && typeof e.equipmentId === 'object') {
          // Populated equipment object
          extractedEquipmentId = (e.equipmentId as any)._id || '';
        }
        
        return {
          equipmentId: extractedEquipmentId,
          equipmentName: e.equipmentName,
          quantity: e.quantity,
          pricePerUnit: e.pricePerUnit,
          totalPrice: e.totalPrice,
          notes: e.notes,
        } as SelectedEquipment;
      });
      
      console.log('Mapped equipment for edit:', mappedEquipment);
      setSelectedEquipment(mappedEquipment);
      
      // Handle venue owner ID for admin users
      if (userRole === 'admin' && initialEvent.venueOwnerId) {
        const venueOwnerIdToSet = typeof initialEvent.venueOwnerId === 'string' 
          ? initialEvent.venueOwnerId 
          : (initialEvent.venueOwnerId as any)?._id || '';
        console.log('Setting venue owner ID for admin:', venueOwnerIdToSet);
        setSelectedVenueOwnerId(venueOwnerIdToSet);
      }
    }
  }, [mode, initialEvent, userRole]);

  // Load venue layouts
  useEffect(() => {
    const loadLayouts = async () => {
      try {
        let queryParams = {};
        
        if (userRole === 'admin') {
          // Admin MUST select a venue owner before seeing layouts
          if (!selectedVenueOwnerId) {
            console.log('Admin must select venue owner before loading layouts');
            setAvailableLayouts([]);
            return;
          }
          queryParams = { venueOwnerId: selectedVenueOwnerId };
          console.log('🔍 [Admin] Loading layouts for venue owner profile ID:', selectedVenueOwnerId);
        } else {
          // Venue owner only sees their own layouts
          // Backend will handle User ID -> VenueOwnerProfile ID conversion
          queryParams = { venueOwnerId: user?.id };
          console.log('🔍 [Venue Owner] Loading layouts for user ID:', user?.id);
        }
        
        console.log('Loading layouts with params:', queryParams);
        const layouts = await venueLayoutService.getVenueLayouts(token || '', queryParams);
        console.log('✅ Loaded layouts:', layouts.length, layouts);
        setAvailableLayouts(layouts);
      } catch (err) {
        console.error('❌ Failed to load layouts:', err);
      }
    };

    if (token && (userRole === 'admin' || user?.id)) {
      loadLayouts();
    }
  }, [user?.id, token, userRole, selectedVenueOwnerId]);

  // Load venue owners for admin users
  useEffect(() => {
    const loadVenueOwners = async () => {
      if (userRole !== 'admin' || !token) return;
      
      try {
        const response = await VenueProviderService.getAllVenueProviders();
        if (response.success) {
          setVenueOwners(response.data);
        }
      } catch (err) {
        console.error('Failed to load venue owners:', err);
      }
    };

    loadVenueOwners();
  }, [userRole, token]);

  const handleInputChange = useCallback((field: keyof EventFormData | string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof EventFormData] as any),
            [child]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });
  }, []);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      setShowErrorModal(true);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      setShowErrorModal(true);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setTempImageSrc(reader.result as string);
      setShowImageCropper(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleCropComplete = useCallback(async (croppedImageBlob: Blob) => {
    const file = new File([croppedImageBlob], `event-cover-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });
    
    setCoverPhoto(file);
    setCoverPhotoPreview(URL.createObjectURL(croppedImageBlob));
    setShowImageCropper(false);
  }, []);

  const handleArtistsSelected = useCallback((artists: SelectedArtist[]) => {
    console.log('handleArtistsSelected called with:', artists);
    setSelectedArtists(artists);
  }, []);

  const handleEquipmentSelected = useCallback((equipment: SelectedEquipment[]) => {
    setSelectedEquipment(equipment);
  }, []);

  const calculateEventDuration = useCallback(() => {
    if (!formData.startTime || !formData.endTime) return 8; // Default 8 hours
    
    const start = new Date(`1970-01-01T${formData.startTime}`);
    const end = new Date(`1970-01-01T${formData.endTime}`);
    
    // Handle overnight events
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }
    
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }, [formData.startTime, formData.endTime]);

  const validateForm = useCallback((): string[] => {
    const errors: string[] = [];

    // Basic Information
    if (!formData.name.trim()) errors.push('Event name is required');
    if (formData.name.trim().length < 3) errors.push('Event name must be at least 3 characters');
    if (formData.name.trim().length > 200) errors.push('Event name must not exceed 200 characters');
    
    if (!formData.description.trim()) errors.push('Event description is required');
    if (formData.description.trim().length < 10) errors.push('Event description must be at least 10 characters');
    
    if (!formData.startDate) errors.push('Start date is required');
    if (!formData.endDate) errors.push('End date is required');
    if (!formData.startTime) errors.push('Start time is required');
    if (!formData.endTime) errors.push('End time is required');
    if (!formData.performanceType) errors.push('Performance type is required');
    
    // Venue Information
    if (!formData.venue.name.trim()) errors.push('Venue name is required');
    if (!formData.venue.address.trim()) errors.push('Venue address is required');
    if (!formData.venue.city.trim()) errors.push('City is required');
    if (!formData.venue.state.trim()) errors.push('State is required');
    if (!formData.venue.country.trim()) errors.push('Country is required');

    // Admin-specific validations
    if (userRole === 'admin') {
      if (!selectedVenueOwnerId || selectedVenueOwnerId.trim() === '') {
        errors.push('Venue owner selection is required for admin-created events');
      }
      
      // If admin selected a layout, ensure it's for the selected venue owner
      if (formData.seatLayoutId && formData.seatLayoutId !== 'none' && !selectedVenueOwnerId) {
        errors.push('Cannot select a layout without selecting a venue owner first');
      }
    }

    // Date and Time Validations
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of day for fair comparison

    if (startDate < now) {
      errors.push('Event start date cannot be in the past');
    }

    if (endDate < startDate) {
      errors.push('End date must be after or equal to start date');
    }

    if (formData.startDate === formData.endDate && formData.startTime >= formData.endTime) {
      errors.push('End time must be after start time for same-day events');
    }

    // Booking validations
    if (formData.maxTicketsPerUser < 1) {
      errors.push('Maximum tickets per user must be at least 1');
    }
    
    if (formData.maxTicketsPerUser > 100) {
      errors.push('Maximum tickets per user cannot exceed 100');
    }

    if (formData.allowBooking) {
      if (!formData.bookingStartDate) {
        errors.push('Booking start date is required when booking is enabled');
      }
      if (!formData.bookingEndDate) {
        errors.push('Booking end date is required when booking is enabled');
      }
      
      if (formData.bookingStartDate && formData.bookingEndDate) {
        const bookingStart = new Date(formData.bookingStartDate);
        const bookingEnd = new Date(formData.bookingEndDate);
        
        if (bookingEnd < bookingStart) {
          errors.push('Booking end date must be after booking start date');
        }
        
        if (bookingEnd > startDate) {
          errors.push('Booking must end before or on the event start date');
        }
      }
    }

    // Contact Information Validations
    if (formData.contactEmail && formData.contactEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactEmail)) {
        errors.push('Contact email is invalid');
      }
    }


    // Seat Layout Validation
    if (formData.seatLayoutId && formData.seatLayoutId !== 'none') {
      const layoutExists = availableLayouts.some(layout => layout._id === formData.seatLayoutId);
      if (!layoutExists) {
        errors.push('Selected seat layout is not valid or not available');
      }
    }

    // Artists Validation
    if (selectedArtists.length > 0) {
      selectedArtists.forEach((artist, index) => {
        if (artist.isCustomArtist) {
          if (!artist.customArtistName || artist.customArtistName.trim() === '') {
            errors.push(`Custom artist #${index + 1}: Name is required`);
          }
        } else {
          if (!artist.artistId || artist.artistId.toString().trim() === '') {
            errors.push(`Artist #${index + 1}: Artist ID is missing`);
          }
        }
        
        // Allow 0 as valid price, only check for negative values
        if (artist.fee === undefined || artist.fee === null || artist.fee < 0) {
          errors.push(`${artist.isCustomArtist ? artist.customArtistName : 'Artist #' + (index + 1)}: Fee cannot be negative`);
        }
      });
    }

    // Equipment Validation
    if (selectedEquipment.length > 0) {
      selectedEquipment.forEach((equipment, index) => {
        if (!equipment.equipmentId || equipment.equipmentId.toString().trim() === '') {
          errors.push(`Equipment #${index + 1}: Equipment ID is missing`);
        }
        
        if (!equipment.quantity || equipment.quantity <= 0) {
          errors.push(`Equipment #${index + 1}: Quantity must be greater than 0`);
        }
      });
    }

    // Cover photo validation (optional but if provided, check size)
    if (coverPhoto) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (coverPhoto.size > maxSize) {
        errors.push('Cover photo size must not exceed 5MB');
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(coverPhoto.type)) {
        errors.push('Cover photo must be a JPEG, PNG, or WebP image');
      }
    }

    return errors;
  }, [formData, coverPhoto, userRole, selectedVenueOwnerId, availableLayouts, selectedArtists, selectedEquipment]);

  const handleSubmit = async () => {
    setError(null);
    setShowErrorModal(false);
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    
    try {
      // Debug logging for artist state
      console.log('Event submission - selectedArtists state:', selectedArtists);
      console.log('Event submission - selectedArtists length:', selectedArtists.length);
      
      const baseEventData: CreateEventRequest = {
        name: formData.name,
        description: formData.description,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        startTime: formData.startTime,
        endTime: formData.endTime,
        visibility: formData.visibility,
        performanceType: formData.performanceType,
        venue: {
          ...formData.venue,
          venueType: formData.venue.venueType === 'not-selected' ? undefined : formData.venue.venueType
        },
        seatLayoutId: formData.seatLayoutId === 'none' ? undefined : formData.seatLayoutId,
        artists: (() => {
          const validArtists = selectedArtists.filter(artist => {
            // For custom artists: must have customArtistName and isCustomArtist flag
            if (artist.isCustomArtist) {
              return artist.customArtistName && artist.customArtistName.trim() !== '';
            }
            // For regular artists: must have artistId
            const artistId = typeof artist.artistId === 'string' 
              ? artist.artistId 
              : (artist.artistId as any)?._id || String(artist.artistId || '');
            return artistId && artistId.trim() !== '';
          }).map(artist => ({
            artistId: artist.isCustomArtist ? undefined : (
              typeof artist.artistId === 'string' 
                ? artist.artistId 
                : (artist.artistId as any)?._id || String(artist.artistId || '')
            ),
            fee: artist.fee,
            isCustomArtist: artist.isCustomArtist,
            customArtistName: artist.isCustomArtist ? artist.customArtistName : undefined,
            customArtistPhoto: artist.isCustomArtist ? artist.customArtistPhoto : undefined,
            customArtistPhotoFile: artist.isCustomArtist ? artist.customArtistPhotoFile : undefined,
            notes: artist.notes
          }));
          
          // Debug logging for artist filtering
          console.log('Artists filtering - Original selectedArtists:', selectedArtists);
          console.log('Artists filtering - Filtered validArtists:', validArtists);
          
          return validArtists.length > 0 ? validArtists : undefined;
        })(),
        equipment: (() => {
          const validEquipment = selectedEquipment
            .filter(equipment => {
              const equipmentId = typeof equipment.equipmentId === 'string' 
                ? equipment.equipmentId 
                : (equipment.equipmentId as any)?._id || String(equipment.equipmentId || '');
              return equipmentId && equipmentId.trim() !== '';
            })
            .map(e => ({
              equipmentId: typeof e.equipmentId === 'string' 
                ? e.equipmentId 
                : (e.equipmentId as any)?._id || String(e.equipmentId || ''),
              quantity: e.quantity,
              notes: e.notes,
            }));
          return validEquipment.length > 0 ? validEquipment : undefined;
        })(),
        maxTicketsPerUser: formData.maxTicketsPerUser,
        allowBooking: formData.allowBooking,
        bookingStartDate: formData.bookingStartDate ? new Date(formData.bookingStartDate) : undefined,
        bookingEndDate: formData.bookingEndDate ? new Date(formData.bookingEndDate) : undefined,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        contactPerson: formData.contactPerson,
        termsAndConditions: formData.termsAndConditions,
        cancellationPolicy: formData.cancellationPolicy,
        pricing: {
          basePrice: 0, // Will be set from layout pricing
          serviceFee: 0,
          taxPercentage: 0,
        },
      };

      // Add venueOwnerId based on user role
      const eventData = userRole === 'admin' 
        ? { ...baseEventData, venueOwnerId: selectedVenueOwnerId }
        : { ...baseEventData, venueOwnerId: user?.id }; // Venue owner creates event for themselves

      // Debug logging
      console.log('Event data being sent:', {
        artists: eventData.artists,
        equipment: eventData.equipment,
        venueOwnerId: eventData.venueOwnerId,
        userRole,
        originalSelectedArtists: selectedArtists,
        originalSelectedEquipment: selectedEquipment
      });

      if (mode === 'edit' && initialEventId) {
        // Handle event updates (existing logic)
        const updated = userRole === 'admin'
          ? await eventService.updateEventAsAdmin(
              initialEventId,
              eventData,
              coverPhoto || undefined,
              token
            )
          : await eventService.updateEventAsVenueOwner(
              initialEventId,
              eventData,
              coverPhoto || undefined,
              token
            );
  if (onSaved) onSaved(updated._id);
  // Route to dashboard with locale prefix
  const dashboardRoute = userRole === 'admin' ? '/dashboard/admin/events' : '/dashboard/venue-owner/events';
  const locale = window.location.pathname.split('/')[1] || 'en';
  router.push(`/${locale}${dashboardRoute}`);
        return;
      }

      // Handle event creation with payment logic
      const paymentResponse = await EventPaymentService.createEventWithPayment({
        eventData,
        coverPhoto: coverPhoto || undefined,
        token,
        userRole: userRole || 'venue_owner',
        selectedArtists,
        selectedEquipment
      });

      if (paymentResponse.paymentRequired && paymentResponse.paymentLink) {
        // Save form data to localStorage before redirect (for retry functionality)
        const formDataToSave = {
          formData,
          selectedArtists,
          selectedEquipment,
          coverPhotoPreview,
          comboBookingId: paymentResponse.comboBookingId, // Save for retry
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('pendingEventData', JSON.stringify(formDataToSave));
        
        // Redirect to payment
        window.location.href = paymentResponse.paymentLink;
      } else {
        // No payment required or payment handled, event created
  // Clear any pending data
  localStorage.removeItem('pendingEventData');
        
  if (onSaved && paymentResponse.eventId) onSaved(paymentResponse.eventId);
  // Route to dashboard with locale prefix
  const dashboardRoute = userRole === 'admin' ? '/dashboard/admin/events' : '/dashboard/venue-owner/events';
  const locale = window.location.pathname.split('/')[1] || 'en';
  router.push(`/${locale}${dashboardRoute}`);
      }
    } catch (err: any) {
      console.error('Failed to create event:', err);
      setError(err.message || 'Failed to create event. Please try again.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Event Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="eventName">Event Name *</Label>
              <Input
                id="eventName"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter event name"
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your event..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="performanceType">Performance Type *</Label>
              <Select
                value={formData.performanceType}
                onValueChange={(value) => handleInputChange('performanceType', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select performance type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {PERFORMANCE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="visibility">Event Visibility *</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value: any) => handleInputChange('visibility', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {VISIBILITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div>{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cover Photo Upload */}
          <div>
            <Label>Event Cover Photo *</Label>
            <div className="mt-2 space-y-3">
              {!coverPhotoPreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-sm font-medium text-gray-700">
                      Upload event poster
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG up to 5MB (16:9 aspect ratio recommended)
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={coverPhotoPreview}
                    alt="Event cover preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverPhoto(null);
                      setCoverPhotoPreview('');
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDateTimeVenue = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date & Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="mt-1"
              />
              <div className="text-xs text-gray-400 mt-1">Debug: {formData.startDate || 'empty'}</div>
            </div>

            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="mt-1"
              />
              <div className="text-xs text-gray-400 mt-1">Debug: {formData.endDate || 'empty'}</div>
            </div>

            <div>
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className="mt-1"
              />
              <div className="text-xs text-gray-400 mt-1">Debug: {formData.startTime || 'empty'}</div>
            </div>

            <div>
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                className="mt-1"
              />
              <div className="text-xs text-gray-400 mt-1">Debug: {formData.endTime || 'empty'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Venue Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Venue Owner Selection (Admin Only) */}
            {userRole === 'admin' && (
              <div className="md:col-span-2">
                <Label htmlFor="venueOwner">Venue Owner *</Label>
                <Select
                  value={selectedVenueOwnerId}
                  onValueChange={(value) => {
                    console.log('📝 Venue owner selected:', value);
                    setSelectedVenueOwnerId(value);
                    // Clear layout selection when venue owner changes
                    handleInputChange('seatLayoutId', '');
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select venue owner" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {venueOwners
                      .filter(owner => owner.profile?._id) // Only show owners with valid profiles
                      .map((owner) => (
                        <SelectItem
                          key={owner._id}
                          value={owner.profile!._id!}
                        >
                          {owner.firstName} {owner.lastName} ({owner.email})
                          {owner.profile?.category && ` - ${owner.profile.category}`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Select which venue owner this event is for. Only layouts owned by this venue owner will be available.
                </p>
                {venueOwners.length > 0 && venueOwners.filter(o => o.profile?._id).length === 0 && (
                  <Alert className="mt-2">
                    <AlertDescription className="text-sm text-amber-700">
                      No venue owners with profiles found. Please ensure venue owners have completed their profiles.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="md:col-span-2">
              <Label htmlFor="venueName">Venue Name *</Label>
              <Input
                id="venueName"
                value={formData.venue.name}
                onChange={(e) => handleInputChange('venue.name', e.target.value)}
                placeholder="Enter venue name"
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="venueAddress">Address *</Label>
              <Input
                id="venueAddress"
                value={formData.venue.address}
                onChange={(e) => handleInputChange('venue.address', e.target.value)}
                placeholder="Enter venue address"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.venue.city}
                onChange={(e) => handleInputChange('venue.city', e.target.value)}
                placeholder="Enter city"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="state">State/Province *</Label>
              <Input
                id="state"
                value={formData.venue.state}
                onChange={(e) => handleInputChange('venue.state', e.target.value)}
                placeholder="Enter state or province"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={formData.venue.country}
                onChange={(e) => handleInputChange('venue.country', e.target.value)}
                placeholder="Enter country"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.venue.postalCode || ''}
                onChange={(e) => handleInputChange('venue.postalCode', e.target.value)}
                placeholder="Enter postal code"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="capacity">Venue Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.venue.capacity || ''}
                onChange={(e) => handleInputChange('venue.capacity', parseInt(e.target.value) || undefined)}
                placeholder="Enter capacity"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="venueType">Venue Type</Label>
              <Select
                value={formData.venue.venueType || 'not-selected'}
                onValueChange={(value) => handleInputChange('venue.venueType', value === 'not-selected' ? '' : value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select venue type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="not-selected">Select venue type</SelectItem>
                  <SelectItem value="theater">Theater</SelectItem>
                  <SelectItem value="concert_hall">Concert Hall</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                  <SelectItem value="club">Club</SelectItem>
                  <SelectItem value="arena">Arena</SelectItem>
                  <SelectItem value="stadium">Stadium</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seat Layout Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Seating Layout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userRole === 'admin' && !selectedVenueOwnerId && (
              <Alert>
                <AlertDescription className="text-sm text-amber-700">
                  Please select a venue owner first to see available seating layouts.
                </AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="seatLayout">Select Venue Layout</Label>
              <Select
                value={formData.seatLayoutId || 'none'}
                onValueChange={(value) => {
                  console.log('Seat layout selection changed to:', value);
                  handleInputChange('seatLayoutId', value === 'none' ? '' : value);
                }}
                disabled={userRole === 'admin' && !selectedVenueOwnerId}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={
                    userRole === 'admin' && !selectedVenueOwnerId 
                      ? "Select venue owner first" 
                      : "Choose a seating layout (optional)"
                  } />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="none">No seating layout</SelectItem>
                  {availableLayouts.map((layout) => (
                    <SelectItem key={layout._id} value={layout._id}>
                      {layout.name} ({layout.categories.length} categories)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                Select a seating layout to enable seat-map bookings. Ticket prices will be taken from the layout.
              </p>
              {/* Debug info */}
              <div className="text-xs text-gray-400 mt-2">
                Debug: Current seatLayoutId = {formData.seatLayoutId || 'none'} | Available layouts: {availableLayouts.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderArtistsAndEquipment = () => (
    <div className="space-y-6">
      {/* Artists Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Event Artists
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Book Professional Artists (Optional)</p>
              <p className="text-sm text-gray-500">
                Select professional artists or add custom artists for your event
              </p>
            </div>
            <Button
              onClick={() => setShowArtistBooking(true)}
              disabled={!formData.startDate || !formData.startTime || !formData.endTime || !formData.performanceType}
            >
              <Music className="h-4 w-4 mr-2" />
              Book Artists ({selectedArtists.length})
            </Button>
          </div>

          {/* Selected Artists Display */}
          {selectedArtists.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Selected Artists:</h4>
              {selectedArtists.map((artist, index) => (
                <div key={artist.artistId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {artist.isCustomArtist ? (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                    ) : (
                      <img
                        src={artist.artistPhoto || '/placeholder-artist.jpg'}
                        alt={artist.artistName || artist.customArtistName}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-artist.jpg';
                        }}
                      />
                    )}
                    <div>
                      <div className="font-medium">
                        {artist.isCustomArtist ? artist.customArtistName : artist.artistName}
                      </div>
                      <div className="text-sm text-gray-600">
                        ${artist.fee.toFixed(2)}
                        {artist.isCustomArtist && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Custom
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedArtists(prev => prev.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="text-right">
                <div className="font-semibold text-lg">
                  Total Artist Fees: ${selectedArtists.reduce((sum, artist) => sum + artist.fee, 0).toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {(!formData.startDate || !formData.startTime || !formData.endTime || !formData.performanceType) && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please complete the event date, time, and performance type in the previous steps to book artists.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Equipment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Equipment Rental
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Rent Professional Equipment (Optional)</p>
              <p className="text-sm text-gray-500">
                Select sound, lighting, and other equipment for your event
              </p>
            </div>
            <Button
              onClick={() => setShowEquipmentRental(true)}
              disabled={!formData.startDate || !formData.startTime || !formData.endTime}
            >
              <Settings className="h-4 w-4 mr-2" />
              Rent Equipment ({selectedEquipment.length})
            </Button>
          </div>

          {/* Selected Equipment Display */}
          {selectedEquipment.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Selected Equipment:</h4>
              {selectedEquipment.map((equipment, index) => (
                <div key={equipment.equipmentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Settings className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <div className="font-medium">{equipment.equipmentName}</div>
                      <div className="text-sm text-gray-600">
                        Qty: {equipment.quantity} × ${equipment.pricePerUnit} = ${equipment.totalPrice}
                      </div>
                      {equipment.notes && (
                        <div className="text-xs text-gray-500 mt-1">{equipment.notes}</div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedEquipment(prev => prev.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="text-right">
                <div className="font-semibold text-lg">
                  Total Equipment Cost: ${selectedEquipment.reduce((sum, equipment) => sum + (equipment.totalPrice || 0), 0)}
                </div>
              </div>
            </div>
          )}

          {(!formData.startDate || !formData.startTime || !formData.endTime) && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please complete the event date and time in the previous steps to rent equipment.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {(selectedArtists.length > 0 || selectedEquipment.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cost Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedArtists.length > 0 && (
                <div className="flex justify-between">
                  <span>Artists ({selectedArtists.length})</span>
                  <span>${selectedArtists.reduce((sum, artist) => sum + artist.fee, 0).toFixed(2)}</span>
                </div>
              )}
              {selectedEquipment.length > 0 && (
                <div className="flex justify-between">
                  <span>Equipment ({selectedEquipment.reduce((sum, eq) => sum + eq.quantity, 0)} items)</span>
                  <span>${selectedEquipment.reduce((sum, equipment) => sum + (equipment.totalPrice || 0), 0).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Total Event Cost</span>
                <span className="text-primary">
                  ${(selectedArtists.reduce((sum, artist) => sum + artist.fee, 0) + 
                    selectedEquipment.reduce((sum, equipment) => sum + (equipment.totalPrice || 0), 0)).toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500 text-center">
                *Final prices may vary based on actual booking terms and conditions
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderBookingSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Booking Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Booking</Label>
              <p className="text-sm text-gray-500">
                Enable ticket booking for this event
              </p>
            </div>
            <Switch
              checked={formData.allowBooking}
              onCheckedChange={(checked) => handleInputChange('allowBooking', checked)}
            />
          </div>

          {formData.allowBooking && (
            <>
              <div>
                <Label htmlFor="maxTickets">Maximum Tickets per User *</Label>
                <Input
                  id="maxTickets"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.maxTicketsPerUser}
                  onChange={(e) => handleInputChange('maxTicketsPerUser', parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bookingStart">Booking Start Date</Label>
                  <Input
                    id="bookingStart"
                    type="date"
                    value={formData.bookingStartDate || ''}
                    onChange={(e) => handleInputChange('bookingStartDate', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="bookingEnd">Booking End Date</Label>
                  <Input
                    id="bookingEnd"
                    type="date"
                    value={formData.bookingEndDate || ''}
                    onChange={(e) => handleInputChange('bookingEndDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Contact & Policies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail || ''}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="contact@example.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone || ''}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="+1 234 567 8900"
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson || ''}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                placeholder="Event organizer name"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="termsConditions">Terms & Conditions</Label>
            <Textarea
              id="termsConditions"
              value={formData.termsAndConditions || ''}
              onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
              placeholder="Enter terms and conditions for this event..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
            <Textarea
              id="cancellationPolicy"
              value={formData.cancellationPolicy || ''}
              onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
              placeholder="Enter cancellation policy..."
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {mode === 'edit' 
            ? (userRole === 'admin' ? 'Edit Event (Admin)' : 'Edit Event')
            : (userRole === 'admin' ? 'Create New Event (Admin)' : 'Create New Event')
          }
        </h1>
        <p className="text-gray-600">
          {mode === 'edit' 
            ? 'Update your event details, artists, equipment, and settings'
            : 'Set up your event details, add artists and equipment, and configure booking settings'
          }
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Multi-step Form */}
      <Tabs value={`step-${currentStep}`} onValueChange={(value) => setCurrentStep(parseInt(value.split('-')[1]))}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="step-1" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="step-2" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date & Venue
          </TabsTrigger>
          <TabsTrigger value="step-3" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Artists & Equipment
          </TabsTrigger>
          <TabsTrigger value="step-4" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="step-1" className="space-y-0">
          {renderBasicInfo()}
        </TabsContent>

        <TabsContent value="step-2" className="space-y-0">
          {renderDateTimeVenue()}
        </TabsContent>

        <TabsContent value="step-3" className="space-y-0">
          {renderArtistsAndEquipment()}
        </TabsContent>

        <TabsContent value="step-4" className="space-y-0">
          {renderBookingSettings()}
        </TabsContent>
      </Tabs>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <div className="flex gap-2">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
            >
              Previous
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showPreview ? 'Hide Preview' : 'Preview'}
          </Button>

          {currentStep < 4 ? (
            <Button onClick={() => setCurrentStep(prev => prev + 1)}>
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {mode === 'edit' ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {mode === 'edit' ? 'Update Event' : 'Create Event'}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showImageCropper && tempImageSrc && (
        <ImageCropper
          src={tempImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setShowImageCropper(false)}
          aspectRatio={16/9}
          cropShape="rect"
          locale="en"
        />
      )}

      {/* Artist Booking Flow */}
      <ArtistBookingFlow
        isOpen={showArtistBooking}
        onClose={() => setShowArtistBooking(false)}
        onArtistsSelected={handleArtistsSelected}
        selectedArtists={selectedArtists}
        eventDate={formData.startDate}
        eventStartTime={formData.startTime}
        eventEndTime={formData.endTime}
        performanceType={formData.performanceType}
      />

      {/* Equipment Rental Flow */}
      <EquipmentRentalFlow
        isOpen={showEquipmentRental}
        onClose={() => setShowEquipmentRental(false)}
        onEquipmentSelected={handleEquipmentSelected}
        selectedEquipment={selectedEquipment}
        eventDate={formData.startDate}
        eventDuration={calculateEventDuration()}
      />

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Error
            </DialogTitle>
            <DialogDescription className="text-base pt-4">
              {error || 'An unexpected error occurred.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowErrorModal(false)}
              className="w-full"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
