'use client';

import { cn } from '@/lib/utils';
import { Button, Badge, EmptyState } from '@/components/ui';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  ChevronRight,
  FileText,
  Eye,
} from 'lucide-react';
import { ISSUE_SEVERITIES } from '@/data/constants';
import type { Issue } from '@/types';

interface QualityIssuePanelProps {
  issues: Issue[];
  onViewIssue: (issue: Issue) => void;
  onResolveIssue: (issueId: string) => void;
}

export function QualityIssuePanel({
  issues,
  onViewIssue,
  onResolveIssue,
}: QualityIssuePanelProps) {
  const qualityIssues = issues.filter((i) => i.type === 'quality');
  const openIssues = qualityIssues.filter((i) => i.status === 'open');
  const resolvedIssues = qualityIssues.filter((i) => i.status === 'resolved');

  const errorCount = openIssues.filter((i) => i.severity === 'error').length;
  const warningCount = openIssues.filter((i) => i.severity === 'warning').length;
  const infoCount = openIssues.filter((i) => i.severity === 'info').length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">Quality Issues</h3>
        <div className="flex items-center gap-3">
          {errorCount > 0 && (
            <div className="flex items-center gap-1.5 text-error-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{errorCount}</span>
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-center gap-1.5 text-warning-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">{warningCount}</span>
            </div>
          )}
          {infoCount > 0 && (
            <div className="flex items-center gap-1.5 text-primary-600">
              <Info className="w-4 h-4" />
              <span className="text-sm font-medium">{infoCount}</span>
            </div>
          )}
          {openIssues.length === 0 && (
            <div className="flex items-center gap-1.5 text-success-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">No open issues</span>
            </div>
          )}
        </div>
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-auto">
        {openIssues.length > 0 ? (
          <div className="p-2 space-y-2">
            {openIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onView={() => onViewIssue(issue)}
                onResolve={() => onResolveIssue(issue.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<CheckCircle className="w-6 h-6 text-success-500" />}
            title="All clear!"
            description="No quality issues detected in your documents."
          />
        )}

        {/* Resolved Issues */}
        {resolvedIssues.length > 0 && (
          <div className="border-t border-gray-100">
            <div className="p-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Resolved ({resolvedIssues.length})
              </p>
              {resolvedIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500"
                >
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span className="line-through">{issue.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface IssueCardProps {
  issue: Issue;
  onView: () => void;
  onResolve: () => void;
}

function IssueCard({ issue, onView, onResolve }: IssueCardProps) {
  const severityConfig = ISSUE_SEVERITIES[issue.severity];

  const SeverityIcon =
    issue.severity === 'error'
      ? AlertCircle
      : issue.severity === 'warning'
      ? AlertTriangle
      : Info;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        className={cn(
          'p-3',
          issue.severity === 'error' && 'bg-error-50',
          issue.severity === 'warning' && 'bg-warning-50',
          issue.severity === 'info' && 'bg-primary-50'
        )}
      >
        <div className="flex items-start gap-3">
          <SeverityIcon
            className={cn(
              'w-5 h-5 mt-0.5',
              issue.severity === 'error' && 'text-error-600',
              issue.severity === 'warning' && 'text-warning-600',
              issue.severity === 'info' && 'text-primary-600'
            )}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-gray-900">{issue.title}</p>
              <Badge
                variant={
                  issue.severity === 'error'
                    ? 'error'
                    : issue.severity === 'warning'
                    ? 'warning'
                    : 'primary'
                }
                size="sm"
              >
                {severityConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">{issue.description}</p>

            {issue.suggestion && (
              <div className="bg-white rounded p-2 border border-gray-200 mb-2">
                <p className="text-xs text-gray-500 mb-0.5">Suggested action:</p>
                <p className="text-sm text-gray-700">{issue.suggestion}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onView}>
                View Document
              </Button>
              <Button variant="ghost" size="sm" onClick={onResolve}>
                Mark as Resolved
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
