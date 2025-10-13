'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { User, UserRole } from '@/types/dashboard';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Crown, Shield, Mic, Package, MapPin, User as UserIcon, LogOut, Settings, ChevronDown, ChevronLeft, ChevronRight, Edit3, Calendar, Mail } from 'lucide-react';
import Image from 'next/image';
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
      return 'bg-[#391C71] text-white';
    case 'admin':
      return 'bg-[#391C71] text-white';
    case 'artist':
      return 'bg-[#391C71] text-white';
    case 'equipment_provider':
      return 'bg-[#391C71] text-white';
    case 'venue_owner':
      return 'bg-[#391C71] text-white';
    default:
      return 'bg-[#391C71] text-white';
  }
};

const getMemberSinceText = (user: User, locale: string) => {
  let year = new Date().getFullYear();
  
  if (user.memberSince) {
    const memberSinceDate = new Date(user.memberSince);
    if (!isNaN(memberSinceDate.getTime())) {
      year = memberSinceDate.getFullYear();
    }
  }
  else if ((user as any).createdAt) {
    const createdAtDate = new Date((user as any).createdAt);
    if (!isNaN(createdAtDate.getTime())) {
      year = createdAtDate.getFullYear();
    }
  }
  
  return locale === 'ar' ? `عضو منذ ${year}` : `Member since ${year}`;
};

export function UserProfile({ user, onLogout, isCollapsed = false, onToggleCollapse, onEditProfilePicture }: UserProfileProps) {
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const [showDropdown, setShowDropdown] = useState(false);
  
  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center space-y-2 p-1 bg-purple-50 overflow-hidden">

        <div className="relative group w-full flex justify-center">
          
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-white/50 to-pink-50/80 rounded-xl blur-sm transition-all duration-300 group-hover:blur-md"></div>
          <div className="relative bg-white/60 backdrop-blur-md border border-white/20 rounded-xl p-2 shadow-lg hover:shadow-xl transition-all duration-300 w-fit">
            <UserAvatar
              firstName={user.firstName}
              lastName={user.lastName}
              profilePicture={(user as any).profilePicture}
              avatar={user.avatar}
              size="md"
              className="shadow-md ring-2 ring-white/30"
            />
            {onEditProfilePicture && (
              <button
                onClick={onEditProfilePicture}
                className="absolute -bottom-0.5 -right-0 w-5 h-5 bg-[#391C71] rounded-full flex items-center justify-center shadow-md transition-all duration-200 border border-white transform hover:scale-110"
                title="Edit profile picture"
              >
                <Edit3 className="w-2 h-2 text-white" />
              </button>
            )}
          </div>
        </div>
        
        {/* Role Badge */}
        <div className={`inline-flex items-center justify-center px-2 py-1 rounded-lg text-xs font-semibold ${getRoleBadgeColor(user.role)} shadow-md w-fit`}>
          {getRoleIcon(user.role)}
        </div>
        
        {/* Toggle Button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-white/10 backdrop-blur-lg transition-all duration-200 border border-white/20"
          >
            <ChevronRight className="w-3 h-3 text-slate-600" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-1">
      {/* Toggle Button */}
      <div className="flex items-center justify-end">
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-xl hover:bg-gray-100/20 backdrop-blur-sm transition-all duration-200 border border-white"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
      
      <div className="relative group">
        <div className="absolute inset-0 -z-10 opacity-90">
          <Image
            src="/login-bg.svg"
            alt="Background"
            fill
            className="object-cover rotate-270 -ml-12 -mt-5 scale-150"
            style={{ transformOrigin: 'center' }}
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-white/50 to-pink-50/80 rounded-2xl blur-md transition-all duration-500 group-hover:blur-lg opacity-60"></div>
        
        <div className="relative bg-white/60 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-4 hover:shadow-2xl transition-all duration-500 hover:bg-white/70">
          <div>
            <div className="flex items-start space-x-3 rtl:space-x-reverse mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-[#391C71]/25 to-purple-600/20 rounded-xl blur-sm"></div>
                <div className="relative">
                  <UserAvatar
                    firstName={user.firstName}
                    lastName={user.lastName}
                    profilePicture={(user as any).profilePicture}
                    avatar={user.avatar}
                    size="lg"
                    className="shadow-lg ring-2 ring-white/40 hover:ring-white/60 transition-all duration-300"
                  />
                  
                  {onEditProfilePicture && (
                    <button
                      onClick={onEditProfilePicture}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#391C71] to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 border-2 border-white transform hover:scale-110 hover:rotate-3"
                      title="Edit profile picture"
                    >
                      <Edit3 className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </h2>
                <div className="flex items-center space-x-1.5 rtl:space-x-reverse mt-1">
                  <Mail className="w-3 h-3 text-gray-600" />
                  <p className="text-xs text-gray-700 truncate">
                    {user.email}
                  </p>
                </div>
                <div className="flex items-center space-x-1.5 rtl:space-x-reverse mt-1">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  <p className="text-xs text-gray-600">
                    {getMemberSinceText(user, locale)}
                  </p>
                </div>
              </div>
            </div>

          {/* Role Badge */}
          <div className={`inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-xl text-xs font-bold ${getRoleBadgeColor(user.role)} shadow-md hover:shadow-lg transition-all duration-300 w-full justify-center transform hover:scale-105`}>
            {getRoleIcon(user.role)}
            <span>{getRoleLabel(user.role, locale)}</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
} 