'use client';

import { Bell, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function Header({ title, subtitle, actions, className }: HeaderProps) {
  return (
    <header className={cn('h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between', className)}>
      <div className="flex items-center gap-4">
        {title && (
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {actions}
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full" />
        </button>
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center ml-2">
          <span className="text-sm font-medium text-primary-700">JL</span>
        </div>
      </div>
    </header>
  );
}
