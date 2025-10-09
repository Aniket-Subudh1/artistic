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

export class UserService {
  static async getAllUsers(): Promise<User[]> {
    return apiRequest<User[]>(API_CONFIG.ENDPOINTS.USER.LIST_ALL, {
      method: 'GET',
    });
  }
}