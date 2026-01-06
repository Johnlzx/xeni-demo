'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  Send,
  FileText,
  ChevronRight,
  Sparkles,
  Clock,
  Upload,
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Issue, Document, EvidenceSlotTemplate, DocumentPipelineStatus } from '@/types';
import type { MergeSuggestion } from '@/services/mergeDetection';

interface SectionContentAreaProps {
  section: EvidenceSlotTemplate | null;
  documents: Document[];
  issues: Issue[];
  completedMerges?: MergeSuggestion[];
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
      return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', borderColor: 'border-emerald-200', label: 'Upload complete' };
    case 'quality_issue':
      return { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', borderColor: 'border-amber-200', label: 'Quality issue' };
    case 'conflict':
      return { icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', borderColor: 'border-rose-200', label: 'Conflict detected' };
    case 'processing':
    case 'quality_check':
    case 'compliance_check':
      return { icon: Loader2, color: 'text-slate-500', bg: 'bg-slate-50', borderColor: 'border-slate-200', label: 'Processing...' };
    default:
      return { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-50', borderColor: 'border-slate-200', label: 'Uploading...' };
  }
}

// Severity configuration for issues
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
 * Document Requirement Card - Shows a document with upload status
 */
function DocumentCard({
  document,
  onPreview,
}: {
  document: Document;
  onPreview: () => void;
}) {
  const statusConfig = getDocumentStatusConfig(document.pipelineStatus);
  const StatusIcon = statusConfig.icon;
  const isProcessing = ['processing', 'quality_check', 'compliance_check'].includes(document.pipelineStatus);
  const isComplete = document.pipelineStatus === 'ready';

  return (
    <motion.button
      onClick={onPreview}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'w-full text-left p-5 rounded-2xl border-2 transition-all duration-200',
        'hover:shadow-lg group',
        isComplete ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-200 hover:border-slate-300'
      )}
    >
      {/* Document Title */}
      <h3 className="text-base font-semibold text-slate-900 mb-2 group-hover:text-[#0E4369] transition-colors">
        {document.fileName || document.name}
      </h3>

      {/* Status Badge */}
      <div className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-4',
        isComplete ? 'bg-emerald-100 text-emerald-700' : statusConfig.bg,
        !isComplete && statusConfig.color
      )}>
        <StatusIcon className={cn('w-3.5 h-3.5', isProcessing && 'animate-spin')} />
        <span>{statusConfig.label}</span>
      </div>

      {/* Document Illustration */}
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16 flex-shrink-0">
          <Image
            src="/images/document-illustration.png"
            alt="Document"
            width={64}
            height={64}
            className="object-contain"
          />
          {isComplete && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
          )}
        </div>
        <span className="text-xs text-slate-500">
          {document.fileType?.includes('pdf') ? 'PDF' :
           document.fileType?.includes('image') ? 'Image' :
           'Document'}
        </span>
      </div>
    </motion.button>
  );
}

/**
 * Empty Document Card - Shows when no document is uploaded
 */
