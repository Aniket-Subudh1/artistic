import { API_CONFIG, apiRequest, uploadRequest, publicApiRequest } from '@/lib/api-config';

export interface PackageItem {
  equipmentId: string;
  quantity: number;
}

export interface CreateEquipmentPackageDto {
  name: string;
  description: string;
  items: PackageItem[];
  totalPrice: number;
  imageUrl?: string;
  images?: string[];
  coverImage?: string;
}

export interface EquipmentPackage {
  _id: string;
  name: string;
  description: string;
  imageUrl?: string;
  images?: string[];
  coverImage?: string;
  items: Array<{
    equipmentId: {
      _id: string;
      name: string;
      category: string;
      pricePerDay: number;
      images?: string[];
    };
    quantity: number;
  }>;
  totalPrice: number;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'draft' | 'pending_review' | 'under_review' | 'approved' | 'rejected';
  visibility: 'online' | 'offline';
  adminNotes?: string;
  roleRef: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPackageAction {
  packageId: string;
  remarks?: string;
  visibility?: boolean;
}

class EquipmentPackagesService {
  // Equipment Provider endpoints
  async createPackage(packageData: CreateEquipmentPackageDto): Promise<{ message: string; pkg: EquipmentPackage }> {
    try {
      return await apiRequest(API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGES.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packageData),
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create package');
    }
  }

  async getMyPackages(): Promise<EquipmentPackage[]> {
    try {
      return await apiRequest(API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGES.MY_PACKAGES, {
        method: 'GET',
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch packages');
    }
  }

  async submitPackageForReview(packageId: string): Promise<{ message: string }> {
    try {
      return await apiRequest(API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGES.SUBMIT_FOR_REVIEW(packageId), {
        method: 'POST',
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to submit package for review');
    }
  }

  async updatePackage(packageId: string, packageData: CreateEquipmentPackageDto): Promise<{ message: string; pkg: EquipmentPackage }> {
    try {
      return await apiRequest(API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGES.UPDATE(packageId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packageData),
      });
    } catch (error: any) {
      console.error('Error updating package:', error);
      throw new Error(error.message || 'Failed to update package');
    }
  }

  async deletePackage(packageId: string): Promise<{ message: string }> {
    try {
      return await apiRequest(API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGES.DELETE(packageId), {
        method: 'DELETE',
      });
    } catch (error: any) {
      console.error('Error deleting package:', error);
      throw new Error(error.message || 'Failed to delete package');
    }
  }

  // Admin endpoints
  async getPendingPackages(): Promise<EquipmentPackage[]> {
    try {
      return await apiRequest(API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGES.PENDING_REVIEW, {
        method: 'GET',
      });
    } catch (error: any) {
      console.error('Error fetching pending packages:', error);
      throw new Error(error.message || 'Failed to fetch pending packages');
    }
  }

  async getAllPackagesForAdmin(): Promise<EquipmentPackage[]> {
    try {
      return await apiRequest(API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGES.ADMIN_ALL, {
        method: 'GET',
      });
    } catch (error: any) {
      console.error('Error fetching all packages for admin:', error);
      throw new Error(error.message || 'Failed to fetch all packages');
    }
  }

  async approvePackage(packageId: string): Promise<{ message: string }> {
    try {
      return await apiRequest(API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGES.APPROVE(packageId), {
        method: 'POST',
      });
    } catch (error: any) {
      console.error('Error approving package:', error);
      throw new Error(error.message || 'Failed to approve package');
    }
  }

  async rejectPackage(packageId: string, remarks: string): Promise<{ message: string }> {
    try {
      return await apiRequest(API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGES.REJECT(packageId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remarks }),
      });
    } catch (error: any) {
      console.error('Error rejecting package:', error);
      throw new Error(error.message || 'Failed to reject package');
    }
  }

  async togglePackageVisibility(packageId: string, visibility: boolean): Promise<{ message: string }> {
    try {
      return await apiRequest(API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGES.TOGGLE_VISIBILITY(packageId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visibility }),
      });
    } catch (error: any) {
      console.error('Error toggling package visibility:', error);
      throw new Error(error.message || 'Failed to toggle package visibility');
    }
  }

  // Public endpoints
  async getPublicPackages(): Promise<EquipmentPackage[]> {
    try {
      return await publicApiRequest(API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGES.PUBLIC, {
        method: 'GET',
      });
    } catch (error: any) {
      console.error('Error fetching public packages:', error);
      throw new Error(error.message || 'Failed to fetch public packages');
    }
  }

  async getPackageById(packageId: string): Promise<EquipmentPackage> {
    try {
      return await publicApiRequest(`${API_CONFIG.BASE_URL}/equipment-packages/${packageId}`, {
        method: 'GET',
      });
    } catch (error: any) {
      console.error('Error fetching package details:', error);
      throw new Error(error.message || 'Failed to fetch package details');
    }
  }

  async uploadPackageImages(packageId: string, images: File[]): Promise<{ message: string; imageUrls: string[]; totalImages: number }> {
    try {
      const formData = new FormData();
      images.forEach((image) => {
        formData.append('images', image);
      });

      // Use uploadRequest for multipart form data
      const fullUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGES.UPLOAD_IMAGES(packageId)}`;
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error uploading package images:', error);
      throw new Error(error.message || 'Failed to upload package images');
    }
  }

  async uploadCoverImage(packageId: string, coverImage: File): Promise<{ message: string; coverImageUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('coverImage', coverImage);

      // Use direct fetch for multipart form data
      const fullUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EQUIPMENT_PACKAGES.UPLOAD_COVER_IMAGE(packageId)}`;
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error uploading cover image:', error);
      throw new Error(error.message || 'Failed to upload cover image');
    }
  }
}

export const equipmentPackagesService = new EquipmentPackagesService();