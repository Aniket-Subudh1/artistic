'use client';

import { useState, useEffect } from 'react';
import { User, UserRole } from '@/types/dashboard';

const mockUsers: Record<string, User> = {
  'admin@artistic.com': {
    id: '1',
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'admin@artistic.com',
    role: 'admin',
    avatar: '/avatars/admin.jpg',
    memberSince: '2020',
    isActive: true,
    permissions: ['manage_users', 'manage_content', 'view_analytics']
  },
  'superadmin@artistic.com': {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'superadmin@artistic.com',
    role: 'super_admin',
    avatar: '/avatars/superadmin.jpg',
    memberSince: '2019',
    isActive: true,
    permissions: ['manage_all_users', 'manage_all_content', 'view_analytics', 'manage_system_settings']
  },
  'artist@artistic.com': {
    id: '3',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'artist@artistic.com',
    role: 'artist',
    avatar: '/avatars/artist.jpg',
    memberSince: '2021',
    isActive: true,
    permissions: ['manage_own_profile', 'view_own_bookings', 'manage_portfolio']
  },
  'equipment@artistic.com': {
    id: '4',
    firstName: 'John',
    lastName: 'Smith',
    email: 'equipment@artistic.com',
    role: 'equipment_provider',
    avatar: '/avatars/equipment.jpg',
    memberSince: '2020',
    isActive: true,
    permissions: ['manage_own_equipment', 'view_equipment_bookings']
  },
  'venue@artistic.com': {
    id: '5',
    firstName: 'Lisa',
    lastName: 'Brown',
    email: 'venue@artistic.com',
    role: 'venue_owner',
    avatar: '/avatars/venue.jpg',
    memberSince: '2021',
    isActive: true,
    permissions: ['manage_own_venues', 'view_venue_bookings']
  },
  'user@artistic.com': {
    id: '6',
    firstName: 'Michael',
    lastName: 'Davis',
    email: 'user@artistic.com',
    role: 'user',
    avatar: '/avatars/user.jpg',
    memberSince: '2022',
    isActive: true,
    permissions: ['book_events', 'book_artists', 'book_equipment']
  },
};

const DEFAULT_USER: User = mockUsers['user@artistic.com']; 

export const useAuthLogic = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('authToken');
      
      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          setUser(DEFAULT_USER);
          localStorage.setItem('user', JSON.stringify(DEFAULT_USER));
          localStorage.setItem('authToken', 'mock-jwt-token');
        }
      } else {
        setUser(DEFAULT_USER);
        localStorage.setItem('user', JSON.stringify(DEFAULT_USER));
        localStorage.setItem('authToken', 'mock-jwt-token');
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, _password: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = mockUsers[email.toLowerCase()];
      if (!foundUser) {
        throw new Error('User not found');
      }

      setUser(foundUser);
      localStorage.setItem('authToken', 'mock-jwt-token');
      localStorage.setItem('user', JSON.stringify(foundUser));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const setUserDirectly = (userEmail: string) => {
    const foundUser = mockUsers[userEmail];
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      localStorage.setItem('authToken', 'mock-jwt-token');
    } else {
      console.error('User not found:', userEmail);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    setUserDirectly,
  };
};