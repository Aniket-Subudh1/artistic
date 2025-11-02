export interface EventArtist {
  artistId?: string;
  artistName: string;
  artistPhoto?: string;
  isCustomArtist: boolean;
  performanceType: string;
  fee?: number;
}

export interface EventEquipment {
  equipmentId?: string;
  equipmentName: string;
  equipmentPhoto?: string;
  isCustomEquipment: boolean;
  quantity: number;
  cost?: number;
}
 

export interface VenueOwner {
  _id: string;
  businessName: string;
  address: string;
  category: string;
}

export interface VenueLayout {
  _id: string;
  name: string;
  categories: VenueCategory[];
}

export interface VenueCategory {
  id: string;
  name: string;
  color: string;
  price: number;
}

export interface EventCreator {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export type EventPrivacyType = 'private' | 'public' | 'workshop' | 'international';
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export interface Event {
  _id: string;
  name: string;
  description: string;
  coverPhoto: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  privacyType: EventPrivacyType;
  status: EventStatus;
  performanceType: string;
  createdBy: EventCreator;
  createdByType: string;
  venueOwnerId?: VenueOwner;
  venueLayoutId?: VenueLayout;
  artists: EventArtist[];
  equipment: EventEquipment[];
  isBookingEnabled: boolean;
  openBookingLayoutId?: string;
  totalCapacity: number;
  bookedTickets: number;
  totalRevenue: number;
  isActive: boolean;
  tags?: string[];
  additionalInfo?: string;
  contactEmail?: string;
  contactPhone?: string;
  viewCount: number;
  likeCount: number;
  publishedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  name: string;
  description: string;
  coverPhoto?: File | string;
  eventDate: string;
  startTime: string;
  endTime: string;
  privacyType: EventPrivacyType;
  performanceType: string;
  venueOwnerId?: string;
  venueLayoutId?: string;
  artists?: EventArtist[];
  equipment?: EventEquipment[];
  isBookingEnabled?: boolean;
  tags?: string[];
  additionalInfo?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface EventsResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EventStats {
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  cancelledEvents: number;
  totalRevenue: number;
  totalBookings: number;
  eventsByPrivacyType: Array<{ _id: string; count: number }>;
  eventsByPerformanceType: Array<{ _id: string; count: number }>;
  recentEvents: Event[];
}

// Seat booking related types
export interface SeatPosition {
  x: number;
  y: number;
}

export interface SeatSize {
  width: number;
  height: number;
}

export type SeatBookingStatus = 'available' | 'booked' | 'blocked' | 'locked' | 'selected';

export interface EventSeat {
  _id: string;
  seatId: string;
  catId: string;
  price: number;
  bookingStatus: SeatBookingStatus;
  pos: SeatPosition;
  size: SeatSize;
  rl: string; // row label
  sn: string; // seat number
}

export interface EventTable {
  _id: string;
  table_id: string;
  name: string;
  price: number;
  bookingStatus: SeatBookingStatus;
  pos: SeatPosition;
  size: SeatSize;
  lbl: string;
  catId: string;
  ts: number; // table seats
  sc: number; // seat count
}

export interface EventBooth {
  _id: string;
  booth_id: string;
  name: string;
  price: number;
  bookingStatus: SeatBookingStatus;
  pos: SeatPosition;
  size: SeatSize;
  lbl: string;
  catId: string;
}

export interface EventLayoutItem {
  refId: EventTable | EventBooth;
  modelType: 'Table' | 'Booth';
}

export interface EventLayoutDetails {
  _id: string;
  name: string;
  categories: VenueCategory[];
  seats: EventSeat[];
  items: EventLayoutItem[];
  spatialGrid?: {
    cellSize: number;
    gridWidth: number;
    gridHeight: number;
    cellIndex: Record<string, string[]>;
  };
}

export interface SeatBookingData {
  eventId: string;
  seatIds: string[];
}

export interface BookingResult {
  bookingId: string;
  seats: EventSeat[];
  totalAmount: number;
  expiresAt: string;
}

export interface SelectedSeat {
  id: string;
  type: 'seat' | 'table' | 'booth';
  name: string;
  price: number;
  category: string;
  categoryColor: string;
}

// Event filter types
export interface EventFilters {
  search?: string;
  privacyType?: EventPrivacyType;
  status?: EventStatus;
  performanceType?: string;
  venueOwnerId?: string;
  eventDate?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  isBookingEnabled?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Form validation types
export interface EventFormErrors {
  name?: string;
  description?: string;
  coverPhoto?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  privacyType?: string;
  performanceType?: string;
  venueOwnerId?: string;
  venueLayoutId?: string;
  artists?: string;
  equipment?: string;
  contactEmail?: string;
  contactPhone?: string;
}

// Performance types (can be extended based on your needs)
export const PERFORMANCE_TYPES = [
  'music',
  'dance',
  'theater',
  'comedy',
  'magic',
  'circus',
  'opera',
  'ballet',
  'concert',
  'festival',
  'workshop',
  'conference',
  'exhibition',
  'sports',
  'other'
] as const;

export type PerformanceType = typeof PERFORMANCE_TYPES[number];

// Privacy type labels for UI
export const PRIVACY_TYPE_LABELS: Record<EventPrivacyType, string> = {
  private: 'Private Event',
  public: 'Public Event',
  workshop: 'Workshop',
  international: 'International Event'
};

// Status labels for UI
export const STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  cancelled: 'Cancelled',
  completed: 'Completed'
};

// Status colors for UI
export const STATUS_COLORS: Record<EventStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800'
};

// Privacy type colors for UI
export const PRIVACY_TYPE_COLORS: Record<EventPrivacyType, string> = {
  private: 'bg-purple-100 text-purple-800',
  public: 'bg-green-100 text-green-800',
  workshop: 'bg-blue-100 text-blue-800',
  international: 'bg-orange-100 text-orange-800'
};

