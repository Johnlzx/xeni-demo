'use client';

import { FilePlus, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionBarProps {
  onAddReference: () => void;
  onStartAutoFill: () => void;
  className?: string;
}

export function ActionBar({
  onAddReference,
  onStartAutoFill,
  className,
}: ActionBarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-3 py-6',
        className
      )}
    >
      {/* Add Reference Button */}
      <button
        onClick={onAddReference}
        className={cn(
          'inline-flex items-center gap-2.5 px-5 py-2.5',
          'bg-white border border-gray-200 rounded-xl',
          'text-sm font-medium text-gray-700',
          'hover:bg-gray-50 hover:border-gray-300',
          'active:scale-[0.98]',
          'transition-all duration-150',
          'shadow-sm'
        )}
      >
        <FilePlus className="w-4 h-4" />
        <span>Add reference</span>
      </button>

      {/* Start Auto-fill Button */}
      <button
        onClick={onStartAutoFill}
        className={cn(
          'inline-flex items-center gap-2.5 px-5 py-2.5',
          'bg-[#0E4369] rounded-xl',
          'text-sm font-medium text-white',
          'hover:bg-[#0B3654]',
          'active:scale-[0.98]',
          'transition-all duration-150',
          'shadow-md shadow-[#0E4369]/20'
        )}
      >
        <Play className="w-4 h-4 fill-current" />
        <span>Start auto-fill</span>
      </button>
    </div>
  );
}
