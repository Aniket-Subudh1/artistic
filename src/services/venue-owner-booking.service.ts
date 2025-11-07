import { API_CONFIG, apiRequest } from '@/lib/api-config';

export interface VenueOwnerBooking {
  _id: string;
  bookingReference: string;
  eventId: {
    _id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    coverPhoto?: string;
    status: 'draft' | 'published' | 'cancelled' | 'completed';
  };
  bookedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'used';
  bookingType: 'ticket' | 'table' | 'booth';
  totalTickets: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    emergencyContact?: string;
    specialRequests?: string;
  };
  paymentInfo: {
    subtotal: number;
    serviceFee: number;
    tax: number;
    total: number;
    currency: string;
  };
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  seats?: Array<{
    seatId: string;
    categoryId: string;
    categoryName: string;
    price: number;
    rowLabel?: string;
    seatNumber?: number;
  }>;
  tables?: Array<{
    tableId: string;
    tableName: string;
    categoryId: string;
    price: number;
    seatCount: number;
  }>;
  booths?: Array<{
    boothId: string;
    boothName: string;
    categoryId: string;
    price: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface VenueOwnerBookingsResponse {
  bookings: VenueOwnerBooking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    totalBookings: number;
    totalRevenue: number;
    pendingBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
  };
}

export interface VenueOwnerBookingFilters {
  eventId?: string;
  status?: string;
  bookingType?: 'ticket' | 'table' | 'booth' | 'all';
  paymentStatus?: string;
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export class VenueOwnerBookingService {
  /**
   * Get all bookings for venue owner's events
   */
  static async getVenueOwnerBookings(
    filters?: VenueOwnerBookingFilters,
    token?: string
  ): Promise<VenueOwnerBookingsResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.eventId) queryParams.append('eventId', filters.eventId);
      if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.bookingType && filters.bookingType !== 'all') queryParams.append('bookingType', filters.bookingType);
      if (filters.paymentStatus && filters.paymentStatus !== 'all') queryParams.append('paymentStatus', filters.paymentStatus);
      if (filters.searchTerm) queryParams.append('search', filters.searchTerm);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
    }

    const url = `/seat-book/venue-owner/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return apiRequest<VenueOwnerBookingsResponse>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : '')}`,
      },
    });
  }

  /**
   * Get bookings for a specific event
   */
  static async getEventBookings(
    eventId: string,
    filters?: Omit<VenueOwnerBookingFilters, 'eventId'>,
    token?: string
  ): Promise<VenueOwnerBookingsResponse> {
    return this.getVenueOwnerBookings({ ...filters, eventId }, token);
  }

  /**
   * Get booking statistics for venue owner
   */
  static async getBookingStats(token?: string): Promise<VenueOwnerBookingsResponse['stats']> {
    const url = `/seat-book/venue-owner/stats`;
    
    return apiRequest<VenueOwnerBookingsResponse['stats']>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : '')}`,
      },
    });
  }

  /**
   * Update booking status (confirm, cancel, etc.)
   */
  static async updateBookingStatus(
    bookingId: string,
    status: 'confirmed' | 'cancelled' | 'refunded',
    reason?: string,
    token?: string
  ): Promise<{ message: string; booking: VenueOwnerBooking }> {
    const url = `/seat-book/venue-owner/booking/${bookingId}/status`;
    
    return apiRequest(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : '')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, reason }),
    });
  }

  /**
   * Get detailed booking information
   */
  static async getBookingDetails(
    bookingId: string,
    token?: string
  ): Promise<VenueOwnerBooking> {
    const url = `/seat-book/venue-owner/booking/${bookingId}`;
    
    return apiRequest<VenueOwnerBooking>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : '')}`,
      },
    });
  }

  /**
   * Export bookings to CSV
   */
  static async exportBookings(
    filters?: VenueOwnerBookingFilters,
    token?: string
  ): Promise<Blob> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.eventId) queryParams.append('eventId', filters.eventId);
      if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
    }

    const url = `/seat-book/venue-owner/bookings/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : '')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export bookings');
    }

    return response.blob();
  }
}
