import { API_CONFIG, apiRequest } from '@/lib/api-config';
import { EquipmentPackageBooking } from '@/types/booking';

export interface CreateEquipmentPackageBookingRequest {
  packageId: string;
  startDate: string;
  endDate: string;
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
}

export interface BookingResponse {
  message: string;
  booking: EquipmentPackageBooking;
}

export interface BookingListResponse {
  bookings: EquipmentPackageBooking[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AvailabilityResponse {
  available: boolean;
  conflicts: string[];
}

export interface UpdateBookingStatusRequest {
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  cancellationReason?: string;
}

class EquipmentPackageBookingService {
  // User booking operations
  async createBooking(bookingData: CreateEquipmentPackageBookingRequest): Promise<BookingResponse> {
    try {
      return await apiRequest(API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGE_BOOKING.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
    } catch (error: any) {
      console.error('Error creating package booking:', error);
      throw new Error(error.message || 'Failed to create package booking');
    }
  }

  async getMyBookings(
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<BookingListResponse> {
    try {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const url = `${API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGE_BOOKING.MY_BOOKINGS}?${params.toString()}`;
      
      return await apiRequest(url, {
        method: 'GET',
      });
    } catch (error: any) {
      console.error('Error fetching my bookings:', error);
      throw new Error(error.message || 'Failed to fetch bookings');
    }
  }

  async getBookingById(bookingId: string): Promise<EquipmentPackageBooking> {
    try {
      return await apiRequest(API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGE_BOOKING.GET_BY_ID(bookingId), {
        method: 'GET',
      });
    } catch (error: any) {
      console.error('Error fetching booking:', error);
      throw new Error(error.message || 'Failed to fetch booking details');
    }
  }

  async updateBookingStatus(
    bookingId: string,
    statusData: UpdateBookingStatusRequest
  ): Promise<BookingResponse> {
    try {
      return await apiRequest(API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGE_BOOKING.UPDATE_STATUS(bookingId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statusData),
      });
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      throw new Error(error.message || 'Failed to update booking status');
    }
  }

  async checkPackageAvailability(
    packageId: string,
    startDate: string,
    endDate: string
  ): Promise<AvailabilityResponse> {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      const url = `${API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGE_BOOKING.CHECK_AVAILABILITY(packageId)}?${params.toString()}`;
      
      return await apiRequest(url, {
        method: 'GET',
      });
    } catch (error: any) {
      console.error('Error checking availability:', error);
      throw new Error(error.message || 'Failed to check availability');
    }
  }

  // Equipment Provider operations
  async getProviderBookings(
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<BookingListResponse> {
    try {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const url = `${API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGE_BOOKING.PROVIDER_BOOKINGS}?${params.toString()}`;
      
      return await apiRequest(url, {
        method: 'GET',
      });
    } catch (error: any) {
      console.error('Error fetching provider bookings:', error);
      throw new Error(error.message || 'Failed to fetch provider bookings');
    }
  }

  // Admin operations
  async getAllBookingsForAdmin(
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<BookingListResponse> {
    try {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const url = `${API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGE_BOOKING.ADMIN_ALL}?${params.toString()}`;
      
      return await apiRequest(url, {
        method: 'GET',
      });
    } catch (error: any) {
      console.error('Error fetching all bookings for admin:', error);
      throw new Error(error.message || 'Failed to fetch bookings');
    }
  }

  // Utility methods
  calculateTotalPrice(pricePerDay: number, startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDifference = end.getTime() - start.getTime();
    const numberOfDays = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1; // Include both start and end dates
    return pricePerDay * numberOfDays;
  }

  calculateNumberOfDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDifference = end.getTime() - start.getTime();
    return Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1; // Include both start and end dates
  }

  formatDateRange(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const formatOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };

    if (startDate === endDate) {
      return start.toLocaleDateString('en-US', formatOptions);
    }

    return `${start.toLocaleDateString('en-US', formatOptions)} - ${end.toLocaleDateString('en-US', formatOptions)}`;
  }
}

export const equipmentPackageBookingService = new EquipmentPackageBookingService();