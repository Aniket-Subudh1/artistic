export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      SIGNUP: '/auth/signup',
      VERIFY_OTP: '/auth/verify-otp', 
      RESEND_OTP: '/auth/resend-otp',
      SEND_PASSWORD_CHANGE_OTP: '/auth/send-password-change-otp',
      VERIFY_PASSWORD_CHANGE_OTP: '/auth/verify-password-change-otp',
      CHANGE_PASSWORD: '/auth/change-password',
      FORGOT_PASSWORD: '/auth/forgot-password',
      VERIFY_FORGOT_PASSWORD_OTP: '/auth/verify-forgot-password-otp',
      RESET_PASSWORD: '/auth/reset-password',
    },
    USER: {
      SIGNUP: '/user/signup',
      LIST_ALL: '/user/listall',
      CREATE: '/user/signup',
      GET_BY_ID: (id: string) => `/user/${id}`,
      UPDATE: (id: string) => `/user/${id}`,
      DELETE: (id: string) => `/user/${id}`,
      TOGGLE_STATUS: (id: string) => `/user/${id}/toggle-status`,
      PROFILE_ME: '/user/profile/me',
      UPDATE_PROFILE_PICTURE: '/user/profile/picture',
      REMOVE_PROFILE_PICTURE: '/user/profile/picture',
    },
    ADMIN: {
      ADD_EQUIPMENT_PROVIDER: '/admin/add-equipment-provider',
      DASHBOARD_STATS: '/admin/dashboard/stats',
      SYSTEM_SETTINGS: '/admin/system/settings',
      PROFILE_UPDATE_REQUESTS: '/admin/profile-update-requests',
      REVIEW_PROFILE_UPDATE: (id: string) => `/admin/profile-update-requests/${id}/review`,
      REVIEW_PORTFOLIO_ITEM: (id: string) => `/admin/portfolio-items/${id}/review`,
      REORDER_ARTISTS: '/admin/artists/reorder',
    },
    ARTIST: {
      ONBOARD: '/artist/onboard',
      LIST_PUBLIC: '/artist/list/public',
      LIST_PRIVATE: '/artist/list/private',
      GET_BY_ID: (id: string) => `/artist/profile/${id}`,
      MY_PROFILE: '/artist/profile/me',
      UPDATE_REQUEST: '/artist/profile/update-request',
      PENDING_REQUESTS: '/artist/profile/update/pending-request',
      MY_REQUESTS: '/artist/profile/update/my-requests',
      REVIEW_UPDATE: (id: string) => `/artist/profile/review-update/${id}`,
      VERIFY: (id: string) => `/artist/${id}/verify`,
      TOGGLE_VISIBILITY: (id: string) => `/artist/${id}/visibility`,
      // Portfolio endpoints
      PORTFOLIO: {
        CREATE: '/artist/portfolio/create',
        MY_ITEMS: '/artist/portfolio/my-items',
        PUBLIC: (artistProfileId: string) => `/artist/portfolio/public/${artistProfileId}`,
        PENDING_REVIEW: '/artist/portfolio/pending-review',
        REVIEW: (id: string) => `/artist/portfolio/review/${id}`,
        DELETE: (id: string) => `/artist/portfolio/${id}`,
        VIEW: (id: string) => `/artist/portfolio/${id}/view`,
        LIKE: (id: string) => `/artist/portfolio/${id}/like`,
      },
    },
    APPLICATIONS: {
      SUBMIT: '/artist/submit-application',
      LIST_ALL: '/artist/application',
      LIST_PENDING: '/artist/application?status=PENDING',
      GET_BY_ID: (id: string) => `/artist/application/${id}`,
      UPDATE_STATUS: (id: string) => `/artist/${id}/status`,
      DELETE: (id: string) => `/artist/application/${id}`,
    },
    EQUIPMENT: {
      LIST_ALL: '/equipment/list',
      CREATE: '/equipment/create',
      GET_BY_ID: (id: string) => `/equipment/${id}`,
      UPDATE: (id: string) => `/equipment/${id}`,
      DELETE: (id: string) => `/equipment/${id}`,
      MY_EQUIPMENT: '/equipment/my-equipment',
      BOOKINGS: '/equipment/bookings',
    },
    EQUIPMENT_PACKAGES: {
      CREATE: '/equipment-packages/create',
      MY_PACKAGES: '/equipment-packages/equipment-provider/list',
      PUBLIC: '/equipment-packages/public',
      PENDING_REVIEW: '/equipment-packages/pending-review',
      ADMIN_ALL: '/equipment-packages/admin/all',
      SUBMIT_FOR_REVIEW: (id: string) => `/equipment-packages/submit-for-review/${id}`,
      UPDATE: (id: string) => `/equipment-packages/update/${id}`,
      DELETE: (id: string) => `/equipment-packages/delete/${id}`,
      APPROVE: (id: string) => `/equipment-packages/approve/${id}`,
      REJECT: (id: string) => `/equipment-packages/reject/${id}`,
      GET_BY_ID: (id: string) => `/equipment-packages/${id}`,
      TOGGLE_VISIBILITY: (id: string) => `/equipment-packages/visibility/${id}`,
      UPLOAD_IMAGES: (id: string) => `/equipment-packages/upload-images/${id}`,
      UPLOAD_COVER_IMAGE: (id: string) => `/equipment-packages/upload-cover-image/${id}`,
      // Custom package endpoints
      CUSTOM: {
        CREATE: '/custom-equipment-packages',
        MY_PACKAGES: '/custom-equipment-packages/my-packages',
        ALL_PACKAGES: '/custom-equipment-packages/all',
        PUBLIC: '/custom-equipment-packages/public',
        AVAILABLE_EQUIPMENT: '/custom-equipment-packages/available-equipment',
        GET_BY_ID: (id: string) => `/custom-equipment-packages/${id}`,
        UPDATE: (id: string) => `/custom-equipment-packages/${id}`,
        DELETE: (id: string) => `/custom-equipment-packages/${id}`,
        SHARE: (id: string, userId: string) => `/custom-equipment-packages/${id}/share/${userId}`,
      },
    },
    EQUIPMENT_PACKAGE_BOOKING: {
      CREATE: '/equipment-package-booking/create',
      MY_BOOKINGS: '/equipment-package-booking/my-bookings',
      PROVIDER_BOOKINGS: '/equipment-package-booking/provider-bookings',
      GET_BY_ID: (id: string) => `/equipment-package-booking/${id}`,
      UPDATE_STATUS: (id: string) => `/equipment-package-booking/${id}/status`,
      CHECK_AVAILABILITY: (packageId: string) => `/equipment-package-booking/check-availability/${packageId}`,
      ADMIN_ALL: '/equipment-package-booking/admin/all',
    },
    EQUIPMENT_PROVIDER: {
      SIGNUP: '/equipment-provider',
      CREATE: '/equipment-provider', 
      LIST_ALL: '/equipment-provider',
      CHANGE_PASSWORD: '/equipment-provider/change-password',
      GET_BY_ID: (id: string) => `/equipment-provider/${id}`,
      UPDATE: (id: string) => `/equipment-provider/${id}`,
      DELETE: (id: string) => `/equipment-provider/${id}`,
      TOGGLE_STATUS: (id: string) => `/equipment-provider/${id}/toggle-status`,
      STATS: '/equipment-provider/stats',
      PROFILE: '/equipment-provider/profile',
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
    VENUE_OWNER: {
      ONBOARD: '/venue-owner/onboard',
      LIST_ALL: '/venue-owner',
      GET_BY_ID: (id: string) => `/venue-owner/profile/${id}`,
      UPDATE: (id: string) => `/venue-owner/${id}`,
      DELETE: (id: string) => `/venue-owner/${id}`,
      MY_PROFILE: '/venue-owner/profile/me',
      FULL_LIST: '/venue-owner/full',
    },
    BOOKINGS: {
      LIST_ALL: '/bookings',
      CREATE: '/bookings',
      GET_BY_ID: (id: string) => `/bookings/${id}`,
      UPDATE: (id: string) => `/bookings/${id}`,
      DELETE: (id: string) => `/bookings/${id}`,
      MY_BOOKINGS: '/bookings/my',
      ARTIST_MY: '/bookings/artist/my',
      ARTIST_ANALYTICS: '/bookings/artist/analytics',
      PENDING: '/bookings/pending',
      APPROVE: (id: string) => `/bookings/${id}/approve`,
      REJECT: (id: string) => `/bookings/${id}/reject`,
      CALCULATE_PRICING: '/bookings/calculate-pricing',
    },
    EVENTS: {
      LIST_ALL: '/events',
      CREATE: '/events',
      GET_BY_ID: (id: string) => `/events/${id}`,
      UPDATE: (id: string) => `/events/${id}`,
      DELETE: (id: string) => `/events/${id}`,
      MY_EVENTS: '/events/my',
      PUBLIC: '/events/public',
      PUBLISH: (id: string) => `/events/${id}/publish`,
      CANCEL: (id: string) => `/events/${id}/cancel`,
      OPEN_BOOKING: '/events/booking/open',
      LAYOUT_DETAILS: (eventId: string) => `/events/${eventId}/layout`,
      BY_PERFORMANCE_TYPE: (performanceType: string) => `/events/performance-type/${performanceType}`,
      STATS: '/events/stats',
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
    SEAT_BOOKING: {
      BOOK: '/seat-book/ticket',
      BOOK_TABLE: '/seat-book/table', 
      BOOK_BOOTH: '/seat-book/booth',
      DETAILS: (id: string) => `/seat-book/details/${id}`,
      TABLE_DETAILS: (id: string) => `/seat-book/table-details/${id}`,
      BOOTH_DETAILS: (id: string) => `/seat-book/booth-details/${id}`,
      CANCEL: (id: string) => `/seat-book/cancel/${id}`,
      USER_BOOKINGS: '/seat-book/user-bookings',
      BOOKING_DETAILS: (id: string) => `/seat-book/booking/${id}`,
      AVAILABILITY: (eventId: string) => `/seat-book/availability/${eventId}`,
      // Venue Owner endpoints
      VENUE_OWNER_BOOKINGS: '/seat-book/venue-owner/bookings',
      VENUE_OWNER_STATS: '/seat-book/venue-owner/stats',
      VENUE_OWNER_BOOKING_DETAILS: (id: string) => `/seat-book/venue-owner/booking/${id}`,
      VENUE_OWNER_UPDATE_STATUS: (id: string) => `/seat-book/venue-owner/booking/${id}/status`,
      VENUE_OWNER_EXPORT: '/seat-book/venue-owner/bookings/export',
    },
    SETTINGS: {
      GET_PROFILE: '/settings/profile',
      UPDATE_PROFILE: '/settings/profile',
      GET_ACCOUNT: '/settings/account',
      UPDATE_ACCOUNT: '/settings/account',
      CHANGE_PASSWORD: '/settings/change-password',
    },
    TRANSLATION: {
      TRANSLATE: '/translation/translate',
      TRANSLATE_BULK: '/translation/translate-bulk',
      HEALTH: '/translation/health',
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
    // Get current path to check if user is on a public page
    const currentPath = window.location.pathname;
    const publicPaths = ['/', '/artists', '/packages', '/events', '/artist-profile', '/package-details', '/auth/signin', '/auth/signup', '/join-us', '/coming-soon'];
    
    // Check if user is on a public page
    const isOnPublicPage = publicPaths.some(path => 
      currentPath === path || 
      currentPath.startsWith(`/${path}`) ||
      currentPath.match(/\/[a-z]{2}\/(artists|packages|events|artist-profile|package-details|auth|join-us|coming-soon)/) ||
      currentPath.match(/\/[a-z]{2}\/$/) // matches locale home pages like /en/ or /ar/
    );
    
    
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      // Clear any stale auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Only redirect if user is trying to access a protected page
      if (!isOnPublicPage) {
        window.location.href = '/auth/signin';
      }
    } else {
      // Token exists but server rejected it - this might be a temporary issue
      // Don't automatically logout on public pages
      if (!isOnPublicPage) {
        console.warn('API returned 401 but token exists - redirecting to login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/auth/signin';
      } else {
        console.warn('API returned 401 on public page - ignoring redirect');
      }
    }
  }
};

export const apiRequest = async <T>(
  url: string,
  options: RequestInit = {},
  requireAuth: boolean = true
): Promise<T> => {
  const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.BASE_URL}${url}`;
  
  // Check if body is FormData to use appropriate headers
  const isFormData = options.body instanceof FormData;
  
  try {
    const response = await fetch(fullUrl, {
      ...options,
      credentials: 'include', // Include credentials for CORS
      headers: {
        ...(requireAuth 
          ? (isFormData ? getMultipartAuthHeaders() : getAuthHeaders()) 
          : (isFormData ? {} : { 'Content-Type': 'application/json' })
        ),
        ...options.headers,
      },
    });

    if (response.status === 401) {
      if (requireAuth) {
        handleUnauthorized();
        throw new APIError(401, 'Unauthorized - Please login again');
      } else {
        // For public endpoints, don't handle unauthorized automatically
        throw new APIError(401, 'Authentication required for this resource');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const backendMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      // Provide clearer client-side messaging for common authorization cases
      let clientMessage = backendMessage;
      if (response.status === 403) {
        // Distinguish ownership vs generic forbidden
        if (/only (publish|cancel|delete|view|edit) your own events/i.test(backendMessage)) {
          clientMessage = backendMessage; // keep specific ownership wording
        } else if (/forbidden|not allowed|permission/i.test(backendMessage)) {
          clientMessage = 'You do not have permission to perform this action.';
        }
      }
      throw new APIError(
        response.status,
        clientMessage,
        errorData
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response as unknown as T;
  } catch (error) {
    // Don't propagate 401 errors as they might cause unwanted logouts
    if (error instanceof APIError && error.status === 401) {
      console.warn('API 401 error caught:', error.message);
      throw new APIError(401, 'Authentication required');
    }
    
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(0, 'Network error or server unavailable');
  }
};

export const publicApiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  return apiRequest<T>(url, options, false);
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