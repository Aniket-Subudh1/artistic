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

export enum SeatStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  RESERVED = 'reserved',
  BLOCKED = 'blocked',
}

// Interfaces matching the new schema
interface Coordinate {
  x: number;
  y: number;
}

export interface Seat {
  id: string;
  pos: Coordinate;
  size: Coordinate;
  catId: string;
  rot?: number;
  rl?: string;
  sn?: number;
  status: SeatStatus;
}

export interface Item {
  id: string;
  type: SeatMapItemType;
  pos: Coordinate;
  size: Coordinate;
  rot?: number;
  lbl?: string;
  shp?: TableShape;
  ts?: number;
  sc?: number;
}

interface LayoutStats {
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  reservedSeats: number;
  categoryStats: { [categoryId: string]: number };
  lastUpdated: string;
}

// Legacy interface for backward compatibility
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

// Updated layout interface
export interface VenueLayoutData {
  _id: string;
  name: string;
  venueOwnerId?: string;
  eventId?: string;
  seats: Seat[];
  items: Item[];
  categories: SeatCategory[];
  canvasW: number;
  canvasH: number;
  stats: LayoutStats;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// Legacy interface for backward compatibility
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

// Transform functions for compatibility
export const transformToLegacyFormat = (data: VenueLayoutData): VenueLayout => {
  const items: SeatMapItem[] = [
    // Transform seats to legacy format
    ...data.seats.map((seat: Seat) => ({
      id: seat.id,
      type: SeatMapItemType.SEAT,
      x: seat.pos.x,
      y: seat.pos.y,
      w: seat.size.x,
      h: seat.size.y,
      rotation: seat.rot || 0,
      categoryId: seat.catId,
      rowLabel: seat.rl,
      seatNumber: seat.sn,
      seatId: seat.id,
    } as SeatMapItem)),
    // Transform items to legacy format
    ...data.items.map((item: Item) => ({
      id: item.id,
      type: item.type,
      x: item.pos.x,
      y: item.pos.y,
      w: item.size.x,
      h: item.size.y,
      rotation: item.rot || 0,
      label: item.lbl,
      shape: item.shp,
      tableSeats: item.ts,
      seatCount: item.sc,
    } as SeatMapItem))
  ];

  return {
    _id: data._id,
    name: data.name,
    venueOwnerId: data.venueOwnerId,
    eventId: data.eventId,
    items,
    categories: data.categories,
    canvasW: data.canvasW,
    canvasH: data.canvasH,
    isActive: data.isActive,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const transformToNewFormat = (legacy: VenueLayout): Partial<VenueLayoutData> => {
  const seats: Seat[] = [];
  const items: Item[] = [];

  legacy.items.forEach(item => {
    if (item.type === SeatMapItemType.SEAT) {
      seats.push({
        id: item.id,
        pos: { x: item.x, y: item.y },
        size: { x: item.w, y: item.h },
        catId: item.categoryId || 'default',
        rot: item.rotation,
        rl: item.rowLabel,
        sn: item.seatNumber,
        status: SeatStatus.AVAILABLE,
      });
    } else {
      items.push({
        id: item.id,
        type: item.type,
        pos: { x: item.x, y: item.y },
        size: { x: item.w, y: item.h },
        rot: item.rotation,
        lbl: item.label,
        shp: item.shape,
        ts: item.tableSeats,
        sc: item.seatCount,
      });
    }
  });

  return {
    name: legacy.name,
    venueOwnerId: legacy.venueOwnerId,
    eventId: legacy.eventId,
    seats,
    items,
    categories: legacy.categories,
    canvasW: legacy.canvasW,
    canvasH: legacy.canvasH,
  };
};

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
    const newData = transformToNewFormat(data as any);
    const result = await apiRequest('/venue-layout', {
      method: 'POST',
      body: JSON.stringify(newData),
    });
    return transformToLegacyFormat(result as VenueLayoutData);
  },

  async getAllLayouts(query?: { venueOwnerId?: string; eventId?: string }): Promise<VenueLayout[]> {
    const params = new URLSearchParams();
    if (query?.venueOwnerId) params.append('venueOwnerId', query.venueOwnerId);
    if (query?.eventId) params.append('eventId', query.eventId);
    
    const results: VenueLayoutData[] = await apiRequest(`/venue-layout?${params.toString()}`);
    return results.map(transformToLegacyFormat);
  },

  async getLayoutById(id: string): Promise<VenueLayout> {
    const result: VenueLayoutData = await apiRequest(`/venue-layout/${id}`);
    return transformToLegacyFormat(result);
  },

  async getLayoutByViewport(
    id: string, 
    viewport: { x: number; y: number; width: number; height: number }
  ): Promise<Partial<VenueLayout>> {
    const result: Partial<VenueLayoutData> = await apiRequest(`/venue-layout/${id}/viewport`, {
      method: 'POST',
      body: JSON.stringify(viewport),
    });
    return result ? transformToLegacyFormat(result as VenueLayoutData) : {};
  },

  async updateLayout(id: string, data: Partial<CreateVenueLayoutDto>): Promise<VenueLayout> {
    const newData = transformToNewFormat(data as any);
    const result = await apiRequest(`/venue-layout/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(newData),
    });
    return transformToLegacyFormat(result as VenueLayoutData);
  },

  async deleteLayout(id: string): Promise<{ message: string }> {
    return apiRequest(`/venue-layout/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleActive(id: string): Promise<VenueLayout> {
    const result = await apiRequest(`/venue-layout/${id}/toggle-active`, {
      method: 'PATCH',
    });
    return transformToLegacyFormat(result as VenueLayoutData);
  },

  async duplicateLayout(id: string, name?: string): Promise<VenueLayout> {
    const result = await apiRequest(`/venue-layout/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    return transformToLegacyFormat(result as VenueLayoutData);
  },

  async updateSeatStatuses(
    layoutId: string, 
    seatUpdates: Array<{ seatId: string; status: SeatStatus }>
  ): Promise<{ success: boolean; updatedCount: number }> {
    return apiRequest(`/venue-layout/${layoutId}/seat-status`, {
      method: 'PATCH',
      body: JSON.stringify({ updates: seatUpdates }),
    });
  },

  async bulkUpdateSeats(
    layoutId: string,
    seatIds: string[],
    updates: Partial<Seat>
  ): Promise<{ success: boolean; updatedCount: number }> {
    return apiRequest(`/venue-layout/${layoutId}/bulk-update-seats`, {
      method: 'PATCH',
      body: JSON.stringify({ seatIds, updates }),
    });
  },

  async getLayoutStats(id: string): Promise<LayoutStats> {
    return apiRequest(`/venue-layout/${id}/stats`);
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
