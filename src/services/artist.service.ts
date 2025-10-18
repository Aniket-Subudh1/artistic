import { API_CONFIG, apiRequest, getMultipartAuthHeaders } from '@/lib/api-config';

export interface ArtistType {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePortfolioItemRequest {
  title: string;
  description: string;
  type: 'image' | 'video' | 'audio';
}

export interface PortfolioItem {
  _id: string;
  title: string;
  description: string;
  type: 'image' | 'video' | 'audio';
  fileUrl: string;
  thumbnailUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  artistProfile: {
    _id: string;
    stageName: string;
  };
  artistUser?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  reviewedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  reviewComment?: string;
  reviewedAt?: string;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArtistRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  stageName: string;
  about?: string;
  yearsOfExperience: number;
  skills: string[];
  musicLanguages: string[];
  awards: string[];
  pricePerHour: number;
  gender: string;
  artistType: string;
  category: string;
  country: string;
  performPreference: string[];
  youtubeLink?: string;
  cooldownPeriodHours?: number;
  maximumPerformanceHours?: number;
}

// New pricing-related interfaces
export interface TimeSlotPricing {
  hour: number;
  rate: number;
}

export interface PricingEntry {
  hours: number;
  amount: number;
}

export interface ArtistPricingData {
  pricingMode: 'duration' | 'timeslot';
  // Legacy duration-based pricing
  privatePricing?: PricingEntry[];
  publicPricing?: PricingEntry[];
  workshopPricing?: PricingEntry[];
  internationalPricing?: PricingEntry[];
  // Time slot pricing
  privateTimeSlotPricing?: TimeSlotPricing[];
  publicTimeSlotPricing?: TimeSlotPricing[];
  workshopTimeSlotPricing?: TimeSlotPricing[];
  internationalTimeSlotPricing?: TimeSlotPricing[];
  // Base rates
  basePrivateRate?: number;
  basePublicRate?: number;
  baseWorkshopRate?: number;
  baseInternationalRate?: number;
}

export interface TimeSlotAvailability {
  hour: number;
  isAvailable: boolean;
  price: number;
  reason?: string;
}

export interface DateAvailability {
  date: string;
  timeSlots: TimeSlotAvailability[];
  maxPerformanceHours?: number;
  cooldownPeriodHours?: number;
}

export type PerformanceType = 'private' | 'public' | 'workshop' | 'international';

export interface UpdateArtistProfileRequest {
  about?: string;
  yearsOfExperience?: number;
  pricePerHour?: number;
  genres?: string[];
  skills?: string[];
  musicLanguages?: string[];
  awards?: string[];
  category?: string;
  performPreference?: string[];
  youtubeLink?: string;
}

export interface Artist {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber?: string;
    role: string;
    isActive: boolean;
  };
  stageName: string;
  about: string;
  yearsOfExperience: number;
  skills: string[];
  musicLanguages: string[];
  awards: string[];
  pricePerHour: number;
  profileImage: string;
  profileCoverImage: string;
  youtubeLink?: string;
  likeCount: number;
  category: string;
  country: string;
  genres: string[];
  performPreference: string[];
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  // Performance constraints
  cooldownPeriodHours?: number;
  maximumPerformanceHours?: number;
}

export interface CreateArtistResponse {
  message: string;
  user: string;
  profile: Artist;
}

export class ArtistService {
  static async getArtistTypes(): Promise<ArtistType[]> {
    return apiRequest<ArtistType[]>(API_CONFIG.ENDPOINTS.ARTIST.LIST_TYPES, {
      method: 'GET',
    });
  }

  static async createArtist(
    artistData: CreateArtistRequest,
    files?: {
      profileImage?: File;
      profileCoverImage?: File;
    }
  ): Promise<CreateArtistResponse> {
    const formData = new FormData();

    // Add all text fields
    Object.entries(artistData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    });

