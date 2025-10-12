import { API_CONFIG, apiRequest } from '@/lib/api-config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  role: string;
  access_token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
    avatar?: string;
    profilePicture?: string;
  };
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  email: string;
  role: string;
}

export interface SignupResponse {
  phoneNumber: string;
  message: string;
}

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  static async signup(userData: SignupRequest): Promise<SignupResponse> {
    return apiRequest<SignupResponse>(API_CONFIG.ENDPOINTS.USER.SIGNUP, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  static getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static storeAuthData(token: string, user: any): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
}