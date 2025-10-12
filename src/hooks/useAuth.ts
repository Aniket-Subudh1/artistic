'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { AuthService, LoginRequest, SignupRequest } from '@/services/auth.service';
import { UserService } from '@/services/user.service';
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
    const initializeAuth = async () => {
      try {
        const storedUser = AuthService.getStoredUser();
        const isAuthenticated = AuthService.isAuthenticated();
        
        if (storedUser && isAuthenticated) {
          try {
            // Try to fetch updated user profile from backend
            const userProfile = await UserService.getCurrentUserProfile();
            
            // Map backend user to frontend user format
            const updatedUser: User = {
              id: userProfile._id,
              firstName: userProfile.firstName,
              lastName: userProfile.lastName,
              email: userProfile.email,
              role: mapBackendRole(userProfile.role),
              avatar: userProfile.profilePicture,
              memberSince: new Date(userProfile.createdAt).getFullYear().toString(),
              isActive: userProfile.isActive,
              permissions: []
            };
            
            // Update stored user with fresh data
            AuthService.storeAuthData(localStorage.getItem('authToken') || '', updatedUser);
            setUser(updatedUser);
          } catch (error) {
            console.error('Error fetching user profile:', error);
            // Fallback to stored user if profile fetch fails
            setUser(storedUser);
          }
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
      
      // Use user data from login response
      const userObj: User = {
        id: response.user.id,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        email: response.user.email,
        role: mapBackendRole(response.user.role),
        avatar: response.user.avatar || response.user.profilePicture,
        memberSince: new Date().getFullYear().toString(),
        isActive: response.user.isActive,
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

  const updateProfilePicture = async (file: File) => {
    setIsLoading(true);
    try {
      const response = await UserService.updateProfilePicture(file);
      
      // Update user with new profile picture
      if (user) {
        const updatedUser = { ...user, avatar: response.profilePicture };
        setUser(updatedUser);
        AuthService.storeAuthData(
          localStorage.getItem('authToken') || '',
          updatedUser
        );
      }
      
      return response;
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeProfilePicture = async () => {
    setIsLoading(true);
    try {
      const response = await UserService.removeProfilePicture();
      
      // Update user to remove profile picture
      if (user) {
        const updatedUser = { ...user, avatar: '' };
        setUser(updatedUser);
        AuthService.storeAuthData(
          localStorage.getItem('authToken') || '',
          updatedUser
        );
      }
      
      return response;
    } catch (error) {
      console.error('Error removing profile picture:', error);
      throw error;
    } finally {
      setIsLoading(false);
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
    updateProfilePicture,
    removeProfilePicture,
  };
};