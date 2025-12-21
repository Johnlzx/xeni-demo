import { cn } from '@/lib/utils';
import { Card } from '@/components/ui';
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import type { ComplianceReport } from '@/types';

interface ComplianceSummaryProps {
  report: ComplianceReport;
}

export function ComplianceSummary({ report }: ComplianceSummaryProps) {
  const { summary, overallStatus } = report;
  const total = summary.passed + summary.failed + summary.warnings + summary.pending;

  const statusConfig = {
    approved: {
      label: 'All Checks Passed',
      color: 'text-success-600',
      bgColor: 'bg-success-50',
      icon: CheckCircle,
    },
    needs_review: {
      label: 'Needs Review',
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
      icon: AlertTriangle,
    },
    rejected: {
      label: 'Issues Found',
      color: 'text-error-600',
      bgColor: 'bg-error-50',
      icon: XCircle,
    },
  };

  const config = statusConfig[overallStatus];
  const StatusIcon = config.icon;

  return (
    <Card className={cn('border-2', config.bgColor)}>
      <div className="flex items-center gap-4">
        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', config.bgColor)}>
          <StatusIcon className={cn('w-6 h-6', config.color)} />
        </div>
        <div className="flex-1">
          <h3 className={cn('font-semibold', config.color)}>{config.label}</h3>
          <p className="text-sm text-gray-500">
            {summary.passed} passed, {summary.failed} failed, {summary.warnings} warnings, {summary.pending} pending
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden flex">
        {summary.passed > 0 && (
          <div
            className="h-full bg-success-500"
            style={{ width: `${(summary.passed / total) * 100}%` }}
          />
        )}
        {summary.warnings > 0 && (
          <div
            className="h-full bg-warning-500"
            style={{ width: `${(summary.warnings / total) * 100}%` }}
          />
        )}
        {summary.failed > 0 && (
          <div
            className="h-full bg-error-500"
            style={{ width: `${(summary.failed / total) * 100}%` }}
          />
        )}
        {summary.pending > 0 && (
          <div
            className="h-full bg-gray-400"
            style={{ width: `${(summary.pending / total) * 100}%` }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success-500" />
          <span className="text-gray-600">Passed ({summary.passed})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-warning-500" />
          <span className="text-gray-600">Warnings ({summary.warnings})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-error-500" />
          <span className="text-gray-600">Failed ({summary.failed})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          <span className="text-gray-600">Pending ({summary.pending})</span>
        </div>
      </div>
    </Card>
  );
}
