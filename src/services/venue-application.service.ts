import { API_CONFIG, apiRequest } from '@/lib/api-config';

export interface CreateVenueApplicationRequest {
  name: string;
  email: string;
  venue: string;
  ownerDescription: string;
  companyName: string;
  phoneNumber: string;
}

export class VenueApplicationService {
  static async submitApplication(
    data: CreateVenueApplicationRequest,
    files?: { license?: File; venueImage?: File }
  ): Promise<{ message: string }>{
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.append(k, v));
    if (files?.license) formData.append('license', files.license);
    if (files?.venueImage) formData.append('venueImage', files.venueImage);

    return apiRequest(`${API_CONFIG.BASE_URL}/venue-owner/submit-application`, {
      method: 'POST',
      body: formData,
    });
  }

  static async listApplications(): Promise<any>{
    return apiRequest(`${API_CONFIG.BASE_URL}/venue-owner/application`);
  }

  static async reviewApplication(id: string, approve: boolean): Promise<{ message: string }>{
    const status = approve ? 'APPROVED' : 'REJECTED';
    return apiRequest(`${API_CONFIG.BASE_URL}/venue-owner/application/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  }
}
