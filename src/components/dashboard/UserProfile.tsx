'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { User, UserRole } from '@/types/dashboard';
import { Crown, Shield, Mic, Package, MapPin, User as UserIcon, LogOut, Settings, ChevronDown, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';

interface UserProfileProps {
  user: User;
  onLogout: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onEditProfilePicture?: () => void;
}

const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case 'super_admin':
      return <Crown className="w-4 h-4 text-white" />;
    case 'admin':
      return <Shield className="w-4 h-4 text-white" />;
    case 'artist':
      return <Mic className="w-4 h-4 text-white" />;
    case 'equipment_provider':
      return <Package className="w-4 h-4 text-white" />;
    case 'venue_owner':
      return <MapPin className="w-4 h-4 text-white" />;
    default:
      return <UserIcon className="w-4 h-4 text-white" />;
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

export function UserProfile({ user, onLogout, isCollapsed = false, onToggleCollapse, onEditProfilePicture }: UserProfileProps) {
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const userImage = (user.avatar && user.avatar.trim()) || ((user as any).profilePicture && (user as any).profilePicture.trim()) || null;
  
  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="relative">
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-200 flex items-center justify-center overflow-hidden shadow-sm">
            {userImage ? (
              <Image
                src={userImage}
                alt={`${user.firstName} ${user.lastName}`}
                width={56}
                height={56}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center ${userImage ? 'hidden' : ''}`}>
              <span className="text-white font-semibold text-base">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            </div>
          </div>
          
        </div>
        
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <ChevronRight className="w-3 h-3 text-slate-500" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1" />
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-0.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-3 h-3 text-slate-500" />
          </button>
        )}
      </div>
      
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <div className="relative">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-200 flex items-center justify-center overflow-hidden shadow-lg ring-2 ring-white">
            {userImage ? (
              <Image
                src={userImage}
                alt={`${user.firstName} ${user.lastName}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center ${userImage ? 'hidden' : ''}`}>
              <span className="text-white font-bold text-2xl">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            </div>
          </div>
          
          {onEditProfilePicture && (
            <button
              onClick={onEditProfilePicture}
              className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors border-2 border-white"
              title="Edit profile picture"
            >
              <Edit3 className="w-3 h-3 text-white" />
            </button>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-slate-900 truncate">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-xs text-slate-600 truncate">
            {user.email}
          </p>
        </div>
      </div>

      <div className={`inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg text-xs font-semibold ${getRoleBadgeColor(user.role)} shadow-sm w-full justify-center`}>
        {getRoleIcon(user.role)}
        <span>{getRoleLabel(user.role, locale)}</span>
      </div>
    </div>
  );
}