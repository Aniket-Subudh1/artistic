export interface Artist {
  _id: string;
  userId?: string;
  fullName: string;
  artistType: string;
  profilePicture?: string;
  profileImage?: string; // For compatibility with different components
  bio?: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  pricing?: {
    hourlyRate: number;
    eventRate: number;
  };
}

export interface Equipment {
  _id: string;
  name: string;
  type: string;
  price: number;
  image?: string;
}

export interface EquipmentPackage {
  _id: string;
  name: string;
  description: string;
  totalPrice: number;
  coverImage?: string;
  images?: string[];
  items: Array<{
    equipmentId: {
      _id: string;
      name: string;
      category: string;
      pricePerDay: number;
      images?: string[];
    };
    quantity: number;
  }>;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'draft' | 'pending_review' | 'under_review' | 'approved' | 'rejected';
  visibility: 'online' | 'offline';
  createdAt: string;
  updatedAt: string;
}

export interface BookingStatus {
  value: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
  label: string;
  color: string;
  bgColor: string;
}

export interface EnhancedEquipmentItem {
  equipmentId: string;
  quantity: number;
  equipment: {
    name: string;
    images: string[];
    category: string;
    description?: string;
    pricePerDay: number;
    specifications?: any;
  };
}

export interface EnhancedEquipmentPackage {
  _id: string;
  name: string;
  description: string;
  totalPrice: number;
  coverImage?: string;
  images?: string[];
  provider?: {
    name: string;
    companyName: string;
    businessDescription: string;
    email: string;
  };
  items: Array<{
    equipmentId: string;
    quantity: number;
    equipment: {
      name: string;
      images: string[];
      category: string;
      pricePerDay: number;
    };
  }>;
  status: 'draft' | 'pending_review' | 'under_review' | 'approved' | 'rejected';
  visibility: 'online' | 'offline';
  createdAt: string;
  updatedAt: string;
}

export interface EnhancedCustomPackage {
  _id: string;
  name: string;
  description: string;
  totalPrice: number;
  isCustom: true;
  items: Array<{
    equipmentId: string;
    quantity: number;
    equipment: {
      name: string;
      images: string[];
      category: string;
      pricePerDay: number;
    };
  }>;
}

export interface EnhancedArtist extends Artist {
  stageName: string;
  skills: string[];
  yearsOfExperience: number;
  availability?: any;
}

export interface Booking {
  _id: string;
  artistId: string;
  artist?: EnhancedArtist;
  bookedBy: string;
  eventType: 'private' | 'public';
  // Multi-day booking support
  eventDates?: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
  isMultiDay?: boolean;
  totalHours?: number;
  // Legacy single-day fields (for backward compatibility)
  eventDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus['value'];
  totalPrice: number;
  artistPrice: number;
  equipmentPrice?: number;
  bookingDate: string;
  userDetails?: {
    name: string;
    email: string;
    phone: string;
  };
  venueDetails: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    venueType?: string;
    additionalInfo?: string;
  };
  eventDescription?: string;
  specialRequests?: string;
  selectedEquipmentPackages?: EnhancedEquipmentPackage[];
  selectedCustomPackages?: EnhancedCustomPackage[];
  equipments?: EnhancedEquipmentItem[];
  bookingType?: 'artist' | 'equipment' | 'combined' | 'artist_only' | 'equipment_only';
  paymentStatus?: 'pending' | 'paid' | 'refunded' | 'failed';
  cancellationReason?: string;
  cancelledAt?: string;
  refundAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EquipmentPackageBooking {
  _id: string;
  bookedBy: string;
  packageId: EquipmentPackage;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  pricePerDay: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  userDetails: {
    name: string;
    email: string;
    phone: string;
  };
  venueDetails: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    venueType?: string;
    additionalInfo?: string;
  };
  eventDescription?: string;
  specialRequests?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  cancellationReason?: string;
  cancelledAt?: string;
  refundAmount?: number;
  bookingDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingFilters {
  status?: BookingStatus['value'] | 'all';
  eventType?: 'private' | 'public' | 'all';
  dateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
}

export interface BookingSummary {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  totalSpent: number;
  upcomingBookings: number;
}

export const BOOKING_STATUSES: Record<BookingStatus['value'], BookingStatus> = {
  pending: {
    value: 'pending',
    label: 'Pending',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50 border-yellow-200'
  },
  confirmed: {
    value: 'confirmed',
    label: 'Confirmed',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200'
  },
  cancelled: {
    value: 'cancelled',
    label: 'Cancelled',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200'
  },
  completed: {
    value: 'completed',
    label: 'Completed',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200'
  },
  rejected: {
    value: 'rejected',
    label: 'Rejected',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50 border-gray-200'
  }
};

export const EVENT_TYPES = {
  private: {
    value: 'private',
    label: 'Private Event',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50'
  },
  public: {
    value: 'public',
    label: 'Public Event',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50'
  }
} as const;