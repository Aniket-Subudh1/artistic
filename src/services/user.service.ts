import { API_CONFIG, apiRequest } from '@/lib/api-config';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
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
}