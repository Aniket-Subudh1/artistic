import { API_CONFIG, apiRequest, getMultipartAuthHeaders } from '@/lib/api-config';

export interface ArtistType {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePortfolioItemRequest {
  title: string;
  description: string;
  type: 'image' | 'video' | 'audio';
}

export interface PortfolioItem {
  _id: string;
  title: string;
  description: string;
  type: 'image' | 'video' | 'audio';
  fileUrl: string;
  thumbnailUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  artistProfile: {
    _id: string;
    stageName: string;
  };
  artistUser?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  reviewedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  reviewComment?: string;
  reviewedAt?: string;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArtistRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  stageName: string;
  about?: string;
  yearsOfExperience: number;
  skills: string[];
  musicLanguages: string[];
  awards: string[];
  pricePerHour: number;
  gender: string;
  artistType: string;
  category: string;
  country: string;
  performPreference: string[];
}

export interface UpdateArtistProfileRequest {
  about?: string;
  yearsOfExperience?: number;
  pricePerHour?: number;
  genres?: string[];
  skills?: string[];
  musicLanguages?: string[];
  awards?: string[];
  category?: string;
  performPreference?: string[];
}

export interface Artist {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber?: string;
    role: string;
    isActive: boolean;
  };
  stageName: string;
  about: string;
  yearsOfExperience: number;
  skills: string[];
  musicLanguages: string[];
  awards: string[];
  pricePerHour: number;
  profileImage: string;
  profileCoverImage: string;
  demoVideo: string;
  likeCount: number;
  category: string;
  country: string;
  genres: string[];
  performPreference: string[];
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArtistResponse {
  message: string;
  user: string;
  profile: Artist;
}

export class ArtistService {
  static async getArtistTypes(): Promise<ArtistType[]> {
    return apiRequest<ArtistType[]>(API_CONFIG.ENDPOINTS.ARTIST.LIST_TYPES, {
      method: 'GET',
    });
  }

  static async createArtist(
    artistData: CreateArtistRequest,
    files?: {
      profileImage?: File;
      profileCoverImage?: File;
      demoVideo?: File;
    }
  ): Promise<CreateArtistResponse> {
    const formData = new FormData();

    // Add all text fields
    Object.entries(artistData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    });

