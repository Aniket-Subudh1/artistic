import { API_CONFIG, apiRequest } from '@/lib/api-config';

export interface Event {
  _id: string;
  name: string;
  description: string;
  coverPhoto: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  visibility: 'private' | 'public' | 'international' | 'workshop';
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdByRole: 'admin' | 'venue_owner';
  venueOwnerId?: {
    _id: string;
    businessName: string;
  };
  performanceType: string;
  tags: string[];
  genres: string[];
  artists: Array<{
    artistId: string;
    artistName: string;
    artistPhoto?: string;
    fee: number;
    isCustomArtist: boolean;
    customArtistName?: string;
    customArtistPhoto?: string;
    notes?: string;
  }>;
  equipment: Array<{
    equipmentId: string;
    equipmentName: string;
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
    notes?: string;
  }>;
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
  openBookingLayoutId?: string;
  pricing: {
    basePrice: number;
    categoryPricing?: Record<string, number>;
    tablePricing?: Record<string, number>;
    boothPricing?: Record<string, number>;
    serviceFee: number;
    taxPercentage: number;
  };
  allowBooking: boolean;
  bookingStartDate?: string;
  bookingEndDate?: string;
  maxTicketsPerUser: number;
  totalCapacity: number;
  availableTickets: number;
  soldTickets: number;
  images: string[];
  videoUrl?: string;
  termsAndConditions?: string;
  cancellationPolicy?: string;
  socialLinks?: Record<string, string>;
  contactEmail?: string;
  contactPhone?: string;
  contactPerson?: string;
  slug?: string;
  keywords: string[];
  metaDescription?: string;
  viewCount: number;
  shareCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
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
  artists?: Array<{
    artistId?: string;
    fee: number;
    isCustomArtist?: boolean;
    customArtistName?: string;
    customArtistPhoto?: string;
    customArtistPhotoFile?: File;
    notes?: string;
  }>;
  equipment?: Array<{
    equipmentId: string;
    quantity: number;
    notes?: string;
  }>;
  pricing: {
    basePrice: number;
    categoryPricing?: Record<string, number>;
    tablePricing?: Record<string, number>;
    boothPricing?: Record<string, number>;
    serviceFee?: number;
    taxPercentage?: number;
  };
  tags?: string[];
  genres?: string[];
  allowBooking?: boolean;
  bookingStartDate?: Date;
  bookingEndDate?: Date;
  maxTicketsPerUser?: number;
  contactEmail?: string;
  contactPhone?: string;
  contactPerson?: string;
  termsAndConditions?: string;
  cancellationPolicy?: string;
}

export interface EventFilters {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  visibility?: 'private' | 'public' | 'international' | 'workshop';
  performanceType?: string;
  city?: string;
  state?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  createdBy?: string;
  venueOwnerId?: string;
}

