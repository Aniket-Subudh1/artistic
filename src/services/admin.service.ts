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

export class AdminService {
  static async createArtistType(data: CreateArtistTypeRequest): Promise<ArtistTypeResponse> {
    return apiRequest<ArtistTypeResponse>(API_CONFIG.ENDPOINTS.ADMIN.ADD_ARTIST_TYPE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}