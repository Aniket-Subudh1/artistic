'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCard {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
    icon?: LucideIcon;
  };
  subtitle?: string;
}

interface DashboardStatsGridProps {
  stats: StatCard[];
}

export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  const getChangeColor = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const ChangeIcon = stat.change?.icon;
        
        return (
          <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.iconBgColor} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
            {(stat.change || stat.subtitle) && (
              <div className="mt-4 flex items-center text-sm">
                {stat.change ? (
                  <>
                    {ChangeIcon && <ChangeIcon className={`w-4 h-4 ${getChangeColor(stat.change.type)} mr-1`} />}
                    <span className={getChangeColor(stat.change.type)}>{stat.change.value}</span>
                  </>
                ) : (
                  <span className="text-gray-500">{stat.subtitle}</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}