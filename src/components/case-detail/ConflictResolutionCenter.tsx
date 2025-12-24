'use client';

import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  MessageSquare,
  FileText,
  ChevronRight,
  ArrowRight,
  Scale,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Issue, ConflictDetails } from '@/types';

interface ConflictResolutionCenterProps {
  issues: Issue[];
  onResolve: (issueId: string, action: 'override' | 'request_clarification') => void;
  onSelectConflict: (issue: Issue) => void;
  selectedIssueId?: string | null;
  /** Demo mode: callback to simulate resolving an issue */
  onDemoResolve?: (issueId: string) => void;
}

export function ConflictResolutionCenter({
  issues,
  onResolve,
  onSelectConflict,
  selectedIssueId,
  onDemoResolve,
}: ConflictResolutionCenterProps) {
  const [resolvingAll, setResolvingAll] = useState(false);
  const logicIssues = issues.filter((i) => i.type === 'logic' && i.status === 'open');
  const resolvedIssues = issues.filter((i) => i.type === 'logic' && i.status === 'resolved');

  // Group by severity
  const errorIssues = logicIssues.filter((i) => i.severity === 'error');
  const warningIssues = logicIssues.filter((i) => i.severity === 'warning');
  const infoIssues = logicIssues.filter((i) => i.severity === 'info');

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <Scale className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Conflict Resolution</h2>
              <p className="text-sm text-gray-500">
                {logicIssues.length} conflict{logicIssues.length !== 1 ? 's' : ''} need review
              </p>
            </div>
          </div>

          {/* Demo: Resolve All Button */}
          {onDemoResolve && logicIssues.length > 0 && (
            <button
              onClick={() => {
                setResolvingAll(true);
                // Resolve issues one by one with stagger
                logicIssues.forEach((issue, index) => {
                  setTimeout(() => {
                    onDemoResolve(issue.id);
                    if (index === logicIssues.length - 1) {
                      setTimeout(() => setResolvingAll(false), 300);
                    }
                  }, index * 200);
                });
              }}
              disabled={resolvingAll}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                resolvingAll
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5"
              )}
            >
              {resolvingAll ? (
                <>
                  <CheckCircle2 className="w-4 h-4 animate-checkmark-pop" />
                  Resolving...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Demo: Resolve All
                </>
              )}
            </button>
          )}
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-3 mt-4">
          {errorIssues.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 rounded-lg text-rose-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">{errorIssues.length}</span>
              <span className="text-xs">Critical</span>
            </div>
          )}
          {warningIssues.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg text-amber-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">{warningIssues.length}</span>
              <span className="text-xs">Warning</span>
            </div>
          )}
          {infoIssues.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg text-blue-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">{infoIssues.length}</span>
              <span className="text-xs">Info</span>
            </div>
          )}
          {resolvedIssues.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg text-emerald-700">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">{resolvedIssues.length}</span>
              <span className="text-xs">Resolved</span>
            </div>
          )}
        </div>
      </div>

      {/* Conflict List */}
      <div className="flex-1 overflow-y-auto">
        {logicIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">All Conflicts Resolved</h3>
            <p className="text-sm text-gray-500">
              No logic conflicts detected. The case is ready for the next stage.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logicIssues.map((issue) => (
              <ConflictCard
                key={issue.id}
                issue={issue}
                isSelected={selectedIssueId === issue.id}
                onSelect={() => onSelectConflict(issue)}
                onResolve={(action) => onResolve(issue.id, action)}
                onDemoResolve={onDemoResolve ? () => onDemoResolve(issue.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Individual Conflict Card
function ConflictCard({
  issue,
  isSelected,
  onSelect,
  onResolve,
  onDemoResolve,
}: {
  issue: Issue;
  isSelected: boolean;
  onSelect: () => void;
  onResolve: (action: 'override' | 'request_clarification') => void;
  onDemoResolve?: () => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const handleDemoResolve = () => {
    if (!onDemoResolve) return;
    setIsResolving(true);
    setTimeout(() => {
      onDemoResolve();
      setIsResolving(false);
    }, 400);
  };

  const severityConfig = {
    error: {
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      label: 'Critical',
      labelBg: 'bg-rose-100 text-rose-700',
    },
    warning: {
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      label: 'Warning',
      labelBg: 'bg-amber-100 text-amber-700',
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      label: 'Info',
      labelBg: 'bg-blue-100 text-blue-700',
    },
  };

  const config = severityConfig[issue.severity];

  return (
    <div
      className={cn(
        'p-4 cursor-pointer transition-all duration-200',
        isSelected && 'bg-[#0E4369]/5 border-l-2 border-l-[#0E4369]',
        !isSelected && 'hover:bg-gray-50 border-l-2 border-l-transparent'
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        {/* Severity Icon */}
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', config.iconBg)}>
          <AlertCircle className={cn('w-4 h-4', config.iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', config.labelBg)}>
              {config.label}
            </span>
            <span className="text-xs text-gray-400">
              Detected {new Date(issue.detectedAt).toLocaleDateString()}
            </span>
          </div>

          <h4 className="text-sm font-semibold text-gray-900 mb-1">{issue.title}</h4>
          <p className="text-sm text-gray-600 mb-3">{issue.description}</p>

          {/* Conflict Details */}
          {issue.conflictDetails && (
            <div className={cn('p-3 rounded-lg border mb-3', config.bgColor, config.borderColor)}>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">
                  {issue.conflictDetails.field}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex-1 p-2 bg-white rounded border border-gray-200">
                  <div className="text-[10px] text-gray-400 mb-0.5">
                    {issue.conflictDetails.sourceA}
                  </div>
                  <div className="font-mono text-gray-900">{issue.conflictDetails.valueA}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 p-2 bg-white rounded border border-gray-200">
                  <div className="text-[10px] text-gray-400 mb-0.5">
                    {issue.conflictDetails.sourceB}
                  </div>
                  <div className="font-mono text-gray-900">{issue.conflictDetails.valueB}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResolve('override');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#0E4369] text-white rounded-lg hover:bg-[#0B3654] transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Override (Confirmed Correct)
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResolve('request_clarification');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Request Clarification
            </button>
            {/* Demo resolve button */}
            {onDemoResolve && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDemoResolve();
                }}
                disabled={isResolving}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                  isResolving
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-200"
                )}
              >
                {isResolving ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 animate-checkmark-pop" />
                    Resolved
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Demo: Resolve
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <ChevronRight
          className={cn(
            'w-5 h-5 text-gray-300 flex-shrink-0 transition-colors',
            isSelected && 'text-[#0E4369]'
          )}
        />
      </div>
    </div>
  );
}