function EmptyDocumentCard({
  section,
  onRequestClient,
}: {
  section: EvidenceSlotTemplate;
  onRequestClient: () => void;
}) {
  // Get acceptable file types from acceptableTypes array
  const fileTypes = section.acceptableTypes
    ?.slice(0, 3)
    .map(t => typeof t === 'string' ? t : t.typeId)
    .join(', ')
    .toUpperCase() || 'PDF, JPG, PNG';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full p-5 rounded-2xl border-2 border-dashed border-slate-200 bg-white hover:border-slate-300 transition-all duration-200"
    >
      {/* Document Title */}
      <h3 className="text-base font-semibold text-slate-900 mb-2">
        {section.name}
      </h3>

      {/* Status Badge - Need to upload */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 mb-4">
        <Clock className="w-3.5 h-3.5" />
        <span>Need to upload</span>
      </div>

      {/* Document Illustration */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-16 h-16 flex-shrink-0 opacity-50">
          <Image
            src="/images/document-illustration.png"
            alt="Document placeholder"
            width={64}
            height={64}
            className="object-contain grayscale"
          />
        </div>
        <span className="text-xs text-slate-400">{fileTypes}</span>
      </div>

      {/* Upload Actions */}
      <div className="flex items-center gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors">
          <Upload className="w-4 h-4" />
          Upload
        </button>
        <button
          onClick={onRequestClient}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0E4369] hover:bg-[#0B3654] rounded-xl text-sm font-medium text-white transition-colors"
        >
          <Send className="w-4 h-4" />
          Request
        </button>
      </div>
    </motion.div>
  );
}

/**
 * Issue Card - Compact issue display
 */
function IssueCard({
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
  const severity = getSeverityConfig(issue.severity);
  const isResolved = issue.status === 'resolved';

  return (
    <div
      onClick={() => onViewDetails?.()}
      className={cn(
        'group relative bg-white rounded-xl transition-all duration-200 cursor-pointer',
        'border border-slate-200 hover:border-slate-300',
        'shadow-sm hover:shadow',
        isResolved && 'opacity-60',
        isSelected && !isResolved && 'ring-2 ring-slate-900 ring-offset-1'
      )}
    >
      <div className="px-4 py-3">
        <div className="flex items-start gap-3">
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

          <div className="flex-1 min-w-0">
            {/* Meta */}
            <div className="flex items-center gap-2 mb-1">
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
            </div>

            {/* Title */}
            <h3 className={cn(
              'text-sm font-semibold leading-tight',
              isResolved ? 'text-slate-400 line-through' : 'text-slate-900'
            )}>
              {issue.title}
            </h3>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}

/**
 * SectionContentArea - Main content area for selected section
 *
 * Design:
 * - Large section title
 * - Document requirement cards with clear upload status
 * - Issues list below documents
 */
export function SectionContentArea({
  section,
  documents,
  issues,
  completedMerges = [],
  onPreviewDocument,
  onResolveIssue,
  onRequestClient,
  onSelectIssue,
  className,
}: SectionContentAreaProps) {
  const [selectedIssueIds, setSelectedIssueIds] = useState<Set<string>>(new Set());

  // Filter open issues
  const openIssues = useMemo(() => {
    return issues.filter(i => i.status === 'open').sort((a, b) => {
      const severityOrder = { error: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [issues]);

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

  const handleRequestClient = useCallback(() => {
    onRequestClient(Array.from(selectedIssueIds));
    setSelectedIssueIds(new Set());
  }, [selectedIssueIds, onRequestClient]);

  // Content state
  const hasDocuments = documents.length > 0;
  const hasOpenIssues = openIssues.length > 0;
  const minRequired = section?.minCount ?? 1;
  const maxAllowed = section?.maxCount ?? 10;

  // No section selected
  if (!section) {
    return (
      <div className={cn('flex-1 flex items-center justify-center bg-slate-50', className)}>
        <p className="text-sm text-slate-400">Select a section to view details</p>
      </div>
    );
  }

  return (
    <div className={cn('flex-1 flex flex-col bg-slate-50 overflow-hidden', className)}>
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-10">
          {/* Hero Section Title */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            {/* Section Icon + Title */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0E4369]/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-7 h-7 text-[#0E4369]" />
              </div>
              <div className="flex-1 pt-1">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                  {section.name}
                </h1>
                {section.description && (
                  <p className="text-lg text-slate-500 mt-2 max-w-2xl leading-relaxed">
                    {section.description}
                  </p>
                )}
              </div>
            </div>

            {/* Progress indicator - more prominent */}
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-200/60">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900">{documents.length}</span>
                <span className="text-slate-400">/</span>
                <span className="text-lg text-slate-500">{minRequired} required</span>
              </div>
              {documents.length >= minRequired && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-semibold">Requirements met</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Document Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Uploaded Documents */}
            {documents.map((doc, index) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onPreview={() => onPreviewDocument(doc.id)}
              />
            ))}

            {/* Empty slots for remaining required documents */}
            {documents.length < minRequired && (
              Array.from({ length: minRequired - documents.length }).map((_, index) => (
                <EmptyDocumentCard
                  key={`empty-${index}`}
                  section={section}
                  onRequestClient={() => onRequestClient([])}
                />
              ))
            )}

            {/* Optional: Add more button when min is met but max not reached */}
            {documents.length >= minRequired && documents.length < maxAllowed && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full p-5 rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 hover:bg-white hover:border-slate-300 transition-all duration-200 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700"
              >
                <Upload className="w-5 h-5" />
                <span className="text-sm font-medium">Add more documents</span>
              </motion.button>
            )}
          </div>

          {/* Issues Section */}
          {hasOpenIssues && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Issues Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-semibold text-slate-900">
                    Issues to resolve
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                    {openIssues.length}
                  </span>
                </div>

                {selectedIssueIds.size > 0 && (
                  <div className="flex items-center gap-3">
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
                  </div>
                )}
              </div>

              {/* Issues Grid */}
              <div className="space-y-2">
                {openIssues.map((issue) => (
                  <IssueCard
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
            </motion.div>
          )}

          {/* All Clear State */}
          {!hasOpenIssues && hasDocuments && documents.length >= minRequired && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 px-6 bg-white rounded-2xl border border-slate-200"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">All Clear</h3>
              <p className="text-sm text-slate-500">
                All documents verified with no outstanding issues
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
