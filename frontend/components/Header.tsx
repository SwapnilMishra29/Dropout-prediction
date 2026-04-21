'use client';

import { Bell, Search, Settings } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  notificationCount?: number;
}

// Custom button component
function IconButton({ onClick, children, className }: { onClick?: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
        className
      )}
    >
      {children}
    </button>
  );
}

export default function Header({ 
  title = 'Dashboard', 
  showSearch = true, 
  onSearch,
  notificationCount = 0 
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between gap-2 md:gap-4 px-4 md:px-6 py-3 md:py-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
          {title}
        </h1>

        {showSearch && (
          <div className="hidden md:flex flex-1 max-w-sm ml-auto mr-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <IconButton>
            <Bell className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </IconButton>
          <IconButton>
            <Settings className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
          </IconButton>
        </div>
      </div>
    </header>
  );
}

// Named export for backward compatibility
export { Header };