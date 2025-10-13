'use client';

import React from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';

interface UserAvatarProps {
  firstName: string;
  lastName: string;
  profilePicture?: string | null;
  avatar?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFallbackIcon?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-20 h-20 text-2xl'
};

const sizeValues = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 80
};

export function UserAvatar({
  firstName,
  lastName,
  profilePicture,
  avatar,
  size = 'md',
  className = '',
  showFallbackIcon = false
}: UserAvatarProps) {
  // Try to get the image URL from either prop
  const imageUrl = (profilePicture && profilePicture.trim()) || (avatar && avatar.trim()) || null;
  
  // Generate initials for fallback
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  
  // Generate a consistent background color based on the user's name
  const getBackgroundColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-orange-500 to-orange-600',
      'from-teal-500 to-teal-600',
      'from-red-500 to-red-600',
      'from-cyan-500 to-cyan-600',
      'from-amber-500 to-amber-600'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  const backgroundGradient = getBackgroundColor(firstName + lastName);

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden shadow-sm ring-2 ring-white flex items-center justify-center ${className}`}>
      {imageUrl ? (
        <>
          <Image
            src={imageUrl}
            alt={`${firstName} ${lastName}`}
            width={sizeValues[size]}
            height={sizeValues[size]}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
          {/* Fallback content that shows when image fails to load */}
          <div className={`hidden w-full h-full bg-gradient-to-br ${backgroundGradient} flex items-center justify-center`}>
            {showFallbackIcon && !initials ? (
              <User className={`text-white ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : 'w-10 h-10'}`} />
            ) : (
              <span className="text-white font-bold">
                {initials}
              </span>
            )}
          </div>
        </>
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${backgroundGradient} flex items-center justify-center`}>
          {showFallbackIcon && !initials ? (
            <User className={`text-white ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : 'w-10 h-10'}`} />
          ) : (
            <span className="text-white font-bold">
              {initials}
            </span>
          )}
        </div>
      )}
    </div>
  );
}