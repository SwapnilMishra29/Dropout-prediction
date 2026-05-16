'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32 mt-2" />
        </div>
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
      
      <div className="mt-4 flex items-center gap-1">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

export function StatCardSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}
