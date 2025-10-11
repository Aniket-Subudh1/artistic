import { API_CONFIG, apiRequest } from '@/lib/api-config';

export interface Equipment {
  _id: string;
  name: string;
  category: string;
  imageUrl: string;
  description: string;
  pricePerHour: number;
  pricePerDay: number;
  quantity: number;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export const EQUIPMENT_CATEGORIES = [
  { value: 'SOUND', label: 'Sound Equipment' },
  { value: 'DISPLAY', label: 'Display Equipment' },
  { value: 'LIGHT', label: 'Lighting Equipment' },
  { value: 'OTHER', label: 'Other Equipment' }
];

export class EquipmentService {
  static async getAllEquipment(): Promise<Equipment[]> {
    return apiRequest<Equipment[]>(API_CONFIG.ENDPOINTS.EQUIPMENT.LIST_ALL, {
      method: 'GET',
    });
  }

  static async getMyEquipment(): Promise<Equipment[]> {
    return apiRequest<Equipment[]>(API_CONFIG.ENDPOINTS.EQUIPMENT.MY_EQUIPMENT, {
      method: 'GET',
    });
  }

  static async getEquipmentByProvider(providerId: string): Promise<Equipment[]> {
    const allEquipment = await this.getAllEquipment();
    return allEquipment.filter(item => item.provider === providerId);
  }

  static async createEquipment(data: FormData): Promise<Equipment> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EQUIPMENT.CREATE}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create equipment');
    }

    return response.json();
  }

  static async updateEquipment(id: string, data: FormData): Promise<Equipment> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EQUIPMENT.UPDATE(id)}`, {
      method: 'PUT',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update equipment');
    }

    return response.json();
  }

  static async deleteEquipment(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(API_CONFIG.ENDPOINTS.EQUIPMENT.DELETE(id), {
      method: 'DELETE',
    });
  }

  static async getEquipmentById(id: string): Promise<Equipment> {
    return apiRequest<Equipment>(API_CONFIG.ENDPOINTS.EQUIPMENT.GET_BY_ID(id), {
      method: 'GET',
    });
  }

  static async getEquipmentStats(): Promise<{
    total: number;
    available: number;
    categories: number;
    averagePrice: number;
  }> {
    try {
      const equipment = await this.getAllEquipment();
      
      return {
        total: equipment.length,
        available: equipment.filter(item => item.quantity > 0).length,
        categories: new Set(equipment.map(item => item.category)).size,
        averagePrice: equipment.length > 0 
          ? Math.round(equipment.reduce((sum, item) => sum + item.pricePerDay, 0) / equipment.length)
          : 0
      };
    } catch (error) {
      throw new Error('Failed to get equipment statistics');
    }
  }

  static async searchEquipment(searchTerm: string, category?: string): Promise<Equipment[]> {
    const equipment = await this.getAllEquipment();
    
    if (!searchTerm.trim() && !category) {
      return equipment;
    }
    
    return equipment.filter(item => {
      const matchesSearch = !searchTerm.trim() || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !category || item.category === category;
      
      return matchesSearch && matchesCategory;
    });
  }

  static getEquipmentCategories(): { value: string; label: string }[] {
    return EQUIPMENT_CATEGORIES;
  }


  static validateEquipmentData(data: {
    name: string;
    category: string;
    description: string;
    pricePerHour: string | number;
    pricePerDay: string | number;
    quantity: string | number;
  }): string[] {
    const errors: string[] = [];

    if (!data.name.trim()) {
      errors.push('Equipment name is required');
    }

    if (!data.category) {
      errors.push('Category is required');
    }

    if (!EQUIPMENT_CATEGORIES.some(cat => cat.value === data.category)) {
      errors.push('Invalid category selected');
    }

    if (!data.description.trim()) {
      errors.push('Description is required');
    }

    const pricePerHour = Number(data.pricePerHour);
    if (isNaN(pricePerHour) || pricePerHour <= 0) {
      errors.push('Price per hour must be a positive number');
    }

    const pricePerDay = Number(data.pricePerDay);
    if (isNaN(pricePerDay) || pricePerDay <= 0) {
      errors.push('Price per day must be a positive number');
    }

    const quantity = Number(data.quantity);
    if (isNaN(quantity) || quantity < 0) {
      errors.push('Quantity must be a non-negative number');
    }

    return errors;
  }
}