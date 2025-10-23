import { apiRequest, API_CONFIG } from '@/lib/api-config';

// Equipment-only booking interface (for standalone equipment bookings)
export interface EquipmentBookingRequest {
  equipments?: Array<{ equipmentId: string; quantity: number }>;
  packages?: string[];
  customPackages?: string[];
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  address?: string;
  isMultiDay?: boolean;
  equipmentDates?: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
}

export interface EquipmentBooking {
  _id: string;
  bookedBy: string;
  equipments?: Array<{
    equipmentId: {
      _id: string;
      name: string;
      category: string;
      pricePerDay: number;
      images?: string[];
    } | null;
    quantity: number;
  }>;
  packages?: Array<{
    _id: string;
    name: string;
    description: string;
    totalPrice: number;
    coverImage?: string;
    items?: any[];
  }>;
  customPackages?: Array<{
    _id: string;
    name: string;
    description: string;
    totalPricePerDay: number;
    coverImage?: string;
  }>;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
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
    additionalInfo?: string;
  };
  eventDescription?: string;
  specialRequests?: string;
  bookingDate: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EquipmentBookingsResponse {
  bookings: EquipmentBooking[];
  pagination: {
    current: number;
    total: number;
    count: number;
    perPage: number;
  };
}

// Equipment booking service for standalone equipment bookings
export class EquipmentBookingService {
  static async createEquipmentBooking(data: EquipmentBookingRequest) {
    return apiRequest('/bookings/equipment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getMyEquipmentBookings(
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<EquipmentBookingsResponse> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const url = `/bookings/equipment/my?${params.toString()}`;
    return await apiRequest(url, {
      method: 'GET',
    });
  }

  static async getEquipmentBookingById(bookingId: string): Promise<EquipmentBooking> {
    return await apiRequest(`/bookings/equipment/${bookingId}`, {
      method: 'GET',
    });
  }

  static async cancelEquipmentBooking(bookingId: string, reason?: string): Promise<void> {
    return await apiRequest(`/bookings/equipment/${bookingId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason: reason || 'User cancelled' }),
    });
  }

  static formatDateRange(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } else {
      return `${start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })} - ${end.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })}`;
    }
  }
}
