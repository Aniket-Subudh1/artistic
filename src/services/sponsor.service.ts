import { apiRequest, API_CONFIG } from '@/lib/api-config';

export interface Sponsor {
  _id: string;
  name: string;
  logo: string;
  website?: string;
  description?: string;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  altText?: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'partner';
  startDate: string;
  endDate?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSponsorRequest {
  name: string;
  logo: string;
  website?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  altText?: string;
  tier?: 'platinum' | 'gold' | 'silver' | 'bronze' | 'partner';
  startDate?: string;
  endDate?: string;
}

export interface UpdateSponsorRequest {
  name?: string;
  logo?: string;
  website?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  altText?: string;
  tier?: 'platinum' | 'gold' | 'silver' | 'bronze' | 'partner';
  startDate?: string;
  endDate?: string;
}

export interface SponsorsPaginationResponse {
  sponsors: Sponsor[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class SponsorService {
  private static readonly BASE_URL = '/sponsors';

  /**
   * Get all active sponsors for public display
   */
  static async getActiveSponsors(): Promise<Sponsor[]> {
    try {
      const response = await apiRequest(`${this.BASE_URL}/active`, {
        method: 'GET',
      }) as { sponsors: Sponsor[] };
      return response.sponsors || [];
    } catch (error) {
      console.error('Error fetching active sponsors:', error);
      return [];
    }
  }

  /**
   * Get all sponsors with pagination (admin)
   */
  static async getAllSponsors(
    page: number = 1,
    limit: number = 10,
    isActive?: boolean,
    tier?: string
  ): Promise<SponsorsPaginationResponse> {
    try {
      const params: any = { page, limit };
      if (isActive !== undefined) params.isActive = isActive;
      if (tier) params.tier = tier;

      const queryString = new URLSearchParams(params).toString();
      const response = await apiRequest(`${this.BASE_URL}?${queryString}`, {
        method: 'GET',
      }) as SponsorsPaginationResponse;
      return response;
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      throw error;
    }
  }

  /**
   * Get sponsor by ID
   */
  static async getSponsorById(id: string): Promise<Sponsor> {
    try {
      const response = await apiRequest(`${this.BASE_URL}/${id}`, {
        method: 'GET',
      }) as { sponsor: Sponsor };
      return response.sponsor;
    } catch (error) {
      console.error('Error fetching sponsor:', error);
      throw error;
    }
  }

  /**
   * Create a new sponsor
   */
  static async createSponsor(data: CreateSponsorRequest): Promise<Sponsor> {
    try {
      const response = await apiRequest(this.BASE_URL, {
        method: 'POST',
        body: JSON.stringify(data),
      }) as { sponsor: Sponsor };
      return response.sponsor;
    } catch (error) {
      console.error('Error creating sponsor:', error);
      throw error;
    }
  }

  /**
   * Update sponsor
   */
  static async updateSponsor(
    id: string,
    data: UpdateSponsorRequest
  ): Promise<Sponsor> {
    try {
      const response = await apiRequest(`${this.BASE_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }) as { sponsor: Sponsor };
      return response.sponsor;
    } catch (error) {
      console.error('Error updating sponsor:', error);
      throw error;
    }
  }

  /**
   * Delete sponsor
   */
  static async deleteSponsor(id: string): Promise<void> {
    try {
      await apiRequest(`${this.BASE_URL}/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting sponsor:', error);
      throw error;
    }
  }

  /**
   * Toggle sponsor active status
   */
  static async toggleSponsorStatus(id: string): Promise<Sponsor> {
    try {
      const response = await apiRequest(`${this.BASE_URL}/${id}/toggle-status`, {
        method: 'PUT',
      }) as { sponsor: Sponsor };
      return response.sponsor;
    } catch (error) {
      console.error('Error toggling sponsor status:', error);
      throw error;
    }
  }

  /**
   * Upload sponsor logo
   */
  static async uploadLogo(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(`${API_CONFIG.BASE_URL}${this.BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  }

  /**
   * Reorder sponsors
   */
  static async reorderSponsors(
    updates: Array<{ sponsorId: string; order: number }>
  ): Promise<void> {
    try {
      await apiRequest(`${this.BASE_URL}/reorder`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Error reordering sponsors:', error);
      throw error;
    }
  }
}
