'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkspaceStatus } from './hooks/useWorkspaceState';
import type { EvidenceSlotTemplate } from '@/types';

interface WorkspaceHeaderProps {
  section: EvidenceSlotTemplate | null;
  status: WorkspaceStatus;
  issueCounts: {
    critical: number;
    warning: number;
    total: number;
  };
  onIssueCounterClick: () => void;
}

const STATUS_CONFIG: Record<WorkspaceStatus, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  colors: string;
  iconColor: string;
}> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    colors: 'bg-slate-100 text-slate-600 border-slate-200',
    iconColor: 'text-slate-400',
  },
  processing: {
    label: 'Processing',
    icon: Loader2,
    colors: 'bg-blue-50 text-blue-700 border-blue-200',
    iconColor: 'text-blue-500',
  },
  action_required: {
    label: 'Action Required',
    icon: AlertTriangle,
    colors: 'bg-amber-50 text-amber-700 border-amber-200',
    iconColor: 'text-amber-500',
  },
  verified: {
    label: 'Verified',
    icon: CheckCircle2,
    colors: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconColor: 'text-emerald-500',
  },
};

export function WorkspaceHeader({
  section,
  status,
  issueCounts,
  onIssueCounterClick,
}: WorkspaceHeaderProps) {
  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;

  const hasIssues = issueCounts.total > 0;
  const hasCritical = issueCounts.critical > 0;

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
      {/* Main header row */}
      <div className="px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          {/* Title and description */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              {section?.name || 'Select a section'}
            </h1>
            {section?.description && (
              <p className="mt-1 text-sm text-slate-500 line-clamp-1">
                {section.description}
              </p>
            )}
          </div>

          {/* Status badge */}
          <motion.div
            layout
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium',
              statusConfig.colors
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <StatusIcon
              className={cn(
                'w-4 h-4',
                statusConfig.iconColor,
                status === 'processing' && 'animate-spin'
              )}
            />
            <span>{statusConfig.label}</span>
          </motion.div>
        </div>

        {/* Issue counter row */}
        {hasIssues && (
          <motion.div
            className="mt-3 pt-3 border-t border-slate-100"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.button
              onClick={onIssueCounterClick}
              className={cn(
                'group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all',
                hasCritical
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {issueCounts.critical > 0 && (
                  <>{issueCounts.critical} Critical</>
                )}
                {issueCounts.critical > 0 && issueCounts.warning > 0 && ', '}
                {issueCounts.warning > 0 && (
                  <>{issueCounts.warning} Warning</>
                )}
                {issueCounts.critical === 0 && issueCounts.warning === 0 && (
                  <>{issueCounts.total} Issue{issueCounts.total !== 1 ? 's' : ''}</>
                )}
              </span>
              <motion.span
                className="text-xs opacity-60 group-hover:opacity-100 transition-opacity"
                initial={{ x: -5, opacity: 0 }}
                animate={{ x: 0, opacity: 0.6 }}
              >
                View all →
              </motion.span>
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
