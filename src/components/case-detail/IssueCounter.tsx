'use client';

import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IssueCounterProps {
  qualityIssues: number;
  logicIssues: number;
  onQualityClick?: () => void;
  onLogicClick?: () => void;
  className?: string;
}

export function IssueCounter({
  qualityIssues,
  logicIssues,
  onQualityClick,
  onLogicClick,
  className,
}: IssueCounterProps) {
  const totalIssues = qualityIssues + logicIssues;

  if (totalIssues === 0) {
    return (
      <div className={cn('flex items-center gap-2 text-emerald-600', className)}>
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100">
          <Info className="w-3.5 h-3.5" />
        </div>
        <span className="text-sm font-medium">No issues</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {qualityIssues > 0 && (
        <button
          onClick={onQualityClick}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all duration-200 hover:shadow-sm"
        >
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white">
            <AlertTriangle className="w-3 h-3" />
          </div>
          <span className="text-sm font-semibold text-amber-700">
            {qualityIssues}
          </span>
          <span className="text-xs text-amber-600 group-hover:text-amber-700 transition-colors">
            Quality
          </span>
        </button>
      )}

      {logicIssues > 0 && (
        <button
          onClick={onLogicClick}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all duration-200 hover:shadow-sm"
        >
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white">
            <AlertCircle className="w-3 h-3" />
          </div>
          <span className="text-sm font-semibold text-rose-700">
            {logicIssues}
          </span>
          <span className="text-xs text-rose-600 group-hover:text-rose-700 transition-colors">
            Conflicts
          </span>
        </button>
      )}
    </div>
  );
}

// Inline badge version for compact displays
export function IssueCounterBadge({
  qualityIssues,
  logicIssues,
  onClick,
  className,
}: {
  qualityIssues: number;
  logicIssues: number;
  onClick?: () => void;
  className?: string;
}) {
  const totalIssues = qualityIssues + logicIssues;

  if (totalIssues === 0) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200',
        totalIssues > 0 && 'bg-rose-100 text-rose-700 hover:bg-rose-200',
        className
      )}
    >
      <AlertCircle className="w-3.5 h-3.5" />
      {totalIssues} issue{totalIssues !== 1 ? 's' : ''}
    </button>
  );
}
