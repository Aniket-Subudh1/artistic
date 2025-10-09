import { API_CONFIG, apiRequest, getMultipartAuthHeaders } from '@/lib/api-config';

export interface ArtistType {
  _id: string;
  name: string;
  description: string;
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

  static async getPrivateArtists(): Promise<Artist[]> {
    return apiRequest<Artist[]>(API_CONFIG.ENDPOINTS.ARTIST.LIST_PRIVATE, {
      method: 'GET',
    });
  }
}