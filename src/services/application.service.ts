import { API_CONFIG, apiRequest, getMultipartAuthHeaders } from '@/lib/api-config';

export interface CreateApplicationRequest {
  fullName: string;
  email: string;
  age: string;
  gender: string;
  applicationType: 'Solo' | 'Team';
  videoLink?: string;
}

export interface Application {
  _id: string;
  fullName: string;
  email: string;
  age: number;
  gender: string;
  applicationType: string;
  videoLink?: string;
  cvFileUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComment?: string;
}

export interface ApplicationResponse {
  message: string;
  application: Application;
}

export class ApplicationService {
  static async submitApplication(
    applicationData: CreateApplicationRequest,
    cvFile?: File
  ): Promise<ApplicationResponse> {
    const formData = new FormData();

    // Add all text fields
    Object.entries(applicationData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Add CV file if provided
    if (cvFile) {
      formData.append('cvFile', cvFile);
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/applications/submit`, {
      method: 'POST',
      headers: getMultipartAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to submit application');
    }

    return response.json();
  }

  static async getAllApplications(): Promise<Application[]> {
    return apiRequest<Application[]>('/applications', {
      method: 'GET',
    });
  }

  static async getPendingApplications(): Promise<Application[]> {
    return apiRequest<Application[]>('/applications/pending', {
      method: 'GET',
    });
  }

  static async reviewApplication(
    applicationId: string,
    action: 'approve' | 'reject',
    comment?: string
  ): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/applications/${applicationId}/review`, {
      method: 'POST',
      body: JSON.stringify({
        action,
        comment
      }),
    });
  }
}