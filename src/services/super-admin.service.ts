import { apiRequest } from '@/lib/api-config';

export interface CreateAdminRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface UpdateAdminRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface Admin {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  addedBy?: string;
}

export interface AdminsResponse {
  data: Admin[];
  pagination: {
    current: number;
    total: number;
    count: number;
    totalItems: number;
  };
}

export interface AdminResponse {
  data: Admin;
}

export interface FetchAdminsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: boolean;
}

export class SuperAdminService {
  private static readonly BASE_PATH = '/super-admin';

  /**
   * Create a new admin user
   */
  static async createAdmin(adminData: CreateAdminRequest): Promise<{ message: string; admin: Partial<Admin> }> {
    return apiRequest<{ message: string; admin: Partial<Admin> }>(`${this.BASE_PATH}/create/admin`, {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  }

  /**
   * Get all admin users with pagination and filtering
   */
  static async fetchAllAdmins(params: FetchAdminsParams = {}): Promise<AdminsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.status !== undefined) searchParams.append('status', params.status.toString());

    const query = searchParams.toString();
    const url = `${this.BASE_PATH}/list/admins${query ? `?${query}` : ''}`;
    
    return apiRequest<AdminsResponse>(url, {
      method: 'GET',
    });
  }

  /**
   * Get admin details by ID
   */
  static async getAdminById(id: string): Promise<AdminResponse> {
    return apiRequest<AdminResponse>(`${this.BASE_PATH}/admin/${id}`, {
      method: 'GET',
    });
  }

  /**
   * Update admin details
   */
  static async updateAdmin(id: string, adminData: UpdateAdminRequest): Promise<{ message: string; data: Admin }> {
    return apiRequest<{ message: string; data: Admin }>(`${this.BASE_PATH}/admin/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(adminData),
    });
  }

  /**
   * Toggle admin active status
   */
  static async toggleAdminStatus(id: string): Promise<{ message: string; data: Admin }> {
    return apiRequest<{ message: string; data: Admin }>(`${this.BASE_PATH}/admin/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  /**
   * Delete an admin user
   */
  static async deleteAdmin(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`${this.BASE_PATH}/admin/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Reset admin password
   */
  static async resetAdminPassword(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`${this.BASE_PATH}/admin/${id}/reset-password`, {
      method: 'POST',
    });
  }
}