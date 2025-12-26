'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { Issue } from '@/types';

interface CaseDashboardProps {
  issues: Issue[];
  daysUntilDeadline?: number;
  clientName?: string;
  clientAvgResponseDays?: number;
  lastClientActivity?: string;
  className?: string;
}

/**
 * Health Score Calculation
 * - Starts at 100
 * - Critical issues: -15 each
 * - Warning issues: -8 each
 * - Info issues: -3 each
 * - Time pressure: -10 if <7 days, -20 if <3 days
 * - Client delay: -5 if >3 days avg response
 */
function calculateHealthScore(
  issues: Issue[],
  daysUntilDeadline: number,
  clientAvgResponseDays: number
): number {
  let score = 100;

  // Issue penalties
  const openIssues = issues.filter(i => i.status === 'open');
  openIssues.forEach(issue => {
    if (issue.severity === 'error') score -= 15;
    else if (issue.severity === 'warning') score -= 8;
    else score -= 3;
  });

  // Time pressure
  if (daysUntilDeadline < 3) score -= 20;
  else if (daysUntilDeadline < 7) score -= 10;

  // Client responsiveness
  if (clientAvgResponseDays > 5) score -= 10;
  else if (clientAvgResponseDays > 3) score -= 5;

  return Math.max(0, Math.min(100, score));
}

function getHealthConfig(score: number) {
  if (score >= 80) {
    return {
      label: 'Healthy',
      color: '#059669', // emerald-600
      bgGradient: 'from-emerald-500 to-emerald-600',
      ringColor: 'ring-emerald-100',
      textColor: 'text-emerald-600',
    };
  } else if (score >= 60) {
    return {
      label: 'Attention',
      color: '#D97706', // amber-600
      bgGradient: 'from-amber-500 to-amber-600',
      ringColor: 'ring-amber-100',
      textColor: 'text-amber-600',
    };
  } else {
    return {
      label: 'Critical',
      color: '#DC2626', // rose-600
      bgGradient: 'from-rose-500 to-rose-600',
      ringColor: 'ring-rose-100',
      textColor: 'text-rose-600',
    };
  }
}

/**
 * Circular Health Gauge
 * SVG-based arc indicator
 */
function HealthGauge({ score }: { score: number }) {
  const config = getHealthConfig(score);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-28 h-28">
      {/* Background ring */}
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={config.color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-3xl font-bold tabular-nums tracking-tight"
          style={{ color: config.color }}
        >
          {score}
        </span>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
          {config.label}
        </span>
      </div>
    </div>
  );
}

/**
 * Compact stat block with label on top
 */
function StatBlock({
  value,
  label,
  sublabel,
  valueColor = 'text-slate-900',
  size = 'normal',
}: {
  value: string | number;
  label: string;
  sublabel?: string;
  valueColor?: string;
  size?: 'small' | 'normal';
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </span>
      <span
        className={cn(
          'font-semibold tabular-nums leading-none',
          size === 'small' ? 'text-lg' : 'text-2xl',
          valueColor
        )}
      >
        {value}
      </span>
      {sublabel && (
        <span className="text-[10px] text-slate-400 mt-1">{sublabel}</span>
      )}
    </div>
  );
}

/**
 * Issue breakdown bar - horizontal stacked
 */
