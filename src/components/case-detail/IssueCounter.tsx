'use client';

import { useState, useRef, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, Mail, MessageCircle, ArrowRight, X, Lightbulb, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Issue } from '@/types';

interface IssueCounterProps {
  issues: Issue[];
  onSlotJump?: (slotId: string) => void;
  /** Demo mode: callback to simulate resolving an issue */
  onDemoResolve?: (issueId: string) => void;
  className?: string;
}

export function IssueCounter({
  issues = [],
  onSlotJump,
  onDemoResolve,
  className,
}: IssueCounterProps) {
  const [showNavigator, setShowNavigator] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'quality' | 'logic'>('all');
  const navigatorRef = useRef<HTMLDivElement>(null);

  // Count open issues by type
  const openIssues = issues.filter(i => i.status === 'open');
  const qualityIssues = openIssues.filter(i => i.type === 'quality').length;
  const logicIssues = openIssues.filter(i => i.type === 'logic').length;
  const totalIssues = qualityIssues + logicIssues;

  // Close navigator when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navigatorRef.current && !navigatorRef.current.contains(event.target as Node)) {
        setShowNavigator(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter issues for display
  const filteredIssues = activeFilter === 'all'
    ? openIssues
    : openIssues.filter(i => i.type === activeFilter);

  const handleIssueClick = (issue: Issue) => {
    if (issue.targetSlotId && onSlotJump) {
      onSlotJump(issue.targetSlotId);
      setShowNavigator(false);
    }
  };

  const handleSendNotification = (issue: Issue, channel: 'email' | 'whatsapp') => {
    console.log(`Sending ${channel} notification for issue:`, issue.id);
  };

  // No issues state
  if (totalIssues === 0) {
    return (
      <div className={cn('flex items-center gap-2 text-emerald-600', className)}>
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100">
          <CheckCircle2 className="w-3 h-3" />
        </div>
        <span className="text-sm font-medium">No issues</span>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} ref={navigatorRef}>
      {/* Unified Entry Point Button */}
      <button
        onClick={() => setShowNavigator(!showNavigator)}
        className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all duration-200 hover:shadow-sm"
      >
        <AlertCircle className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-semibold text-gray-700">
          {totalIssues} Issue{totalIssues !== 1 ? 's' : ''}
        </span>
        {/* Breakdown dots */}
        <div className="flex items-center gap-1 pl-1 border-l border-gray-200">
          {qualityIssues > 0 && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-semibold">
              <AlertTriangle className="w-2.5 h-2.5" />
              {qualityIssues}
            </span>
          )}
          {logicIssues > 0 && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-semibold">
              <AlertCircle className="w-2.5 h-2.5" />
              {logicIssues}
            </span>
          )}
        </div>
      </button>

      {/* Issue Navigator Popover */}
      {showNavigator && (
        <div className="absolute top-full right-0 mt-2 w-[420px] bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                {activeFilter === 'quality' && `${qualityIssues} Quality Issue${qualityIssues !== 1 ? 's' : ''}`}
                {activeFilter === 'logic' && `${logicIssues} Data Conflict${logicIssues !== 1 ? 's' : ''}`}
                {activeFilter === 'all' && `${totalIssues} Issue${totalIssues !== 1 ? 's' : ''}`}
              </h3>
              <button
                onClick={() => setShowNavigator(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => setActiveFilter('all')}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                  activeFilter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                )}
              >
                All ({totalIssues})
              </button>
              {qualityIssues > 0 && (
                <button
                  onClick={() => setActiveFilter('quality')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                    activeFilter === 'quality'
                      ? 'bg-amber-500 text-white'
                      : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
                  )}
                >
                  Quality ({qualityIssues})
                </button>
              )}
              {logicIssues > 0 && (
                <button
                  onClick={() => setActiveFilter('logic')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                    activeFilter === 'logic'
                      ? 'bg-rose-500 text-white'
                      : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
                  )}
                >
                  Conflicts ({logicIssues})
                </button>
              )}
            </div>
          </div>

          {/* Issues List */}
          <div className="max-h-[400px] overflow-y-auto">
            {filteredIssues.map((issue) => (
              <IssueNavigatorItem
                key={issue.id}
                issue={issue}
                onGoToSlot={() => handleIssueClick(issue)}
                onSendEmail={() => handleSendNotification(issue, 'email')}
                onSendWhatsApp={() => handleSendNotification(issue, 'whatsapp')}
                onDemoResolve={onDemoResolve ? () => onDemoResolve(issue.id) : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Issue Navigator Item Component
interface IssueNavigatorItemProps {
  issue: Issue;
  onGoToSlot: () => void;
  onSendEmail: () => void;
  onSendWhatsApp: () => void;
  onDemoResolve?: () => void;
}

function IssueNavigatorItem({ issue, onGoToSlot, onSendEmail, onSendWhatsApp, onDemoResolve }: IssueNavigatorItemProps) {
  const [isResolving, setIsResolving] = useState(false);

  const handleDemoResolve = () => {
    if (!onDemoResolve) return;
    setIsResolving(true);
    setTimeout(() => {
      onDemoResolve();
      setIsResolving(false);
    }, 400);
  };

  const isQuality = issue.type === 'quality';
  const hasRecommendation = issue.aiRecommendation;
  const channels = issue.aiRecommendation?.channels || [];

  return (
    <div className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors">
      {/* Issue Header */}
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          isQuality ? 'bg-amber-100' : 'bg-rose-100'
        )}>
          {isQuality ? (
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 leading-tight">
            {issue.title}
          </h4>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
            {issue.description}
          </p>

          {/* Conflict Details */}
          {issue.conflictDetails && (
            <div className="mt-2 p-2 bg-rose-50 rounded-lg border border-rose-100">
              <div className="flex items-center gap-2 text-xs text-rose-700">
                <span className="font-medium">{issue.conflictDetails.sourceA}:</span>
                <span>"{issue.conflictDetails.valueA}"</span>
                <span className="text-rose-400">vs</span>
                <span className="font-medium">{issue.conflictDetails.sourceB}:</span>
                <span>"{issue.conflictDetails.valueB}"</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendation */}
      {hasRecommendation && (
        <div className="mt-3 ml-11 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
              {issue.aiRecommendation?.message}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 ml-11 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {channels.includes('email') && (
            <button
              onClick={onSendEmail}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              Email
            </button>
          )}
          {channels.includes('whatsapp') && (
            <button
              onClick={onSendWhatsApp}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </button>
          )}
          {onDemoResolve && (
            <button
              onClick={handleDemoResolve}
              disabled={isResolving}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all",
                isResolving
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-200"
              )}
            >
              {isResolving ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
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

        {issue.targetSlotId && (
          <button
            onClick={onGoToSlot}
            className="flex items-center gap-1 text-xs font-medium text-[#0E4369] hover:text-[#0B3654] transition-colors"
          >
            Go to Slot
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
