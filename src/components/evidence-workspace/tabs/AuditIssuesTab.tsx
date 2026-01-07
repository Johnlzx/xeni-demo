'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Wand2,
  Edit3,
  Eye,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkspaceIssue } from '../hooks/useWorkspaceState';

interface AuditIssuesTabProps {
  issues: WorkspaceIssue[];
  activeFixIssueId: string | null;
  onEnterFixFlow: (issueId: string) => void;
  onExitFixFlow: () => void;
  onApplyFix: (issueId: string) => void;
  onOverride: (issueId: string, value: string) => void;
  onViewInDocument: (issueId: string) => void;
}

export function AuditIssuesTab({
  issues,
  activeFixIssueId,
  onEnterFixFlow,
  onExitFixFlow,
  onApplyFix,
  onOverride,
  onViewInDocument,
}: AuditIssuesTabProps) {
  const openIssues = issues.filter(i => i.status === 'open');
  const resolvedIssues = issues.filter(i => i.status !== 'open');

  const criticalCount = openIssues.filter(i => i.severity === 'critical').length;
  const warningCount = openIssues.filter(i => i.severity === 'warning').length;

  // If fix flow is active, show split view
  const activeIssue = activeFixIssueId ? issues.find(i => i.id === activeFixIssueId) : null;

  if (activeIssue) {
    return (
      <SplitScreenFixFlow
        issue={activeIssue}
        onClose={onExitFixFlow}
        onApplyFix={() => onApplyFix(activeIssue.id)}
        onOverride={(value) => onOverride(activeIssue.id, value)}
      />
    );
  }

  // All clear state
  if (openIssues.length === 0 && resolvedIssues.length > 0) {
    return <AllClearState resolvedCount={resolvedIssues.length} />;
  }

  // Empty state
  if (issues.length === 0) {
    return <EmptyIssuesState />;
  }

  return (
    <div className="p-6">
      {/* Header Stats */}
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Issues</h2>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
              <AlertTriangle className="w-3 h-3" />
              {criticalCount} Critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
              <AlertCircle className="w-3 h-3" />
              {warningCount} Warning
            </span>
          )}
          {openIssues.length === 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-3 h-3" />
              All resolved
            </span>
          )}
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {openIssues.map((issue, index) => (
          <motion.div
            key={issue.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <IssueCard
              issue={issue}
              onFix={() => onEnterFixFlow(issue.id)}
              onViewInDocument={() => onViewInDocument(issue.id)}
            />
          </motion.div>
        ))}
      </div>

      {/* Resolved Issues (collapsed) */}
      {resolvedIssues.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-slate-500 mb-3">
            Resolved ({resolvedIssues.length})
          </h3>
          <div className="space-y-2 opacity-60">
            {resolvedIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-slate-600 line-through">{issue.title}</span>
                <span className="ml-auto text-xs text-slate-400">
                  {issue.status === 'fixed' ? 'Auto-fixed' : 'Overridden'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Issue Card Component
interface IssueCardProps {
  issue: WorkspaceIssue;
  onFix: () => void;
  onViewInDocument: () => void;
}

function IssueCard({ issue, onFix, onViewInDocument }: IssueCardProps) {
  const severityConfig = {
    critical: {
      icon: AlertTriangle,
      colors: 'border-rose-200 bg-rose-50/50',
      iconColor: 'text-rose-500',
      badge: 'bg-rose-100 text-rose-700',
    },
    warning: {
      icon: AlertCircle,
      colors: 'border-amber-200 bg-amber-50/50',
      iconColor: 'text-amber-500',
      badge: 'bg-amber-100 text-amber-700',
    },
    info: {
      icon: Info,
      colors: 'border-blue-200 bg-blue-50/50',
      iconColor: 'text-blue-500',
      badge: 'bg-blue-100 text-blue-700',
    },
  };

  const config = severityConfig[issue.severity];
  const Icon = config.icon;

  return (
    <motion.div
      className={cn(
        'p-4 rounded-xl border transition-all',
        config.colors
      )}
      whileHover={{ scale: 1.005 }}
    >
      <div className="flex items-start gap-3">
        {/* Severity Icon */}
        <div className={cn('mt-0.5', config.iconColor)}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-slate-900">{issue.title}</h3>
            <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium uppercase', config.badge)}>
              {issue.severity}
            </span>
          </div>

          <p className="text-sm text-slate-600 mb-3">{issue.description}</p>

          {/* AI Suggestion */}
          {issue.suggestedFix && (
            <div className="mb-3 p-2.5 rounded-lg bg-white/80 border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary-700 mb-1">
                <Sparkles className="w-3 h-3" />
                AI Suggestion
              </div>
              <p className="text-sm text-slate-700">{issue.suggestedFix}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {issue.autoFixAvailable && (
              <motion.button
                onClick={onFix}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Wand2 className="w-3.5 h-3.5" />
                Fix Issue
              </motion.button>
            )}

            <motion.button
              onClick={onFix}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Manual Override
            </motion.button>

            <motion.button
              onClick={onViewInDocument}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Eye className="w-3.5 h-3.5" />
              View in Document
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Split Screen Fix Flow
interface SplitScreenFixFlowProps {
  issue: WorkspaceIssue;
  onClose: () => void;
  onApplyFix: () => void;
  onOverride: (value: string) => void;
}

function SplitScreenFixFlow({ issue, onClose, onApplyFix, onOverride }: SplitScreenFixFlowProps) {
  const [overrideValue, setOverrideValue] = useState('');

  return (
    <motion.div
      className="h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className={cn(
            'w-5 h-5',
            issue.severity === 'critical' ? 'text-rose-500' : 'text-amber-500'
          )} />
          <h3 className="font-medium text-slate-900">Fix: {issue.title}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Split Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Document View */}
        <div className="flex-1 bg-slate-100 p-4 overflow-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            {/* Mock document with highlighted area */}
            <div className="relative aspect-[3/4] bg-slate-50 rounded border border-slate-200">
              <div className="absolute inset-0 p-4 font-mono text-xs text-slate-600">
                <div className="mb-4 text-center text-slate-400">Document Preview</div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                </div>

                {/* Highlighted bbox */}
                <motion.div
                  className="absolute left-8 top-1/3 right-8 h-8 border-2 border-rose-500 bg-rose-100/30 rounded flex items-center justify-center"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-[10px] font-semibold text-rose-700">15 MAR 1988</span>
                </motion.div>
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-slate-500">
              Page 1 of 3
            </div>
          </div>
        </div>

        {/* Right: Fix Panel */}
        <div className="w-80 border-l border-slate-200 bg-white p-4 flex flex-col">
          <div className="flex-1 space-y-4">
            {/* Current Value */}
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                Current Value
              </label>
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-mono">
                1988-15-03
              </div>
            </div>

            {/* AI Suggestion */}
            {issue.suggestedFix && (
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                  AI Suggested
                </label>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono flex items-center justify-between">
                  <span>15 March 1988</span>
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
            )}

            {/* Manual Override */}
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                Manual Override
              </label>
              <input
                type="text"
                value={overrideValue}
                onChange={(e) => setOverrideValue(e.target.value)}
                placeholder="Enter correct value..."
                className="w-full p-3 rounded-lg border border-slate-200 text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            {issue.suggestedFix && (
              <motion.button
                onClick={onApplyFix}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Wand2 className="w-4 h-4" />
                Apply AI Fix
              </motion.button>
            )}

            <motion.button
              onClick={() => overrideValue && onOverride(overrideValue)}
              disabled={!overrideValue}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: overrideValue ? 1.01 : 1 }}
              whileTap={{ scale: overrideValue ? 0.99 : 1 }}
            >
              <Edit3 className="w-4 h-4" />
              Apply Override
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// All Clear State
function AllClearState({ resolvedCount }: { resolvedCount: number }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full p-12 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.div
        className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
      >
        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
      </motion.div>

      <motion.h3
        className="text-xl font-semibold text-slate-900 mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        All Clear!
      </motion.h3>

      <motion.p
        className="text-slate-500 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {resolvedCount} issue{resolvedCount !== 1 ? 's' : ''} have been resolved.
        This section is verified.
      </motion.p>

      <motion.div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <CheckCircle2 className="w-4 h-4" />
        Verified
      </motion.div>
    </motion.div>
  );
}

// Empty Issues State
function EmptyIssuesState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <CheckCircle2 className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-1">No issues found</h3>
      <p className="text-sm text-slate-500">
        Documents are being processed. Issues will appear here if detected.
      </p>
    </div>
  );
}
