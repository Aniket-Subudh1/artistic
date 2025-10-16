import { API_CONFIG, apiRequest } from '@/lib/api-config';

export enum TermsType {
  ARTIST_BOOKING_PAYMENT = 'ARTIST-BOOKING-PAYMENT',
  EQUIPMENT_BOOKING_PAYMENT = 'EQUIPMENT-BOOKING-PAYMENT',
  GENERAL_BOOKING = 'GENERAL-BOOKING',
}

export interface SubSection {
  title: string;
  descriptions: string[];
  createdAt?: Date;
}

export interface TermsAndConditions {
  _id: string;
  category: TermsType;
  name: string;
  description: string;
  subSections: SubSection[];
  version: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateTermsRequest {
  category: TermsType;
  name: string;
  description?: string;
  subSections: {
    title: string;
    descriptions: string[];
  }[];
}

export interface UpdateTermsRequest {
  category?: TermsType;
  name?: string;
  description?: string;
  subSections?: {
    title: string;
    descriptions: string[];
  }[];
}

export class TermsAndConditionsService {
  /**
   * Get all terms and conditions
   */
  static async getAllTerms(): Promise<TermsAndConditions[]> {
    return apiRequest<TermsAndConditions[]>('/term-and-conditions', {
      method: 'GET',
    });
  }

  /**
   * Get terms and conditions by ID
   */
  static async getTermsById(id: string): Promise<TermsAndConditions> {
    return apiRequest<TermsAndConditions>(`/term-and-conditions/${id}`, {
      method: 'GET',
    });
  }

  /**
   * Get the latest terms and conditions by category
   */
  static async getLatestTermsByCategory(category: TermsType): Promise<TermsAndConditions | null> {
    try {
      const allTerms = await this.getAllTerms();
      const categoryTerms = allTerms.filter(term => term.category === category);
      
      if (categoryTerms.length === 0) {
        return null;
      }

      // Sort by version descending to get the latest
      return categoryTerms.sort((a, b) => b.version - a.version)[0];
    } catch (error) {
      console.error('Error fetching terms by category:', error);
      return null;
    }
  }

  /**
   * Get terms for artist booking
   */
  static async getArtistBookingTerms(): Promise<TermsAndConditions | null> {
    return this.getLatestTermsByCategory(TermsType.ARTIST_BOOKING_PAYMENT);
  }

  /**
   * Get terms for equipment booking
   */
  static async getEquipmentBookingTerms(): Promise<TermsAndConditions | null> {
    return this.getLatestTermsByCategory(TermsType.EQUIPMENT_BOOKING_PAYMENT);
  }

  /**
   * Get general booking terms
   */
  static async getGeneralBookingTerms(): Promise<TermsAndConditions | null> {
    return this.getLatestTermsByCategory(TermsType.GENERAL_BOOKING);
  }

  /**
   * Create new terms and conditions (Admin only)
   */
  static async createTerms(data: CreateTermsRequest): Promise<TermsAndConditions> {
    return apiRequest<TermsAndConditions>('/term-and-conditions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update terms and conditions (Admin only)
   */
  static async updateTerms(id: string, data: UpdateTermsRequest): Promise<TermsAndConditions> {
    return apiRequest<TermsAndConditions>(`/term-and-conditions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete terms and conditions (Admin only)
   */
  static async deleteTerms(id: string): Promise<void> {
    return apiRequest<void>(`/term-and-conditions/${id}`, {
      method: 'DELETE',
    });
  }
}