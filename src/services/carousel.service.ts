import { API_CONFIG, apiRequest } from '@/lib/api-config';

export interface CarouselSlide {
  _id: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  category: string;
  order: number;
  isActive: boolean;
  isFeatured?: boolean;
  altText?: string;
  description?: string;
  startDate: string;
  endDate?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCarouselSlideRequest {
  title: string;
  titleHighlight: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  category: string;
  order?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  altText?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateCarouselSlideRequest {
  title?: string;
  titleHighlight?: string;
  subtitle?: string;
  image?: string;
  ctaText?: string;
  ctaLink?: string;
  category?: string;
  order?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  altText?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateSlideOrderRequest {
  slideId: string;
  order: number;
}

export interface CarouselSlidesResponse {
  slides: CarouselSlide[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ActiveSlidesResponse {
  slides: CarouselSlide[];
  count: number;
}

export interface SlideResponse {
  slide: CarouselSlide;
}

interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
}

export class CarouselService {
  private static baseUrl = `${API_CONFIG.BASE_URL}/carousel`;

  /**
   * Create a new carousel slide
   */
  static async createSlide(data: CreateCarouselSlideRequest): Promise<void> {
    try {
      const response = await apiRequest<ApiResponse<CarouselSlide>>(
        this.baseUrl,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );

      // Treat message-only success as OK
      return;
    } catch (error: any) {
      console.error('Error creating carousel slide:', error);
      throw new Error(error.message || 'Failed to create carousel slide');
    }
  }

  /**
   * Get all carousel slides with pagination and filtering
   */
  static async getAllSlides(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<CarouselSlidesResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

      const url = queryParams.toString() 
        ? `${this.baseUrl}?${queryParams.toString()}`
        : this.baseUrl;

      const response = await apiRequest<CarouselSlidesResponse>(url);

      return response;
    } catch (error: any) {
      console.error('Error fetching carousel slides:', error);
      throw new Error(error.message || 'Failed to fetch carousel slides');
    }
  }

  /**
   * Get all active carousel slides for public display
   */
  static async getActiveSlides(): Promise<CarouselSlide[]> {
    try {
      const response = await apiRequest<ActiveSlidesResponse>(
        `${this.baseUrl}/active`,
        {},
        false // Don't require auth for public endpoint
      );

      return response.slides || [];
    } catch (error: any) {
      console.error('Error fetching active carousel slides:', error);
      // Return empty array on error to allow fallback
      return [];
    }
  }

  /**
   * Get carousel slide by ID
   */
  static async getSlideById(id: string): Promise<CarouselSlide> {
    try {
      const response = await apiRequest<SlideResponse>(`${this.baseUrl}/${id}`);

      if (response.slide) {
        return response.slide;
      }
      
      throw new Error('Carousel slide not found');
    } catch (error: any) {
      console.error('Error fetching carousel slide:', error);
      throw new Error(error.message || 'Failed to fetch carousel slide');
    }
  }

  /**
   * Update carousel slide
   */
  static async updateSlide(id: string, data: UpdateCarouselSlideRequest): Promise<void> {
    try {
      const response = await apiRequest<ApiResponse<CarouselSlide>>(
        `${this.baseUrl}/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      );
      // Accept message-only success
      return;
    } catch (error: any) {
      console.error('Error updating carousel slide:', error);
      throw new Error(error.message || 'Failed to update carousel slide');
    }
  }

  /**
   * Delete carousel slide
   */
  static async deleteSlide(id: string): Promise<void> {
    try {
      await apiRequest<ApiResponse>(
        `${this.baseUrl}/${id}`,
        {
          method: 'DELETE',
        }
      );
    } catch (error: any) {
      console.error('Error deleting carousel slide:', error);
      throw new Error(error.message || 'Failed to delete carousel slide');
    }
  }

  /**
   * Reorder carousel slides
   */
  static async updateSlideOrder(updates: UpdateSlideOrderRequest[]): Promise<void> {
    try {
      await apiRequest<ApiResponse>(
        `${this.baseUrl}/reorder`,
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        }
      );
    } catch (error: any) {
      console.error('Error reordering carousel slides:', error);
      throw new Error(error.message || 'Failed to reorder carousel slides');
    }
  }

  /**
   * Toggle carousel slide active status
   */
  static async toggleSlideStatus(id: string): Promise<void> {
    try {
      const response = await apiRequest<ApiResponse<CarouselSlide>>(
        `${this.baseUrl}/${id}/toggle-status`,
        {
          method: 'PUT',
        }
      );
      // Accept message-only success
      return;
    } catch (error: any) {
      console.error('Error toggling slide status:', error);
      throw new Error(error.message || 'Failed to toggle slide status');
    }
  }

  /**
   * Duplicate carousel slide
   */
  static async duplicateSlide(id: string): Promise<void> {
    try {
      const response = await apiRequest<ApiResponse<CarouselSlide>>(
        `${this.baseUrl}/${id}/duplicate`,
        {
          method: 'POST',
        }
      );
      // Accept message-only success
      return;
    } catch (error: any) {
      console.error('Error duplicating carousel slide:', error);
      throw new Error(error.message || 'Failed to duplicate carousel slide');
    }
  }

  /**
   * Convert CarouselSlide to HeroCarousel slide format
   */
  static convertToHeroSlide(slide: CarouselSlide) {
    return {
      image: slide.image,
      title: slide.title,
      titleHighlight: slide.titleHighlight,
      subtitle: slide.subtitle,
      ctaText: slide.ctaText,
      ctaLink: slide.ctaLink,
      category: slide.category,
    };
  }

  /**
   * Convert multiple CarouselSlides to HeroCarousel slides format
   */
  static convertToHeroSlides(slides: CarouselSlide[]) {
    return slides.map(slide => this.convertToHeroSlide(slide));
  }
}