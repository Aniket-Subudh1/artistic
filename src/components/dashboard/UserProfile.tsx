'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { User, UserRole } from '@/types/dashboard';
import { Crown, Shield, Mic, Package, MapPin, User as UserIcon, LogOut, Settings, ChevronDown } from 'lucide-react';

interface UserProfileProps {
  user: User;
  onLogout: () => void;
  isCollapsed?: boolean;
}

const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case 'super_admin':
      return <Crown className="w-4 h-4 text-yellow-500" />;
    case 'admin':
      return <Shield className="w-4 h-4 text-blue-500" />;
    case 'artist':
      return <Mic className="w-4 h-4 text-purple-500" />;
    case 'equipment_provider':
      return <Package className="w-4 h-4 text-green-500" />;
    case 'venue_owner':
      return <MapPin className="w-4 h-4 text-orange-500" />;
    default:
      return <UserIcon className="w-4 h-4 text-gray-500" />;
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

export function UserProfile({ user, onLogout, isCollapsed = false }: UserProfileProps) {
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const [showDropdown, setShowDropdown] = useState(false);
  
  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center space-y-2">
        {/* Collapsed Avatar */}
        <div className="relative group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-lg">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          {/* Online status indicator */}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
        </div>

        {/* Role Icon */}
        <div className="p-1">
          {getRoleIcon(user.role)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* User Info */}
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

        {/* User Details */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 truncate">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-sm text-gray-600 truncate">
            {user.email}
          </p>
          <p className="text-xs text-gray-500">
            {locale === 'ar' ? `عضو منذ ${user.memberSince}` : `Member since ${user.memberSince}`}
          </p>
        </div>
      </div>

      {/* Role Badge */}
      <div className={`inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium ${getRoleBadgeColor(user.role)} shadow-sm w-full justify-center`}>
        {getRoleIcon(user.role)}
        <span>{getRoleLabel(user.role, locale)}</span>
      </div>


    </div>
  );
}