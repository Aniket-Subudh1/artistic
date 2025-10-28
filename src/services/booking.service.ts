import { API_CONFIG, apiRequest } from '@/lib/api-config';

export interface PricingCalculationRequest {
  artistId?: string;
  eventType: 'private' | 'public';
  isMultiDay?: boolean;
  eventDates?: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  selectedEquipmentPackages?: string[];
  selectedCustomPackages?: string[];
}

export interface PricingCalculationResponse {
  artistFee: {
    amount: number;
    totalHours: number;
    pricingTier: string;
    breakdown: Array<{
      date: string;
      hours: number;
      rate: number;
    }>;
  };
  equipmentFee: {
    amount: number;
    packages: Array<{
      id: string;
      name: string;
      price: number;
      type: 'provider' | 'custom';
    }>;
  };
  totalAmount: number;
  currency: string;
  calculatedAt: string;
}

// Enhanced booking summary for UI display
export interface BookingSummary {
  artistDetails?: {
    id: string;
    name: string;
    stageName: string;
    profileImage?: string;
  };
  eventDetails: {
    type: 'private' | 'public';
    isMultiDay: boolean;
    dates: Array<{
      date: string;
      startTime: string;
      endTime: string;
    }>;
    totalHours: number;
  };
  equipmentDetails: {
    packages: Array<{
      id: string;
      name: string;
      type: 'provider' | 'custom';
    }>;
    totalPackages: number;
  };
  pricingDetails: PricingCalculationResponse;
}

export interface BookingRequest {
  artistId: string;
  eventType: 'private' | 'public';
  // Multi-day booking support
  isMultiDay?: boolean;
  eventDates?: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
  totalHours?: number;
  // Legacy single-day fields (for backward compatibility)
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  artistPrice: number;
  equipmentPrice?: number;
  totalPrice: number;
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
  selectedEquipmentPackages?: string[];
  selectedCustomPackages?: string[];
}

export interface BookingResponse {
  message: string;
  data: {
    _id: string;
    artistId: string;
    bookedBy: string;
    eventType: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    status: string;
    totalPrice: number;
    bookingDate: string;
  };
}

export interface AvailabilityResponse {
  artistId: string;
  month: number;
  year: number;
  unavailableSlots: {
    [date: string]: number[]; // date -> array of unavailable hours
  };
}

export interface BookingStatsResponse {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  upcomingBookings: number;
}

export interface CancelBookingRequest {
  reason: string;
}

export class BookingService {
  // NEW: Calculate complete pricing on backend (OPTIMAL APPROACH)
  static async calculateBookingPricing(data: PricingCalculationRequest): Promise<PricingCalculationResponse> {
    return apiRequest<PricingCalculationResponse>(API_CONFIG.ENDPOINTS.BOOKINGS.CALCULATE_PRICING, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async createArtistBooking(data: BookingRequest): Promise<BookingResponse> {
    return apiRequest<BookingResponse>('/bookings/combine', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getArtistAvailability(
    artistId: string, 
    month?: number, 
    year?: number
  ): Promise<AvailabilityResponse> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    // Use the direct artist-availability endpoint instead
    const url = `/artist-availability/calendar/${artistId}${params.toString() ? '?' + params.toString() : ''}`;
    
    return apiRequest<AvailabilityResponse>(url, {
      method: 'GET',
    });
  }

  static async getArtistDateAvailability(artistId: string, date: string) {
    const url = `/artist-availability/date/${artistId}/${date}`;
    
    return apiRequest(url, {
      method: 'GET',
    });
  }

  static async getUserBookings(): Promise<any[]> {
    const bookings = await apiRequest<any[]>(API_CONFIG.ENDPOINTS.BOOKINGS.MY_BOOKINGS, {
      method: 'GET',
    });
    
    console.log('📋 BookingService.getUserBookings response:', bookings);
    return bookings;
  }

  static async getArtistOwnBookings(): Promise<any[]> {
    const bookings = await apiRequest<any[]>(API_CONFIG.ENDPOINTS.BOOKINGS.ARTIST_MY, {
      method: 'GET',
    });
    return bookings;
  }

  static async getArtistAnalytics(): Promise<any> {
    const analytics = await apiRequest<any>(API_CONFIG.ENDPOINTS.BOOKINGS.ARTIST_ANALYTICS, {
      method: 'GET',
    });
    return analytics;
  }

  static async getBookingById(bookingId: string): Promise<any> {
    return apiRequest<any>(API_CONFIG.ENDPOINTS.BOOKINGS.GET_BY_ID(bookingId), {
      method: 'GET',
    });
  }

  static async cancelBooking(bookingId: string, reason?: string): Promise<any> {
    const body: CancelBookingRequest = { reason: reason || 'User cancelled' };
    return apiRequest<any>(`/booking/${bookingId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  static async getBookingStats(): Promise<BookingStatsResponse> {
    return apiRequest<BookingStatsResponse>('/booking/stats', {
      method: 'GET',
    });
  }

  static async updateBookingStatus(bookingId: string, status: string): Promise<any> {
    return apiRequest<any>(`/booking/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  static async rescheduleBooking(bookingId: string, newDate: string, newStartTime: string, newEndTime: string): Promise<any> {
    return apiRequest<any>(`/booking/${bookingId}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({
        eventDate: newDate,
        startTime: newStartTime,
        endTime: newEndTime
      }),
    });
  }

  // Helper method to generate booking summary
  static generateBookingSummary(
    formData: any,
    artist: any,
    equipmentPackages: any[],
    customPackages: any[],
    pricing: PricingCalculationResponse
  ): BookingSummary {
    const eventDates = formData.isMultiDay 
      ? formData.eventDates
      : [{ date: formData.eventDate, startTime: formData.startTime, endTime: formData.endTime }];

    const selectedPackages = [
      ...equipmentPackages.filter(pkg => formData.selectedEquipmentPackages.includes(pkg._id)),
      ...customPackages.filter(pkg => formData.selectedCustomPackages.includes(pkg._id))
    ];

    return {
      artistDetails: artist ? {
        id: artist._id,
        name: artist.user?.firstName + ' ' + artist.user?.lastName,
        stageName: artist.stageName,
        profileImage: artist.profileImage
      } : undefined,
      eventDetails: {
        type: formData.eventType,
        isMultiDay: formData.isMultiDay,
        dates: eventDates,
        totalHours: pricing.artistFee.totalHours
      },
      equipmentDetails: {
        packages: selectedPackages.map(pkg => ({
          id: pkg._id,
          name: pkg.name,
          type: formData.selectedEquipmentPackages.includes(pkg._id) ? 'provider' : 'custom'
        })),
        totalPackages: selectedPackages.length
      },
      pricingDetails: pricing
    };
  }
}
