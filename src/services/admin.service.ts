import { API_CONFIG, apiRequest } from '@/lib/api-config';

export interface CreateArtistTypeRequest {
  name: string;
  description: string;
}

export interface ArtistTypeResponse {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

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
  static async createArtistType(data: CreateArtistTypeRequest): Promise<ArtistTypeResponse> {
    return apiRequest<ArtistTypeResponse>(API_CONFIG.ENDPOINTS.ADMIN.ADD_ARTIST_TYPE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

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
}