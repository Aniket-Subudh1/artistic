import { API_CONFIG, apiRequest } from '@/lib/api-config';

export interface CustomPackageItem {
  equipmentId: string;
  quantity: number;
}

export interface CreateCustomPackageDto {
  name: string;
  description: string;
  items: CustomPackageItem[];
  isPublic?: boolean;
  notes?: string;
}

export interface UpdateCustomPackageDto {
  name?: string;
  description?: string;
  items?: CustomPackageItem[];
  isPublic?: boolean;
  notes?: string;
}

export interface CustomEquipmentPackage {
  _id: string;
  name: string;
  description: string;
  items: Array<{
    equipmentId: {
      _id: string;
      name: string;
      category: string;
      pricePerDay: number;
      images?: string[];
      provider: {
        _id: string;
        companyName?: string;
        firstName: string;
        lastName: string;
      };
    };
    quantity: number;
    pricePerDay: number;
  }>;
  totalPricePerDay: number;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'active' | 'inactive';
  isPublic: boolean;
  sharedWith: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

class CustomEquipmentPackagesService {
  // Create a new custom package
  async createCustomPackage(packageData: CreateCustomPackageDto): Promise<{ message: string; package: CustomEquipmentPackage }> {
    try {
      return await apiRequest(API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGES.CUSTOM.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packageData),
      });
    } catch (error: any) {
      console.error('Error creating custom package:', error);
      throw new Error(error.message || 'Failed to create custom package');
    }
  }

  // Get user's custom packages
  async getUserCustomPackages(): Promise<CustomEquipmentPackage[]> {
    try {
      const response = await apiRequest(API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGES.CUSTOM.MY_PACKAGES, {
        method: 'GET',
      }) as { data: CustomEquipmentPackage[] };
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching user custom packages:', error);
      throw new Error(error.message || 'Failed to fetch user custom packages');
    }
  }

  // Get all custom packages (user's own + public)
  async getAllCustomPackages(): Promise<CustomEquipmentPackage[]> {
    try {
      const response = await apiRequest(API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGES.CUSTOM.ALL_PACKAGES, {
        method: 'GET',
      }) as { data: CustomEquipmentPackage[] };
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching all custom packages:', error);
      throw new Error(error.message || 'Failed to fetch custom packages');
    }
  }

  // Get public custom packages
  async getPublicCustomPackages(): Promise<CustomEquipmentPackage[]> {
    try {
      const response = await apiRequest(API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGES.CUSTOM.PUBLIC, {
        method: 'GET',
      }) as { data: CustomEquipmentPackage[] };
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching public custom packages:', error);
      throw new Error(error.message || 'Failed to fetch public custom packages');
    }
  }

  // Get available equipment for creating custom packages
  async getAvailableEquipment(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<{
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.category) queryParams.append('category', params.category);
      if (params?.search) queryParams.append('search', params.search);

      const url = `${API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGES.CUSTOM.AVAILABLE_EQUIPMENT}?${queryParams.toString()}`;
      
      return await apiRequest(url, {
        method: 'GET',
      });
    } catch (error: any) {
      console.error('Error fetching available equipment:', error);
      throw new Error(error.message || 'Failed to fetch available equipment');
    }
  }

  // Get custom package by ID
  async getCustomPackageById(packageId: string): Promise<CustomEquipmentPackage> {
    try {
      return await apiRequest(API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGES.CUSTOM.GET_BY_ID(packageId), {
        method: 'GET',
      });
    } catch (error: any) {
      console.error('Error fetching custom package:', error);
      throw new Error(error.message || 'Failed to fetch custom package');
    }
  }

  // Update custom package
  async updateCustomPackage(packageId: string, packageData: UpdateCustomPackageDto): Promise<{ message: string; package: CustomEquipmentPackage }> {
    try {
      return await apiRequest(API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGES.CUSTOM.UPDATE(packageId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packageData),
      });
    } catch (error: any) {
      console.error('Error updating custom package:', error);
      throw new Error(error.message || 'Failed to update custom package');
    }
  }

  // Delete custom package
  async deleteCustomPackage(packageId: string): Promise<{ message: string }> {
    try {
      return await apiRequest(API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGES.CUSTOM.DELETE(packageId), {
        method: 'DELETE',
      });
    } catch (error: any) {
      console.error('Error deleting custom package:', error);
      throw new Error(error.message || 'Failed to delete custom package');
    }
  }

  // Share custom package with another user
  async shareCustomPackage(packageId: string, userId: string): Promise<{ message: string }> {
    try {
      return await apiRequest(API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGES.CUSTOM.SHARE(packageId, userId), {
        method: 'POST',
      });
    } catch (error: any) {
      console.error('Error sharing custom package:', error);
      throw new Error(error.message || 'Failed to share custom package');
    }
  }
}

export const customEquipmentPackagesService = new CustomEquipmentPackagesService();