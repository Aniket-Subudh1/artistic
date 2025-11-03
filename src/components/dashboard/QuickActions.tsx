'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'yellow';
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
}

export function QuickActions({ actions, title = 'Quick Actions' }: QuickActionsProps) {
  const colorClasses = {
    green: 'hover:border-green-300 hover:bg-green-50 hover:ring-green-200',
    blue: 'hover:border-blue-300 hover:bg-blue-50 hover:ring-blue-200',
    purple: 'hover:border-purple-300 hover:bg-purple-50 hover:ring-purple-200',
    orange: 'hover:border-orange-300 hover:bg-orange-50 hover:ring-orange-200',
    red: 'hover:border-red-300 hover:bg-red-50 hover:ring-red-200',
    yellow: 'hover:border-yellow-300 hover:bg-yellow-50 hover:ring-yellow-200'
  };

  const iconClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className={`p-4 border border-gray-200 rounded-lg ${colorClasses[action.color]} 
              ring-1 ring-gray-100 hover:ring-2 shadow-sm hover:shadow-md 
              transform hover:-translate-y-0.5 transition-all text-left block`}
            >
              <div className="p-2 rounded-lg bg-gray-50 inline-flex mb-2">
                <Icon className={`w-7 h-7 ${iconClasses[action.color]}`} />
              </div>
              <h4 className="font-medium text-gray-900">{action.title}</h4>
              <p className="text-sm text-gray-500">{action.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}