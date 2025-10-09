'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { AuthService, LoginRequest, SignupRequest } from '@/services/auth.service';
import { User, UserRole } from '@/types/dashboard';

const mapBackendRole = (backendRole: string): UserRole => {
  switch (backendRole.toUpperCase()) {
    case 'SUPER_ADMIN':
      return 'super_admin';
    case 'ADMIN':
      return 'admin';
    case 'ARTIST':
      return 'artist';
    case 'EQUIPMENT_PROVIDER':
      return 'equipment_provider';
    case 'VENUE_OWNER':
      return 'venue_owner';
    case 'USER':
    default:
      return 'user';
  }
};

const mapFrontendRole = (frontendRole: UserRole): string => {
  switch (frontendRole) {
    case 'super_admin':
      return 'SUPER_ADMIN';
    case 'admin':
      return 'ADMIN';
    case 'artist':
      return 'ARTIST';
    case 'equipment_provider':
      return 'EQUIPMENT_PROVIDER';
    case 'venue_owner':
      return 'VENUE_OWNER';
    case 'user':
    default:
      return 'USER';
  }
};

export const useAuthLogic = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = AuthService.getStoredUser();
        const isAuthenticated = AuthService.isAuthenticated();
        
        if (storedUser && isAuthenticated) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        AuthService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await AuthService.login({ email, password });
      
      // Create user object compatible with dashboard types
      const userObj: User = {
        id: Date.now().toString(), // Since backend doesn't return user ID in login
        firstName: email.split('@')[0], // Temporary - should be updated when user profile is fetched
        lastName: '',
        email,
        role: mapBackendRole(response.role),
        memberSince: new Date().getFullYear().toString(),
        isActive: true,
        permissions: []
      };

      AuthService.storeAuthData(response.access_token, userObj);
      setUser(userObj);
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    password: string;
    email: string;
    role: UserRole;
  }) => {
    setIsLoading(true);
    try {
      const signupData: SignupRequest = {
        ...userData,
        role: mapFrontendRole(userData.role),
      };
      
      const response = await AuthService.signup(signupData);
      return response;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    router.push('/');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AuthService.storeAuthData(
        localStorage.getItem('authToken') || '',
        updatedUser
      );
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && AuthService.isAuthenticated(),
    login,
    signup,
    logout,
    updateUser,
  };
};