export interface EventsResponse {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const eventService = {
  /**
   * Rebuild open booking layout (admin)
   */
  async rebuildOpenBookingAsAdmin(eventId: string, token: string): Promise<{ message: string; openBookingLayoutId: string }>{
    return apiRequest(`${API_CONFIG.BASE_URL}/events/admin/${eventId}/rebuild-open-booking`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Rebuild open booking layout (venue owner)
   */
  async rebuildOpenBookingAsVenueOwner(eventId: string, token: string): Promise<{ message: string; openBookingLayoutId: string }>{
    return apiRequest(`${API_CONFIG.BASE_URL}/events/venue-owner/${eventId}/rebuild-open-booking`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
  // Helper: append nested fields into FormData using dotted/array keys
  appendFormDataRecursively(form: FormData, value: any, parentKey?: string) {
    if (value === undefined || value === null) return;
    if (value instanceof Date) {
      form.append(parentKey || '', value.toISOString());
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((v, idx) => {
        const key = `${parentKey}[${idx}]`;
        if (v instanceof Date) {
          form.append(key, v.toISOString());
        } else if (typeof v === 'object' && v !== null) {
          Object.entries(v).forEach(([k, inner]) => this.appendFormDataRecursively(form, inner, `${key}.${k}`));
        } else if (v !== undefined && v !== null) {
          form.append(key, String(v));
        }
      });
      return;
    }
    if (typeof value === 'object') {
      Object.entries(value).forEach(([k, v]) => this.appendFormDataRecursively(form, v, parentKey ? `${parentKey}.${k}` : k));
      return;
    }
    form.append(parentKey || '', String(value));
  },

  /**
   * Get public events for homepage
   */
  async getPublicEvents(filters?: Partial<EventFilters>): Promise<EventsResponse> {
    const queryParams = new URLSearchParams();
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.performanceType) queryParams.append('performanceType', filters.performanceType);
    if (filters?.city) queryParams.append('city', filters.city);
    if (filters?.state) queryParams.append('state', filters.state);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.search) queryParams.append('search', filters.search);

    const url = `${API_CONFIG.BASE_URL}/events/public${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest(url);
  },

  /**
   * Get public event by ID
   */
  async getPublicEventById(eventId: string): Promise<Event> {
    return apiRequest(`${API_CONFIG.BASE_URL}/events/public/${eventId}`);
  },

  /**
   * Backward-compatible alias used by client pages
   * Note: This fetches the public event details
   */
  async getEventById(eventId: string): Promise<Event> {
    return this.getPublicEventById(eventId);
  },

  /**
   * Get events by performance type
   */
  async getEventsByPerformanceType(performanceType: string, filters?: Partial<EventFilters>): Promise<EventsResponse> {
    const queryParams = new URLSearchParams();
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.city) queryParams.append('city', filters.city);
    if (filters?.state) queryParams.append('state', filters.state);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.search) queryParams.append('search', filters.search);

    const url = `${API_CONFIG.BASE_URL}/events/public/performance-type/${performanceType}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest(url);
  },

  /**
   * Search events
   */
  async searchEvents(filters: EventFilters): Promise<EventsResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${API_CONFIG.BASE_URL}/events/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest(url);
  },

  /**
   * Get event cities
   */
  async getEventCities(): Promise<{ cities: string[] }> {
    return apiRequest(`${API_CONFIG.BASE_URL}/events/cities`);
  },

  /**
   * Get performance types
   */
  async getPerformanceTypes(): Promise<{ performanceTypes: string[] }> {
    return apiRequest(`${API_CONFIG.BASE_URL}/events/performance-types`);
  },


  /**
   * Create event as admin
   */
  async createEventAsAdmin(eventData: CreateEventRequest, coverPhoto?: File, token?: string): Promise<Event> {
    // Extract custom artist photo files
    const customArtistPhotoFiles: File[] = [];
    if (eventData.artists) {
      eventData.artists.forEach((artist, index) => {
        if (artist.isCustomArtist && artist.customArtistPhotoFile) {
          customArtistPhotoFiles[index] = artist.customArtistPhotoFile;
          // Remove the file from the data before serialization
          delete artist.customArtistPhotoFile;
        }
      });
    }

    // If no files at all, send pure JSON
    if (!coverPhoto && customArtistPhotoFiles.length === 0) {
      return apiRequest(`${API_CONFIG.BASE_URL}/events/admin/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
    }

    // Multipart when files are present
    const formData = new FormData();

    // Append primitives directly, JSON-stringify complex structures
    formData.append('name', eventData.name);
    formData.append('description', eventData.description);
    formData.append('startDate', eventData.startDate.toISOString());
    formData.append('endDate', eventData.endDate.toISOString());
    formData.append('startTime', eventData.startTime);
    formData.append('endTime', eventData.endTime);
    formData.append('visibility', eventData.visibility);
    formData.append('performanceType', eventData.performanceType);
  if (eventData.seatLayoutId) formData.append('seatLayoutId', eventData.seatLayoutId);
  if ((eventData as any).venueOwnerId) formData.append('venueOwnerId', String((eventData as any).venueOwnerId));

    // Complex/optional fields
    if (eventData.venue) formData.append('venue', JSON.stringify(eventData.venue));
    if (eventData.artists) formData.append('artists', JSON.stringify(eventData.artists));
    if (eventData.equipment) formData.append('equipment', JSON.stringify(eventData.equipment));
    if (eventData.pricing) formData.append('pricing', JSON.stringify(eventData.pricing));
    if (eventData.tags) formData.append('tags', JSON.stringify(eventData.tags));
    if (eventData.genres) formData.append('genres', JSON.stringify(eventData.genres));
    if (typeof eventData.allowBooking !== 'undefined') formData.append('allowBooking', String(!!eventData.allowBooking));
    if (eventData.bookingStartDate) formData.append('bookingStartDate', eventData.bookingStartDate.toISOString());
    if (eventData.bookingEndDate) formData.append('bookingEndDate', eventData.bookingEndDate.toISOString());
    if (typeof eventData.maxTicketsPerUser !== 'undefined') formData.append('maxTicketsPerUser', String(eventData.maxTicketsPerUser));
    if (eventData.contactEmail) formData.append('contactEmail', eventData.contactEmail);
    if (eventData.contactPhone) formData.append('contactPhone', eventData.contactPhone);
    if (eventData.contactPerson) formData.append('contactPerson', eventData.contactPerson);
    if (eventData.termsAndConditions) formData.append('termsAndConditions', eventData.termsAndConditions);
    if (eventData.cancellationPolicy) formData.append('cancellationPolicy', eventData.cancellationPolicy);

    if (coverPhoto) {
      formData.append('coverPhoto', coverPhoto);
    }

    // Add custom artist photos with indexed field names
    customArtistPhotoFiles.forEach((file, index) => {
      if (file) {
        formData.append(`customArtistPhoto_${index}`, file);
      }
    });

    return apiRequest(`${API_CONFIG.BASE_URL}/events/admin/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
  },

  /**
   * Update event as admin
   */
  async updateEventAsAdmin(eventId: string, eventData: Partial<CreateEventRequest>, coverPhoto?: File, token?: string): Promise<Event> {
    if (!coverPhoto) {
      return apiRequest(`${API_CONFIG.BASE_URL}/events/admin/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
    }

  const formData = new FormData();

  // Append primitives directly, JSON-stringify complex structures
  if (eventData.name) formData.append('name', eventData.name);
  if (eventData.description) formData.append('description', eventData.description);
  if (eventData.startDate) formData.append('startDate', (eventData.startDate as Date).toISOString());
  if (eventData.endDate) formData.append('endDate', (eventData.endDate as Date).toISOString());
  if (eventData.startTime) formData.append('startTime', eventData.startTime);
  if (eventData.endTime) formData.append('endTime', eventData.endTime);
  if (eventData.visibility) formData.append('visibility', eventData.visibility);
  if (eventData.performanceType) formData.append('performanceType', eventData.performanceType);
  if (eventData.seatLayoutId) formData.append('seatLayoutId', eventData.seatLayoutId);
  if (eventData.venue) formData.append('venue', JSON.stringify(eventData.venue));
  if (eventData.artists) formData.append('artists', JSON.stringify(eventData.artists));
  if (eventData.equipment) formData.append('equipment', JSON.stringify(eventData.equipment));
  if (eventData.pricing) formData.append('pricing', JSON.stringify(eventData.pricing));
  if (eventData.tags) formData.append('tags', JSON.stringify(eventData.tags));
  if (eventData.genres) formData.append('genres', JSON.stringify(eventData.genres));
  if (typeof eventData.allowBooking !== 'undefined') formData.append('allowBooking', String(!!eventData.allowBooking));
  if (eventData.bookingStartDate) formData.append('bookingStartDate', (eventData.bookingStartDate as Date).toISOString());
  if (eventData.bookingEndDate) formData.append('bookingEndDate', (eventData.bookingEndDate as Date).toISOString());
  if (typeof eventData.maxTicketsPerUser !== 'undefined') formData.append('maxTicketsPerUser', String(eventData.maxTicketsPerUser));
  if (eventData.contactEmail) formData.append('contactEmail', eventData.contactEmail);
  if (eventData.contactPhone) formData.append('contactPhone', eventData.contactPhone);
  if (eventData.contactPerson) formData.append('contactPerson', eventData.contactPerson);
  if (eventData.termsAndConditions) formData.append('termsAndConditions', eventData.termsAndConditions);
  if (eventData.cancellationPolicy) formData.append('cancellationPolicy', eventData.cancellationPolicy);

  formData.append('coverPhoto', coverPhoto);

    return apiRequest(`${API_CONFIG.BASE_URL}/events/admin/${eventId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
  },

  /**
   * Get events as admin
   */
  async getEventsAsAdmin(filters?: EventFilters, token?: string): Promise<EventsResponse> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `${API_CONFIG.BASE_URL}/events/admin${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Get event by ID as admin
   */
  async getEventByIdAsAdmin(eventId: string, token?: string): Promise<Event> {
    return apiRequest(`${API_CONFIG.BASE_URL}/events/admin/${eventId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Publish event as admin
   */
  async publishEventAsAdmin(eventId: string, token?: string): Promise<Event> {
    return apiRequest(`${API_CONFIG.BASE_URL}/events/admin/${eventId}/publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Cancel event as admin
   */
  async cancelEventAsAdmin(eventId: string, reason?: string, token?: string): Promise<Event> {
    return apiRequest(`${API_CONFIG.BASE_URL}/events/admin/${eventId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Delete event as admin
   */
  async deleteEventAsAdmin(eventId: string, token?: string): Promise<{ message: string }> {
    return apiRequest(`${API_CONFIG.BASE_URL}/events/admin/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Create event as venue owner
   */
  async createEventAsVenueOwner(eventData: CreateEventRequest, coverPhoto?: File, token?: string): Promise<Event> {
    // Extract custom artist photo files
    const customArtistPhotoFiles: File[] = [];
    if (eventData.artists) {
      eventData.artists.forEach((artist, index) => {
        if (artist.isCustomArtist && artist.customArtistPhotoFile) {
          customArtistPhotoFiles[index] = artist.customArtistPhotoFile;
          // Remove the file from the data before serialization
          delete artist.customArtistPhotoFile;
        }
      });
    }

    // If no files at all, send pure JSON
    if (!coverPhoto && customArtistPhotoFiles.length === 0) {
      return apiRequest(`${API_CONFIG.BASE_URL}/events/venue-owner/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
    }

    const formData = new FormData();

    // Append primitives directly, JSON-stringify complex structures
    formData.append('name', eventData.name);
    formData.append('description', eventData.description);
    formData.append('startDate', eventData.startDate.toISOString());
    formData.append('endDate', eventData.endDate.toISOString());
    formData.append('startTime', eventData.startTime);
    formData.append('endTime', eventData.endTime);
    formData.append('visibility', eventData.visibility);
    formData.append('performanceType', eventData.performanceType);
  if (eventData.seatLayoutId) formData.append('seatLayoutId', eventData.seatLayoutId);
  if ((eventData as any).venueOwnerId) formData.append('venueOwnerId', String((eventData as any).venueOwnerId));
    if (eventData.venue) formData.append('venue', JSON.stringify(eventData.venue));
    if (eventData.artists) formData.append('artists', JSON.stringify(eventData.artists));
    if (eventData.equipment) formData.append('equipment', JSON.stringify(eventData.equipment));
    if (eventData.pricing) formData.append('pricing', JSON.stringify(eventData.pricing));
    if (eventData.tags) formData.append('tags', JSON.stringify(eventData.tags));
    if (eventData.genres) formData.append('genres', JSON.stringify(eventData.genres));
    if (typeof eventData.allowBooking !== 'undefined') formData.append('allowBooking', String(!!eventData.allowBooking));
    if (eventData.bookingStartDate) formData.append('bookingStartDate', eventData.bookingStartDate.toISOString());
    if (eventData.bookingEndDate) formData.append('bookingEndDate', eventData.bookingEndDate.toISOString());
    if (typeof eventData.maxTicketsPerUser !== 'undefined') formData.append('maxTicketsPerUser', String(eventData.maxTicketsPerUser));
    if (eventData.contactEmail) formData.append('contactEmail', eventData.contactEmail);
    if (eventData.contactPhone) formData.append('contactPhone', eventData.contactPhone);
    if (eventData.contactPerson) formData.append('contactPerson', eventData.contactPerson);
    if (eventData.termsAndConditions) formData.append('termsAndConditions', eventData.termsAndConditions);
    if (eventData.cancellationPolicy) formData.append('cancellationPolicy', eventData.cancellationPolicy);

    if (coverPhoto) {
      formData.append('coverPhoto', coverPhoto);
    }

    // Add custom artist photos with indexed field names
    customArtistPhotoFiles.forEach((file, index) => {
      if (file) {
        formData.append(`customArtistPhoto_${index}`, file);
      }
    });

    return apiRequest(`${API_CONFIG.BASE_URL}/events/venue-owner/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
  },

  /**
   * Update event as venue owner
   */
  async updateEventAsVenueOwner(eventId: string, eventData: Partial<CreateEventRequest>, coverPhoto?: File, token?: string): Promise<Event> {
    if (!coverPhoto) {
      return apiRequest(`${API_CONFIG.BASE_URL}/events/venue-owner/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
    }

  const formData = new FormData();

  // Append primitives directly, JSON-stringify complex structures
  if (eventData.name) formData.append('name', eventData.name);
  if (eventData.description) formData.append('description', eventData.description);
  if (eventData.startDate) formData.append('startDate', (eventData.startDate as Date).toISOString());
  if (eventData.endDate) formData.append('endDate', (eventData.endDate as Date).toISOString());
  if (eventData.startTime) formData.append('startTime', eventData.startTime);
  if (eventData.endTime) formData.append('endTime', eventData.endTime);
  if (eventData.visibility) formData.append('visibility', eventData.visibility);
  if (eventData.performanceType) formData.append('performanceType', eventData.performanceType);
  if (eventData.seatLayoutId) formData.append('seatLayoutId', eventData.seatLayoutId);
  if ((eventData as any).venueOwnerId) formData.append('venueOwnerId', String((eventData as any).venueOwnerId));
  if (eventData.venue) formData.append('venue', JSON.stringify(eventData.venue));
  if (eventData.artists) formData.append('artists', JSON.stringify(eventData.artists));
  if (eventData.equipment) formData.append('equipment', JSON.stringify(eventData.equipment));
  if (eventData.pricing) formData.append('pricing', JSON.stringify(eventData.pricing));
  if (eventData.tags) formData.append('tags', JSON.stringify(eventData.tags));
  if (eventData.genres) formData.append('genres', JSON.stringify(eventData.genres));
  if (typeof eventData.allowBooking !== 'undefined') formData.append('allowBooking', String(!!eventData.allowBooking));
  if (eventData.bookingStartDate) formData.append('bookingStartDate', (eventData.bookingStartDate as Date).toISOString());
  if (eventData.bookingEndDate) formData.append('bookingEndDate', (eventData.bookingEndDate as Date).toISOString());
  if (typeof eventData.maxTicketsPerUser !== 'undefined') formData.append('maxTicketsPerUser', String(eventData.maxTicketsPerUser));
  if (eventData.contactEmail) formData.append('contactEmail', eventData.contactEmail);
  if (eventData.contactPhone) formData.append('contactPhone', eventData.contactPhone);
  if (eventData.contactPerson) formData.append('contactPerson', eventData.contactPerson);
  if (eventData.termsAndConditions) formData.append('termsAndConditions', eventData.termsAndConditions);
  if (eventData.cancellationPolicy) formData.append('cancellationPolicy', eventData.cancellationPolicy);

  formData.append('coverPhoto', coverPhoto);

    return apiRequest(`${API_CONFIG.BASE_URL}/events/venue-owner/${eventId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
  },

  /**
   * Get my events as venue owner
   */
  async getMyEventsAsVenueOwner(filters?: EventFilters, token?: string): Promise<EventsResponse> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `${API_CONFIG.BASE_URL}/events/venue-owner/my-events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Get event by ID as venue owner
   */
  async getEventByIdAsVenueOwner(eventId: string, token?: string): Promise<Event> {
    return apiRequest(`${API_CONFIG.BASE_URL}/events/venue-owner/${eventId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Publish event as venue owner
   */
  async publishEventAsVenueOwner(eventId: string, token?: string): Promise<Event> {
    return apiRequest(`${API_CONFIG.BASE_URL}/events/venue-owner/${eventId}/publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Cancel event as venue owner
   */
  async cancelEventAsVenueOwner(eventId: string, reason?: string, token?: string): Promise<Event> {
    return apiRequest(`${API_CONFIG.BASE_URL}/events/venue-owner/${eventId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Delete event as venue owner
   */
  async deleteEventAsVenueOwner(eventId: string, token?: string): Promise<{ message: string }> {
    return apiRequest(`${API_CONFIG.BASE_URL}/events/venue-owner/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },


  /**
   * Format event date for display
   */
  formatEventDate(event: Event): string {
    try {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      
      // Check if dates are valid
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return 'Date TBA';
      }
      
      if (startDate.toDateString() === endDate.toDateString()) {
        // Same day event
        return `${startDate.toLocaleDateString()} ${event.startTime} - ${event.endTime}`;
      } else {
        // Multi-day event
        return `${startDate.toLocaleDateString()} ${event.startTime} - ${endDate.toLocaleDateString()} ${event.endTime}`;
      }
    } catch (error) {
      console.error('Error formatting event date:', error);
      return 'Date TBA';
    }
  },

  /**
   * Check if event is bookable
   */
  isEventBookable(event: Event): boolean {
    if (!event.allowBooking) return false;
    if (event.status !== 'published') return false;
    if (event.visibility === 'private') return false;
    if (event.availableTickets <= 0) return false;
    
    const now = new Date();
    // Only check booking window if dates are provided
    if (event.bookingStartDate && new Date(event.bookingStartDate) > now) return false;
    if (event.bookingEndDate && new Date(event.bookingEndDate) < now) return false;
    
    return true;
  },

  /**
   * Get event status color
   */
  getEventStatusColor(status: Event['status']): string {
    const colors = {
      draft: 'gray',
      published: 'green',
      cancelled: 'red',
      completed: 'blue',
    };
    return colors[status] || 'gray';
  },

  /**
   * Get visibility label
   */
  getVisibilityLabel(visibility: Event['visibility']): string {
    const labels = {
      private: 'Private',
      public: 'Public',
      international: 'International',
      workshop: 'Workshop',
    };
    return labels[visibility] || 'Unknown';
  },
};