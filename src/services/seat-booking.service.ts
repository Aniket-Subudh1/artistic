import { API_CONFIG, apiRequest } from '@/lib/api-config';

export interface EventTicketBookingRequest {
  eventId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    emergencyContact?: string;
    specialRequests?: string;
  };
  seats?: Array<{
    seatId: string;
    categoryId: string;
    price: number;
  }>;
  tables?: Array<{
    tableId: string;
    categoryId: string;
    price: number;
  }>;
  booths?: Array<{
    boothId: string;
    categoryId: string;
    price: number;
  }>;
}

export interface EventTicketBookingResponse {
  booking: {
    _id: string;
    bookingReference: string;
    eventId: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'used';
    seats: Array<{
      seatId: string;
      categoryId: string;
      categoryName: string;
      price: number;
      rowLabel?: string;
      seatNumber?: number;
    }>;
    tables: Array<{
      tableId: string;
      tableName: string;
      categoryId: string;
      price: number;
      seatCount: number;
    }>;
    booths: Array<{
      boothId: string;
      boothName: string;
      categoryId: string;
      price: number;
    }>;
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
    totalTickets: number;
    lockExpiry: string;
    createdAt: string;
  };
  paymentLink: string;
}

export interface EventLayoutDetails {
  event: {
    _id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    venue: {
      name: string;
      address: string;
      city: string;
      state: string;
      country: string;
    };
    pricing: {
      basePrice: number;
      categoryPricing?: Record<string, number>;
      tablePricing?: Record<string, number>;
      boothPricing?: Record<string, number>;
      serviceFee: number;
      taxPercentage: number;
    };
  };
  layout: {
    _id: string;
    name: string;
    categories: Array<{
      id: string;
      name: string;
      color: string;
      price: number;
      appliesTo: 'seat' | 'table' | 'booth';
    }>;
    seats: Array<{
      _id: string;
      seatId: string;
      catId: string;
      price: number;
      bookingStatus: 'available' | 'booked' | 'locked' | 'blocked';
      pos: { x: number; y: number };
      size: { x: number; y: number };
      rl?: string; // row label
      sn?: number; // seat number
    }>;
    items: Array<{
      refId: string;
      modelType: 'Table' | 'Booth';
      // Populated data will be here
    }>;
  };
}

// Legacy interfaces for backward compatibility
export interface BookingRequest {
  seatIds: string[];
  eventId: string;
  userInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface BookingResponse {
  bookingId: string;
  status: 'pending' | 'confirmed' | 'failed';
  totalAmount: number;
  seats: Array<{
    seatId: string;
    seatNumber?: string;
    categoryName: string;
    price: number;
  }>;
  expiresAt: string;
}

export interface UserBooking {
  _id: string;
  userId: string;
  seatIds: string[];
  eventId: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  bookingDate: string;
  expiresAt: string;
  paymentStatus?: 'pending' | 'completed' | 'failed';
}

export const seatBookingService = {
  /**
   * Book event tickets with seats, tables, and booths
   */
  async bookEventTickets(bookingData: EventTicketBookingRequest, token: string): Promise<EventTicketBookingResponse> {
    return apiRequest(`${API_CONFIG.BASE_URL}/events/book-tickets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
  },

  /**
   * Get event layout details for booking interface
   */
  async getEventLayoutDetails(eventId: string): Promise<EventLayoutDetails> {
    return apiRequest(`${API_CONFIG.BASE_URL}/events/public/${eventId}/layout`);
  },

  /**
   * Get event ticket booking details
   */
  async getEventTicketBooking(bookingId: string, token: string): Promise<EventTicketBookingResponse['booking']> {
    return apiRequest(`${API_CONFIG.BASE_URL}/events/bookings/${bookingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Cancel event ticket booking
   */
  async cancelEventTicketBooking(bookingId: string, token: string, reason?: string): Promise<{ message: string }> {
    return apiRequest(`${API_CONFIG.BASE_URL}/events/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Get user's event ticket bookings
   */
  async getUserEventBookings(token: string, filters?: {
    status?: string;
    eventId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    bookings: EventTicketBookingResponse['booking'][];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.eventId) queryParams.append('eventId', filters.eventId);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const url = `${API_CONFIG.BASE_URL}/events/bookings/my-bookings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return apiRequest(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Check seat/table/booth availability in real-time
   */
  async checkAvailability(eventId: string, items: {
    seats?: string[];
    tables?: string[];
    booths?: string[];
  }): Promise<{
    available: boolean;
    unavailableItems: {
      seats?: string[];
      tables?: string[];
      booths?: string[];
    };
    message?: string;
  }> {
    return apiRequest(`${API_CONFIG.BASE_URL}/events/${eventId}/check-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(items),
    });
  },

  /**
   * Get real-time seat map with current availability
   */
  async getRealTimeSeatMap(eventId: string): Promise<{
    seats: Array<{
      seatId: string;
      status: 'available' | 'booked' | 'locked' | 'blocked';
      price: number;
      categoryId: string;
      position: { x: number; y: number };
      rowLabel?: string;
      seatNumber?: number;
    }>;
    tables: Array<{
      tableId: string;
      status: 'available' | 'booked' | 'locked' | 'blocked';
      price: number;
      categoryId: string;
      position: { x: number; y: number };
      seatCount: number;
      name: string;
    }>;
    booths: Array<{
      boothId: string;
      status: 'available' | 'booked' | 'locked' | 'blocked';
      price: number;
      categoryId: string;
      position: { x: number; y: number };
      name: string;
    }>;
    lastUpdated: string;
  }> {
    return apiRequest(`${API_CONFIG.BASE_URL}/events/${eventId}/seat-map`);
  },

  async bookSeats(bookingData: BookingRequest, token: string): Promise<BookingResponse> {
    return apiRequest(API_CONFIG.ENDPOINTS.SEAT_BOOKING.BOOK, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(bookingData),
    });
  },

  async cancelBooking(bookingId: string, token: string): Promise<{ message: string }> {
    return apiRequest(API_CONFIG.ENDPOINTS.SEAT_BOOKING.CANCEL(bookingId), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async getUserBookings(token: string): Promise<UserBooking[]> {
    return apiRequest(API_CONFIG.ENDPOINTS.SEAT_BOOKING.USER_BOOKINGS, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async getBookingDetails(bookingId: string, token: string): Promise<UserBooking> {
    return apiRequest(API_CONFIG.ENDPOINTS.SEAT_BOOKING.BOOKING_DETAILS(bookingId), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Method to get seat availability for an event
  async getSeatAvailability(eventId: string): Promise<{
    totalSeats: number;
    availableSeats: number;
    bookedSeats: number;
    seatDetails: Array<{
      seatId: string;
      status: 'available' | 'booked' | 'reserved' | 'blocked';
      categoryId: string;
      price: number;
    }>;
  }> {
    return apiRequest(API_CONFIG.ENDPOINTS.SEAT_BOOKING.AVAILABILITY(eventId));
  },
};
