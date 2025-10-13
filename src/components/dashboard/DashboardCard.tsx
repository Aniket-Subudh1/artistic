'use client';

import React from 'react';
import { Link } from '@/i18n/routing';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  headerAction?: {
    text: string;
    href: string;
  };
  className?: string;
}

export function DashboardCard({ title, children, headerAction, className = '' }: DashboardCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {headerAction && (
            <Link href={headerAction.href} className="text-green-600 hover:text-green-700 text-sm font-medium">
              {headerAction.text}
            </Link>
          )}
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}