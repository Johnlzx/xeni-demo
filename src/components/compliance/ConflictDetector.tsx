'use client';

import { cn } from '@/lib/utils';
import { Card, Badge, Button, EmptyState } from '@/components/ui';
import { AlertCircle, ArrowRight, FileText, CheckCircle } from 'lucide-react';
import type { Issue } from '@/types';

interface ConflictDetectorProps {
  issues: Issue[];
  onResolveIssue: (issueId: string) => void;
}

export function ConflictDetector({ issues, onResolveIssue }: ConflictDetectorProps) {
  const logicIssues = issues.filter((i) => i.type === 'logic');
  const openIssues = logicIssues.filter((i) => i.status === 'open');

  if (openIssues.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<CheckCircle className="w-6 h-6 text-success-500" />}
          title="No Conflicts Detected"
          description="All document information is consistent across your case files."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Detected Conflicts</h3>
        <Badge variant="error">{openIssues.length} conflict{openIssues.length > 1 ? 's' : ''}</Badge>
      </div>

      {openIssues.map((issue) => (
        <ConflictCard key={issue.id} issue={issue} onResolve={() => onResolveIssue(issue.id)} />
      ))}
    </div>
  );
}

interface ConflictCardProps {
  issue: Issue;
  onResolve: () => void;
}

function ConflictCard({ issue, onResolve }: ConflictCardProps) {
  const { conflictDetails } = issue;

  return (
    <Card className="border-error-200 bg-error-50/50">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-error-100 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-error-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900">{issue.title}</h4>
            <Badge variant="error" size="sm">
              {issue.severity === 'error' ? 'Critical' : 'Warning'}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-4">{issue.description}</p>

          {/* Conflict Comparison */}
          {conflictDetails && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                Conflict: {conflictDetails.field}
              </p>
              <div className="flex items-center gap-4">
                {/* Source A */}
                <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">{conflictDetails.sourceA}</span>
                  </div>
                  <p className="font-mono text-sm font-medium text-gray-900">
                    "{conflictDetails.valueA}"
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-error-100 flex items-center justify-center">
                    <span className="text-error-600 font-bold text-sm">≠</span>
                  </div>
                </div>

                {/* Source B */}
                <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">{conflictDetails.sourceB}</span>
                  </div>
                  <p className="font-mono text-sm font-medium text-gray-900">
                    "{conflictDetails.valueB}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Suggestion */}
          {issue.suggestion && (
            <div className="bg-primary-50 rounded-lg p-3 mb-4 border border-primary-100">
              <p className="text-xs font-medium text-primary-700 mb-1">Suggested Action</p>
              <p className="text-sm text-primary-800">{issue.suggestion}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              View Documents
            </Button>
            <Button variant="ghost" size="sm" onClick={onResolve}>
              Mark as Resolved
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
