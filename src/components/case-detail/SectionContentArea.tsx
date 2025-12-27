'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  Send,
  FileText,
  ChevronRight,
  Sparkles,
  FolderOpen,
  X,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionEmptyState } from './SectionEmptyState';
import type { Issue, Document, EvidenceSlotTemplate, DocumentPipelineStatus } from '@/types';

interface SectionContentAreaProps {
  section: EvidenceSlotTemplate | null;
  documents: Document[];
  issues: Issue[];
  onPreviewDocument: (docId: string) => void;
  onResolveIssue: (issueId: string) => void;
  onRequestClient: (issueIds: string[]) => void;
  onSelectIssue?: (issueId: string) => void;
  className?: string;
}

// Check if a document has pipeline issues
function hasDocumentIssue(status: DocumentPipelineStatus): boolean {
  return status === 'quality_issue' || status === 'conflict';
}

// Get document status config
function getDocumentStatusConfig(status: DocumentPipelineStatus) {
  switch (status) {
    case 'ready':
      return { icon: Check, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Verified' };
    case 'quality_issue':
      return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Quality Issue' };
    case 'conflict':
      return { icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Conflict' };
    case 'processing':
    case 'quality_check':
    case 'compliance_check':
      return { icon: Loader2, color: 'text-slate-400', bg: 'bg-slate-50', label: 'Processing' };
    default:
      return { icon: FileText, color: 'text-slate-400', bg: 'bg-slate-50', label: 'Uploading' };
  }
}

// Refined severity configuration
function getSeverityConfig(severity: Issue['severity']) {
  switch (severity) {
    case 'error':
      return {
        icon: AlertTriangle,
        label: 'Critical',
        dotClass: 'bg-rose-500',
        textClass: 'text-rose-700',
      };
    case 'warning':
      return {
        icon: AlertCircle,
        label: 'Warning',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-700',
      };
    default:
      return {
        icon: Info,
        label: 'Notice',
        dotClass: 'bg-sky-500',
        textClass: 'text-sky-700',
      };
  }
}

/**
 * Files Drawer - Collapsible sidebar for documents
 */
function FilesDrawer({
  isOpen,
  onClose,
  section,
  documents,
  onPreviewDocument,
}: {
  isOpen: boolean;
  onClose: () => void;
  section: EvidenceSlotTemplate;
  documents: Document[];
  onPreviewDocument: (docId: string) => void;
}) {
  const stats = useMemo(() => {
    const ready = documents.filter(d => d.pipelineStatus === 'ready').length;
    const issues = documents.filter(d => hasDocumentIssue(d.pipelineStatus)).length;
    const processing = documents.filter(d =>
      ['processing', 'quality_check', 'compliance_check', 'uploading'].includes(d.pipelineStatus)
    ).length;
    return { ready, issues, processing, total: documents.length };
  }, [documents]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/5 z-10"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-slate-200 shadow-xl z-20 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Section Files</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{section.name}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 -mr-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stats Bar */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-600">{stats.ready} verified</span>
              </div>
              {stats.issues > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[10px] text-slate-600">{stats.issues} issues</span>
                </div>
              )}
              {stats.processing > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="text-[10px] text-slate-600">{stats.processing} processing</span>
                </div>
              )}
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 space-y-2">
                {documents.map((doc, index) => {
                  const statusConfig = getDocumentStatusConfig(doc.pipelineStatus);
                  const StatusIcon = statusConfig.icon;
                  const isProcessing = ['processing', 'quality_check', 'compliance_check'].includes(doc.pipelineStatus);

                  return (
                    <motion.button
                      key={doc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onPreviewDocument(doc.id)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg transition-all duration-200',
                        'border border-slate-100 hover:border-slate-200',
                        'hover:shadow-sm group',
                        statusConfig.bg
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                          'bg-white/80'
                        )}>
                          <StatusIcon className={cn(
                            'w-4 h-4',
                            statusConfig.color,
                            isProcessing && 'animate-spin'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-900 truncate group-hover:text-[#0E4369]">
                            {doc.fileName || doc.name}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {statusConfig.label}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 flex-shrink-0" />
                      </div>
                    </motion.button>
                  );
                })}

                {documents.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No files uploaded yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-[10px] text-slate-400">
                {section.minCount ?? 1} required · {section.maxCount ?? 'unlimited'} max
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Section Complete Celebration - Elegant completion state with motion
 */
function SectionCompleteCelebration({ section }: { section: EvidenceSlotTemplate }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative text-center max-w-md px-8"
      >
        {/* Checkmark with ring animation */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          {/* Outer ring - pulses subtly */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="absolute inset-0 rounded-full bg-emerald-100"
          />

          {/* Inner ring */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="absolute inset-2 rounded-full bg-emerald-500 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
            >
              <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2.5} />
            </motion.div>
          </motion.div>

          {/* Decorative dots */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.05 }}
              className="absolute w-1.5 h-1.5 rounded-full bg-emerald-300"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 60}deg) translateY(-44px) translateX(-50%)`,
              }}
            />
          ))}
        </div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-xl font-semibold text-slate-900 mb-2"
        >
          Section Complete
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-sm text-slate-500 mb-6"
        >
          All documents for <span className="font-medium text-slate-700">{section.name}</span> have been verified with no outstanding issues.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="inline-flex items-center gap-4 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs text-slate-600">Documents verified</span>
          </div>
          <div className="w-px h-3 bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs text-slate-600">No issues found</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * Compact Issue Card for section view
 */
function CompactIssueCard({
  issue,
  documents,
  isSelected,
  onSelect,
  onPreviewDocument,
  onViewDetails,
}: {
  issue: Issue;
  documents: Document[];
  isSelected: boolean;
  onSelect: () => void;
  onPreviewDocument: (documentId: string) => void;
  onViewDetails?: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const severity = getSeverityConfig(issue.severity);
  const relatedDocs = documents.filter((d) => issue.documentIds.includes(d.id));
  const isResolved = issue.status === 'resolved';

  return (
    <div
      onClick={() => onViewDetails?.()}
      className={cn(
        'group relative bg-white rounded-lg transition-all duration-200 cursor-pointer',
        'border border-slate-200 hover:border-slate-300',
        'shadow-sm hover:shadow',
        isResolved && 'opacity-60',
        isSelected && !isResolved && 'ring-2 ring-slate-900 ring-offset-1'
      )}
    >
      <div className="px-3 py-2.5">
        {/* Header Row */}
        <div className="flex items-start gap-2">
          {/* Checkbox */}
          {!isResolved && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
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
            <div className="flex items-center gap-2 mb-0.5">
              <span className={cn(
                'text-[10px] font-semibold uppercase tracking-wide',
                issue.type === 'quality' ? 'text-slate-500' : 'text-slate-700'
              )}>
                {issue.type === 'quality' ? 'QC' : 'Compliance'}
              </span>
              <span className="text-slate-300">·</span>
              <span className={cn(
                'text-[10px] font-medium',
                issue.severity === 'error' && 'text-rose-600',
                issue.severity === 'warning' && 'text-amber-600',
                issue.severity === 'info' && 'text-sky-600'
              )}>
                {severity.label}
              </span>
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
              'text-xs font-semibold leading-tight',
              isResolved ? 'text-slate-400 line-through' : 'text-slate-900'
            )}>
              {issue.title}
            </h3>

            {/* Description - truncated */}
            <p className={cn(
              'text-[11px] leading-relaxed mt-1 line-clamp-2',
              isResolved ? 'text-slate-400' : 'text-slate-600'
            )}>
              {issue.description}
            </p>

            {/* Related Docs - Inline compact */}
            {relatedDocs.length > 0 && !isResolved && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {relatedDocs.slice(0, 2).map((doc) => (
                  <button
                    key={doc.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreviewDocument(doc.id);
                    }}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-medium text-slate-600 transition-colors"
                  >
                    <FileText className="w-2.5 h-2.5" />
                    <span className="truncate max-w-[60px]">{doc.fileName || doc.name}</span>
                  </button>
                ))}
                {relatedDocs.length > 2 && (
                  <span className="text-[10px] text-slate-400">+{relatedDocs.length - 2}</span>
                )}
              </div>
            )}

            {/* AI Suggestion toggle */}
            {issue.aiRecommendation && !isResolved && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
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
              <div className="mt-2 p-2 bg-slate-50 rounded text-[11px] text-slate-600 leading-relaxed">
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
 * Filter Tabs for issue types
 */
function FilterTabs({
  activeFilter,
  onFilterChange,
  counts,
}: {
  activeFilter: 'all' | 'quality' | 'logic';
  onFilterChange: (filter: 'all' | 'quality' | 'logic') => void;
  counts: { all: number; quality: number; logic: number };
}) {
  const tabs: { key: 'all' | 'quality' | 'logic'; label: string }[] = [
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
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
            activeFilter === tab.key
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          )}
        >
          {tab.label}
          <span
            className={cn(
              'ml-1.5 px-1 py-0.5 text-[10px] rounded',
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
 * Section Header with Files Drawer Toggle
 */
function SectionHeader({
  section,
  documents,
  onToggleFilesDrawer,
  isFilesDrawerOpen,
}: {
  section: EvidenceSlotTemplate;
  documents: Document[];
  onToggleFilesDrawer: () => void;
  isFilesDrawerOpen: boolean;
}) {
  const stats = useMemo(() => {
    const ready = documents.filter(d => d.pipelineStatus === 'ready').length;
    const issues = documents.filter(d => hasDocumentIssue(d.pipelineStatus)).length;
    return { ready, issues, total: documents.length, required: section.minCount ?? 1 };
  }, [documents, section]);

  return (
    <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{section.name}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
      </div>

      {/* Files Toggle Button */}
      <button
        onClick={onToggleFilesDrawer}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all',
          isFilesDrawerOpen
            ? 'bg-slate-900 text-white'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        )}
      >
        <FolderOpen className="w-4 h-4" />
        <span>{stats.total} Files</span>
        {stats.issues > 0 && (
          <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-semibold rounded">
            {stats.issues}
          </span>
        )}
      </button>
    </div>
  );
}

/**
 * SectionContentArea - Main content area for selected section
 */
export function SectionContentArea({
  section,
  documents,
  issues,
  onPreviewDocument,
  onResolveIssue,
  onRequestClient,
  onSelectIssue,
  className,
}: SectionContentAreaProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'quality' | 'logic'>('all');
  const [selectedIssueIds, setSelectedIssueIds] = useState<Set<string>>(new Set());
  const [isFilesDrawerOpen, setIsFilesDrawerOpen] = useState(false);

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
    // Sort: open first, then by severity
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

  const handleClearSelection = useCallback(() => {
    setSelectedIssueIds(new Set());
  }, []);

  const handleSelectAll = useCallback(() => {
    const openIds = filteredIssues.filter(i => i.status === 'open').map(i => i.id);
    setSelectedIssueIds(new Set(openIds));
  }, [filteredIssues]);

  const handleRequestClient = useCallback(() => {
    onRequestClient(Array.from(selectedIssueIds));
    setSelectedIssueIds(new Set());
  }, [selectedIssueIds, onRequestClient]);

  // FIXED: Determine content state - now checks document pipeline status too
  const hasDocuments = documents.length > 0;
  const hasOpenIssues = issues.some(i => i.status === 'open');
  const hasDocumentIssues = documents.some(d => hasDocumentIssue(d.pipelineStatus));
  const meetsMinCount = section ? documents.length >= (section.minCount ?? 1) : false;

  // Section is only complete if:
  // 1. Has documents
  // 2. Meets minimum count
  // 3. No open issues
  // 4. No documents with pipeline issues (quality_issue, conflict)
  const isComplete = hasDocuments && meetsMinCount && !hasOpenIssues && !hasDocumentIssues;

  // No section selected
  if (!section) {
    return (
      <div className={cn('flex-1 flex items-center justify-center bg-slate-50', className)}>
        <p className="text-sm text-slate-400">Select a section to view details</p>
      </div>
    );
  }

  // Section complete - show celebration
  if (isComplete) {
    return (
      <div className={cn('flex-1 flex flex-col bg-slate-50 relative', className)}>
        <SectionHeader
          section={section}
          documents={documents}
          onToggleFilesDrawer={() => setIsFilesDrawerOpen(prev => !prev)}
          isFilesDrawerOpen={isFilesDrawerOpen}
        />
        <SectionCompleteCelebration section={section} />
        <FilesDrawer
          isOpen={isFilesDrawerOpen}
          onClose={() => setIsFilesDrawerOpen(false)}
          section={section}
          documents={documents}
          onPreviewDocument={onPreviewDocument}
        />
      </div>
    );
  }

  // No documents in section
  if (!hasDocuments) {
    return (
      <div className={cn('flex-1 flex flex-col bg-slate-50 relative', className)}>
        <SectionHeader
          section={section}
          documents={documents}
          onToggleFilesDrawer={() => setIsFilesDrawerOpen(prev => !prev)}
          isFilesDrawerOpen={isFilesDrawerOpen}
        />
        <div className="flex-1 flex items-center justify-center">
          <SectionEmptyState
            type="no_documents"
            section={section}
            onRequestClient={() => onRequestClient([])}
          />
        </div>
        <FilesDrawer
          isOpen={isFilesDrawerOpen}
          onClose={() => setIsFilesDrawerOpen(false)}
          section={section}
          documents={documents}
          onPreviewDocument={onPreviewDocument}
        />
      </div>
    );
  }

  // Normal state: has documents, may have issues
  return (
    <div className={cn('flex-1 flex flex-col bg-slate-50 overflow-hidden relative', className)}>
      {/* Section Header with Files Toggle */}
      <SectionHeader
        section={section}
        documents={documents}
        onToggleFilesDrawer={() => setIsFilesDrawerOpen(prev => !prev)}
        isFilesDrawerOpen={isFilesDrawerOpen}
      />

      {/* Issues Section */}
      {(hasOpenIssues || hasDocumentIssues) && (
        <>
          {/* Filter Bar */}
          <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
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
                    onClick={handleRequestClient}
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

          {/* Issue Cards Grid */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredIssues.map((issue) => (
                <CompactIssueCard
                  key={issue.id}
                  issue={issue}
                  documents={documents}
                  isSelected={selectedIssueIds.has(issue.id)}
                  onSelect={() => handleSelectIssue(issue.id)}
                  onPreviewDocument={onPreviewDocument}
                  onViewDetails={() => onSelectIssue?.(issue.id)}
                />
              ))}
            </div>

            {filteredIssues.length === 0 && filterCounts.all > 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-slate-500">No issues in this category</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* No issues - just files with potential document issues */}
      {!hasOpenIssues && !hasDocumentIssues && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-slate-900">No Issues</p>
            <p className="text-xs text-slate-500 mt-1">All documents are verified</p>
          </div>
        </div>
      )}

      {/* Files Drawer */}
      <FilesDrawer
        isOpen={isFilesDrawerOpen}
        onClose={() => setIsFilesDrawerOpen(false)}
        section={section}
        documents={documents}
        onPreviewDocument={onPreviewDocument}
      />
    </div>
  );
}
