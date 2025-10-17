'use client';

import React from 'react';

interface ButtonSpinnerProps {
  size?: 'sm' | 'md';
  className?: string;
}

export function ButtonSpinner({ size = 'sm', className = '' }: ButtonSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin ${className}`}>
      <div className="h-full w-full rounded-full border-2 border-white border-t-transparent"></div>
    </div>
  );
}