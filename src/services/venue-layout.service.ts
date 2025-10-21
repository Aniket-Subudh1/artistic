import { API_CONFIG, apiRequest } from '@/lib/api-config';

export interface SeatCategory {
  id: string;
  name: string;
  color: string;
  price: number;
}

export enum SeatMapItemType {
  SEAT = 'seat',
  ENTRY = 'entry',
  EXIT = 'exit',
  WASHROOM = 'washroom',
  SCREEN = 'screen',
  STAGE = 'stage',
  TABLE = 'table',
  BOOTH = 'booth',
}

export enum TableShape {
  ROUND = 'round',
  RECT = 'rect',
  HALF = 'half',
  TRIANGLE = 'triangle',
}

export interface SeatMapItem {
  id: string;
  type: SeatMapItemType;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
  categoryId?: string;
  label?: string;
  shape?: TableShape;
  rowLabel?: string;
  seatNumber?: number;
  tableSeats?: number;
  seatCount?: number;
  seatId?: string;
  sectionId?: string;
  subSectionId?: string;
  rowId?: string;
}

export interface VenueLayout {
  _id: string;
  name: string;
  venueOwnerId?: string;
  eventId?: string;
  items: SeatMapItem[];
  categories: SeatCategory[];
  canvasW: number;
  canvasH: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVenueLayoutDto {
  name: string;
  venueOwnerId?: string;
  eventId?: string;
  items: SeatMapItem[];
  categories: SeatCategory[];
  canvasW?: number;
  canvasH?: number;
}

export const venueLayoutService = {
  async createLayout(data: CreateVenueLayoutDto): Promise<VenueLayout> {
    return apiRequest('/venue-layout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAllLayouts(query?: { venueOwnerId?: string; eventId?: string }): Promise<VenueLayout[]> {
    const params = new URLSearchParams();
    if (query?.venueOwnerId) params.append('venueOwnerId', query.venueOwnerId);
    if (query?.eventId) params.append('eventId', query.eventId);
    
    return apiRequest(`/venue-layout?${params.toString()}`);
  },

  async getLayoutById(id: string): Promise<VenueLayout> {
    return apiRequest(`/venue-layout/${id}`);
  },

  async updateLayout(id: string, data: Partial<CreateVenueLayoutDto>): Promise<VenueLayout> {
    return apiRequest(`/venue-layout/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteLayout(id: string): Promise<{ message: string }> {
    return apiRequest(`/venue-layout/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleActive(id: string): Promise<VenueLayout> {
    return apiRequest(`/venue-layout/${id}/toggle-active`, {
      method: 'PATCH',
    });
  },

  async duplicateLayout(id: string, name?: string): Promise<VenueLayout> {
    return apiRequest(`/venue-layout/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  async getSeatAvailability(id: string): Promise<{
    totalSeats: number;
    bookedSeats: number;
    availableSeats: number;
    categoryCounts: { [categoryName: string]: { total: number; available: number; price: number } };
  }> {
    return apiRequest(`/venue-layout/${id}/availability`);
  },
};
