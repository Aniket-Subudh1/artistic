export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL ,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
    },
    USER: {
      SIGNUP: '/user/signup',
      LIST_ALL: '/user/listall',
      GET_BY_ID: (id: string) => `/user/${id}`,
      UPDATE: (id: string) => `/user/${id}`,
      DELETE: (id: string) => `/user/${id}`,
      TOGGLE_STATUS: (id: string) => `/user/${id}/toggle-status`,
    },
    ADMIN: {
      ADD_ARTIST_TYPE: '/admin/add-artist-type',
    },
    ARTIST: {
      LIST_TYPES: '/artist/list-types',
      ONBOARD: '/artist/onboard',
      LIST_PUBLIC: '/artist/list/public',
      LIST_PRIVATE: '/artist/list/private',
      UPDATE_REQUEST: '/artist/profile/update-request',
      PENDING_REQUESTS: '/artist/profile/update/pending-request',
      REVIEW_UPDATE: (id: string) => `/artist/profile/review-update/${id}`,
      SUBMIT_APPLICATION: '/artist/submit-application',
      LIST_APPLICATIONS: '/artist/application',
      UPDATE_APPLICATION_STATUS: (id: string) => `/artist/${id}/status`,
    },
    APPLICATIONS: {
      SUBMIT: '/applications/submit',
      LIST_ALL: '/applications',
      LIST_PENDING: '/applications/pending',
      REVIEW: (id: string) => `/applications/${id}/review`,
    },
    EQUIPMENT_PROVIDER: {
      SIGNUP: '/equipment-provider/signup',
      LOGIN: '/equipment-provider/login',
      LIST_ALL: '/equipment-provider/listall',
      CREATE_EQUIPMENT: '/equipment-provider/create/equipment',
      LIST_EQUIPMENTS: '/equipment-provider/list-equipments',
      MY_EQUIPMENTS: '/equipment-provider/me/equipments',
    },
    EQUIPMENT: {
      LIST_ALL: '/equipment',
      GET_BY_ID: (id: string) => `/equipment/${id}`,
      UPDATE: (id: string) => `/equipment/${id}`,
      DELETE: (id: string) => `/equipment/${id}`,
    },
    VENUES: {
      LIST_ALL: '/venues',
      GET_BY_ID: (id: string) => `/venues/${id}`,
      CREATE: '/venues',
      UPDATE: (id: string) => `/venues/${id}`,
      DELETE: (id: string) => `/venues/${id}`,
      MY_VENUES: '/venues/my',
    },
    BOOKINGS: {
      LIST_ALL: '/bookings',
      GET_BY_ID: (id: string) => `/bookings/${id}`,
      CREATE: '/bookings',
      UPDATE: (id: string) => `/bookings/${id}`,
      DELETE: (id: string) => `/bookings/${id}`,
      MY_BOOKINGS: '/bookings/my',
      PENDING: '/bookings/pending',
      APPROVE: (id: string) => `/bookings/${id}/approve`,
      REJECT: (id: string) => `/bookings/${id}/reject`,
    },
    EVENTS: {
      LIST_ALL: '/events',
      GET_BY_ID: (id: string) => `/events/${id}`,
      CREATE: '/events',
      UPDATE: (id: string) => `/events/${id}`,
      DELETE: (id: string) => `/events/${id}`,
      MY_EVENTS: '/events/my',
    },
    ANALYTICS: {
      OVERVIEW: '/analytics/overview',
      REVENUE: '/analytics/revenue',
      BOOKINGS: '/analytics/bookings',
      USERS: '/analytics/users',
    },
    PAYMENTS: {
      LIST_ALL: '/payments',
      GET_BY_ID: (id: string) => `/payments/${id}`,
      CREATE: '/payments',
      MY_PAYMENTS: '/payments/my',
      METHODS: '/payments/methods',
      ADD_METHOD: '/payments/methods',
      DELETE_METHOD: (id: string) => `/payments/methods/${id}`,
    },
    NOTIFICATIONS: {
      LIST_ALL: '/notifications',
      GET_BY_ID: (id: string) => `/notifications/${id}`,
      MARK_READ: (id: string) => `/notifications/${id}/read`,
      MARK_ALL_READ: '/notifications/mark-all-read',
      DELETE: (id: string) => `/notifications/${id}`,
    },
    SETTINGS: {
      GET_PROFILE: '/settings/profile',
      UPDATE_PROFILE: '/settings/profile',
      GET_ACCOUNT: '/settings/account',
      UPDATE_ACCOUNT: '/settings/account',
      CHANGE_PASSWORD: '/settings/change-password',
      GET_SYSTEM: '/settings/system',
      UPDATE_SYSTEM: '/settings/system',
    },
  },
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function for multipart form data
export const getMultipartAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// API Error handler
export class APIError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'APIError';
  }
}

// Generic API request handler
export const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.BASE_URL}${url}`;
  
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        response.status,
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        errorData
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response as unknown as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(0, 'Network error or server unavailable');
  }
};

// File upload helper
export const uploadRequest = async <T>(
  url: string,
  formData: FormData
): Promise<T> => {
  const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.BASE_URL}${url}`;
  
  try {
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: getMultipartAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        response.status,
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(0, 'Network error or server unavailable');
  }
};

// Request interceptor for authentication
export const setupInterceptors = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async (url: RequestInfo | URL, options?: RequestInit) => {
    const response = await originalFetch(url, options);
    
    // Handle unauthorized responses
    if (response.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/auth/signin';
    }
    
    return response;
  };
};

// Initialize interceptors
if (typeof window !== 'undefined') {
  setupInterceptors();
}