'use client';

import React from 'react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { User } from '@/types/dashboard';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  user: User;
  userBadgeColor?: string;
  userBadgeText?: string;
}

export function DashboardHeader({ 
  title, 
  subtitle, 
  user, 
  userBadgeColor = 'bg-green-100',
  userBadgeText 
}: DashboardHeaderProps) {
  const getBadgeTextColor = (bgColor: string) => {
    if (bgColor.includes('green')) return 'text-green-800';
    if (bgColor.includes('blue')) return 'text-blue-800';
    if (bgColor.includes('purple')) return 'text-purple-800';
    if (bgColor.includes('orange')) return 'text-orange-800';
    if (bgColor.includes('red')) return 'text-red-800';
    if (bgColor.includes('yellow')) return 'text-yellow-800';
    return 'text-gray-800';
  };

  const getBadgeRingColor = (bgColor: string) => {
    if (bgColor.includes('green')) return 'bg-green-600';
    if (bgColor.includes('blue')) return 'bg-blue-600';
    if (bgColor.includes('purple')) return 'bg-purple-600';
    if (bgColor.includes('orange')) return 'bg-orange-600';
    if (bgColor.includes('red')) return 'bg-red-600';
    if (bgColor.includes('yellow')) return 'bg-yellow-600';
    return 'bg-gray-600';
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>
      
      {/* User Badge */}
      <div className={`flex items-center space-x-2 ${userBadgeColor} px-4 py-2 rounded-full`}>
        <UserAvatar
          firstName={user.firstName}
          lastName={user.lastName}
          profilePicture={(user as any).profilePicture}
          avatar={user.avatar}
          size="sm"
          className="ring-0"
        />
        <span className={`font-medium ${getBadgeTextColor(userBadgeColor)}`}>
          {userBadgeText || user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
      </div>
    </div>
  );
}