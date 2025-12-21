'use client';

import { User, Scale, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ResponsibleParty = 'applicant' | 'lawyer' | 'system' | null;

interface ResponsibilityBadgeProps {
  party: ResponsibleParty;
  blockingReason?: string | null;
  className?: string;
}

const PARTY_CONFIG: Record<
  NonNullable<ResponsibleParty>,
  { icon: typeof User; label: string; colors: string }
> = {
  applicant: {
    icon: User,
    label: 'Awaiting Applicant',
    colors: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  lawyer: {
    icon: Scale,
    label: 'Awaiting Lawyer Review',
    colors: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  system: {
    icon: Clock,
    label: 'Processing',
    colors: 'bg-gray-50 text-gray-600 border-gray-200',
  },
};

export function ResponsibilityBadge({
  party,
  blockingReason,
  className,
}: ResponsibilityBadgeProps) {
  if (!party) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200',
          className
        )}
      >
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm font-medium">Ready to Progress</span>
      </div>
    );
  }

  const config = PARTY_CONFIG[party];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border',
        config.colors,
        className
      )}
    >
      <Icon className="w-4 h-4" />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{config.label}</span>
        {blockingReason && (
          <span className="text-xs opacity-80">{blockingReason}</span>
        )}
      </div>
    </div>
  );
}

// Compact inline version
export function ResponsibilityBadgeCompact({
  party,
  className,
}: {
  party: ResponsibleParty;
  className?: string;
}) {
  if (!party) return null;

  const config = PARTY_CONFIG[party];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border',
        config.colors,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {party === 'applicant' ? 'Applicant' : party === 'lawyer' ? 'Lawyer' : 'System'}
    </span>
  );
}
