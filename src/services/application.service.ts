import { API_CONFIG, apiRequest, getMultipartAuthHeaders } from '@/lib/api-config';

export interface CreateApplicationRequest {
  fullName: string;
  email: string;
  age: string;
  gender: string;
  applicationType: 'SOLO' | 'GROUP'; 
  videoLink?: string;
  performPreference?: string[];
}

export interface Application {
  _id: string;
  fullName: string;
  email: string;
  age: number;
  gender: string;
  applicationType: string;
  videoLink?: string;
  resume?: string;
  profileImage?: string;
  performPreference?: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED'; 
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationResponse {
  message: string;
  data?: Application;
}

export class ApplicationService {
  static async submitApplication(
    applicationData: CreateApplicationRequest,
    cvFile?: File,
    profileImage?: File
  ): Promise<ApplicationResponse> {
    try {
      const formData = new FormData();

      Object.entries(applicationData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // Handle arrays like performPreference
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      if (cvFile) {
        formData.append('resume', cvFile);
      }

      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APPLICATIONS.SUBMIT}`, {
        method: 'POST',
        headers: getMultipartAuthHeaders(),
        body: formData,
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error(responseData.message || 'Invalid application data. Please check all fields.');
        } else if (response.status === 409) {
          throw new Error(responseData.message || 'An application with this email already exists.');
        } else if (response.status === 413) {
          throw new Error('File size is too large. Please upload a smaller file.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(responseData.message || 'Failed to submit application. Please try again.');
        }
      }

      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        throw error; 
      }
      
      if (typeof error === 'object' && error !== null) {
        const errorObj = error as any;
        if (errorObj.name === 'TypeError' || errorObj.message?.includes('fetch')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        }
        
        if (errorObj.message) {
          throw new Error(errorObj.message);
        }
      }
      
      throw new Error('Failed to submit application. Please try again.');
    }
  }

  static async getAllApplications(): Promise<Application[]> {
    try {
      return await apiRequest<Application[]>(API_CONFIG.ENDPOINTS.APPLICATIONS.LIST_ALL, {
        method: 'GET',
      });
    } catch (error) {
      throw new Error('Failed to load applications. Please try again.');
    }
  }

  static async getPendingApplications(): Promise<Application[]> {
    try {
      return await apiRequest<Application[]>(`${API_CONFIG.ENDPOINTS.APPLICATIONS.LIST_ALL}?status=PENDING`, {
        method: 'GET',
      });
    } catch (error) {
      throw new Error('Failed to load pending applications. Please try again.');
    }
  }

  static async getApplicationsByStatus(status: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<Application[]> {
    try {
      return await apiRequest<Application[]>(`${API_CONFIG.ENDPOINTS.APPLICATIONS.LIST_ALL}?status=${status}`, {
        method: 'GET',
      });
    } catch (error) {
      throw new Error(`Failed to load ${status.toLowerCase()} applications. Please try again.`);
    }
  }

  // CORRECTED: Use backend endpoint structure /artist/:id/status
  static async reviewApplication(
    applicationId: string,
    action: 'approve' | 'reject',
    comment?: string
  ): Promise<{ message: string }> {
    try {
      // Map frontend actions to backend status values
      const statusMap = {
        approve: 'APPROVED',
        reject: 'REJECTED'
      };

      return await apiRequest<{ message: string }>(API_CONFIG.ENDPOINTS.APPLICATIONS.UPDATE_STATUS(applicationId), {
        method: 'PATCH',
        body: JSON.stringify({
          status: statusMap[action],
          comment: comment || ''
        }),
      });
    } catch (error) {
      throw new Error('Failed to review application. Please try again.');
    }
  }

  static async deleteApplication(applicationId: string): Promise<{ message: string }> {
    try {
      return await apiRequest<{ message: string }>(API_CONFIG.ENDPOINTS.APPLICATIONS.DELETE(applicationId), {
        method: 'DELETE',
      });
    } catch (error) {
      throw new Error('Failed to delete application. Please try again.');
    }
  }

  static async getApplicationById(applicationId: string): Promise<Application> {
    try {
      return await apiRequest<Application>(API_CONFIG.ENDPOINTS.APPLICATIONS.GET_BY_ID(applicationId), {
        method: 'GET',
      });
    } catch (error) {
      throw new Error('Failed to load application details. Please try again.');
    }
  }

  // Statistics methods - these will work with existing data
  static async getApplicationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    soloArtists: number;
    teams: number;
  }> {
    try {
      const applications = await this.getAllApplications();
      
      return {
        total: applications.length,
        pending: applications.filter(app => app.status === 'PENDING').length,
        approved: applications.filter(app => app.status === 'APPROVED').length,
        rejected: applications.filter(app => app.status === 'REJECTED').length,
        soloArtists: applications.filter(app => app.applicationType === 'SOLO').length,
        teams: applications.filter(app => app.applicationType === 'GROUP').length,
      };
    } catch (error) {
      throw new Error('Failed to get application statistics');
    }
  }

  // Export applications data
  static async exportApplications(format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    try {
      const applications = await this.getAllApplications();
      
      if (format === 'json') {
        const jsonData = JSON.stringify(applications, null, 2);
        return new Blob([jsonData], { type: 'application/json' });
      }
      
      // CSV format
      const headers = [
        'Full Name',
        'Email',
        'Age',
        'Gender',
        'Application Type',
        'Status',
        'Submitted At',
        'Video Link',
        'Resume URL'
      ];
      
      const csvRows = [
        headers.join(','),
        ...applications.map(app => [
          `"${app.fullName}"`,
          `"${app.email}"`,
          app.age,
          `"${app.gender}"`,
          `"${app.applicationType}"`,
          `"${app.status}"`,
          `"${new Date(app.createdAt).toLocaleString()}"`,
          `"${app.videoLink || ''}"`,
          `"${app.resume || ''}"`
        ].join(','))
      ];
      
      const csvData = csvRows.join('\n');
      return new Blob([csvData], { type: 'text/csv' });
    } catch (error) {
      throw new Error('Failed to export applications');
    }
  }

  // Search applications
  static async searchApplications(searchTerm: string): Promise<Application[]> {
    try {
      const applications = await this.getAllApplications();
      
      if (!searchTerm.trim()) {
        return applications;
      }
      
      const term = searchTerm.toLowerCase();
      return applications.filter(app =>
        app.fullName.toLowerCase().includes(term) ||
        app.email.toLowerCase().includes(term) ||
        app.gender.toLowerCase().includes(term) ||
        app.applicationType.toLowerCase().includes(term) ||
        app.status.toLowerCase().includes(term)
      );
    } catch (error) {
      throw new Error('Failed to search applications');
    }
  }
}