import { API_CONFIG, apiRequest, getMultipartAuthHeaders } from '@/lib/api-config';
import { AuthService } from './auth.service';

export interface EquipmentProvider {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  roleProfile?: {
    companyName: string;
    businessDescription: string;
  };
}

export interface CreateEquipmentProviderRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  companyName?: string;
  businessDescription?: string;
}

export interface LoginEquipmentProviderRequest {
  email: string;
  password: string;
}

export interface LoginEquipmentProviderResponse {
  message: string;
  access_token: string;
  name: string;
  email: string;
  role: string;
}

export interface ChangePasswordRequest {
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export class EquipmentProviderService {
  static async createEquipmentProvider(data: CreateEquipmentProviderRequest): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(API_CONFIG.ENDPOINTS.EQUIPMENT_PROVIDER.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Use unified auth login instead of separate endpoint
  static async login(credentials: LoginEquipmentProviderRequest): Promise<LoginEquipmentProviderResponse> {
    const response = await AuthService.login(credentials);
    return {
      message: response.message,
      access_token: response.access_token,
      name: credentials.email.split('@')[0], 
      email: credentials.email,
      role: response.role
    };
  }

  static async getAllProviders(): Promise<EquipmentProvider[]> {
    return apiRequest<EquipmentProvider[]>(API_CONFIG.ENDPOINTS.EQUIPMENT_PROVIDER.LIST_ALL, {
      method: 'GET',
    });
  }

  static async changePassword(newPassword: string): Promise<ChangePasswordResponse> {
    return apiRequest<ChangePasswordResponse>(API_CONFIG.ENDPOINTS.EQUIPMENT_PROVIDER.CHANGE_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  }

  static validatePassword(password: string): string[] {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }

    return errors;
  }

  // Get provider statistics
  static async getProviderStats(): Promise<{
    total: number;
    active: number;
    recentSignups: number;
  }> {
    try {
      const providers = await this.getAllProviders();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      return {
        total: providers.length,
        active: providers.length, 
        recentSignups: providers.filter(provider => 
          new Date(provider.createdAt) > oneWeekAgo
        ).length,
      };
    } catch (error) {
      throw new Error('Failed to get provider statistics');
    }
  }
}