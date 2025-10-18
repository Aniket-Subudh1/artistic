import { API_CONFIG, apiRequest } from '@/lib/api-config';

export interface CreateEquipmentProviderRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  companyName?: string;
  businessDescription?: string;
}

export interface EquipmentProviderResponse {
  message: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: string;
  };
  profile: {
    id: string;
    companyName: string;
    businessDescription: string;
  };
}

export interface UpdateRequest {
  _id: string;
  type: 'PROFILE_UPDATE' | 'PORTFOLIO_ITEM';
  artist?: {
    _id: string;
    stageName: string;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  requestedChanges?: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    firstName: string;
    lastName: string;
  };
  adminComment?: string;
}

export class AdminService {
  static async createEquipmentProvider(data: CreateEquipmentProviderRequest): Promise<EquipmentProviderResponse> {
    return apiRequest<EquipmentProviderResponse>(API_CONFIG.ENDPOINTS.ADMIN.ADD_EQUIPMENT_PROVIDER, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Profile Update Request Management
  static async getAllUpdateRequests(): Promise<UpdateRequest[]> {
    return apiRequest<UpdateRequest[]>(API_CONFIG.ENDPOINTS.ADMIN.PROFILE_UPDATE_REQUESTS, {
      method: 'GET',
    });
  }

  static async reviewProfileUpdateRequest(
    requestId: string,
    approve: boolean,
    comment?: string
  ): Promise<{ message: string }> {
    const url = `${API_CONFIG.ENDPOINTS.ADMIN.REVIEW_PROFILE_UPDATE(requestId)}?approve=${approve}`;
    return apiRequest(url, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }

  static async reviewPortfolioItem(
    portfolioItemId: string,
    approve: boolean,
    reviewComment?: string
  ): Promise<{ message: string }> {
    const url = `${API_CONFIG.ENDPOINTS.ADMIN.REVIEW_PORTFOLIO_ITEM(portfolioItemId)}?approve=${approve}`;
    return apiRequest(url, {
      method: 'POST',
      body: JSON.stringify({ reviewComment }),
    });
  }

  // Artist Booking Management
  static async getArtistBookings(filters?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    bookings: any[];
    metrics: {
      totalRevenue: number;
      statusBreakdown: any[];
      artistTypeBreakdown: any[];
      monthlyRevenue: any[];
      topArtists: any[];
      avgBookingValue: number;
    };
    pagination: {
      current: number;
      total: number;
      count: number;
      perPage: number;
    };
  }> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const url = `${API_CONFIG.BASE_URL}/admin/bookings/artists?${params}`;
    return apiRequest(url, { method: 'GET' });
  }

  // Equipment Booking Management
  static async getEquipmentBookings(filters?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    bookings: any[];
    metrics: {
      totalRevenue: number;
      combinedEquipmentRevenue: number;
      packageRevenue: number;
      equipmentTypeBreakdown: any[];
      providerPerformance: any[];
      monthlyTrends: any[];
      utilizationStats: {
        avgDuration: number;
        totalBookingDays: number;
      };
    };
    pagination: {
      current: number;
      total: number;
      count: number;
      perPage: number;
    };
  }> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const url = `${API_CONFIG.BASE_URL}/admin/bookings/equipment?${params}`;
    return apiRequest(url, { method: 'GET' });
  }

  // Legacy Booking Management (for backward compatibility)
  static async getAllBookings(filters?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    bookings: any[];
    pagination: {
      current: number;
      total: number;
      count: number;
      perPage: number;
    };
  }> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const url = `${API_CONFIG.BASE_URL}/admin/bookings?${params}`;
    return apiRequest(url, { method: 'GET' });
  }

  static async getAllEquipmentPackageBookings(filters?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    bookings: any[];
    pagination: {
      current: number;
      total: number;
      count: number;
      perPage: number;
    };
  }> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const url = `${API_CONFIG.BASE_URL}/admin/equipment-package-bookings?${params}`;
    return apiRequest(url, { method: 'GET' });
  }

  // Payment Management
  static async getArtistPayments(filters?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    payments: any[];
    totalEarnings: number;
    pagination: {
      current: number;
      total: number;
      count: number;
      perPage: number;
    };
  }> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const url = `${API_CONFIG.BASE_URL}/admin/payments/artists?${params}`;
    return apiRequest(url, { method: 'GET' });
  }

  static async getEquipmentProviderPayments(filters?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    payments: any[];
    totalEarnings: number;
    pagination: {
      current: number;
      total: number;
      count: number;
      perPage: number;
    };
  }> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const url = `${API_CONFIG.BASE_URL}/admin/payments/equipment-providers?${params}`;
    return apiRequest(url, { method: 'GET' });
  }
}