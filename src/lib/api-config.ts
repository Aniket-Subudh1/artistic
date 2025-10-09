export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
    },
    USER: {
      SIGNUP: '/user/signup',
      LIST_ALL: '/user/listall',
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
      REVIEW_UPDATE: '/artist/profile/review-update',
    },
    APPLICATIONS: {
      SUBMIT: '/applications/submit',
      LIST_ALL: '/applications',
      LIST_PENDING: '/applications/pending',
      REVIEW: '/applications/:id/review',
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
  const fullUrl = `${API_CONFIG.BASE_URL}${url}`;
  
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
        errorData.message || 'An error occurred',
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