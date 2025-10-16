import { API_CONFIG, apiRequest } from '@/lib/api-config';

export interface BookingRequest {
  artistId: string;
  eventType: 'private' | 'public';
  eventDate: string;
  startTime: string;
  endTime: string;
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

export class BookingService {
  static async createArtistBooking(data: BookingRequest): Promise<BookingResponse> {
    return apiRequest<BookingResponse>('/booking/combine', {
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
    
    const url = `/booking/artist/${artistId}/availability${params.toString() ? '?' + params.toString() : ''}`;
    
    return apiRequest<AvailabilityResponse>(url, {
      method: 'GET',
    });
  }

  static async getUserBookings(): Promise<any[]> {
    return apiRequest<any[]>(API_CONFIG.ENDPOINTS.BOOKINGS.MY_BOOKINGS, {
      method: 'GET',
    });
  }

  static async getBookingById(bookingId: string): Promise<any> {
    return apiRequest<any>(API_CONFIG.ENDPOINTS.BOOKINGS.GET_BY_ID(bookingId), {
      method: 'GET',
    });
  }

  static async cancelBooking(bookingId: string): Promise<any> {
    return apiRequest<any>(`/booking/${bookingId}/cancel`, {
      method: 'PUT',
    });
  }
}
