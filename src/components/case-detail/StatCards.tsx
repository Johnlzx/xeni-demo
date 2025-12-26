'use client';

import { cn } from '@/lib/utils';

interface StatCardsProps {
  completeness: number;
  referenceCount: number;
  missingInfoCount: number;
  className?: string;
}

export function StatCards({
  completeness,
  referenceCount,
  missingInfoCount,
  className,
}: StatCardsProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-4', className)}>
      {/* Completeness Card */}
      <div className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100/80">
        <div className="relative w-11 h-11 flex-shrink-0">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke="#E8F4FC"
              strokeWidth="4"
            />
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke="#60B5E8"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${(completeness / 100) * 113.1} 113.1`}
              className="transition-all duration-700 ease-out"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-semibold text-gray-900 tracking-tight">{completeness}%</p>
          <p className="text-sm text-gray-500 font-medium">Completeness</p>
        </div>
      </div>

      {/* Reference Card */}
      <div className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100/80">
        <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-amber-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-semibold text-gray-900 tracking-tight">{referenceCount}</p>
          <p className="text-sm text-gray-500 font-medium">Reference</p>
        </div>
      </div>

      {/* Missing Information Card */}
      <div className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100/80">
        <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-slate-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-semibold text-gray-900 tracking-tight">{missingInfoCount}</p>
          <p className="text-sm text-gray-500 font-medium">Missing information</p>
        </div>
      </div>
    </div>
  );
}