function IssueBreakdownBar({
  quality,
  compliance,
  resolved,
}: {
  quality: number;
  compliance: number;
  resolved: number;
}) {
  const total = quality + compliance + resolved;
  if (total === 0) return null;

  const qualityPct = (quality / total) * 100;
  const compliancePct = (compliance / total) * 100;
  const resolvedPct = (resolved / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <span className="uppercase tracking-wider">Issue Composition</span>
        <span className="tabular-nums">{total} total</span>
      </div>

      {/* Stacked bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
        {quality > 0 && (
          <div
            className="h-full bg-slate-400 transition-all duration-500"
            style={{ width: `${qualityPct}%` }}
          />
        )}
        {compliance > 0 && (
          <div
            className="h-full bg-slate-700 transition-all duration-500"
            style={{ width: `${compliancePct}%` }}
          />
        )}
        {resolved > 0 && (
          <div
            className="h-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${resolvedPct}%` }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-slate-400" />
          <span className="text-slate-600">QC ({quality})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-slate-700" />
          <span className="text-slate-600">Compliance ({compliance})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-emerald-400" />
          <span className="text-slate-600">Resolved ({resolved})</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Ball in Court indicator
 */
function BallInCourt({
  holder,
  waitingDays,
}: {
  holder: 'lawyer' | 'client' | 'government';
  waitingDays?: number;
}) {
  const config = {
    lawyer: {
      label: 'Your Action',
      sublabel: 'Review required',
      dotColor: 'bg-slate-900',
    },
    client: {
      label: 'Waiting for Client',
      sublabel: waitingDays ? `${waitingDays}d pending` : 'Pending response',
      dotColor: 'bg-amber-500',
    },
    government: {
      label: 'With Authority',
      sublabel: 'Awaiting decision',
      dotColor: 'bg-sky-500',
    },
  };

  const c = config[holder];

  return (
    <div className="flex items-center gap-3">
      <div className={cn('w-2.5 h-2.5 rounded-full', c.dotColor)} />
      <div>
        <p className="text-sm font-medium text-slate-900">{c.label}</p>
        <p className="text-[10px] text-slate-400">{c.sublabel}</p>
      </div>
    </div>
  );
}

/**
 * Main Dashboard Component
 * Swiss precision aesthetic - typography-forward, monochrome with health accents
 */
export function CaseDashboard({
  issues,
  daysUntilDeadline = 14,
  clientName = 'James Chen',
  clientAvgResponseDays = 4.5,
  lastClientActivity = '2 days ago',
  className,
}: CaseDashboardProps) {
  // Calculate stats
  const stats = useMemo(() => {
    const quality = issues.filter(i => i.type === 'quality' && i.status === 'open').length;
    const compliance = issues.filter(i => i.type === 'logic' && i.status === 'open').length;
    const resolved = issues.filter(i => i.status === 'resolved').length;
    const critical = issues.filter(i => i.severity === 'error' && i.status === 'open').length;

    return { quality, compliance, resolved, critical };
  }, [issues]);

  const healthScore = useMemo(() => {
    return calculateHealthScore(issues, daysUntilDeadline, clientAvgResponseDays);
  }, [issues, daysUntilDeadline, clientAvgResponseDays]);

  const healthConfig = getHealthConfig(healthScore);

  // Determine ball holder
  const ballHolder = useMemo(() => {
    if (stats.critical > 0 || stats.compliance > 0) return 'lawyer';
    if (stats.quality > 0) return 'client';
    return 'government';
  }, [stats]);

  const openIssues = stats.quality + stats.compliance;

  return (
    <div className={cn('bg-white border border-slate-200 rounded-2xl overflow-hidden', className)}>
      {/* Main content grid */}
      <div className="p-6">
        <div className="flex items-start gap-8">
          {/* Left: Health Gauge */}
          <div className="flex-shrink-0">
            <HealthGauge score={healthScore} />
          </div>

          {/* Center: Core Metrics */}
          <div className="flex-1 grid grid-cols-4 gap-6">
            {/* Critical Issues */}
            <StatBlock
              label="Critical"
              value={stats.critical}
              valueColor={stats.critical > 0 ? 'text-rose-600' : 'text-slate-300'}
            />

            {/* Open Issues */}
            <StatBlock
              label="Open Issues"
              value={openIssues}
              valueColor={openIssues > 0 ? 'text-slate-900' : 'text-slate-300'}
            />

            {/* Days to Deadline */}
            <StatBlock
              label="Deadline"
              value={`${daysUntilDeadline}d`}
              valueColor={
                daysUntilDeadline < 7
                  ? 'text-amber-600'
                  : daysUntilDeadline < 3
                  ? 'text-rose-600'
                  : 'text-slate-900'
              }
              sublabel="to submission"
            />

            {/* Client Response */}
            <StatBlock
              label="Avg Response"
              value={`${clientAvgResponseDays}d`}
              valueColor={clientAvgResponseDays > 3 ? 'text-amber-600' : 'text-slate-900'}
              sublabel="client"
            />
          </div>

          {/* Right: Ball in Court */}
          <div className="flex-shrink-0 pl-6 border-l border-slate-100">
            <BallInCourt
              holder={ballHolder}
              waitingDays={ballHolder === 'client' ? 3 : undefined}
            />
          </div>
        </div>
      </div>

      {/* Bottom: Issue Breakdown Bar */}
      <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
        <IssueBreakdownBar
          quality={stats.quality}
          compliance={stats.compliance}
          resolved={stats.resolved}
        />
      </div>
    </div>
  );
}
