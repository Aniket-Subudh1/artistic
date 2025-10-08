'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { User, UserRole } from '@/types/dashboard';
import { Crown, Shield, Mic, Package, MapPin, User as UserIcon } from 'lucide-react';

interface UserProfileProps {
  user: User;
}

const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case 'super_admin':
      return <Crown className="w-5 h-5 text-yellow-500" />;
    case 'admin':
      return <Shield className="w-5 h-5 text-blue-500" />;
    case 'artist':
      return <Mic className="w-5 h-5 text-purple-500" />;
    case 'equipment_provider':
      return <Package className="w-5 h-5 text-green-500" />;
    case 'venue_owner':
      return <MapPin className="w-5 h-5 text-orange-500" />;
    default:
      return <UserIcon className="w-5 h-5 text-gray-500" />;
  }
};

const getRoleLabel = (role: UserRole, locale: string) => {
  const labels = {
    en: {
      super_admin: 'Super Admin',
      admin: 'Admin',
      artist: 'Artist',
      equipment_provider: 'Equipment Provider',
      venue_owner: 'Venue Owner',
      user: 'User'
    },
    ar: {
      super_admin: 'مدير عام',
      admin: 'مدير',
      artist: 'فنان',
      equipment_provider: 'مزود معدات',
      venue_owner: 'مالك مكان',
      user: 'مستخدم'
    }
  };
  
  return labels[locale as 'en' | 'ar']?.[role] || labels.en[role];
};

const getRoleBadgeColor = (role: UserRole) => {
  switch (role) {
    case 'super_admin':
      return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
    case 'admin':
      return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
    case 'artist':
      return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
    case 'equipment_provider':
      return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
    case 'venue_owner':
      return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
    default:
      return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
  }
};

export function UserProfile({ user }: UserProfileProps) {
  const locale = useLocale();
  const t = useTranslations('dashboard');
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        {/* Avatar */}
        <div className="relative group">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          {/* Online status indicator */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
            <h2 className="text-xl font-bold text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </h2>
            
            {/* Role Badge */}
            <div className={`inline-flex items-center space-x-1 rtl:space-x-reverse px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)} shadow-sm`}>
              {getRoleIcon(user.role)}
              <span>{getRoleLabel(user.role, locale)}</span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-1 truncate">
            {user.email}
          </p>
          
          <p className="text-gray-500 text-xs">
            {locale === 'ar' ? `عضو منذ ${user.memberSince}` : `Member since ${user.memberSince}`}
          </p>
        </div>

        {/* Action Menu */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}