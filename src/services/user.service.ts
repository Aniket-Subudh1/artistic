import { API_CONFIG, apiRequest } from '@/lib/api-config';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  avatar?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
  isActive?: boolean;
}

export interface CreateUserResponse {
  phoneNumber: string;
  message: string;
}

export class UserService {
  static async getAllUsers(): Promise<User[]> {
    return apiRequest<User[]>(API_CONFIG.ENDPOINTS.USER.LIST_ALL, {
      method: 'GET',
    });
  }

  static async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    return apiRequest<CreateUserResponse>(API_CONFIG.ENDPOINTS.USER.SIGNUP, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async getUserById(id: string): Promise<User> {
    return apiRequest<User>(`/user/${id}`, {
      method: 'GET',
    });
  }

  static async updateUser(id: string, userData: Partial<CreateUserRequest>): Promise<User> {
    return apiRequest<User>(`/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  static async deleteUser(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/user/${id}`, {
      method: 'DELETE',
    });
  }

  static async toggleUserStatus(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/user/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  static async getCurrentUserProfile(): Promise<User> {
    return apiRequest<User>(API_CONFIG.ENDPOINTS.USER.PROFILE_ME, {
      method: 'GET',
    });
  }

  static async updateProfilePicture(file: File): Promise<{ message: string; profilePicture: string }> {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const fullUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE_PICTURE}`;
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(fullUrl, {
      method: 'PUT',
      headers,
      body: formData,
    });

    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/auth/signin';
      throw new Error('Unauthorized - Please login again');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  static async removeProfilePicture(): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(
      API_CONFIG.ENDPOINTS.USER.REMOVE_PROFILE_PICTURE,
      {
        method: 'DELETE',
      }
    );
  }
}