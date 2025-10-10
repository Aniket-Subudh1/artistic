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
  application?: Application;
  data?: Application;
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
      formData.append('resume', cvFile); // Backend expects 'resume' field name
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ARTIST.SUBMIT_APPLICATION}`, {
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
    return apiRequest<Application[]>(API_CONFIG.ENDPOINTS.ARTIST.LIST_APPLICATIONS, {
      method: 'GET',
    });
  }

  static async getPendingApplications(): Promise<Application[]> {
    return apiRequest<Application[]>(`${API_CONFIG.ENDPOINTS.ARTIST.LIST_APPLICATIONS}?status=pending`, {
      method: 'GET',
    });
  }

  static async getApplicationsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<Application[]> {
    return apiRequest<Application[]>(`${API_CONFIG.ENDPOINTS.ARTIST.LIST_APPLICATIONS}?status=${status}`, {
      method: 'GET',
    });
  }

  static async reviewApplication(
    applicationId: string,
    action: 'approve' | 'reject',
    comment?: string
  ): Promise<{ message: string }> {
    // Map frontend actions to backend status
    const statusMap = {
      approve: 'APPROVED',
      reject: 'REJECTED'
    };

    return apiRequest<{ message: string }>(API_CONFIG.ENDPOINTS.ARTIST.UPDATE_APPLICATION_STATUS(applicationId), {
      method: 'PATCH',
      body: JSON.stringify({
        status: statusMap[action],
        comment: comment || ''
      }),
    });
  }

  static async getApplicationById(id: string): Promise<Application> {
    return apiRequest<Application>(`${API_CONFIG.ENDPOINTS.ARTIST.LIST_APPLICATIONS}/${id}`, {
      method: 'GET',
    });
  }

  static async deleteApplication(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`${API_CONFIG.ENDPOINTS.ARTIST.LIST_APPLICATIONS}/${id}`, {
      method: 'DELETE',
    });
  }

  // Statistics methods
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
        pending: applications.filter(app => app.status === 'pending').length,
        approved: applications.filter(app => app.status === 'approved').length,
        rejected: applications.filter(app => app.status === 'rejected').length,
        soloArtists: applications.filter(app => app.applicationType === 'Solo').length,
        teams: applications.filter(app => app.applicationType === 'Team').length,
      };
    } catch (error) {
      throw new Error('Failed to get application statistics');
    }
  }

  // Bulk operations
  static async bulkReview(
    applicationIds: string[],
    action: 'approve' | 'reject',
    comment?: string
  ): Promise<{ message: string; processed: number }> {
    const results = await Promise.allSettled(
      applicationIds.map(id => this.reviewApplication(id, action, comment))
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    
    return {
      message: `${successful} applications ${action}d successfully`,
      processed: successful
    };
  }

  // Export applications data
  static async exportApplications(format: 'csv' | 'json' = 'csv'): Promise<Blob> {
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
      'Reviewed At',
      'Review Comment',
      'Video Link'
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
        `"${new Date(app.submittedAt).toLocaleString()}"`,
        `"${app.reviewedAt ? new Date(app.reviewedAt).toLocaleString() : ''}"`,
        `"${app.reviewComment || ''}"`,
        `"${app.videoLink || ''}"`
      ].join(','))
    ];
    
    const csvData = csvRows.join('\n');
    return new Blob([csvData], { type: 'text/csv' });
  }

  // Search applications
  static async searchApplications(searchTerm: string): Promise<Application[]> {
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
  }

  // Get applications with pagination
  static async getApplicationsPaginated(
    page: number = 1,
    limit: number = 10,
    status?: 'pending' | 'approved' | 'rejected',
    sortBy: string = 'submittedAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{
    applications: Application[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      let applications = await this.getAllApplications();
      
      // Filter by status if provided
      if (status) {
        applications = applications.filter(app => app.status === status);
      }
      
      applications.sort((a, b) => {
        const aValue = a[sortBy as keyof Application];
        const bValue = b[sortBy as keyof Application];
        
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortOrder === 'asc' ? -1 : 1;
        if (bValue == null) return sortOrder === 'asc' ? 1 : -1;
        
        if (sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
      
      // Paginate
      const total = applications.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedApplications = applications.slice(startIndex, startIndex + limit);
      
      return {
        applications: paginatedApplications,
        total,
        page,
        totalPages
      };
    } catch (error) {
      throw new Error('Failed to get paginated applications');
    }
  }
}