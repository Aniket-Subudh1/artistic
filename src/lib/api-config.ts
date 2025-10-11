export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
    },
    USER: {
      SIGNUP: '/user/signup',
      LIST_ALL: '/user/listall',
      CREATE: '/user/signup',
      GET_BY_ID: (id: string) => `/user/${id}`,
      UPDATE: (id: string) => `/user/${id}`,
      DELETE: (id: string) => `/user/${id}`,
      TOGGLE_STATUS: (id: string) => `/user/${id}/toggle-status`,
    },
    ADMIN: {
      ADD_ARTIST_TYPE: '/admin/add-artist-type',
      DASHBOARD_STATS: '/admin/dashboard/stats',
      SYSTEM_SETTINGS: '/admin/system/settings',
    },
    ARTIST: {
      LIST_TYPES: '/artist/list-types',
      ONBOARD: '/artist/onboard',
      LIST_PUBLIC: '/artist/list/public',
      LIST_PRIVATE: '/artist/list/private',
      UPDATE_REQUEST: '/artist/profile/update-request',
      PENDING_REQUESTS: '/artist/profile/update/pending-request',
      REVIEW_UPDATE: (id: string) => `/artist/profile/review-update/${id}`,
      GET_PROFILE: (id: string) => `/artist/profile/${id}`,
      UPDATE_PROFILE: (id: string) => `/artist/profile/${id}`,
      VERIFY: (id: string) => `/artist/${id}/verify`,
    },
    APPLICATIONS: {
      SUBMIT: '/artist/submit-application',
      LIST_ALL: '/artist/application',
      LIST_PENDING: '/artist/application?status=PENDING',
      GET_BY_ID: (id: string) => `/artist/application/${id}`,
      REVIEW: (id: string) => `/artist/${id}/status`,
      DELETE: (id: string) => `/artist/application/${id}`,
      STATS: '/artist/application/stats',
      EXPORT: '/artist/application/export',
    },
    EQUIPMENT: {
      LIST_ALL: '/equipment-provider/list-equipments',
      CREATE: '/equipment-provider/create/equipment',
      GET_BY_ID: (id: string) => `/equipment/${id}`,
      UPDATE: (id: string) => `/equipment/${id}`,
      DELETE: (id: string) => `/equipment/${id}`,
      MY_EQUIPMENT: '/equipment-provider/me/equipments',
      BOOKINGS: '/equipment/bookings',
    },
    EQUIPMENT_PROVIDER: {
      SIGNUP: '/equipment-provider/signup',
      LOGIN: '/equipment-provider/login',
      LIST_ALL: '/equipment-provider/listall',
      CHANGE_PASSWORD: '/equipment-provider/changePass',
      CREATE_EQUIPMENT: '/equipment-provider/create/equipment',
      MY_EQUIPMENT: '/equipment-provider/me/equipments',
      GET_BY_ID: (id: string) => `/equipment-provider/${id}`,
      UPDATE: (id: string) => `/equipment-provider/${id}`,
      DELETE: (id: string) => `/equipment-provider/${id}`,
    },
    VENUES: {
      LIST_ALL: '/venues',
      CREATE: '/venues',
      GET_BY_ID: (id: string) => `/venues/${id}`,
      UPDATE: (id: string) => `/venues/${id}`,
      DELETE: (id: string) => `/venues/${id}`,
      MY_VENUES: '/venues/my',
      BOOKINGS: '/venues/bookings',
    },
    BOOKINGS: {
      LIST_ALL: '/bookings',
      CREATE: '/bookings',
      GET_BY_ID: (id: string) => `/bookings/${id}`,
      UPDATE: (id: string) => `/bookings/${id}`,
      DELETE: (id: string) => `/bookings/${id}`,
      MY_BOOKINGS: '/bookings/my',
      PENDING: '/bookings/pending',
      APPROVE: (id: string) => `/bookings/${id}/approve`,
      REJECT: (id: string) => `/bookings/${id}/reject`,
    },
    EVENTS: {
      LIST_ALL: '/events',
      CREATE: '/events',
      GET_BY_ID: (id: string) => `/events/${id}`,
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
      CREATE: '/payments',
      GET_BY_ID: (id: string) => `/payments/${id}`,
      MY_PAYMENTS: '/payments/my',
      METHODS: '/payments/methods',
      ADD_METHOD: '/payments/methods',
      DELETE_METHOD: (id: string) => `/payments/methods/${id}`,
      TRANSACTIONS: '/payments/transactions',
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
    },
  },
};

export const getAuthHeaders = () => {
  if (typeof window === 'undefined') return {};
  
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getMultipartAuthHeaders = () => {
  if (typeof window === 'undefined') return {};
  
  const token = localStorage.getItem('authToken');
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export class APIError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'APIError';
  }
}

const handleUnauthorized = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/auth/signin';
  }
};

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

    if (response.status === 401) {
      handleUnauthorized();
      throw new APIError(401, 'Unauthorized - Please login again');
    }

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

    if (response.status === 401) {
      handleUnauthorized();
      throw new APIError(401, 'Unauthorized - Please login again');
    }

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

export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.BASE_URL}${url}`;
  
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    handleUnauthorized();
  }

  return response;
};