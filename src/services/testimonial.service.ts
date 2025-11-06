import { apiRequest, API_CONFIG } from '@/lib/api-config';

export interface Testimonial {
  _id: string;
  name: string;
  role: string;
  content: string;
  avatar?: string;
  rating: number;
  company?: string;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestimonialRequest {
  name: string;
  role: string;
  content: string;
  avatar?: string;
  rating?: number;
  company?: string;
  order?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface UpdateTestimonialRequest {
  name?: string;
  role?: string;
  content?: string;
  avatar?: string;
  rating?: number;
  company?: string;
  order?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface TestimonialsPaginationResponse {
  testimonials: Testimonial[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class TestimonialService {
  private static readonly BASE_URL = '/testimonials';

  /**
   * Get all active testimonials for public display
   */
  static async getActiveTestimonials(): Promise<Testimonial[]> {
    try {
      const response = await apiRequest(`${this.BASE_URL}/active`, {
        method: 'GET',
      }) as { testimonials: Testimonial[] };
      return response.testimonials || [];
    } catch (error) {
      console.error('Error fetching active testimonials:', error);
      return [];
    }
  }

  /**
   * Get all testimonials with pagination (admin)
   */
  static async getAllTestimonials(
    page: number = 1,
    limit: number = 10,
    isActive?: boolean
  ): Promise<TestimonialsPaginationResponse> {
    try {
      const params: any = { page, limit };
      if (isActive !== undefined) params.isActive = isActive;

      const queryString = new URLSearchParams(params).toString();
      const response = await apiRequest(`${this.BASE_URL}?${queryString}`, {
        method: 'GET',
      }) as TestimonialsPaginationResponse;
      return response;
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }
  }

  /**
   * Get testimonial by ID
   */
  static async getTestimonialById(id: string): Promise<Testimonial> {
    try {
      const response = await apiRequest(`${this.BASE_URL}/${id}`, {
        method: 'GET',
      }) as { testimonial: Testimonial };
      return response.testimonial;
    } catch (error) {
      console.error('Error fetching testimonial:', error);
      throw error;
    }
  }

  /**
   * Create a new testimonial
   */
  static async createTestimonial(data: CreateTestimonialRequest): Promise<Testimonial> {
    try {
      const response = await apiRequest(this.BASE_URL, {
        method: 'POST',
        body: JSON.stringify(data),
      }) as { testimonial: Testimonial };
      return response.testimonial;
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  }

  /**
   * Update testimonial
   */
  static async updateTestimonial(
    id: string,
    data: UpdateTestimonialRequest
  ): Promise<Testimonial> {
    try {
      const response = await apiRequest(`${this.BASE_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }) as { testimonial: Testimonial };
      return response.testimonial;
    } catch (error) {
      console.error('Error updating testimonial:', error);
      throw error;
    }
  }

  /**
   * Delete testimonial
   */
  static async deleteTestimonial(id: string): Promise<void> {
    try {
      await apiRequest(`${this.BASE_URL}/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      throw error;
    }
  }

  /**
   * Toggle testimonial active status
   */
  static async toggleTestimonialStatus(id: string): Promise<Testimonial> {
    try {
      const response = await apiRequest(`${this.BASE_URL}/${id}/toggle-status`, {
        method: 'PUT',
      }) as { testimonial: Testimonial };
      return response.testimonial;
    } catch (error) {
      console.error('Error toggling testimonial status:', error);
      throw error;
    }
  }

  /**
   * Upload testimonial avatar
   */
  static async uploadAvatar(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

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
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }

  /**
   * Reorder testimonials
   */
  static async reorderTestimonials(
    updates: Array<{ testimonialId: string; order: number }>
  ): Promise<void> {
    try {
      await apiRequest(`${this.BASE_URL}/reorder`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Error reordering testimonials:', error);
      throw error;
    }
  }
}
