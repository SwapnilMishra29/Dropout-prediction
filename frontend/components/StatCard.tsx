'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  trend?: {
    value: number;
    positive: boolean;
  };
  suffix?: string;
  prefix?: string;
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue',
  trend,
  suffix = '',
  prefix = ''
}: StatCardProps) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };

  const formattedValue = `${prefix}${value}${suffix}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{formattedValue}</p>
        </div>
        <div className={cn("p-3 rounded-full", colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center gap-1 text-sm">
          {trend.positive ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={trend.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
            {trend.positive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
          <span className="text-gray-500 dark:text-gray-400">vs last month</span>
        </div>
      )}
    </div>
  );
}