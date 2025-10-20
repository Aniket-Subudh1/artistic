import { API_CONFIG, apiRequest, getMultipartAuthHeaders, getAuthHeaders } from '@/lib/api-config';

export interface VenueProvider {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: {
    address: string;
    category: string;
    profileImage?: string;
    coverPhoto?: string;
    isApproved?: boolean;
  };
}

export interface CreateVenueProviderRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  category: string;
}

export interface UpdateVenueProviderRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  category?: string;
}

export interface LoginVenueProviderRequest {
  email: string;
  password: string;
}

export interface LoginVenueProviderResponse {
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

export class VenueProviderService {
  static async createVenueProvider(
    data: CreateVenueProviderRequest,
    files?: { profileImage?: File; coverPhoto?: File }
  ): Promise<{ message: string }> {
    const formData = new FormData();
    
    // Add text fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Add files if provided
    if (files?.profileImage) {
      formData.append('profileImage', files.profileImage);
    }
    if (files?.coverPhoto) {
      formData.append('coverPhoto', files.coverPhoto);
    }

    return apiRequest(API_CONFIG.ENDPOINTS.VENUE_OWNER.ONBOARD, {
      method: 'POST',
      headers: getMultipartAuthHeaders(),
      body: formData,
    });
  }

  static async getAllVenueProviders(): Promise<{ success: boolean; data: VenueProvider[]; message: string }> {
    return apiRequest(API_CONFIG.ENDPOINTS.VENUE_OWNER.LIST_ALL, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  }

  static async getVenueProviderById(userId: string): Promise<VenueProvider> {
    return apiRequest(API_CONFIG.ENDPOINTS.VENUE_OWNER.GET_BY_ID(userId), {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  }

  static async updateVenueProvider(
    userId: string,
    data: UpdateVenueProviderRequest,
    files?: { profileImage?: File; coverPhoto?: File }
  ): Promise<{ message: string }> {
    const formData = new FormData();
    
    // Add text fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Add files if provided
    if (files?.profileImage) {
      formData.append('profileImage', files.profileImage);
    }
    if (files?.coverPhoto) {
      formData.append('coverPhoto', files.coverPhoto);
    }

    return apiRequest(API_CONFIG.ENDPOINTS.VENUE_OWNER.UPDATE(userId), {
      method: 'PATCH',
      headers: getMultipartAuthHeaders(),
      body: formData,
    });
  }

  static async deleteVenueProvider(userId: string): Promise<{ message: string }> {
    return apiRequest(API_CONFIG.ENDPOINTS.VENUE_OWNER.DELETE(userId), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  }

  static async loginVenueProvider(data: LoginVenueProviderRequest): Promise<LoginVenueProviderResponse> {
    return apiRequest(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  static async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    return apiRequest(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  }

  static async getMyProfile(): Promise<VenueProvider> {
    return apiRequest(API_CONFIG.ENDPOINTS.VENUE_OWNER.MY_PROFILE, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  }
}