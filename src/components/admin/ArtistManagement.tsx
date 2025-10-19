'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Star, 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Mail,
  Phone,
  User,
  UserCheck,
  UserX,
  X,
  EyeOff,
  Camera,
  Upload,
  Trash2,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { ArtistService, Artist } from '@/services/artist.service';
import { AdminService } from '@/services/admin.service';
import { UserService } from '@/services/user.service';
import { ImageCropper } from '@/components/ui/ImageCropper';
import { PricingSettings } from './PricingSettings';

export function ArtistManagement() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingArtist, setIsCreatingArtist] = useState(false); 
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState(1); // Multi-step form state
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditingArtist, setIsEditingArtist] = useState(false);
  const [isDeletingArtist, setIsDeletingArtist] = useState(false);

  const [createArtistForm, setCreateArtistForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    stageName: '',
    about: '',
    yearsOfExperience: 0,
    skills: [] as string[],
    musicLanguages: [] as string[],
    awards: [] as string[],
    pricePerHour: 0,
    gender: '',
    artistType: '',
    category: '',
    customCategory: '', // Add custom category field
    country: '',
    performPreference: [] as string[],
    youtubeLink: '',
    cooldownPeriodHours: 2,
    maximumPerformanceHours: 4,
  });

  // Edit form state
  const [editArtistForm, setEditArtistForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    stageName: '',
    about: '',
    yearsOfExperience: 0,
    skills: [] as string[],
    musicLanguages: [] as string[],
    awards: [] as string[],
    pricePerHour: 0,
    gender: '',
    artistType: '',
    category: '',
    customCategory: '', 
    country: '',
    performPreference: [] as string[],
    youtubeLink: '',
    cooldownPeriodHours: 2,
    maximumPerformanceHours: 4,
    isVisible: true,
    isActive: true,
  });

  // Edit pricing form state
  const [editPricingForm, setEditPricingForm] = useState({
    pricingMode: 'duration' as 'duration' | 'timeslot',
    // Legacy duration-based pricing
    privatePricing: [{ hours: 1, amount: 0 }],
    publicPricing: [{ hours: 1, amount: 0 }],
    workshopPricing: [{ hours: 1, amount: 0 }],
    internationalPricing: [{ hours: 1, amount: 0 }],
    // Time slot pricing
    privateTimeSlotPricing: [] as { hour: number; rate: number }[],
    publicTimeSlotPricing: [] as { hour: number; rate: number }[],
    workshopTimeSlotPricing: [] as { hour: number; rate: number }[],
    internationalTimeSlotPricing: [] as { hour: number; rate: number }[],
    // Base rates
    basePrivateRate: 0,
    basePublicRate: 0,
    baseWorkshopRate: 0,
    baseInternationalRate: 0,
  });

  // Pricing form state
  const [pricingForm, setPricingForm] = useState({
    pricingMode: 'duration' as 'duration' | 'timeslot',
    // Legacy duration-based pricing
    privatePricing: [{ hours: 1, amount: 0 }],
    publicPricing: [{ hours: 1, amount: 0 }],
    workshopPricing: [{ hours: 1, amount: 0 }],
    internationalPricing: [{ hours: 1, amount: 0 }],
    // Time slot pricing
    privateTimeSlotPricing: [] as { hour: number; rate: number }[],
    publicTimeSlotPricing: [] as { hour: number; rate: number }[],
    workshopTimeSlotPricing: [] as { hour: number; rate: number }[],
    internationalTimeSlotPricing: [] as { hour: number; rate: number }[],
    // Base rates
    basePrivateRate: 0,
    basePublicRate: 0,
    baseWorkshopRate: 0,
    baseInternationalRate: 0,
  });

  // Artist settings (extracted from main form for clarity)
  const [artistSettings, setArtistSettings] = useState({
    cooldownPeriodHours: 2,
    maximumPerformanceHours: 4,
  });

  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newAward, setNewAward] = useState('');

  // Edit form specific inputs
  const [editNewSkill, setEditNewSkill] = useState('');
  const [editNewLanguage, setEditNewLanguage] = useState('');
  const [editNewAward, setEditNewAward] = useState('');

  // Image upload states
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const [showCropper, setShowCropper] = useState(false);
  const [cropperImage, setCropperImage] = useState<string>('');
  const [currentCropType, setCurrentCropType] = useState<'profile' | 'cover'>('profile');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const artistsData = await ArtistService.getPrivateArtists();
      setArtists(artistsData);
    } catch (error: any) {
      setError('Failed to load data: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleArtistStatus = async (userId: string) => {
    setError('');
    setSuccess('');

    try {
      await UserService.toggleUserStatus(userId);
      setSuccess('Artist status updated successfully!');
      loadData();
    } catch (error: any) {
      setError('Failed to update artist status: ' + (error.message || 'Unknown error'));
    }
  };

  const handleToggleArtistVisibility = async (artistId: string, currentVisibility: boolean) => {
    setError('');
    setSuccess('');

    try {
      await ArtistService.toggleArtistVisibility(artistId, !currentVisibility);
      setSuccess(`Artist ${!currentVisibility ? 'shown' : 'hidden'} on homepage successfully!`);
      loadData();
    } catch (error: any) {
      setError('Failed to update artist visibility: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeleteArtist = async (artistId: string, artistName: string) => {
    if (!confirm(`Are you sure you want to delete "${artistName}"? This action cannot be undone and will delete all associated data including the user account.`)) {
      return;
    }

    setError('');
    setSuccess('');
    setIsDeletingArtist(true);

    try {
      await ArtistService.deleteArtist(artistId);
      setSuccess(`Artist "${artistName}" deleted successfully!`);
      loadData();
    } catch (error: any) {
      setError('Failed to delete artist: ' + (error.message || 'Unknown error'));
    } finally {
      setIsDeletingArtist(false);
    }
  };

  const handleEditArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedArtist) return;

    setError('');
    setSuccess('');

    // Validate custom category if "Other" is selected
    if (editArtistForm.category === 'OTHER' && !editArtistForm.customCategory.trim()) {
      setError('Please enter a custom category');
      return;
    }

    setIsEditingArtist(true);

    try {
      const formData = new FormData();
      
      // Add all form fields
      Object.keys(editArtistForm).forEach(key => {
        let value = (editArtistForm as any)[key];
        
        // Skip customCategory field as it's only used for UI logic
        if (key === 'customCategory') {
          return;
        }
        
        // Handle category field - use custom category if "Other" is selected
        if (key === 'category' && editArtistForm.category === 'OTHER') {
          value = editArtistForm.customCategory;
        }
        
        // Handle different data types properly for FormData
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else if (typeof value === 'number') {
          formData.append(key, value.toString());
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      // Add pricing fields
      Object.keys(editPricingForm).forEach(key => {
        const value = (editPricingForm as any)[key];
        
        // Handle different data types properly for FormData
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else if (typeof value === 'number') {
          formData.append(key, value.toString());
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      // Add images if selected
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }
      if (coverImage) {
        formData.append('profileCoverImage', coverImage);
      }

      await ArtistService.editArtist(selectedArtist._id, formData);
      setSuccess('Artist updated successfully!');
      setShowEditModal(false);
      resetEditForm();
      loadData();
    } catch (error: any) {
      console.error('Edit artist error:', error);
      const errorMessage = error.data?.message || error.message || 'Unknown error';
      setError('Failed to update artist: ' + errorMessage);
    } finally {
      setIsEditingArtist(false);
    }
  };

  const resetEditForm = () => {
    setEditArtistForm({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      stageName: '',
      about: '',
      yearsOfExperience: 0,
      skills: [],
      musicLanguages: [],
      awards: [],
      pricePerHour: 0,
      gender: '',
      artistType: '',
      category: '',
      customCategory: '',
      country: '',
      performPreference: [],
      youtubeLink: '',
      cooldownPeriodHours: 2,
      maximumPerformanceHours: 4,
      isVisible: true,
      isActive: true,
    });
    setEditPricingForm({
      pricingMode: 'duration',
      privatePricing: [{ hours: 1, amount: 0 }],
      publicPricing: [{ hours: 1, amount: 0 }],
      workshopPricing: [{ hours: 1, amount: 0 }],
      internationalPricing: [{ hours: 1, amount: 0 }],
      privateTimeSlotPricing: [],
      publicTimeSlotPricing: [],
      workshopTimeSlotPricing: [],
      internationalTimeSlotPricing: [],
      basePrivateRate: 0,
      basePublicRate: 0,
      baseWorkshopRate: 0,
      baseInternationalRate: 0,
    });
    setProfileImage(null);
    setCoverImage(null);
    setProfileImagePreview('');
    setCoverImagePreview('');
    setEditNewSkill('');
    setEditNewLanguage('');
    setEditNewAward('');
  };

  const populateEditForm = (artist: Artist) => {
    const predefinedCategories = ['VOCALIST', 'INSTRUMENTALIST', 'BAND', 'DJ', 'DANCER'];
    const isCustomCategory = artist.category && !predefinedCategories.includes(artist.category);
    
    setEditArtistForm({
      firstName: artist.user?.firstName || '',
      lastName: artist.user?.lastName || '',
      phoneNumber: artist.user?.phoneNumber || '',
      email: artist.user?.email || '',
      stageName: artist.stageName || '',
      about: artist.about || '',
      yearsOfExperience: artist.yearsOfExperience || 0,
      skills: artist.skills || [],
      musicLanguages: artist.musicLanguages || [],
      awards: artist.awards || [],
      pricePerHour: artist.pricePerHour || 0,
      gender: '', // Will need to be fetched from full artist profile
      artistType: '', // Will need to be fetched from full artist profile
      category: isCustomCategory ? 'OTHER' : (artist.category || ''),
      customCategory: isCustomCategory ? artist.category || '' : '',
      country: artist.country || '',
      performPreference: artist.performPreference || [],
      youtubeLink: artist.youtubeLink || '',
      cooldownPeriodHours: artist.cooldownPeriodHours || 2,
      maximumPerformanceHours: artist.maximumPerformanceHours || 4,
      isVisible: artist.isVisible !== false,
      isActive: artist.user?.isActive !== false,
    });
    
    // Load pricing data for the artist
    loadPricingData(artist._id);
  };

  const loadPricingData = async (artistId: string) => {
    try {
      const pricing = await ArtistService.getArtistPricing(artistId);
      if (pricing) {
        setEditPricingForm({
          pricingMode: pricing.pricingMode || 'duration',
          privatePricing: pricing.privatePricing || [{ hours: 1, amount: 0 }],
          publicPricing: pricing.publicPricing || [{ hours: 1, amount: 0 }],
          workshopPricing: pricing.workshopPricing || [{ hours: 1, amount: 0 }],
          internationalPricing: pricing.internationalPricing || [{ hours: 1, amount: 0 }],
          privateTimeSlotPricing: pricing.privateTimeSlotPricing || [],
          publicTimeSlotPricing: pricing.publicTimeSlotPricing || [],
          workshopTimeSlotPricing: pricing.workshopTimeSlotPricing || [],
          internationalTimeSlotPricing: pricing.internationalTimeSlotPricing || [],
          basePrivateRate: pricing.basePrivateRate || 0,
          basePublicRate: pricing.basePublicRate || 0,
          baseWorkshopRate: pricing.baseWorkshopRate || 0,
          baseInternationalRate: pricing.baseInternationalRate || 0,
        });
      }
    } catch (error) {
      console.warn('Failed to load pricing data:', error);
      // Keep default pricing form values
    }
  };

  const handleCreateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (createStep === 1) {
      // Validate step 1 fields
      if (!createArtistForm.firstName || !createArtistForm.lastName || !createArtistForm.email || 
          !createArtistForm.phoneNumber || !createArtistForm.stageName || !createArtistForm.artistType ||
          !createArtistForm.category || !createArtistForm.country || !createArtistForm.gender) {
        setError('Please fill in all required fields');
        return;
      }
      
      // Validate custom category if "Other" is selected
      if (createArtistForm.category === 'OTHER' && !createArtistForm.customCategory.trim()) {
        setError('Please enter a custom category');
        return;
      }
      
      // Move to step 2
      setCreateStep(2);
      return;
    }

    // Step 2 - Final submission
    setError('');
    setSuccess('');
    
    // Validate pricing configuration before starting creation
    const hasTimeSlotPricing = (pricingForm.privateTimeSlotPricing.length > 0 || 
           pricingForm.publicTimeSlotPricing.length > 0 ||
           pricingForm.workshopTimeSlotPricing.length > 0 ||
           pricingForm.internationalTimeSlotPricing.length > 0 ||
           pricingForm.basePrivateRate > 0 ||
           pricingForm.basePublicRate > 0 ||
           pricingForm.baseWorkshopRate > 0 ||
           pricingForm.baseInternationalRate > 0);
           
    const hasDurationPricing = (pricingForm.privatePricing.some(p => p.amount > 0) ||
           pricingForm.publicPricing.some(p => p.amount > 0) ||
           pricingForm.workshopPricing.some(p => p.amount > 0) ||
           pricingForm.internationalPricing.some(p => p.amount > 0));

    // Require at least one pricing configuration
    if (pricingForm.pricingMode === 'timeslot' && !hasTimeSlotPricing) {
      setError('Please configure at least one time slot pricing or base rate before creating the artist.');
      return;
    }
    
    if (pricingForm.pricingMode === 'duration' && !hasDurationPricing) {
      setError('Please configure at least one duration pricing before creating the artist.');
      return;
    }
    
    setIsCreatingArtist(true); // Start loading
    
    try {
      // Prepare artist data with performance settings
      const artistData = {
        ...createArtistForm,
        // Use custom category if "Other" is selected, otherwise use the selected category
        category: createArtistForm.category === 'OTHER' ? createArtistForm.customCategory : createArtistForm.category,
        // Map frontend field names to backend field names
        cooldownPeriod: artistSettings.cooldownPeriodHours,
        maximumPerformHour: artistSettings.maximumPerformanceHours,
      };

      // Validate required fields before sending
      const requiredFields: (keyof typeof artistData)[] = ['firstName', 'lastName', 'email', 'phoneNumber', 'stageName', 'artistType', 'category', 'country', 'gender', 'cooldownPeriod', 'maximumPerformHour'];
      const missingFields = requiredFields.filter(field => !artistData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Prepare files object
      const files: {
        profileImage?: File;
        profileCoverImage?: File;
      } = {};
      
      if (profileImage) files.profileImage = profileImage;
      if (coverImage) files.profileCoverImage = coverImage;

      const createdArtist = await ArtistService.createArtist(artistData, files);
      
   
      if (createdArtist && createdArtist.profile && createdArtist.profile._id) {        
        const hasTimeSlotPricing = (pricingForm.privateTimeSlotPricing.length > 0 || 
               pricingForm.publicTimeSlotPricing.length > 0 ||
               pricingForm.workshopTimeSlotPricing.length > 0 ||
               pricingForm.internationalTimeSlotPricing.length > 0 ||
               pricingForm.basePrivateRate > 0 ||
               pricingForm.basePublicRate > 0 ||
               pricingForm.baseWorkshopRate > 0 ||
               pricingForm.baseInternationalRate > 0);
               
        const hasDurationPricing = (pricingForm.privatePricing.some(p => p.amount > 0) ||
               pricingForm.publicPricing.some(p => p.amount > 0) ||
               pricingForm.workshopPricing.some(p => p.amount > 0) ||
               pricingForm.internationalPricing.some(p => p.amount > 0));

        // If any pricing is configured, it MUST be saved successfully for artist creation to complete
        if ((pricingForm.pricingMode === 'timeslot' && hasTimeSlotPricing) || 
            (pricingForm.pricingMode === 'duration' && hasDurationPricing)) {
          
          // Check if pricing already exists to avoid conflicts
          let existingPricing = null;
          try {
            existingPricing = await ArtistService.getArtistPricing(createdArtist.profile._id);
          } catch (getError: any) {
            if (getError.status !== 404) {
              // If it's not a 404 (not found), it's a real error that should fail the creation
              throw new Error(`Failed to check existing pricing: ${getError.message}`);
            }
            // 404 is fine - means no existing pricing
          }
          
          if (existingPricing) {
            await ArtistService.updateArtistBasicPricing(createdArtist.profile._id, pricingForm);
          } else {
            await ArtistService.createArtistPricing(createdArtist.profile._id, pricingForm);
          }
        }
      }

      setSuccess('Artist created successfully!');
      
      await loadData();
      
      setTimeout(() => {
        setIsCreatingArtist(false); 
        setShowCreateModal(false);
        setCreateStep(1); 
        resetCreateForm();
      }, 1000); 
      
    } catch (error: any) {
      console.error('Failed to create artist:', error);
      
      // Determine if this was an artist creation failure or pricing failure
      let errorMessage = 'Failed to create artist: ';
      
      if (error.message && error.message.includes('pricing')) {
        errorMessage += `Pricing configuration error - ${error.message}. Please verify all pricing settings are correctly filled.`;
      } else if (error.message && error.message.includes('Failed to check existing pricing')) {
        errorMessage += `Unable to validate pricing data - ${error.message}. Please try again.`;
      } else {
        errorMessage += error.message || 'Unknown error occurred during artist creation.';
      }
      
      setError(errorMessage);
      setIsCreatingArtist(false); // End loading on error
    }
  };

  const resetCreateForm = () => {
    setCreateArtistForm({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      stageName: '',
      about: '',
      yearsOfExperience: 0,
      skills: [],
      musicLanguages: [],
      awards: [],
      pricePerHour: 0,
      gender: '',
      artistType: '',
      category: '',
      customCategory: '', // Add custom category to reset
      country: '',
      performPreference: [],
      youtubeLink: '',
      cooldownPeriodHours: 2,
      maximumPerformanceHours: 4,
    });
    setPricingForm({
      pricingMode: 'duration',
      privatePricing: [{ hours: 1, amount: 0 }],
      publicPricing: [{ hours: 1, amount: 0 }],
      workshopPricing: [{ hours: 1, amount: 0 }],
      internationalPricing: [{ hours: 1, amount: 0 }],
      privateTimeSlotPricing: [],
      publicTimeSlotPricing: [],
      workshopTimeSlotPricing: [],
      internationalTimeSlotPricing: [],
      basePrivateRate: 0,
      basePublicRate: 0,
      baseWorkshopRate: 0,
      baseInternationalRate: 0,
    });
    setArtistSettings({
      cooldownPeriodHours: 2,
      maximumPerformanceHours: 4,
    });
    setCreateStep(1);
    setNewSkill('');
    setNewLanguage('');
    setNewAward('');
    
    // Reset image states
    setProfileImage(null);
    setCoverImage(null);
    setProfileImagePreview('');
    setCoverImagePreview('');
  };

  const addSkill = () => {
    if (newSkill.trim() && !createArtistForm.skills.includes(newSkill.trim())) {
      setCreateArtistForm(prev => ({ 
        ...prev, 
        skills: [...prev.skills, newSkill.trim()] 
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setCreateArtistForm(prev => ({ 
      ...prev, 
      skills: prev.skills.filter(s => s !== skill) 
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !createArtistForm.musicLanguages.includes(newLanguage.trim())) {
      setCreateArtistForm(prev => ({ 
        ...prev, 
        musicLanguages: [...prev.musicLanguages, newLanguage.trim()] 
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setCreateArtistForm(prev => ({ 
      ...prev, 
      musicLanguages: prev.musicLanguages.filter(l => l !== language) 
    }));
  };

  const addAward = () => {
    if (newAward.trim() && !createArtistForm.awards.includes(newAward.trim())) {
      setCreateArtistForm(prev => ({ 
        ...prev, 
        awards: [...prev.awards, newAward.trim()] 
      }));
      setNewAward('');
    }
  };

  const removeAward = (award: string) => {
    setCreateArtistForm(prev => ({ 
      ...prev, 
      awards: prev.awards.filter(a => a !== award) 
    }));
  };

  // Edit form array handlers
  const addEditSkill = () => {
    if (editNewSkill.trim() && !editArtistForm.skills.includes(editNewSkill.trim())) {
      setEditArtistForm(prev => ({ 
        ...prev, 
        skills: [...prev.skills, editNewSkill.trim()] 
      }));
      setEditNewSkill('');
    }
  };

  const removeEditSkill = (skill: string) => {
    setEditArtistForm(prev => ({ 
      ...prev, 
      skills: prev.skills.filter(s => s !== skill) 
    }));
  };

  const addEditLanguage = () => {
    if (editNewLanguage.trim() && !editArtistForm.musicLanguages.includes(editNewLanguage.trim())) {
      setEditArtistForm(prev => ({ 
        ...prev, 
        musicLanguages: [...prev.musicLanguages, editNewLanguage.trim()] 
      }));
      setEditNewLanguage('');
    }
  };

  const removeEditLanguage = (language: string) => {
    setEditArtistForm(prev => ({ 
      ...prev, 
      musicLanguages: prev.musicLanguages.filter(l => l !== language) 
    }));
  };

  const addEditAward = () => {
    if (editNewAward.trim() && !editArtistForm.awards.includes(editNewAward.trim())) {
      setEditArtistForm(prev => ({ 
        ...prev, 
        awards: [...prev.awards, editNewAward.trim()] 
      }));
      setEditNewAward('');
    }
  };

  const removeEditAward = (award: string) => {
    setEditArtistForm(prev => ({ 
      ...prev, 
      awards: prev.awards.filter(a => a !== award) 
    }));
  };

  // Image handling functions
  const handleImageSelect = (event: Event, type: 'profile' | 'cover') => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCropperImage(result);
        setCurrentCropType(type);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImageBlob: Blob) => {
    const file = new File([croppedImageBlob], `${currentCropType}-image.jpg`, { type: 'image/jpeg' });
    const previewUrl = URL.createObjectURL(croppedImageBlob);
    
    if (currentCropType === 'profile') {
      setProfileImage(file);
      setProfileImagePreview(previewUrl);
    } else {
      setCoverImage(file);
      setCoverImagePreview(previewUrl);
    }
    
    setShowCropper(false);
    setCropperImage('');
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setCropperImage('');
  };

  const filteredArtists = artists.filter(artist => {
  const matchesSearch = (artist.stageName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
             (artist.user?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
             (artist.user?.lastName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         (artist.category || '').toLowerCase() === selectedFilter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Artist Management</h1>
          <p className="text-gray-600">Manage artists and their profiles</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowCreateModal(true);
              setError(''); // Clear any previous errors
              setSuccess(''); // Clear any previous success messages
              setCreateStep(1); // Reset to step 1
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Artist
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Artists</p>
              <p className="text-2xl font-bold text-gray-900">{artists.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Artists</p>
              <p className="text-2xl font-bold text-gray-900">
                {artists.filter(artist => !!artist.user?.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {artists.length > 0 ? Math.round(artists.reduce((sum, artist) => sum + artist.pricePerHour, 0) / artists.length) : 0} KWD
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search artists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="all">All Categories</option>
          <option value="music">Music</option>
          <option value="dance">Dance</option>
          <option value="art">Art</option>
          <option value="theater">Theater</option>
        </select>
      </div>

      {/* Artists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtists.map((artist) => (
          <div key={artist._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 bg-gradient-to-br from-purple-500 to-blue-600">
              {artist.profileCoverImage ? (
                <img 
                  src={artist.profileCoverImage} 
                  alt={artist.stageName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold">
                        {(artist.user?.firstName?.charAt(0) || 'A')}{(artist.user?.lastName?.charAt(0) || 'R')}
                      </span>
                    </div>
                    <p className="text-sm">{artist.stageName}</p>
                  </div>
                </div>
              )}
              
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                {artist.category}
              </div>

              <div className="absolute top-4 left-4 flex flex-col gap-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  artist.user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {artist.user?.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  artist.isVisible !== false ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {artist.isVisible !== false ? 'Visible' : 'Hidden'}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{artist.stageName || 'Unknown Artist'}</h3>
                  <p className="text-sm text-gray-600">{artist.user?.firstName || 'Unknown'} {artist.user?.lastName || 'Artist'}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{artist.likeCount || 0}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{artist.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{artist.yearsOfExperience} years experience</span>
                </div>
                <div className="font-semibold text-gray-900">
                  {artist.pricePerHour} KWD/hour
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => {
                    setSelectedArtist(artist);
                    setShowViewModal(true);
                  }}
                  className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button 
                  onClick={() => {
                    setSelectedArtist(artist);
                    populateEditForm(artist);
                    setShowEditModal(true);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteArtist(artist._id, artist.stageName)}
                  className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>

              <div className="mt-2 flex gap-2">
                <button 
                  onClick={() => artist.user && handleToggleArtistStatus(artist.user._id)}
                  disabled={!artist.user}
                  className={`flex-1 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                    !artist.user 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : artist.user?.isActive 
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                  title={
                    !artist.user 
                      ? 'No user account linked' 
                      : artist.user?.isActive ? 'Deactivate Artist' : 'Activate Artist'
                  }
                >
                  {!artist.user ? (
                    <>
                      <User className="w-4 h-4" />
                      No User
                    </>
                  ) : artist.user?.isActive ? (
                    <>
                      <UserX className="w-4 h-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Activate
                    </>
                  )}
                </button>
                <button 
                  onClick={() => handleToggleArtistVisibility(artist._id, artist.isVisible !== false)}
                  className={`flex-1 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                    artist.isVisible !== false
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={artist.isVisible !== false ? 'Hide from Homepage' : 'Show on Homepage'}
                >
                  {artist.isVisible !== false ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Show
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredArtists.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No artists found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}

      {/* View Artist Modal */}
      {showViewModal && selectedArtist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Artist Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Artist Header */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">
                      {(selectedArtist.user?.firstName?.charAt(0) || 'A')}{(selectedArtist.user?.lastName?.charAt(0) || 'R')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedArtist.stageName}</h3>
                  <p className="text-gray-600">{selectedArtist.user?.firstName || 'Unknown'} {selectedArtist.user?.lastName || 'Artist'}</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                    selectedArtist.user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedArtist.user?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedArtist.user?.email || '—'}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{selectedArtist.user?.phoneNumber || '—'}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Category</label>
                    <p className="text-gray-900">{selectedArtist.category}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Country</label>
                    <p className="text-gray-900">{selectedArtist.country}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Experience</label>
                    <p className="text-gray-900">{selectedArtist.yearsOfExperience} years</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Rate</label>
                    <p className="text-gray-900">{selectedArtist.pricePerHour} KWD/hour</p>
                  </div>
                </div>

                {/* About */}
                <div>
                  <label className="block font-medium text-gray-700 mb-1">About</label>
                  <p className="text-gray-900">{selectedArtist.about || 'No description provided'}</p>
                </div>

                {/* Skills */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedArtist.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Languages</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedArtist.musicLanguages.map((lang, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Artist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Add New Artist - Step {createStep} of 2
                  </h2>
                  <div className="flex items-center mt-2 space-x-2">
                    <div className={`w-4 h-4 rounded-full ${createStep >= 1 ? 'bg-purple-600' : 'bg-gray-300'}`} />
                    <div className="w-8 h-1 bg-gray-300">
                      <div className={`h-full bg-purple-600 transition-all duration-300 ${createStep >= 2 ? 'w-full' : 'w-0'}`} />
                    </div>
                    <div className={`w-4 h-4 rounded-full ${createStep >= 2 ? 'bg-purple-600' : 'bg-gray-300'}`} />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {createStep === 1 ? 'Basic Information' : 'Pricing & Performance Settings'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateArtist} className="space-y-6">
                {createStep === 1 ? (
                  <>
                    {/* Step 1: Basic Information */}
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={createArtistForm.firstName}
                        onChange={(e) => setCreateArtistForm(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={createArtistForm.lastName}
                        onChange={(e) => setCreateArtistForm(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={createArtistForm.email}
                        onChange={(e) => setCreateArtistForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={createArtistForm.phoneNumber}
                        onChange={(e) => setCreateArtistForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Profile Images */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Images</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Profile Photo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Photo
                      </label>
                      <div className="flex flex-col items-center space-y-3">
                        <div className="relative">
                          <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                            {profileImagePreview ? (
                              <img 
                                src={profileImagePreview} 
                                alt="Profile preview" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center">
                                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-xs text-gray-500">Profile Photo</p>
                              </div>
                            )}
                          </div>
                          {profileImagePreview && (
                            <button
                              type="button"
                              onClick={() => {
                                setProfileImage(null);
                                setProfileImagePreview('');
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => handleImageSelect(e, 'profile');
                            input.click();
                          }}
                          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Upload Photo</span>
                        </button>
                      </div>
                    </div>

                    {/* Cover Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cover Image
                      </label>
                      <div className="flex flex-col items-center space-y-3">
                        <div className="relative">
                          <div className="w-48 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                            {coverImagePreview ? (
                              <img 
                                src={coverImagePreview} 
                                alt="Cover preview" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center">
                                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-xs text-gray-500">Cover Image</p>
                              </div>
                            )}
                          </div>
                          {coverImagePreview && (
                            <button
                              type="button"
                              onClick={() => {
                                setCoverImage(null);
                                setCoverImagePreview('');
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => handleImageSelect(e, 'cover');
                            input.click();
                          }}
                          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Upload Cover</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* YouTube Demo Video Link */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    YouTube Demo Video Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={createArtistForm.youtubeLink}
                    onChange={(e) => setCreateArtistForm(prev => ({ ...prev, youtubeLink: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500">Add a YouTube link to showcase the artist's demo video</p>
                </div>

                {/* Artist Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Artist Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stage Name *
                      </label>
                      <input
                        type="text"
                        value={createArtistForm.stageName}
                        onChange={(e) => setCreateArtistForm(prev => ({ ...prev, stageName: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={createArtistForm.category}
                        onChange={(e) => setCreateArtistForm(prev => ({ ...prev, category: e.target.value, customCategory: e.target.value !== 'OTHER' ? '' : prev.customCategory }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">Select Category</option>
                        <option value="VOCALIST">Vocalist</option>
                        <option value="INSTRUMENTALIST">Instrumentalist</option>
                        <option value="BAND">Band</option>
                        <option value="DJ">DJ</option>
                        <option value="DANCER">Dancer</option>
                        <option value="OTHER">Other</option>
                      </select>
                      {createArtistForm.category === 'OTHER' && (
                        <div className="mt-2">
                          <input
                            type="text"
                            value={createArtistForm.customCategory}
                            onChange={(e) => setCreateArtistForm(prev => ({ ...prev, customCategory: e.target.value }))}
                            placeholder="Enter custom category"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Artist Type *
                      </label>
                      <input
                        type="text"
                        value={createArtistForm.artistType}
                        onChange={(e) => setCreateArtistForm(prev => ({ ...prev, artistType: e.target.value }))}
                        required
                        placeholder="Enter artist type (e.g., Singer, Musician, Performer)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender *
                      </label>
                      <select
                        value={createArtistForm.gender}
                        onChange={(e) => setCreateArtistForm(prev => ({ ...prev, gender: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <input
                        type="text"
                        value={createArtistForm.country}
                        onChange={(e) => setCreateArtistForm(prev => ({ ...prev, country: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={createArtistForm.yearsOfExperience}
                        onChange={(e) => setCreateArtistForm(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price per Hour (KWD)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={createArtistForm.pricePerHour}
                        onChange={(e) => setCreateArtistForm(prev => ({ ...prev, pricePerHour: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      About
                    </label>
                    <textarea
                      value={createArtistForm.about}
                      onChange={(e) => setCreateArtistForm(prev => ({ ...prev, about: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Skills</h3>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {createArtistForm.skills.map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-2 text-purple-600 hover:text-purple-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Music Languages */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Music Languages</h3>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        placeholder="Add a language"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                      />
                      <button
                        type="button"
                        onClick={addLanguage}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {createArtistForm.musicLanguages.map((language, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          {language}
                          <button
                            type="button"
                            onClick={() => removeLanguage(language)}
                            className="ml-2 text-green-600 hover:text-green-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Performance Preferences */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Preferences</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Select up to 4 performance preferences:</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {['private', 'public', 'international', 'workshop'].map((pref) => (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => {
                            const isSelected = createArtistForm.performPreference.includes(pref);
                            if (isSelected) {
                              // Remove preference
                              setCreateArtistForm(prev => ({
                                ...prev,
                                performPreference: prev.performPreference.filter(p => p !== pref)
                              }));
                            } else if (createArtistForm.performPreference.length < 4) {
                              // Add preference if under limit
                              setCreateArtistForm(prev => ({
                                ...prev,
                                performPreference: [...prev.performPreference, pref]
                              }));
                            }
                          }}
                          className={`p-3 text-sm border rounded-lg transition-colors ${
                            createArtistForm.performPreference.includes(pref)
                              ? 'bg-purple-100 border-purple-500 text-purple-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          } ${
                            !createArtistForm.performPreference.includes(pref) && createArtistForm.performPreference.length >= 4
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer'
                          }`}
                          disabled={!createArtistForm.performPreference.includes(pref) && createArtistForm.performPreference.length >= 4}
                        >
                          <div className="flex items-center justify-between">
                            <span className="capitalize font-medium">{pref}</span>
                            {createArtistForm.performPreference.includes(pref) && (
                              <CheckCircle className="w-4 h-4 text-purple-600" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Selected: {createArtistForm.performPreference.length}/4
                    </div>
                    
                    {/* Display selected preferences */}
                    {createArtistForm.performPreference.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {createArtistForm.performPreference.map((preference, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                            {preference}
                            <button
                              type="button"
                              onClick={() => setCreateArtistForm(prev => ({
                                ...prev,
                                performPreference: prev.performPreference.filter(p => p !== preference)
                              }))}
                              className="ml-2 text-purple-600 hover:text-purple-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetCreateForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                  </>
                ) : (
                  <>
                    {/* Step 2: Pricing & Performance Settings */}
                    <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <h4 className="text-amber-800 font-medium">Pricing Configuration Required</h4>
                      </div>
                      <p className="text-amber-700 text-sm mt-1">
                        You must configure at least one pricing option before the artist can be created. 
                        This ensures users can book the artist with proper pricing information.
                      </p>
                    </div>
                    
                    <PricingSettings
                      pricingForm={pricingForm}
                      setPricingForm={setPricingForm}
                      artistSettings={artistSettings}
                      setArtistSettings={setArtistSettings}
                    />

                    {/* Form Actions */}
                    <div className="flex gap-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setCreateStep(1)}
                        disabled={isCreatingArtist}
                        className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                          isCreatingArtist 
                            ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Previous Step</span>
                      </button>
                      <button
                        type="submit"
                        disabled={isCreatingArtist}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                          success && isCreatingArtist
                            ? 'bg-green-500 text-white cursor-not-allowed'
                            : isCreatingArtist 
                              ? 'bg-purple-400 text-white cursor-not-allowed' 
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        {isCreatingArtist && !success && (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {success && isCreatingArtist && (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        <span>
                          {success && isCreatingArtist 
                            ? 'Artist Created!' 
                            : isCreatingArtist 
                              ? 'Creating Artist...' 
                              : 'Create Artist'
                          }
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Artist Modal */}
      {showEditModal && selectedArtist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Artist: {selectedArtist.stageName}</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetEditForm();
                  }}
                  disabled={isEditingArtist}
                  className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleEditArtist} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="edit-firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="edit-firstName"
                      value={editArtistForm.firstName}
                      onChange={(e) => setEditArtistForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="edit-lastName"
                      value={editArtistForm.lastName}
                      onChange={(e) => setEditArtistForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="edit-email"
                      value={editArtistForm.email}
                      onChange={(e) => setEditArtistForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="edit-phoneNumber"
                      value={editArtistForm.phoneNumber}
                      onChange={(e) => setEditArtistForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-stageName" className="block text-sm font-medium text-gray-700 mb-1">
                      Stage Name *
                    </label>
                    <input
                      type="text"
                      id="edit-stageName"
                      value={editArtistForm.stageName}
                      onChange={(e) => setEditArtistForm(prev => ({ ...prev, stageName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      id="edit-category"
                      value={editArtistForm.category}
                      onChange={(e) => setEditArtistForm(prev => ({ ...prev, category: e.target.value, customCategory: e.target.value !== 'OTHER' ? '' : prev.customCategory }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="VOCALIST">Vocalist</option>
                      <option value="INSTRUMENTALIST">Instrumentalist</option>
                      <option value="BAND">Band</option>
                      <option value="DJ">DJ</option>
                      <option value="DANCER">Dancer</option>
                      <option value="OTHER">Other</option>
                    </select>
                    {editArtistForm.category === 'OTHER' && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={editArtistForm.customCategory}
                          onChange={(e) => setEditArtistForm(prev => ({ ...prev, customCategory: e.target.value }))}
                          placeholder="Enter custom category"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="edit-country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      id="edit-country"
                      value={editArtistForm.country}
                      onChange={(e) => setEditArtistForm(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-1">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      id="edit-yearsOfExperience"
                      min="0"
                      value={editArtistForm.yearsOfExperience}
                      onChange={(e) => setEditArtistForm(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-pricePerHour" className="block text-sm font-medium text-gray-700 mb-1">
                      Price per Hour (KWD) *
                    </label>
                    <input
                      type="number"
                      id="edit-pricePerHour"
                      min="0"
                      step="0.01"
                      value={editArtistForm.pricePerHour}
                      onChange={(e) => setEditArtistForm(prev => ({ ...prev, pricePerHour: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-youtubeLink" className="block text-sm font-medium text-gray-700 mb-1">
                      YouTube Link
                    </label>
                    <input
                      type="url"
                      id="edit-youtubeLink"
                      value={editArtistForm.youtubeLink}
                      onChange={(e) => setEditArtistForm(prev => ({ ...prev, youtubeLink: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Photo
                    </label>
                    <div className="flex flex-col items-center space-y-3">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                          {profileImagePreview ? (
                            <img 
                              src={profileImagePreview} 
                              alt="Profile preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : selectedArtist?.profileImage ? (
                            <img 
                              src={selectedArtist.profileImage} 
                              alt="Current profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center">
                              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-xs text-gray-500">Profile Photo</p>
                            </div>
                          )}
                        </div>
                        {(profileImagePreview || selectedArtist?.profileImage) && (
                          <button
                            type="button"
                            onClick={() => {
                              setProfileImage(null);
                              setProfileImagePreview('');
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => handleImageSelect(e, 'profile');
                          input.click();
                        }}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload Photo</span>
                      </button>
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Image
                    </label>
                    <div className="flex flex-col items-center space-y-3">
                      <div className="relative">
                        <div className="w-48 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                          {coverImagePreview ? (
                            <img 
                              src={coverImagePreview} 
                              alt="Cover preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : selectedArtist?.profileCoverImage ? (
                            <img 
                              src={selectedArtist.profileCoverImage} 
                              alt="Current cover" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center">
                              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-xs text-gray-500">Cover Image</p>
                            </div>
                          )}
                        </div>
                        {(coverImagePreview || selectedArtist?.profileCoverImage) && (
                          <button
                            type="button"
                            onClick={() => {
                              setCoverImage(null);
                              setCoverImagePreview('');
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => handleImageSelect(e, 'cover');
                          input.click();
                        }}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload Cover</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* About */}
                <div>
                  <label htmlFor="edit-about" className="block text-sm font-medium text-gray-700 mb-1">
                    About
                  </label>
                  <textarea
                    id="edit-about"
                    rows={4}
                    value={editArtistForm.about}
                    onChange={(e) => setEditArtistForm(prev => ({ ...prev, about: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Tell us about this artist..."
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={editNewSkill}
                      onChange={(e) => setEditNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEditSkill())}
                      placeholder="Add a skill..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addEditSkill}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editArtistForm.skills.map((skill, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeEditSkill(skill)}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Music Languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Music Languages</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={editNewLanguage}
                      onChange={(e) => setEditNewLanguage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEditLanguage())}
                      placeholder="Add a language..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addEditLanguage}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editArtistForm.musicLanguages.map((language, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {language}
                        <button
                          type="button"
                          onClick={() => removeEditLanguage(language)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Awards */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Awards</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={editNewAward}
                      onChange={(e) => setEditNewAward(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEditAward())}
                      placeholder="Add an award..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addEditAward}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editArtistForm.awards.map((award, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        {award}
                        <button
                          type="button"
                          onClick={() => removeEditAward(award)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Performance Preferences */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Preferences</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Select up to 4 performance preferences:</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {['private', 'public', 'international', 'workshop'].map((pref) => (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => {
                            const isSelected = editArtistForm.performPreference.includes(pref);
                            if (isSelected) {
                              // Remove preference
                              setEditArtistForm(prev => ({
                                ...prev,
                                performPreference: prev.performPreference.filter(p => p !== pref)
                              }));
                            } else if (editArtistForm.performPreference.length < 4) {
                              // Add preference if under limit
                              setEditArtistForm(prev => ({
                                ...prev,
                                performPreference: [...prev.performPreference, pref]
                              }));
                            }
                          }}
                          className={`p-3 text-sm border rounded-lg transition-colors ${
                            editArtistForm.performPreference.includes(pref)
                              ? 'bg-purple-100 border-purple-500 text-purple-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          } ${
                            !editArtistForm.performPreference.includes(pref) && editArtistForm.performPreference.length >= 4
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer'
                          }`}
                          disabled={!editArtistForm.performPreference.includes(pref) && editArtistForm.performPreference.length >= 4}
                        >
                          <div className="flex items-center justify-between">
                            <span className="capitalize font-medium">{pref}</span>
                            {editArtistForm.performPreference.includes(pref) && (
                              <CheckCircle className="w-4 h-4 text-purple-600" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Selected: {editArtistForm.performPreference.length}/4
                    </div>
                    
                    {/* Display selected preferences */}
                    {editArtistForm.performPreference.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {editArtistForm.performPreference.map((preference, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                            {preference}
                            <button
                              type="button"
                              onClick={() => setEditArtistForm(prev => ({
                                ...prev,
                                performPreference: prev.performPreference.filter(p => p !== preference)
                              }))}
                              className="ml-2 text-purple-600 hover:text-purple-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing Settings */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing Settings</h3>
                  <PricingSettings
                    pricingForm={editPricingForm}
                    setPricingForm={setEditPricingForm}
                    artistSettings={{
                      cooldownPeriodHours: editArtistForm.cooldownPeriodHours,
                      maximumPerformanceHours: editArtistForm.maximumPerformanceHours,
                    }}
                    setArtistSettings={(settingsOrFunction) => {
                      if (typeof settingsOrFunction === 'function') {
                        const currentSettings = {
                          cooldownPeriodHours: editArtistForm.cooldownPeriodHours,
                          maximumPerformanceHours: editArtistForm.maximumPerformanceHours,
                        };
                        const newSettings = settingsOrFunction(currentSettings);
                        setEditArtistForm(prev => ({
                          ...prev,
                          cooldownPeriodHours: newSettings.cooldownPeriodHours,
                          maximumPerformanceHours: newSettings.maximumPerformanceHours,
                        }));
                      } else {
                        setEditArtistForm(prev => ({
                          ...prev,
                          cooldownPeriodHours: settingsOrFunction.cooldownPeriodHours,
                          maximumPerformanceHours: settingsOrFunction.maximumPerformanceHours,
                        }));
                      }
                    }}
                  />
                </div>

                {/* Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit-isActive"
                      checked={editArtistForm.isActive}
                      onChange={(e) => setEditArtistForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="edit-isActive" className="ml-2 block text-sm text-gray-700">
                      Account Active
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit-isVisible"
                      checked={editArtistForm.isVisible}
                      onChange={(e) => setEditArtistForm(prev => ({ ...prev, isVisible: e.target.checked }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="edit-isVisible" className="ml-2 block text-sm text-gray-700">
                      Visible on Homepage
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetEditForm();
                    }}
                    disabled={isEditingArtist}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isEditingArtist}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                      isEditingArtist 
                        ? 'bg-purple-400 text-white cursor-not-allowed' 
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {isEditingArtist && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span>
                      {isEditingArtist ? 'Updating...' : 'Update Artist'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {showCropper && cropperImage && (
        <ImageCropper
          src={cropperImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={currentCropType === 'profile' ? 1 : 16 / 9}
          cropShape={currentCropType === 'profile' ? 'round' : 'rect'}
          locale="en"
        />
      )}
    </div>
  );
}