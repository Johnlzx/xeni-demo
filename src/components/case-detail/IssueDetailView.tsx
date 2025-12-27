'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  Info,
  FileText,
  Check,
  Send,
  Sparkles,
  Clock,
  ChevronRight,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Eye,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Issue, Document, DocumentPipelineStatus } from '@/types';
import { RequestActivitySidebar, type ClientRequest } from './RequestActivitySidebar';

interface IssueDetailViewProps {
  issue: Issue;
  documents: Document[];
  onBack: () => void;
  onRequestClient: (issueIds: string[]) => void;
  onPreviewDocument: (docId: string) => void;
  activeRequest?: ClientRequest | null;
  onResendRequest?: () => void;
  onSendReminder?: () => void;
  className?: string;
}

function getSeverityConfig(severity: Issue['severity']) {
  switch (severity) {
    case 'error':
      return {
        icon: AlertTriangle,
        label: 'Critical',
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
      };
    case 'warning':
      return {
        icon: AlertCircle,
        label: 'Warning',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      };
    default:
      return {
        icon: Info,
        label: 'Notice',
        color: 'text-sky-600',
        bg: 'bg-sky-50',
        border: 'border-sky-200',
        dot: 'bg-sky-500',
      };
  }
}

function getDocumentStatusConfig(status: DocumentPipelineStatus) {
  switch (status) {
    case 'ready':
      return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Verified' };
    case 'quality_issue':
      return { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Quality Issue' };
    case 'conflict':
      return { icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Conflict' };
    case 'processing':
    case 'quality_check':
    case 'compliance_check':
      return { icon: Loader2, color: 'text-slate-500', bg: 'bg-slate-50', label: 'Processing' };
    default:
      return { icon: FileText, color: 'text-slate-400', bg: 'bg-slate-50', label: 'Uploading' };
  }
}

/**
 * Section Label - Refined divider with label
 */
function SectionLabel({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-center gap-3 mb-4"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
        {children}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
    </motion.div>
  );
}

/**
 * Document Card - Refined clickable document reference
 */
function DocumentCard({
  document,
  onClick,
  index,
}: {
  document: Document;
  onClick: () => void;
  index: number;
}) {
  const statusConfig = getDocumentStatusConfig(document.pipelineStatus);
  const StatusIcon = statusConfig.icon;
  const isProcessing = ['processing', 'quality_check', 'compliance_check'].includes(document.pipelineStatus);

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 + index * 0.05, duration: 0.3 }}
      onClick={onClick}
      className={cn(
        'group w-full flex items-center gap-3 p-3.5 rounded-lg border transition-all duration-200',
        'bg-white hover:bg-slate-50/80',
        'border-slate-150 hover:border-slate-250 hover:shadow-sm'
      )}
    >
      <div className={cn('w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0', statusConfig.bg)}>
        <StatusIcon className={cn('w-4 h-4', statusConfig.color, isProcessing && 'animate-spin')} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-[13px] font-medium text-slate-800 truncate group-hover:text-[#0E4369] transition-colors">
          {document.fileName || document.name}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">{statusConfig.label}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
    </motion.button>
  );
}

/**
 * Header Action Button
 */
function HeaderAction({
  icon: Icon,
  label,
  onClick,
  variant = 'secondary',
  disabled,
  showLabel = true,
}: {
  icon: typeof Check;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  showLabel?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md text-xs font-semibold transition-all',
        showLabel ? 'px-3 py-1.5' : 'p-1.5',
        variant === 'primary'
          ? 'bg-[#0E4369] text-white hover:bg-[#0c3a5a] shadow-sm'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {showLabel && label}
    </motion.button>
  );
}

/**
 * IssueDetailView - Refined issue detail page
 */
