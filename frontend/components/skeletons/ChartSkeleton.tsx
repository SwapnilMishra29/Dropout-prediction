'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface ChartSkeletonProps {
  title?: boolean;
  height?: number;
}

export default function ChartSkeleton({ title = true, height = 250 }: ChartSkeletonProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      {title && <Skeleton className="h-6 w-32 mb-4" />}
      <div style={{ height: `${height}px` }} className="flex items-center justify-center bg-gray-50 dark:bg-gray-700/30 rounded">
        <div className="w-full h-full flex flex-col justify-between p-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-2 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PieChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="flex items-center justify-center h-64">
        <Skeleton className="w-48 h-48 rounded-full" />
      </div>
    </div>
  );
}
