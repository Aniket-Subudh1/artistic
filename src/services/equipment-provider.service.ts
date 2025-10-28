import { API_CONFIG, apiRequest, getMultipartAuthHeaders } from '@/lib/api-config';
import { AuthService } from './auth.service';

export interface EquipmentProvider {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  roleProfile?: {
    companyName: string;
    businessDescription: string;
  };
}

export interface CreateEquipmentProviderRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  companyName?: string;
  businessDescription?: string;
}

export interface LoginEquipmentProviderRequest {
  email: string;
  password: string;
}

export interface LoginEquipmentProviderResponse {
  message: string;
  access_token: string;
  name: string;
  email: string;
  role: string;
}

export interface ChangePasswordRequest {
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface BookingFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface EquipmentBookingItem {
  _id: string;
  type: 'equipment' | 'package';
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  items?: Array<{
    equipment: any;
    quantity: number;
  }>;
  packages?: any[];
  customPackages?: Array<{
    _id: string;
    name: string;
    description: string;
    totalPricePerDay: number;
    notes?: string;
    items?: Array<{
      equipmentId: any;
      quantity: number;
      pricePerDay: number;
    }>;
  }>;
  package?: any;
  date?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  numberOfDays?: number;
  pricePerDay?: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  userDetails?: {
    name: string;
    email: string;
    phone: string;
  };
  venueDetails?: {
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
  address?: string;
  equipmentDates?: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
  isMultiDay?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingAnalytics {
  overview: {
    totalEquipment: number;
    totalPackages: number;
    totalBookingsThisMonth: number;
    totalBookingsLastMonth: number;
    totalRevenue: number;
    equipmentRevenue: number;
    packageRevenue: number;
  };
  bookingTrends: {
    equipmentBookingsThisMonth: number;
    equipmentBookingsLastMonth: number;
    packageBookingsThisMonth: number;
    packageBookingsLastMonth: number;
  };
  statusBreakdown: {
    equipment: Array<{ _id: string; count: number }>;
    packages: Array<{ _id: string; count: number }>;
  };
}

export class EquipmentProviderService {
  static async createEquipmentProvider(data: CreateEquipmentProviderRequest): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(API_CONFIG.ENDPOINTS.EQUIPMENT_PROVIDER.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Use unified auth login instead of separate endpoint
  static async login(credentials: LoginEquipmentProviderRequest): Promise<LoginEquipmentProviderResponse> {
    const response = await AuthService.login(credentials);
    return {
      message: response.message,
      access_token: response.access_token,
      name: credentials.email.split('@')[0], 
      email: credentials.email,
      role: response.role
    };
  }

  static async getAllProviders(): Promise<EquipmentProvider[]> {
    return apiRequest<EquipmentProvider[]>(API_CONFIG.ENDPOINTS.EQUIPMENT_PROVIDER.LIST_ALL, {
      method: 'GET',
    });
  }

  static async changePassword(newPassword: string): Promise<ChangePasswordResponse> {
    return apiRequest<ChangePasswordResponse>(API_CONFIG.ENDPOINTS.EQUIPMENT_PROVIDER.CHANGE_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  }

  static validatePassword(password: string): string[] {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }

    return errors;
  }

  // Get provider statistics
  static async getProviderStats(): Promise<{
    total: number;
    active: number;
    recentSignups: number;
  }> {
    try {
      const providers = await this.getAllProviders();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      return {
        total: providers.length,
        active: providers.length, 
        recentSignups: providers.filter(provider => 
          new Date(provider.createdAt) > oneWeekAgo
        ).length,
      };
    } catch (error) {
      throw new Error('Failed to get provider statistics');
    }
  }

  // Get provider bookings
  static async getMyBookings(filters: BookingFilters = {}): Promise<{
    bookings: EquipmentBookingItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    stats: {
      totalEquipmentBookings: number;
      totalPackageBookings: number;
      totalBookings: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const endpoint = `/equipment-provider/bookings/my-bookings${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    return apiRequest<{
      bookings: EquipmentBookingItem[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
      stats: {
        totalEquipmentBookings: number;
        totalPackageBookings: number;
        totalBookings: number;
      };
    }>(endpoint, {
      method: 'GET',
    });
  }

  // Get booking analytics
  static async getBookingAnalytics(): Promise<BookingAnalytics> {
    return apiRequest<BookingAnalytics>('/equipment-provider/bookings/analytics', {
      method: 'GET',
    });
  }

  // Update booking status
  static async updateBookingStatus(bookingId: string, status: string, notes?: string): Promise<{ message: string; booking: any }> {
    return apiRequest<{ message: string; booking: any }>(`/equipment-provider/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }
}