    // Add files if provided
    if (files?.profileImage) {
      formData.append('profileImage', files.profileImage);
    }
    if (files?.profileCoverImage) {
      formData.append('profileCoverImage', files.profileCoverImage);
    }
    if (files?.demoVideo) {
      formData.append('demoVideo', files.demoVideo);
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ARTIST.ONBOARD}`, {
      method: 'POST',
      headers: getMultipartAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create artist');
    }

    return response.json();
  }

  static async getPublicArtists(): Promise<Artist[]> {
    return apiRequest<Artist[]>(API_CONFIG.ENDPOINTS.ARTIST.LIST_PUBLIC, {
      method: 'GET',
    });
  }

  static async getArtistById(artistId: string): Promise<Artist> {
    return apiRequest<Artist>(API_CONFIG.ENDPOINTS.ARTIST.GET_BY_ID(artistId), {
      method: 'GET',
    });
  }

  static async getMyProfile(): Promise<Artist> {
    return apiRequest<Artist>(API_CONFIG.ENDPOINTS.ARTIST.MY_PROFILE, {
      method: 'GET',
    });
  }

  static async getPrivateArtists(): Promise<Artist[]> {
    return apiRequest<Artist[]>(API_CONFIG.ENDPOINTS.ARTIST.LIST_PRIVATE, {
      method: 'GET',
    });
  }

  static async verifyArtist(artistId: string, isVerified: boolean): Promise<{ message: string; artistId: string; isVerified: boolean; }> {
    return apiRequest(API_CONFIG.ENDPOINTS.ARTIST.VERIFY(artistId), {
      method: 'PATCH',
      body: JSON.stringify({ isVerified }),
    });
  }

  static async toggleArtistVisibility(artistId: string, isVisible: boolean): Promise<{ message: string; artistId: string; isVisible: boolean; }> {
    return apiRequest(API_CONFIG.ENDPOINTS.ARTIST.TOGGLE_VISIBILITY(artistId), {
      method: 'PATCH',
      body: JSON.stringify({ isVisible }),
    });
  }

  static async requestProfileUpdate(
    updateData: UpdateArtistProfileRequest,
    files?: {
      profileImage?: File;
      profileCoverImage?: File;
      demoVideo?: File;
    }
  ): Promise<{ message: string }> {
    const formData = new FormData();

    // Add text fields (only if they have values)
    if (updateData.genres && updateData.genres.length > 0) {
      formData.append('genres', JSON.stringify(updateData.genres));
    }
    if (updateData.skills && updateData.skills.length > 0) {
      formData.append('skills', JSON.stringify(updateData.skills));
    }
    if (updateData.category && updateData.category.trim()) {
      formData.append('category', updateData.category);
    }
    if (updateData.about && updateData.about.trim()) {
      formData.append('about', updateData.about);
    }
    if (updateData.yearsOfExperience !== undefined && updateData.yearsOfExperience !== null) {
      formData.append('yearsOfExperience', updateData.yearsOfExperience.toString());
    }
    if (updateData.pricePerHour !== undefined && updateData.pricePerHour !== null) {
      formData.append('pricePerHour', updateData.pricePerHour.toString());
    }
    if (updateData.musicLanguages && updateData.musicLanguages.length > 0) {
      formData.append('musicLanguages', JSON.stringify(updateData.musicLanguages));
    }
    if (updateData.awards && updateData.awards.length > 0) {
      formData.append('awards', JSON.stringify(updateData.awards));
    }
    if (updateData.performPreference && updateData.performPreference.length > 0) {
      formData.append('performPreference', JSON.stringify(updateData.performPreference));
    }

    // Add files if provided
    if (files?.profileImage) {
      formData.append('profileImage', files.profileImage);
    }
    if (files?.profileCoverImage) {
      formData.append('profileCoverImage', files.profileCoverImage);
    }
    if (files?.demoVideo) {
      formData.append('demoVideo', files.demoVideo);
    }

    // Debug: Log what's being sent
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ARTIST.UPDATE_REQUEST}`, {
      method: 'POST',
      headers: getMultipartAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  static async getPendingUpdateRequests(): Promise<any[]> {
    return apiRequest<any[]>(API_CONFIG.ENDPOINTS.ARTIST.PENDING_REQUESTS, {
      method: 'GET',
    });
  }

  static async getMyUpdateRequests(): Promise<any[]> {
    return apiRequest<any[]>(API_CONFIG.ENDPOINTS.ARTIST.MY_REQUESTS, {
      method: 'GET',
    });
  }

  static async reviewUpdateRequest(
    requestId: string, 
    approve: boolean, 
    comment?: string
  ): Promise<{ message: string }> {
    const url = `${API_CONFIG.ENDPOINTS.ARTIST.REVIEW_UPDATE(requestId)}?approve=${approve}`;
    return apiRequest(url, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }

  // Portfolio Management Methods
  static async createPortfolioItem(
    itemData: CreatePortfolioItemRequest,
    file: File
  ): Promise<{ message: string; portfolioItem: PortfolioItem }> {
    const formData = new FormData();
    formData.append('title', itemData.title);
    formData.append('description', itemData.description);
    formData.append('type', itemData.type);
    formData.append('file', file);

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ARTIST.PORTFOLIO.CREATE}`, {
      method: 'POST',
      headers: getMultipartAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create portfolio item');
    }

    return response.json();
  }

  static async getMyPortfolioItems(status?: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<PortfolioItem[]> {
    const url = status 
      ? `${API_CONFIG.ENDPOINTS.ARTIST.PORTFOLIO.MY_ITEMS}?status=${status}`
      : API_CONFIG.ENDPOINTS.ARTIST.PORTFOLIO.MY_ITEMS;
    
    return apiRequest<PortfolioItem[]>(url, {
      method: 'GET',
    });
  }

  static async getPublicPortfolioItems(artistProfileId: string): Promise<PortfolioItem[]> {
    return apiRequest<PortfolioItem[]>(API_CONFIG.ENDPOINTS.ARTIST.PORTFOLIO.PUBLIC(artistProfileId), {
      method: 'GET',
    });
  }

  static async deletePortfolioItem(portfolioItemId: string): Promise<{ message: string }> {
    return apiRequest(API_CONFIG.ENDPOINTS.ARTIST.PORTFOLIO.DELETE(portfolioItemId), {
      method: 'DELETE',
    });
  }

  static async incrementPortfolioViews(portfolioItemId: string): Promise<void> {
    return apiRequest(API_CONFIG.ENDPOINTS.ARTIST.PORTFOLIO.VIEW(portfolioItemId), {
      method: 'POST',
    });
  }

  static async togglePortfolioLike(portfolioItemId: string, increment: boolean): Promise<void> {
    return apiRequest(API_CONFIG.ENDPOINTS.ARTIST.PORTFOLIO.LIKE(portfolioItemId), {
      method: 'POST',
      body: JSON.stringify({ increment }),
    });
  }

  // Admin Portfolio Methods
  static async getPendingPortfolioItems(): Promise<PortfolioItem[]> {
    return apiRequest<PortfolioItem[]>(API_CONFIG.ENDPOINTS.ARTIST.PORTFOLIO.PENDING_REVIEW, {
      method: 'GET',
    });
  }

  static async reviewPortfolioItem(
    portfolioItemId: string, 
    approve: boolean, 
    reviewComment?: string
  ): Promise<{ message: string; portfolioItem: PortfolioItem }> {
    const url = `${API_CONFIG.ENDPOINTS.ARTIST.PORTFOLIO.REVIEW(portfolioItemId)}?approve=${approve}`;
    return apiRequest(url, {
      method: 'POST',
      body: JSON.stringify({ reviewComment }),
    });
  }
}