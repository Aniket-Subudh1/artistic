import { API_CONFIG, apiRequest, publicApiRequest } from '@/lib/api-config';

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

// Updated booking request to match backend SeatBookDto
export interface BookingRequest {
  eventId: string;
  seatIds: string[];
}

export interface BookingResponse {
  paymentLink: string;
  trackId: string;
  bookingType: string;
  bookingId: string;
  message: string;
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
  async bookEventTickets(bookingData: EventTicketBookingRequest, token: string): Promise<{ paymentLink: string }> {
    // Route to new separate booking schemas and use batch payment if mixed
    const hasSeats = (bookingData.seats?.length || 0) > 0;
    const hasTables = (bookingData.tables?.length || 0) > 0;
    const hasBooths = (bookingData.booths?.length || 0) > 0;

    // Helper to compute totals client-side (server also validates/prices)
    const seatsTotal = (bookingData.seats || []).reduce((s, x) => s + (x.price || 0), 0);
    const tablesTotal = (bookingData.tables || []).reduce((s, x) => s + (x.price || 0), 0);
    const boothsTotal = (bookingData.booths || []).reduce((s, x) => s + (x.price || 0), 0);

    // Single type shortcut
    if (hasSeats && !hasTables && !hasBooths) {
      const resp = await apiRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEAT_BOOKING.BOOK}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: bookingData.eventId, seatIds: bookingData.seats!.map(s => s.seatId) }),
      }) as unknown as BookingResponse;
      return { paymentLink: resp.paymentLink };
    }
    if (!hasSeats && hasTables && !hasBooths) {
      const resp = await apiRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEAT_BOOKING.BOOK_TABLE}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: bookingData.eventId, tableIds: bookingData.tables!.map(t => t.tableId) }),
      }) as unknown as BookingResponse;
      return { paymentLink: resp.paymentLink };
    }
    if (!hasSeats && !hasTables && hasBooths) {
      const resp = await apiRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEAT_BOOKING.BOOK_BOOTH}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: bookingData.eventId, boothIds: bookingData.booths!.map(b => b.boothId) }),
      }) as unknown as BookingResponse;
      return { paymentLink: resp.paymentLink };
    }

    // Mixed selection: create bookings per type, then initiate batch payment
    const items: Array<{ bookingId: string; type: string; amount: number }> = [];

    if (hasSeats) {
      const seatRes = await apiRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEAT_BOOKING.BOOK}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: bookingData.eventId, seatIds: bookingData.seats!.map(s => s.seatId) }),
      }) as unknown as BookingResponse;
      items.push({ bookingId: String(seatRes.bookingId), type: 'ticket', amount: seatsTotal });
    }
    if (hasTables) {
      const tableRes = await apiRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEAT_BOOKING.BOOK_TABLE}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: bookingData.eventId, tableIds: bookingData.tables!.map(t => t.tableId) }),
      }) as unknown as BookingResponse;
      items.push({ bookingId: String(tableRes.bookingId), type: 'table', amount: tablesTotal });
    }
    if (hasBooths) {
      const boothRes = await apiRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEAT_BOOKING.BOOK_BOOTH}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: bookingData.eventId, boothIds: bookingData.booths!.map(b => b.boothId) }),
      }) as unknown as BookingResponse;
      items.push({ bookingId: String(boothRes.bookingId), type: 'booth', amount: boothsTotal });
    }

    // Call batch initiate
    const batch = await apiRequest(`${API_CONFIG.BASE_URL}/payment/initiate-batch`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    }) as unknown as { paymentLink: string };
    return { paymentLink: batch.paymentLink };
  },

  /**
   * Get event layout details for booking interface
   */
  async getEventLayoutDetails(eventId: string): Promise<EventLayoutDetails> {
    // Public endpoint: avoid sending auth headers that could trigger role guards on some backends
    return publicApiRequest(`${API_CONFIG.BASE_URL}/events/public/${eventId}/layout`);
  },

  /**
   * Get decor (stage/screen/entry/exit/washroom) from original venue layout for a public event
   */
  async getEventDecor(eventId: string): Promise<{
    canvasW: number;
    canvasH: number;
    items: Array<{ id: string; type: string; x: number; y: number; w: number; h: number; label?: string }>;
  }> {
    // Public endpoint
    return publicApiRequest(`${API_CONFIG.BASE_URL}/events/public/${eventId}/decor`);
  },

  /**
   * Get event ticket booking details - Updated to use new separate schemas
   */
  async getEventTicketBooking(bookingId: string, token: string): Promise<EventTicketBookingResponse['booking']> {
    // First try to get from seat bookings
    try {
      return apiRequest(`${API_CONFIG.BASE_URL}/seat-book/details/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      // If not found, try table bookings
      if (error.status === 404) {
        try {
          return apiRequest(`${API_CONFIG.BASE_URL}/seat-book/table-details/${bookingId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
        } catch (tableError: any) {
          // If not found, try booth bookings
          if (tableError.status === 404) {
            return apiRequest(`${API_CONFIG.BASE_URL}/seat-book/booth-details/${bookingId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
          }
          throw tableError;
        }
      }
      throw error;
    }
  },

  /**
   * Cancel event ticket booking
   */
  async cancelEventTicketBooking(bookingId: string, token: string, reason?: string): Promise<{ message: string }> {
    // Updated to unified cancel endpoint under /seat-book
    return apiRequest(`${API_CONFIG.BASE_URL}/seat-book/cancel/${bookingId}`, {
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
    // Prefer new unified seat-book endpoint if available
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.eventId) queryParams.append('eventId', filters.eventId);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const url = `${API_CONFIG.BASE_URL}/seat-book/user-bookings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    try {
      return await apiRequest(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (e: any) {
      // Fallback to empty structure if endpoint not present yet
      if (e?.status === 404) {
        return {
          bookings: [],
          pagination: { page: filters?.page || 1, limit: filters?.limit || 10, total: 0, pages: 0 },
        } as any;
      }
      throw e;
    }
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
    // Public endpoint: users check availability pre-auth
    return publicApiRequest(`${API_CONFIG.BASE_URL}/events/${eventId}/check-availability`, {
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
    // Public endpoint for real-time seat map
    return publicApiRequest(`${API_CONFIG.BASE_URL}/events/${eventId}/seat-map`);
  },

  async bookSeats(bookingData: BookingRequest, token: string): Promise<BookingResponse> {
    return apiRequest(`${API_CONFIG.BASE_URL}/seat-book/ticket`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
  },

  async bookTables(bookingData: { eventId: string; tableIds: string[] }, token: string): Promise<BookingResponse> {
    return apiRequest(`${API_CONFIG.BASE_URL}/seat-book/table`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
  },

  async bookBooths(bookingData: { eventId: string; boothIds: string[] }, token: string): Promise<BookingResponse> {
    return apiRequest(`${API_CONFIG.BASE_URL}/seat-book/booth`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
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
