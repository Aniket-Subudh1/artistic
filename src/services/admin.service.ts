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

  // Artist Order Management
  static async updateArtistOrder(artistIds: string[]): Promise<{ success: boolean; message: string }> {
    return apiRequest(API_CONFIG.ENDPOINTS.ADMIN.REORDER_ARTISTS, {
      method: 'POST',
      body: JSON.stringify({ artistIds }),
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

  // Detailed booking retrieval
  static async getCombinedBookingDetails(id: string): Promise<any> {
    const url = `${API_CONFIG.BASE_URL}/admin/bookings/combined/${id}`;
    return apiRequest(url, { method: 'GET' });
  }

  static async getEquipmentPackageBookingDetails(id: string): Promise<any> {
    const url = `${API_CONFIG.BASE_URL}/admin/bookings/equipment-package/${id}`;
    return apiRequest(url, { method: 'GET' });
  }

  // Finance: Commission Settings
  static async getCommissionSetting(scope: 'artist' | 'equipment' | 'global' = 'global') {
    const url = `${API_CONFIG.BASE_URL}/admin/payments/settings/commission?scope=${scope}`;
    return apiRequest(url, { method: 'GET' });
  }

  static async updateCommissionSetting(payload: { scope: 'artist' | 'equipment' | 'global'; percentage: number }) {
    const url = `${API_CONFIG.BASE_URL}/admin/payments/settings/commission`;
    return apiRequest(url, { method: 'POST', body: JSON.stringify(payload) });
  }

  // Finance: Payouts and Audit
  static async recordPayout(payload: {
    recipientType: 'artist' | 'equipment';
    recipientId: string;
    bookingId?: string;
    grossAmount: number;
    commissionPercentage?: number;
    method?: 'manual' | 'bank_transfer' | 'cash' | 'other';
    reference?: string;
    notes?: string;
    currency?: string;
  }) {
    const url = `${API_CONFIG.BASE_URL}/admin/payments/payouts`;
    return apiRequest(url, { method: 'POST', body: JSON.stringify(payload) });
  }

  static async listPayouts(filters?: { recipientType?: 'artist' | 'equipment'; recipientId?: string; page?: number; limit?: number; }) {
    const params = new URLSearchParams();
    if (filters?.recipientType) params.append('recipientType', filters.recipientType);
    if (filters?.recipientId) params.append('recipientId', filters.recipientId);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    const url = `${API_CONFIG.BASE_URL}/admin/payments/payouts?${params.toString()}`;
    return apiRequest(url, { method: 'GET' });
  }

  static async listPaymentAudits(filters?: { action?: string; page?: number; limit?: number }) {
    const params = new URLSearchParams();
    if (filters?.action) params.append('action', filters.action);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    const url = `${API_CONFIG.BASE_URL}/admin/payments/audit?${params.toString()}`;
    return apiRequest(url, { method: 'GET' });
  }
}