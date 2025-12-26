'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  Send,
  FileText,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Issue, Document } from '@/types';
import { ClientNoteModal } from './ClientNoteModal';
import { CaseDashboard } from './CaseDashboard';

type IssueAction = 'ignore' | 'fix' | 'mark_for_client';
type IssueFilter = 'all' | 'quality' | 'logic';

interface IssueWorkspaceProps {
  issues: Issue[];
  documents: Document[];
  onResolveIssue: (issueId: string) => void;
  onPreviewDocument: (documentId: string) => void;
  className?: string;
}

// Refined severity configuration
function getSeverityConfig(severity: Issue['severity']) {
  switch (severity) {
    case 'error':
      return {
        icon: AlertTriangle,
        accentColor: '#DC2626', // rose-600
        label: 'Critical',
        dotClass: 'bg-rose-500',
        textClass: 'text-rose-700',
        bgClass: 'bg-rose-50',
        borderClass: 'border-l-rose-500',
      };
    case 'warning':
      return {
        icon: AlertCircle,
        accentColor: '#D97706', // amber-600
        label: 'Warning',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-700',
        bgClass: 'bg-amber-50',
        borderClass: 'border-l-amber-500',
      };
    default:
      return {
        icon: Info,
        accentColor: '#0284C7', // sky-600
        label: 'Notice',
        dotClass: 'bg-sky-500',
        textClass: 'text-sky-700',
        bgClass: 'bg-sky-50',
        borderClass: 'border-l-sky-500',
      };
  }
}


/**
 * Refined Filter Tabs
 */
function FilterTabs({
  activeFilter,
  onFilterChange,
  counts,
}: {
  activeFilter: IssueFilter;
  onFilterChange: (filter: IssueFilter) => void;
  counts: { all: number; quality: number; logic: number };
}) {
  const tabs: { key: IssueFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'quality', label: 'Quality' },
    { key: 'logic', label: 'Compliance' },
  ];

  return (
    <div className="flex items-center gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onFilterChange(tab.key)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            activeFilter === tab.key
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          )}
        >
          {tab.label}
          <span
            className={cn(
              'ml-2 px-1.5 py-0.5 text-xs rounded',
              activeFilter === tab.key
                ? 'bg-white/20 text-white'
                : 'bg-slate-200 text-slate-600'
            )}
          >
            {counts[tab.key]}
          </span>
        </button>
      ))}
    </div>
  );
}

/**
 * Compact Issue Card - Surgical Efficiency Design
 * Actions appear as floating toolbar on hover, no reserved space
 */
