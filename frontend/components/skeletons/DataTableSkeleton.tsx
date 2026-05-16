'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface DataTableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function DataTableSkeleton({ rows = 5, columns = 4 }: DataTableSkeletonProps) {
  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              {[...Array(columns)].map((_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(rows)].map((_, rowIdx) => (
              <tr key={rowIdx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                {[...Array(columns)].map((_, colIdx) => (
                  <td key={colIdx} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