export function IssueDetailView({
  issue,
  documents,
  onBack,
  onRequestClient,
  onPreviewDocument,
  activeRequest,
  onResendRequest,
  onSendReminder,
  className,
}: IssueDetailViewProps) {
  const severity = getSeverityConfig(issue.severity);
  const SeverityIcon = severity.icon;
  const isResolved = issue.status === 'resolved';

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const relatedDocuments = useMemo(() => {
    return documents.filter(d => issue.documentIds?.includes(d.id));
  }, [documents, issue.documentIds]);

  const isMultiDocument = relatedDocuments.length > 1;

  const handleCloseSidebar = () => setIsSidebarOpen(false);
  const handleToggleSidebar = () => setIsSidebarOpen(prev => !prev);

  return (
    <div className={cn('flex-1 flex overflow-hidden', className)}>
      {/* Main Content Area */}
      <motion.div layout className="flex-1 flex flex-col bg-slate-50/50 overflow-hidden min-w-0">
        {/* Unified Header */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border-b border-slate-100"
        >
          {/* Top Row - Back Navigation */}
          <div className="px-6 pt-4 pb-2">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to section</span>
            </button>
          </div>

          {/* Main Header Row */}
          <div className="px-6 pb-4 flex items-start justify-between gap-4">
            {/* Left: Issue Info */}
            <div className="flex items-start gap-3 min-w-0 flex-1">
              {/* Compact Severity Icon */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 25 }}
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                  severity.bg
                )}
              >
                <SeverityIcon className={cn('w-4 h-4', severity.color)} />
              </motion.div>

              {/* Title & Meta */}
              <div className="min-w-0 flex-1">
                {/* Type Tag Only */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={cn(
                    'text-[9px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded',
                    issue.type === 'quality' ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-600'
                  )}>
                    {issue.type === 'quality' ? 'Quality' : 'Compliance'}
                  </span>
                  {isResolved && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      <Check className="w-2.5 h-2.5" />
                      Resolved
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className={cn(
                  'text-base font-semibold leading-snug tracking-[-0.01em]',
                  isResolved ? 'text-slate-400 line-through' : 'text-slate-800'
                )}>
                  {issue.title}
                </h1>

                {/* Affected Documents Count */}
                <p className="text-[11px] text-slate-400 mt-1">
                  {relatedDocuments.length} document{relatedDocuments.length !== 1 ? 's' : ''} affected
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="flex items-center gap-2 flex-shrink-0"
            >
              {/* Request Status Indicator */}
              {activeRequest && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleToggleSidebar}
                  className="inline-flex items-center gap-1.5 px-2 py-1 bg-sky-50 text-sky-600 rounded-md text-[10px] font-medium hover:bg-sky-100 transition-colors"
                >
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 bg-sky-500 rounded-full"
                  />
                  Pending
                </motion.button>
              )}

              {/* Request Client Button */}
              {!isResolved && !activeRequest && (
                <HeaderAction
                  icon={Send}
                  label="Request Client"
                  onClick={() => onRequestClient([issue.id])}
                  variant="primary"
                />
              )}

              {/* Activity Sidebar Toggle */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleToggleSidebar}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                  isSidebarOpen
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                Activity
              </motion.button>
            </motion.div>
          </div>
        </motion.header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
            {/* Description Section */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <SectionLabel delay={0.1}>Description</SectionLabel>
              <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
                <p className="text-[13px] text-slate-600 leading-[1.7] tracking-[0.01em]">
                  {issue.description}
                </p>

                {/* Conflict Details */}
                {issue.conflictDetails && (
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                        Data Conflict
                      </span>
                      <span className="text-[10px] text-slate-300">·</span>
                      <span className="text-[11px] font-medium text-slate-500">
                        {issue.conflictDetails.field}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-slate-400 mb-1.5">
                          {issue.conflictDetails.sourceA}
                        </p>
                        <p className="text-sm font-mono text-slate-700 tracking-tight">
                          {issue.conflictDetails.valueA}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-slate-400 mb-1.5">
                          {issue.conflictDetails.sourceB}
                        </p>
                        <p className="text-sm font-mono text-slate-700 tracking-tight">
                          {issue.conflictDetails.valueB}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.section>

            {/* Related Documents */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <SectionLabel delay={0.15}>
                Related Documents
                {isMultiDocument && (
                  <span className="ml-2 text-[9px] font-medium text-slate-300 normal-case tracking-normal">
                    Cross-document
                  </span>
                )}
              </SectionLabel>

              <div className={cn('grid gap-2', isMultiDocument ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1')}>
                {relatedDocuments.map((doc, index) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onClick={() => onPreviewDocument(doc.id)}
                    index={index}
                  />
                ))}

                {relatedDocuments.length === 0 && (
                  <div className="p-8 bg-white rounded-xl border border-dashed border-slate-200 text-center">
                    <FileText className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">No documents linked</p>
                  </div>
                )}
              </div>
            </motion.section>

            {/* AI Recommendation */}
            {issue.aiRecommendation && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
              >
                <SectionLabel delay={0.2}>AI Recommendation</SectionLabel>
                <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-xl border border-slate-100 p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-md bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-150 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-slate-600 leading-[1.7]">
                        {issue.aiRecommendation.message}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={cn(
                          'text-[9px] font-semibold uppercase tracking-[0.04em] px-1.5 py-0.5 rounded',
                          issue.aiRecommendation.priority === 'high' && 'bg-rose-50 text-rose-500',
                          issue.aiRecommendation.priority === 'medium' && 'bg-amber-50 text-amber-500',
                          issue.aiRecommendation.priority === 'low' && 'bg-slate-100 text-slate-400'
                        )}>
                          {issue.aiRecommendation.priority} priority
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Activity Timeline */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <SectionLabel delay={0.25}>Activity</SectionLabel>
              <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
                <div className="space-y-4">
                  {/* Timeline Item */}
                  <div className="relative flex gap-3 pl-1">
                    <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gradient-to-b from-slate-200 to-transparent" />
                    <div className="relative z-10 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-2.5 h-2.5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[13px] text-slate-600">Issue detected by AI verification</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">2 hours ago</p>
                    </div>
                  </div>

                  {/* Request Sent (if applicable) */}
                  {activeRequest && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="relative flex gap-3 pl-1"
                    >
                      <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gradient-to-b from-sky-200 to-transparent" />
                      <div className="relative z-10 w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Send className="w-2.5 h-2.5 text-sky-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] text-slate-600">Client request sent via {activeRequest.channel}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Just now</p>
                      </div>
                      <button
                        onClick={handleToggleSidebar}
                        className="text-[10px] font-medium text-sky-500 hover:text-sky-600 transition-colors"
                      >
                        View details →
                      </button>
                    </motion.div>
                  )}

                  {/* Current Status */}
                  <div className="relative flex gap-3 pl-1">
                    <div className="relative z-10 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-2.5 h-2.5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[13px] text-slate-600">
                        {activeRequest ? 'Awaiting client response' : 'Awaiting review'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Current status</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </motion.div>

      {/* Activity Sidebar */}
      <RequestActivitySidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        request={activeRequest || null}
        onResend={onResendRequest || (() => {})}
        onSendReminder={onSendReminder || (() => {})}
      />
    </div>
  );
}