function IssueCard({
  issue,
  documents,
  isSelected,
  onSelect,
  onAction,
  onPreviewDocument,
}: {
  issue: Issue;
  documents: Document[];
  isSelected: boolean;
  onSelect: () => void;
  onAction: (action: IssueAction) => void;
  onPreviewDocument: (documentId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const severity = getSeverityConfig(issue.severity);
  const relatedDocs = documents.filter((d) => issue.documentIds.includes(d.id));
  const isResolved = issue.status === 'resolved';

  return (
    <div
      className={cn(
        'group relative bg-white rounded-lg transition-all duration-200',
        'border border-slate-200 hover:border-slate-300',
        'shadow-sm hover:shadow',
        isResolved && 'opacity-60',
        isSelected && !isResolved && 'ring-2 ring-slate-900 ring-offset-1'
      )}
    >
      {/* Card Content - Compact */}
      <div className="px-3 py-3">
        {/* Header Row: Checkbox + Meta */}
        <div className="flex items-start gap-2">
          {/* Checkbox */}
          {!isResolved && (
            <button
              onClick={onSelect}
              className={cn(
                'w-4 h-4 mt-0.5 rounded border flex-shrink-0 flex items-center justify-center transition-all',
                isSelected
                  ? 'bg-slate-900 border-slate-900'
                  : 'border-slate-300 hover:border-slate-400'
              )}
            >
              {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
            </button>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Meta line */}
            <div className="flex items-center gap-2 mb-1">
              {/* Type */}
              <span className={cn(
                'text-[10px] font-semibold uppercase tracking-wide',
                issue.type === 'quality' ? 'text-slate-500' : 'text-slate-700'
              )}>
                {issue.type === 'quality' ? 'QC' : 'Compliance'}
              </span>
              <span className="text-slate-300">·</span>
              {/* Severity */}
              <span className={cn(
                'text-[10px] font-medium',
                issue.severity === 'error' && 'text-rose-600',
                issue.severity === 'warning' && 'text-amber-600',
                issue.severity === 'info' && 'text-sky-600'
              )}>
                {severity.label}
              </span>
              {/* Resolved badge */}
              {isResolved && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5" />
                    Done
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <h3 className={cn(
              'text-sm font-semibold leading-tight',
              isResolved ? 'text-slate-400 line-through' : 'text-slate-900'
            )}>
              {issue.title}
            </h3>

            {/* Description - truncated */}
            <p className={cn(
              'text-xs leading-relaxed mt-1',
              isResolved ? 'text-slate-400' : 'text-slate-600',
              !isExpanded && 'line-clamp-2'
            )}>
              {issue.description}
            </p>

            {/* Conflict Details - Compact */}
            {issue.conflictDetails && !isResolved && (
              <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-100">
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex-1 min-w-0">
                    <span className="text-slate-400 text-[10px]">{issue.conflictDetails.sourceA}:</span>
                    <span className="ml-1 font-mono font-semibold text-slate-800">{issue.conflictDetails.valueA}</span>
                  </div>
                  <span className="text-slate-300">≠</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-slate-400 text-[10px]">{issue.conflictDetails.sourceB}:</span>
                    <span className="ml-1 font-mono font-semibold text-slate-800">{issue.conflictDetails.valueB}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Related Docs - Inline compact */}
            {relatedDocs.length > 0 && !isResolved && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {relatedDocs.slice(0, 2).map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => onPreviewDocument(doc.id)}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-medium text-slate-600 transition-colors"
                  >
                    <FileText className="w-2.5 h-2.5" />
                    <span className="truncate max-w-[80px]">{doc.fileName || doc.name}</span>
                  </button>
                ))}
                {relatedDocs.length > 2 && (
                  <span className="text-[10px] text-slate-400">+{relatedDocs.length - 2}</span>
                )}
              </div>
            )}

            {/* AI Suggestion - Minimal */}
            {issue.aiRecommendation && !isResolved && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 mt-2 text-[10px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>AI suggestion</span>
                <ChevronRight
                  className={cn('w-2.5 h-2.5 transition-transform', isExpanded && 'rotate-90')}
                />
              </button>
            )}

            {isExpanded && issue.aiRecommendation && (
              <div className="mt-2 p-2 bg-slate-50 rounded text-xs text-slate-600 leading-relaxed">
                {issue.aiRecommendation.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main IssueWorkspace Component
 */
export function IssueWorkspace({
  issues,
  documents,
  onResolveIssue,
  onPreviewDocument,
  className,
}: IssueWorkspaceProps) {
  const [activeFilter, setActiveFilter] = useState<IssueFilter>('all');
  const [selectedIssueIds, setSelectedIssueIds] = useState<Set<string>>(new Set());

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIssueIds, setModalIssueIds] = useState<string[]>([]);

  // Stats are now computed inside CaseDashboard

  // Filter counts
  const filterCounts = useMemo(() => {
    return {
      all: issues.filter((i) => i.status === 'open').length,
      quality: issues.filter((i) => i.type === 'quality' && i.status === 'open').length,
      logic: issues.filter((i) => i.type === 'logic' && i.status === 'open').length,
    };
  }, [issues]);

  // Filtered issues
  const filteredIssues = useMemo(() => {
    let filtered = issues;
    if (activeFilter === 'quality') {
      filtered = issues.filter((i) => i.type === 'quality');
    } else if (activeFilter === 'logic') {
      filtered = issues.filter((i) => i.type === 'logic');
    }
    // Sort: open issues first, then by severity
    return filtered.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'open' ? -1 : 1;
      const severityOrder = { error: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [issues, activeFilter]);

  const handleSelectIssue = useCallback((issueId: string) => {
    setSelectedIssueIds((prev) => {
      const next = new Set(prev);
      if (next.has(issueId)) {
        next.delete(issueId);
      } else {
        next.add(issueId);
      }
      return next;
    });
  }, []);

  // Get issues for modal display
  const modalIssues = useMemo(() => {
    return issues.filter((i) => modalIssueIds.includes(i.id));
  }, [issues, modalIssueIds]);

  // Open modal with specific issues
  const openModalWithIssues = useCallback((issueIds: string[]) => {
    setModalIssueIds(issueIds);
    setIsModalOpen(true);
  }, []);

  const handleAction = useCallback(
    (issueId: string, action: IssueAction) => {
      if (action === 'ignore' || action === 'fix') {
        onResolveIssue(issueId);
        setSelectedIssueIds((prev) => {
          const next = new Set(prev);
          next.delete(issueId);
          return next;
        });
      } else if (action === 'mark_for_client') {
        // Open modal with this single issue
        openModalWithIssues([issueId]);
      }
    },
    [onResolveIssue, openModalWithIssues]
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setModalIssueIds([]);
  }, []);

  const handleSendMessage = useCallback(
    (channel: 'whatsapp' | 'email', message: string, subject?: string) => {
      console.log(`Sending via ${channel}:`, { subject, message });
      // Clear selection after sending
      setSelectedIssueIds(new Set());
      setIsModalOpen(false);
      setModalIssueIds([]);
    },
    []
  );

  const handleSelectAll = useCallback(() => {
    const openIssueIds = filteredIssues.filter((i) => i.status === 'open').map((i) => i.id);
    setSelectedIssueIds(new Set(openIssueIds));
  }, [filteredIssues]);

  const handleClearSelection = useCallback(() => {
    setSelectedIssueIds(new Set());
  }, []);

  return (
    <div className={cn('flex flex-col h-full bg-slate-50', className)}>
      {/* Dashboard */}
      <div className="px-6 py-5">
        <CaseDashboard issues={issues} />
      </div>

      {/* Filter Bar */}
      <div className="px-6 pb-4 flex items-center justify-between">
        <FilterTabs
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={filterCounts}
        />

        <div className="flex items-center gap-3">
          {selectedIssueIds.size > 0 ? (
            <>
              <span className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{selectedIssueIds.size}</span> selected
              </span>
              <button
                onClick={handleClearSelection}
                className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  openModalWithIssues(Array.from(selectedIssueIds));
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Send className="w-3 h-3" />
                Request Client
              </button>
            </>
          ) : (
            <button
              onClick={handleSelectAll}
              className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              Select all
            </button>
          )}
        </div>
      </div>

      {/* Issue Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {filteredIssues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                documents={documents}
                isSelected={selectedIssueIds.has(issue.id)}
                onSelect={() => handleSelectIssue(issue.id)}
                onAction={(action) => handleAction(issue.id, action)}
                onPreviewDocument={onPreviewDocument}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">All Clear</h3>
            <p className="text-sm text-slate-500 mt-1">No issues found in this category</p>
          </div>
        )}
      </div>

      {/* Client Note Modal */}
      <ClientNoteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        issues={modalIssues}
        onSend={handleSendMessage}
      />
    </div>
  );
}
