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
  provider: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  createdAt: string;
  updatedAt: string;
}

export class EquipmentService {
  static async getAllEquipment(): Promise<Equipment[]> {
    return apiRequest<Equipment[]>('/equipment-provider/list-equipments', {
      method: 'GET',
    });
  }

  static async getEquipmentByProvider(providerId: string): Promise<Equipment[]> {
    return apiRequest<Equipment[]>('/equipment-provider/me/equipments', {
      method: 'GET',
    });
  }

  static async createEquipment(data: FormData): Promise<Equipment> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_CONFIG.BASE_URL}/equipment-provider/create/equipment`, {
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
    const response = await fetch(`${API_CONFIG.BASE_URL}/equipment/${id}`, {
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
    return apiRequest<{ message: string }>(`/equipment/${id}`, {
      method: 'DELETE',
    });
  }
}