    // Add files if provided
    if (files?.profileImage) {
      formData.append('profileImage', files.profileImage);
    }
    if (files?.profileCoverImage) {
      formData.append('profileCoverImage', files.profileCoverImage);
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ARTIST.ONBOARD}`, {
      method: 'POST',
      headers: getMultipartAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Artist creation failed:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ARTIST.ONBOARD}`
      });
      
      // Provide more detailed error message
      let errorMessage = 'Failed to create artist';
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.errors) {
        // Handle validation errors
        const validationErrors = Array.isArray(errorData.errors) 
          ? errorData.errors.join(', ')
          : JSON.stringify(errorData.errors);
        errorMessage = `Validation failed: ${validationErrors}`;
      } else if (response.status === 400) {
        errorMessage = 'Bad request - please check all required fields';
      } else if (response.status === 401) {
        errorMessage = 'Unauthorized - please login again';
      } else if (response.status === 403) {
        errorMessage = 'Forbidden - insufficient permissions';
      } else if (response.status === 500) {
        errorMessage = 'Server error - please try again later';
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  static async getPublicArtists(): Promise<Artist[]> {
    return apiRequest<Artist[]>(API_CONFIG.ENDPOINTS.ARTIST.LIST_PUBLIC, {
      method: 'GET',
    });
  }

  static async getArtistById(artistId: string): Promise<Artist> {
    return apiRequest<Artist>(API_CONFIG.ENDPOINTS.ARTIST.GET_BY_ID(artistId), {
      method: 'GET',
    });
  }

  static async getMyProfile(): Promise<Artist> {
    return apiRequest<Artist>(API_CONFIG.ENDPOINTS.ARTIST.MY_PROFILE, {
      method: 'GET',
    });
  }

  static async getPrivateArtists(): Promise<Artist[]> {
    return apiRequest<Artist[]>(API_CONFIG.ENDPOINTS.ARTIST.LIST_PRIVATE, {
      method: 'GET',
    });
  }

  static async verifyArtist(artistId: string, isVerified: boolean): Promise<{ message: string; artistId: string; isVerified: boolean; }> {
    return apiRequest(API_CONFIG.ENDPOINTS.ARTIST.VERIFY(artistId), {
      method: 'PATCH',
      body: JSON.stringify({ isVerified }),
    });
  }

  static async toggleArtistVisibility(artistId: string, isVisible: boolean): Promise<{ message: string; artistId: string; isVisible: boolean; }> {
    return apiRequest(API_CONFIG.ENDPOINTS.ARTIST.TOGGLE_VISIBILITY(artistId), {
      method: 'PATCH',
      body: JSON.stringify({ isVisible }),
    });
  }

  static async requestProfileUpdate(
    updateData: UpdateArtistProfileRequest,
    files?: {
      profileImage?: File;
      profileCoverImage?: File;
    }
  ): Promise<{ message: string }> {
    const formData = new FormData();

    // Add text fields (only if they have values)
    if (updateData.genres && updateData.genres.length > 0) {
      formData.append('genres', JSON.stringify(updateData.genres));
    }
    if (updateData.skills && updateData.skills.length > 0) {
      formData.append('skills', JSON.stringify(updateData.skills));
    }
    if (updateData.category && updateData.category.trim()) {
      formData.append('category', updateData.category);
    }
    if (updateData.about && updateData.about.trim()) {
      formData.append('about', updateData.about);
    }
    if (updateData.yearsOfExperience !== undefined && updateData.yearsOfExperience !== null) {
      formData.append('yearsOfExperience', updateData.yearsOfExperience.toString());
    }
    if (updateData.pricePerHour !== undefined && updateData.pricePerHour !== null) {
      formData.append('pricePerHour', updateData.pricePerHour.toString());
    }
    if (updateData.musicLanguages && updateData.musicLanguages.length > 0) {
      formData.append('musicLanguages', JSON.stringify(updateData.musicLanguages));
    }
    if (updateData.awards && updateData.awards.length > 0) {
      formData.append('awards', JSON.stringify(updateData.awards));
    }
    if (updateData.performPreference && updateData.performPreference.length > 0) {
      formData.append('performPreference', JSON.stringify(updateData.performPreference));
    }
    if (updateData.youtubeLink && updateData.youtubeLink.trim()) {
      formData.append('youtubeLink', updateData.youtubeLink);
    }

    // Add files if provided
    if (files?.profileImage) {
      formData.append('profileImage', files.profileImage);
    }
    if (files?.profileCoverImage) {
      formData.append('profileCoverImage', files.profileCoverImage);
    }

    // Debug: Log what's being sent
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ARTIST.UPDATE_REQUEST}`, {
      method: 'POST',
      headers: getMultipartAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  static async getPendingUpdateRequests(): Promise<any[]> {
    return apiRequest<any[]>(API_CONFIG.ENDPOINTS.ARTIST.PENDING_REQUESTS, {
      method: 'GET',
    });
  }

  static async getMyUpdateRequests(): Promise<any[]> {
    return apiRequest<any[]>(API_CONFIG.ENDPOINTS.ARTIST.MY_REQUESTS, {
      method: 'GET',
    });
  }

  static async reviewUpdateRequest(
    requestId: string, 
    approve: boolean, 
    comment?: string
  ): Promise<{ message: string }> {
    const url = `${API_CONFIG.ENDPOINTS.ARTIST.REVIEW_UPDATE(requestId)}?approve=${approve}`;
    return apiRequest(url, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }

  // Portfolio Management Methods
  static async createPortfolioItem(
    itemData: CreatePortfolioItemRequest,
    file: File
  ): Promise<{ message: string; portfolioItem: PortfolioItem }> {
    const formData = new FormData();
    formData.append('title', itemData.title);
    formData.append('description', itemData.description);
    formData.append('type', itemData.type);
    formData.append('file', file);

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ARTIST.PORTFOLIO.CREATE}`, {
      method: 'POST',
      headers: getMultipartAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create portfolio item');
    }

    return response.json();
  }

  static async getMyPortfolioItems(status?: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<PortfolioItem[]> {
    const url = status 
      ? `${API_CONFIG.ENDPOINTS.ARTIST.PORTFOLIO.MY_ITEMS}?status=${status}`
      : API_CONFIG.ENDPOINTS.ARTIST.PORTFOLIO.MY_ITEMS;
    
    return apiRequest<PortfolioItem[]>(url, {
      method: 'GET',
    });
  }

  static async getPublicPortfolioItems(artistProfileId: string): Promise<PortfolioItem[]> {
    return apiRequest<PortfolioItem[]>(API_CONFIG.ENDPOINTS.ARTIST.PORTFOLIO.PUBLIC(artistProfileId), {
      method: 'GET',
    });
  }

  static async deletePortfolioItem(portfolioItemId: string): Promise<{ message: string }> {
    return apiRequest(API_CONFIG.ENDPOINTS.ARTIST.PORTFOLIO.DELETE(portfolioItemId), {
      method: 'DELETE',
    });
  }

  static async incrementPortfolioViews(portfolioItemId: string): Promise<void> {
    return apiRequest(API_CONFIG.ENDPOINTS.ARTIST.PORTFOLIO.VIEW(portfolioItemId), {
      method: 'POST',
    });
  }

  static async togglePortfolioLike(portfolioItemId: string, increment: boolean): Promise<void> {
    return apiRequest(API_CONFIG.ENDPOINTS.ARTIST.PORTFOLIO.LIKE(portfolioItemId), {
      method: 'POST',
      body: JSON.stringify({ increment }),
    });
  }

  // Admin Portfolio Methods
  static async getPendingPortfolioItems(): Promise<PortfolioItem[]> {
    return apiRequest<PortfolioItem[]>(API_CONFIG.ENDPOINTS.ARTIST.PORTFOLIO.PENDING_REVIEW, {
      method: 'GET',
    });
  }

  static async reviewPortfolioItem(
    portfolioItemId: string, 
    approve: boolean, 
    reviewComment?: string
  ): Promise<{ message: string; portfolioItem: PortfolioItem }> {
    const url = `${API_CONFIG.ENDPOINTS.ARTIST.PORTFOLIO.REVIEW(portfolioItemId)}?approve=${approve}`;
    return apiRequest(url, {
      method: 'POST',
      body: JSON.stringify({ reviewComment }),
    });
  }

  // Pricing Management Methods
  static async createArtistPricing(
    artistProfileId: string, 
    pricingData: ArtistPricingData
  ): Promise<{ message: string }> {
    return apiRequest(`/artist-pricing/${artistProfileId}`, {
      method: 'POST',
      body: JSON.stringify(pricingData),
    });
  }

  static async getArtistPricing(artistProfileId: string): Promise<ArtistPricingData | null> {
    try {
      return await apiRequest<ArtistPricingData>(`/artist-pricing/${artistProfileId}`, {
        method: 'GET',
      });
    } catch (error) {
      // Return null if no pricing found
      return null;
    }
  }

  static async updateArtistBasicPricing(
    artistProfileId: string, 
    pricingData: ArtistPricingData
  ): Promise<{ message: string }> {
    return apiRequest(`/artist-pricing/${artistProfileId}/basic`, {
      method: 'PUT',
      body: JSON.stringify(pricingData),
    });
  }

  static async updateArtistTimeSlotPricing(
    artistProfileId: string, 
    performanceType: PerformanceType,
    timeSlotPricing: TimeSlotPricing[],
    baseRate?: number
  ): Promise<{ message: string }> {
    return apiRequest(`/artist-pricing/${artistProfileId}/timeslot`, {
      method: 'PUT',
      body: JSON.stringify({
        performanceType,
        timeSlotPricing,
        baseRate,
        pricingMode: 'timeslot'
      }),
    });
  }

  static async getAllTimeSlotPricing(artistProfileId: string): Promise<{
    pricingMode: 'duration' | 'timeslot';
    private: { timeSlotPricing: TimeSlotPricing[]; baseRate: number };
    public: { timeSlotPricing: TimeSlotPricing[]; baseRate: number };
    workshop: { timeSlotPricing: TimeSlotPricing[]; baseRate: number };
    international: { timeSlotPricing: TimeSlotPricing[]; baseRate: number };
  } | null> {
    try {
      return await apiRequest(`/artist-pricing/${artistProfileId}/timeslot/all`, {
        method: 'GET',
      });
    } catch (error) {
      return null;
    }
  }

  static async getDateAvailability(
    artistProfileId: string,
    date: string,
    performanceType: PerformanceType
  ): Promise<DateAvailability> {
    return apiRequest<DateAvailability>(
      `/artist-pricing/${artistProfileId}/availability/${date}?performanceType=${performanceType}`,
      {
        method: 'GET',
      }
    );
  }

  static async calculateBookingCost(
    artistProfileId: string,
    performanceType: PerformanceType,
    startHour: number,
    duration: number
  ): Promise<{ totalCost: number }> {
    return apiRequest<{ totalCost: number }>(
      `/artist-pricing/${artistProfileId}/booking/cost`,
      {
        method: 'POST',
        body: JSON.stringify({ performanceType, startHour, duration }),
      }
    );
  }

  static async checkAvailability(
    artistProfileId: string,
    date: string,
    startHour: number,
    duration: number
  ): Promise<{ isAvailable: boolean; reason?: string }> {
    return apiRequest<{ isAvailable: boolean; reason?: string }>(
      `/artist-pricing/${artistProfileId}/availability/check`,
      {
        method: 'POST',
        body: JSON.stringify({ date, startHour, duration }),
      }
    );
  }

  static async validateConsecutiveBooking(
    artistProfileId: string,
    date: string,
    startHour: number,
    duration: number
  ): Promise<{ isValid: boolean; reason?: string }> {
    return apiRequest<{ isValid: boolean; reason?: string }>(
      `/artist-pricing/${artistProfileId}/booking/validate`,
      {
        method: 'POST',
        body: JSON.stringify({ date, startHour, duration }),
      }
    );
  }

  static async deleteArtistPricing(artistProfileId: string): Promise<{ message: string }> {
    return apiRequest(`/artist-pricing/${artistProfileId}`, {
      method: 'DELETE',
    });
  }
}