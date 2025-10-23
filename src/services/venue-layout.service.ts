import { API_CONFIG, apiRequest } from '@/lib/api-config';

export interface SeatCategory {
  id: string;
  name: string;
  color: string;
  price: number;
  // Scope to avoid conflicts: defaults to seat; can be 'table' or 'booth'
  appliesTo?: 'seat' | 'table' | 'booth';
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
  x?: number;
  y?: number;
}

export interface Seat {
  id: string;
  pos?: Coordinate;
  size?: Coordinate;
  catId: string;
  rot?: number;
  rl?: string;
  sn?: number;
  status?: SeatStatus;
  // Added fields to preserve display and grouping
  lbl?: string;
  grpId?: string;
}

export interface Item {
  id: string;
  type: SeatMapItemType;
  pos?: Coordinate;
  size?: Coordinate;
  rot?: number;
  lbl?: string;
  shp?: TableShape;
  ts?: number;
  sc?: number;
  // Added: category for non-seat items
  catId?: string;
  // Added: direct price storage for tables/booths (for user-side rendering)
  price?: number;
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
  // Group reference (e.g., table id)
  tableId?: string;
  // Metadata for storing additional properties (like price)
  metadata?: {
    price?: number;
    [key: string]: any;
  };
}

// Updated layout interface
export interface VenueLayoutData {
  _id: string;
  name: string;
  venueOwnerId?: string;
  eventId?: string;
  seats?: Seat[]; // Optional since list view excludes this
  items?: Item[]; // Optional since list view excludes this
  categories: SeatCategory[];
  canvasW: number;
  canvasH: number;
  stats?: LayoutStats; // Optional
  isActive: boolean;
  // Admin-controlled permission to allow owner edits
  ownerCanEdit?: boolean;
  version?: number; // Optional
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
  ownerCanEdit?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Transform functions for compatibility
export const transformToLegacyFormat = (data: VenueLayoutData): VenueLayout => {
  // Map backend shapes to editor shapes
  const mapBackendShapeToEditor = (sh?: TableShape): string | undefined => {
    if (!sh) return undefined;
    switch (sh) {
      case TableShape.ROUND:
        return 'round';
      case TableShape.RECT:
        // Editor differentiates by size; use 'square' label for UI
        return 'square';
      case TableShape.HALF:
        return 'semi-circle';
      case TableShape.TRIANGLE:
        return 'triangle';
      default:
        return undefined;
    }
  };

  const transformedSeats = (data.seats || []).map((seat: Seat) => ({
    id: seat.id,
    type: SeatMapItemType.SEAT,
    x: seat.pos?.x || 0,
    y: seat.pos?.y || 0,
    w: seat.size?.x || 24,
    h: seat.size?.y || 24,
    rotation: seat.rot || 0,
    categoryId: seat.catId,
    rowLabel: seat.rl,
    seatNumber: seat.sn,
    label: seat.lbl,
    tableId: seat.grpId,
    seatId: seat.id,
  } as SeatMapItem));
  
  const transformedItems = (data.items || []).map((item: Item) => ({
    id: item.id,
    type: item.type,
    x: item.pos?.x || 0,
    y: item.pos?.y || 0,
    w: item.size?.x || 50,
    h: item.size?.y || 50,
    rotation: item.rot || 0,
    label: item.lbl,
    shape: mapBackendShapeToEditor(item.shp),
    tableSeats: item.ts,
    seatCount: item.sc,
    // Preserve item category
    categoryId: item.catId,
    // Preserve price in metadata for compatibility with existing price display logic
    metadata: {
      ...(typeof item.price === 'number' ? { price: item.price } : {})
    }
  } as SeatMapItem));
  
  console.debug('transformToLegacyFormat data.items:', data.items);
  console.debug('transformToLegacyFormat transformedItems:', transformedItems);

  const items: SeatMapItem[] = [
    ...transformedSeats,
    ...transformedItems
  ];

  const result = {
    _id: data._id,
    name: data.name,
    venueOwnerId: data.venueOwnerId,
    eventId: data.eventId,
    items,
    categories: data.categories || [],
    canvasW: data.canvasW || 1200,
    canvasH: data.canvasH || 800,
    isActive: (data as any).isActive || true, // Default to true since backend removed this field
    ownerCanEdit: (data as any).ownerCanEdit ?? false,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
  
  console.debug('transformToLegacyFormat result:', result);
  return result;
};

export const transformToNewFormat = (legacy: VenueLayout): Partial<VenueLayoutData> => {
  console.debug('transformToNewFormat input:', legacy);
  
  // Create category price lookup map
  const categoryPriceMap = Object.fromEntries(
    legacy.categories.map(cat => [cat.id, cat.price])
  );
  
  // Map editor shapes to backend enum values
  const mapEditorShapeToBackend = (sh?: string): TableShape | undefined => {
    if (!sh) return undefined;
    switch (sh) {
      case 'round':
        return TableShape.ROUND;
      case 'square':
      case 'rectangle':
        return TableShape.RECT;
      case 'semi-circle':
        return TableShape.HALF;
      case 'triangle':
        return TableShape.TRIANGLE;
      default:
        return undefined;
    }
  };

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
        lbl: item.label,
        grpId: (item as any).tableId,
        status: SeatStatus.AVAILABLE,
      });
    } else {
      // Resolve price for tables/booths from category or metadata
      let resolvedPrice: number | undefined = undefined;
      
      if (item.type === 'table' || item.type === 'booth') {
        // First check direct metadata price
        if (typeof (item as any).metadata?.price === 'number' && (item as any).metadata.price > 0) {
          resolvedPrice = (item as any).metadata.price;
        }
        // Then check category price
        else if (item.categoryId && categoryPriceMap[item.categoryId]) {
          resolvedPrice = categoryPriceMap[item.categoryId];
        }
      }
      
      const transformedItem = {
        id: item.id,
        type: item.type,
        pos: { x: item.x, y: item.y },
        size: { x: item.w, y: item.h },
        rot: item.rotation,
        lbl: item.label,
        shp: mapEditorShapeToBackend(item.shape),
        ts: item.tableSeats,
        sc: item.seatCount,
        // Map legacy categoryId to new catId
        catId: item.categoryId,
        // Store resolved price directly for user-side rendering
        price: resolvedPrice,
      };
      
      console.debug(`transformToNewFormat - Item ${item.id}:`, {
        originalItem: item,
        transformedItem: transformedItem,
        categoryId: item.categoryId,
        catId: transformedItem.catId,
        resolvedPrice: resolvedPrice,
        metadataPrice: (item as any).metadata?.price,
        categoryPrice: item.categoryId ? categoryPriceMap[item.categoryId] : 'N/A'
      });
      
      items.push(transformedItem);
    }
  });

  const result = {
    name: legacy.name,
    venueOwnerId: legacy.venueOwnerId,
    eventId: legacy.eventId,
    seats,
    items,
    categories: legacy.categories,
    canvasW: legacy.canvasW,
    canvasH: legacy.canvasH,
    // Pass through if present; backend defaults false
    ownerCanEdit: (legacy as any).ownerCanEdit,
  };
  
  console.debug('transformToNewFormat output:', result);
  return result;
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
    
    try {
      const results: VenueLayoutData[] = await apiRequest(`/venue-layout?${params.toString()}`);
      return results.map(result => {
        // Add defensive checks for the transformation
        if (!result || typeof result !== 'object') {
          console.warn('Invalid layout data received:', result);
          return null;
        }
        return transformToLegacyFormat(result);
      }).filter(Boolean) as VenueLayout[];
    } catch (error) {
      console.error('Error fetching layouts:', error);
      throw error;
    }
  },

  async getLayoutById(id: string): Promise<VenueLayout> {
    try {
      console.log('Fetching layout by ID:', id);
      const result: VenueLayoutData = await apiRequest(`/venue-layout/${id}`);
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid layout data received');
      }
      console.log('Raw layout data from backend:', result);
      const transformed = transformToLegacyFormat(result);
      console.log('Transformed layout data:', transformed);
      console.log('Layout ownerCanEdit:', transformed.ownerCanEdit);
      return transformed;
    } catch (error) {
      console.error('Error fetching layout by ID:', error);
      throw error;
    }
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

  // User-side method to get layout data with embedded prices (no need for categories lookup)
  async getLayoutForBooking(id: string): Promise<VenueLayout> {
    try {
      const result: VenueLayoutData = await apiRequest(`/venue-layout/${id}`);
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid layout data received');
      }
      
      // Transform to legacy format - prices are now embedded in items
      const transformed = transformToLegacyFormat(result);
      
      // Verify that tables/booths have prices for user booking interface
      const itemsWithoutPrices = transformed.items.filter(item => 
        (item.type === 'table' || item.type === 'booth') && 
        (!item.metadata?.price || item.metadata.price <= 0)
      );
      
      if (itemsWithoutPrices.length > 0) {
        console.warn('Some tables/booths missing prices:', itemsWithoutPrices.map(i => i.id));
      }
      
      return transformed;
    } catch (error) {
      console.error('Error fetching layout for booking:', error);
      throw error;
    }
  },
};
