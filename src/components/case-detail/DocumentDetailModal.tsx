'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Shield,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileCheck,
  Layers,
  Info,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Document, DocumentPipelineStatus, Issue } from '@/types';

interface SourceFile {
  id: string;
  name: string;
  uploadedAt?: string;
}

interface DocumentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  sourceFiles?: SourceFile[];
  onViewOriginal?: (fileId: string) => void;
  // New: issues related to this document
  issues?: Issue[];
}

// Mock issue location data - maps issue IDs to document locations
const ISSUE_LOCATIONS: Record<string, { line: number; field: string; highlightText: string }> = {
  'issue-001': { line: 3, field: 'Photo Area', highlightText: 'Photo Area' },
  'issue-002': { line: 8, field: 'Date of Birth', highlightText: '15 MAR 1985' },
  'issue-003': { line: 12, field: 'Salary Line', highlightText: '£82,000' },
  'issue-004': { line: 5, field: 'Account Balance', highlightText: '£24,521.45' },
};

// Pipeline stages
const PIPELINE_STAGES: { status: DocumentPipelineStatus; label: string; icon: typeof Clock }[] = [
  { status: 'uploading', label: 'Upload', icon: Clock },
  { status: 'processing', label: 'Processing', icon: Sparkles },
  { status: 'quality_check', label: 'Quality', icon: FileCheck },
  { status: 'compliance_check', label: 'Compliance', icon: Shield },
  { status: 'ready', label: 'Certified', icon: CheckCircle2 },
];

function getStageIndex(status: DocumentPipelineStatus): number {
  const map: Record<DocumentPipelineStatus, number> = {
    uploading: 0,
    processing: 1,
    quality_check: 2,
    quality_issue: 2,
    compliance_check: 3,
    conflict: 3,
    ready: 4,
  };
  return map[status] ?? 0;
}

function getStatusColor(status: DocumentPipelineStatus) {
  switch (status) {
    case 'ready':
      return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    case 'quality_issue':
    case 'conflict':
      return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    default:
      return { text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' };
  }
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getSeverityConfig(severity: Issue['severity']) {
  switch (severity) {
    case 'error':
      return {
        icon: AlertTriangle,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        ring: 'ring-rose-400',
      };
    case 'warning':
      return {
        icon: AlertCircle,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        ring: 'ring-amber-400',
      };
    default:
      return {
        icon: Info,
        color: 'text-sky-600',
        bg: 'bg-sky-50',
        border: 'border-sky-200',
        ring: 'ring-sky-400',
      };
  }
}

/**
 * Pipeline Progress - Compact horizontal
 */
function PipelineProgress({ currentStatus }: { currentStatus: DocumentPipelineStatus }) {
  const currentIndex = getStageIndex(currentStatus);
  const hasIssue = currentStatus === 'quality_issue' || currentStatus === 'conflict';

  return (
    <div className="flex items-center gap-1">
      {PIPELINE_STAGES.map((stage, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={stage.status} className="flex items-center gap-1">
            <div
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                isCompleted && 'bg-emerald-500',
                isCurrent && !hasIssue && 'bg-emerald-500 ring-2 ring-emerald-200',
                isCurrent && hasIssue && 'bg-amber-500 ring-2 ring-amber-200',
                !isCompleted && !isCurrent && 'bg-slate-200'
              )}
            />
            {index < PIPELINE_STAGES.length - 1 && (
              <div className={cn(
                'w-4 h-0.5',
                isCompleted ? 'bg-emerald-300' : 'bg-slate-200'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Issue Highlight Overlay - Animated highlight on document
 */
function IssueHighlight({
  issue,
  isActive,
  position,
}: {
  issue: Issue;
  isActive: boolean;
  position: { top: number; left: number; width: number; height: number };
}) {
  const severity = getSeverityConfig(issue.severity);

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="absolute pointer-events-none"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        height: position.height,
      }}
    >
      {/* Pulsing ring effect */}
      <motion.div
        className={cn('absolute inset-0 rounded', severity.bg)}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: [0.6, 0.3, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Border highlight */}
      <motion.div
        className={cn('absolute inset-0 rounded ring-2', severity.ring)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
    </motion.div>
  );
}

/**
 * Issue Annotation Card - Floating card next to highlight
 */
function IssueAnnotation({
  issue,
  isActive,
  position,
  onClose,
}: {
  issue: Issue;
  isActive: boolean;
  position: { top: number; right: number };
  onClose: () => void;
}) {
  const severity = getSeverityConfig(issue.severity);
  const Icon = severity.icon;

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.1 }}
      className={cn(
        'absolute z-30 w-64 p-3 rounded-lg shadow-xl border',
        'bg-white/95 backdrop-blur-sm',
        severity.border
      )}
      style={{
        top: position.top,
        right: position.right,
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-2">
        <div className={cn('p-1.5 rounded', severity.bg)}>
          <Icon className={cn('w-3.5 h-3.5', severity.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-900 leading-tight">
            {issue.title}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {issue.type === 'quality' ? 'Quality Issue' : 'Compliance Issue'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 -mr-1 -mt-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Description */}
      <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
        {issue.description}
      </p>

      {/* AI Recommendation */}
      {issue.aiRecommendation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 0.2 }}
          className="pt-2 border-t border-slate-100"
        >
          <div className="flex items-center gap-1 mb-1">
            <Sparkles className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-medium text-slate-500">AI Suggestion</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            {issue.aiRecommendation.message}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Issue Navigator - Sidebar list of issues
 */
function IssueNavigator({
  issues,
  activeIssueId,
  onSelectIssue,
}: {
  issues: Issue[];
  activeIssueId: string | null;
  onSelectIssue: (issueId: string | null) => void;
}) {
  if (issues.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="absolute right-4 top-4 w-56 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 overflow-hidden z-20"
    >
      {/* Header */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-semibold text-slate-700">
            {issues.length} Issue{issues.length > 1 ? 's' : ''} Found
          </span>
        </div>
      </div>

      {/* Issue List */}
      <div className="max-h-64 overflow-y-auto">
        {issues.map((issue, index) => {
          const severity = getSeverityConfig(issue.severity);
          const Icon = severity.icon;
          const isActive = activeIssueId === issue.id;

          return (
            <motion.button
              key={issue.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onClick={() => onSelectIssue(isActive ? null : issue.id)}
              className={cn(
                'w-full text-left px-3 py-2.5 border-b border-slate-100 last:border-0',
                'transition-all duration-200',
                isActive
                  ? cn(severity.bg, 'border-l-2', severity.border.replace('border-', 'border-l-'))
                  : 'hover:bg-slate-50'
              )}
            >
              <div className="flex items-start gap-2">
                <Icon className={cn('w-3.5 h-3.5 mt-0.5 flex-shrink-0', severity.color)} />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-xs font-medium leading-tight truncate',
                    isActive ? 'text-slate-900' : 'text-slate-700'
                  )}>
                    {issue.title}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                    {issue.type === 'quality' ? 'Quality' : 'Compliance'}
                  </p>
                </div>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5"
                  />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 text-center">
          Click issue to locate in document
        </p>
      </div>
    </motion.div>
  );
}

/**
 * High-Fidelity PDF Preview with Issue Highlighting
 */
function PdfPreviewMock({
  documentName,
  documentType,
  isOriginal = false,
  issues = [],
  activeIssueId,
  onClearActiveIssue,
}: {
  documentName: string;
  documentType?: string;
  isOriginal?: boolean;
  issues?: Issue[];
  activeIssueId: string | null;
  onClearActiveIssue: () => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const contentRef = useRef<HTMLDivElement>(null);
  const totalPages = 2;

  // Determine document content based on type
  const isPassport = documentName.toLowerCase().includes('passport');
  const isBankStatement = documentName.toLowerCase().includes('bank') || documentName.toLowerCase().includes('statement');
  const isEmployment = documentName.toLowerCase().includes('employment') || documentName.toLowerCase().includes('letter');

  // Get active issue
  const activeIssue = issues.find(i => i.id === activeIssueId) || null;
  const activeLocation = activeIssueId ? ISSUE_LOCATIONS[activeIssueId] : null;

  // Scroll to highlighted area when issue is selected
  useEffect(() => {
    if (activeIssueId && contentRef.current) {
      const highlightElement = contentRef.current.querySelector('[data-issue-highlight="true"]');
      if (highlightElement) {
        highlightElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIssueId]);

  return (
    <div className="flex flex-col h-full">
      {/* PDF Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 rounded-t-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-300 font-mono">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(50, zoom - 25))}
            className="p-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-300 font-mono w-12 text-center">
            {zoom}%
          </span>
          <button
            onClick={() => setZoom(Math.min(150, zoom + 25))}
            className="p-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-slate-600 mx-1" />
          <button className="p-1.5 text-slate-400 hover:text-white transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="flex-1 bg-slate-700 p-4 overflow-auto rounded-b-lg relative" ref={contentRef}>
        <div
          className="mx-auto bg-white shadow-2xl transition-transform origin-top relative"
          style={{
            width: `${(595 * zoom) / 100}px`,
            minHeight: `${(842 * zoom) / 100}px`,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
          }}
        >
          {/* Paper content */}
          <div className="p-8 font-serif text-sm leading-relaxed text-slate-800">
            {isPassport ? (
              <PassportContent
                isOriginal={isOriginal}
                activeIssue={activeIssue}
                activeLocation={activeLocation}
              />
            ) : isBankStatement ? (
              <BankStatementContent
                isOriginal={isOriginal}
                activeIssue={activeIssue}
                activeLocation={activeLocation}
              />
            ) : isEmployment ? (
              <EmploymentLetterContent
                isOriginal={isOriginal}
                activeIssue={activeIssue}
                activeLocation={activeLocation}
              />
            ) : (
              <GenericDocumentContent
                documentName={documentName}
                isOriginal={isOriginal}
              />
            )}
          </div>
        </div>

        {/* Issue Annotation Card */}
        <AnimatePresence>
          {activeIssue && (
            <IssueAnnotation
              issue={activeIssue}
              isActive={true}
              position={{ top: 100, right: 20 }}
              onClose={onClearActiveIssue}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Highlighted Text Component
 */
function HighlightedText({
  children,
  isHighlighted,
  severity = 'warning',
}: {
  children: React.ReactNode;
  isHighlighted: boolean;
  severity?: 'error' | 'warning' | 'info';
}) {
  if (!isHighlighted) return <>{children}</>;

  const config = getSeverityConfig(severity);

  return (
    <motion.span
      data-issue-highlight="true"
      initial={{ backgroundColor: 'transparent' }}
      animate={{
        backgroundColor: severity === 'error' ? 'rgba(254, 202, 202, 0.8)' : 'rgba(254, 243, 199, 0.8)',
      }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative inline-block px-1 -mx-1 rounded',
        'ring-2',
        config.ring
      )}
    >
      {children}
      {/* Animated underline */}
      <motion.span
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'absolute bottom-0 left-0 right-0 h-0.5',
          severity === 'error' ? 'bg-rose-500' : 'bg-amber-500'
        )}
        style={{ transformOrigin: 'left' }}
      />
    </motion.span>
  );
}

function PassportContent({
  isOriginal,
  activeIssue,
  activeLocation,
}: {
  isOriginal: boolean;
  activeIssue: Issue | null;
  activeLocation: { line: number; field: string; highlightText: string } | null;
}) {
  const highlightField = activeLocation?.field;

  return (
    <div className="space-y-6">
      {/* Passport Header */}
      <div className="text-center border-b-2 border-slate-300 pb-4">
        <p className="text-xs text-slate-500 uppercase tracking-[0.3em] mb-1">United Kingdom</p>
        <h1 className="text-xl font-bold text-[#0E4369] tracking-wide">PASSPORT</h1>
        <p className="text-[10px] text-slate-400 mt-1">PASSEPORT</p>
      </div>

      {/* Photo and MRZ area mock */}
      <div className="flex gap-6">
        <div className={cn(
          "w-32 h-40 rounded flex items-center justify-center relative",
          isOriginal ? "bg-slate-100 border-2 border-dashed border-slate-300" : "bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300",
          highlightField === 'Photo Area' && "ring-2 ring-amber-400"
        )}>
          {isOriginal ? (
            <HighlightedText isHighlighted={highlightField === 'Photo Area'}>
              <span className="text-[10px] text-slate-400 text-center px-2">Photo<br/>Area</span>
            </HighlightedText>
          ) : (
            <div className="w-20 h-24 bg-slate-300 rounded" />
          )}
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-[10px] text-slate-400 uppercase">Surname / Nom</p>
            <p className="font-semibold text-slate-900">CHEN</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase">Given Names / Prénoms</p>
            <p className="font-semibold text-slate-900">JAMES WEI</p>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Date of Birth</p>
              <p className="font-mono text-sm">
                <HighlightedText isHighlighted={highlightField === 'Date of Birth'}>
                  15 MAR 1985
                </HighlightedText>
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Sex</p>
              <p className="font-mono text-sm">M</p>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase">Nationality</p>
            <p className="font-semibold text-slate-900">BRITISH CITIZEN</p>
          </div>
        </div>
      </div>

      {/* MRZ Zone */}
      <div className="mt-8 p-3 bg-slate-50 border border-slate-200 font-mono text-xs tracking-wider">
        <p>P&lt;GBRCHEN&lt;&lt;JAMES&lt;WEI&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
        <p>9876543210GBR8503152M3001019&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;04</p>
      </div>

      {isOriginal && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            Original scan - may contain quality issues
          </p>
        </div>
      )}
    </div>
  );
}

function BankStatementContent({
  isOriginal,
  activeIssue,
  activeLocation,
}: {
  isOriginal: boolean;
  activeIssue: Issue | null;
  activeLocation: { line: number; field: string; highlightText: string } | null;
}) {
  const highlightField = activeLocation?.field;

  return (
    <div className="space-y-6">
      {/* Bank Header */}
      <div className="flex items-start justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="w-12 h-12 bg-[#0E4369] rounded-lg flex items-center justify-center mb-2">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <p className="text-lg font-bold text-[#0E4369]">Barclays</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold">BANK STATEMENT</p>
          <p className="text-slate-500">Statement Period</p>
          <p className="font-mono">01 Dec 2024 - 31 Dec 2024</p>
        </div>
      </div>

      {/* Account Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate-500 text-xs">Account Holder</p>
          <p className="font-semibold">Mr James W Chen</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs">Account Number</p>
          <p className="font-mono">****4521</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs">Sort Code</p>
          <p className="font-mono">20-45-67</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs">Statement Number</p>
          <p className="font-mono">142</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="mt-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-300">
              <th className="text-left py-2 text-slate-500 font-medium">Date</th>
              <th className="text-left py-2 text-slate-500 font-medium">Description</th>
              <th className="text-right py-2 text-slate-500 font-medium">Out</th>
              <th className="text-right py-2 text-slate-500 font-medium">In</th>
              <th className="text-right py-2 text-slate-500 font-medium">Balance</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            <tr className="border-b border-slate-100">
              <td className="py-2">01 Dec</td>
              <td className="py-2">Opening Balance</td>
              <td className="py-2 text-right"></td>
              <td className="py-2 text-right"></td>
              <td className="py-2 text-right font-semibold">
                <HighlightedText isHighlighted={highlightField === 'Account Balance'}>
                  £24,521.45
                </HighlightedText>
              </td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2">03 Dec</td>
              <td className="py-2">SALARY - TECH CORP LTD</td>
              <td className="py-2 text-right"></td>
              <td className="py-2 text-right text-emerald-600">£6,850.00</td>
              <td className="py-2 text-right">£31,371.45</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2">05 Dec</td>
              <td className="py-2">MORTGAGE - HALIFAX</td>
              <td className="py-2 text-right text-rose-600">£1,450.00</td>
              <td className="py-2 text-right"></td>
              <td className="py-2 text-right">£29,921.45</td>
            </tr>
          </tbody>
        </table>
      </div>

      {isOriginal && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            Original scan - unverified bank statement
          </p>
        </div>
      )}
    </div>
  );
}

function EmploymentLetterContent({
  isOriginal,
  activeIssue,
  activeLocation,
}: {
  isOriginal: boolean;
  activeIssue: Issue | null;
  activeLocation: { line: number; field: string; highlightText: string } | null;
}) {
  const highlightField = activeLocation?.field;

  return (
    <div className="space-y-6">
      {/* Company Letterhead */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0E4369]">Tech Corp Ltd</h1>
            <p className="text-xs text-slate-500 mt-1">
              123 Innovation Way, London EC2A 4BX
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Tel: +44 20 7123 4567</p>
            <p>hr@techcorp.co.uk</p>
          </div>
        </div>
      </div>

      {/* Letter Content */}
      <div className="space-y-4 text-sm">
        <p className="text-right">15th December 2024</p>

        <div>
          <p>To Whom It May Concern</p>
        </div>

        <div>
          <p className="font-semibold mb-2">RE: Employment Confirmation - Mr James W Chen</p>
        </div>

        <p>
          I am writing to confirm that Mr James Wei Chen has been employed by Tech Corp Ltd
          since 1st March 2019. He currently holds the position of Senior Software Engineer
          within our Engineering department.
        </p>

        <p>
          His current annual salary is{' '}
          <HighlightedText isHighlighted={highlightField === 'Salary Line'}>
            £82,000
          </HighlightedText>{' '}
          (Eighty-Two Thousand Pounds Sterling),
          payable monthly. This position is permanent and full-time.
        </p>

        <div className="py-4">
          <p>Employment Details:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Start Date: 1st March 2019</li>
            <li>Position: Senior Software Engineer</li>
            <li>Employment Type: Permanent, Full-time</li>
            <li>Annual Salary: £82,000</li>
          </ul>
        </div>

        <p>
          Should you require any further information, please do not hesitate to contact
          our Human Resources department.
        </p>

        <div className="pt-6">
          <p>Yours faithfully,</p>
          <div className="h-12 flex items-end">
            <span className="font-script text-xl text-slate-600 italic">Sarah Mitchell</span>
          </div>
          <p className="font-semibold">Sarah Mitchell</p>
          <p className="text-xs text-slate-500">Head of Human Resources</p>
        </div>
      </div>

      {isOriginal && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            Original scan - awaiting employer verification
          </p>
        </div>
      )}
    </div>
  );
}

function GenericDocumentContent({ documentName, isOriginal }: { documentName: string; isOriginal: boolean }) {
  return (
    <div className="space-y-6">
      <div className="text-center border-b border-slate-200 pb-4">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <h1 className="text-lg font-semibold text-slate-700">{documentName}</h1>
        <p className="text-xs text-slate-400 mt-1">Legal Document</p>
      </div>

      <div className="space-y-4 text-sm text-slate-600">
        <p>This is a verified legal document that has been processed through our AI-powered verification pipeline.</p>
        <p>Document contents have been extracted, validated, and cross-referenced against known data sources.</p>
      </div>

      {isOriginal && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            Original evidence file
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Document Detail Modal with Issue Navigation
 */
export function DocumentDetailModal({
  isOpen,
  onClose,
  document: doc,
  sourceFiles = [],
  onViewOriginal,
  issues = [],
}: DocumentDetailModalProps) {
  const [activeView, setActiveView] = useState<'verified' | 'original'>('verified');
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);

  // Filter issues related to this document
  const documentIssues = useMemo(() => {
    if (!doc) return [];
    return issues.filter(i => i.documentIds?.includes(doc.id) && i.status === 'open');
  }, [issues, doc]);

  // Reset state when document changes
  useEffect(() => {
    if (doc) {
      setActiveView('verified');
      setActiveIssueId(null);
    }
  }, [doc?.id]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeIssueId) {
          setActiveIssueId(null);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, activeIssueId]);

  const statusColor = useMemo(() => {
    return doc ? getStatusColor(doc.pipelineStatus) : getStatusColor('processing');
  }, [doc?.pipelineStatus]);

  const isReady = doc?.pipelineStatus === 'ready';
  const hasIssue = doc?.pipelineStatus === 'quality_issue' || doc?.pipelineStatus === 'conflict';
  const isMerged = sourceFiles.length > 0;

  if (!isOpen || !doc) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header - Compact */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4 min-w-0">
            {/* Document Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                isReady
                  ? 'bg-emerald-100'
                  : hasIssue
                  ? 'bg-amber-100'
                  : 'bg-slate-100'
              )}
            >
              <FileText className={cn(
                'w-5 h-5',
                isReady ? 'text-emerald-600' : hasIssue ? 'text-amber-600' : 'text-slate-500'
              )} />
            </motion.div>

            {/* Info */}
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900 truncate">
                {doc.fileName || doc.name}
              </h2>
              <div className="flex items-center gap-3 mt-0.5">
                {doc.fileSize && (
                  <span className="text-xs text-slate-500">{formatFileSize(doc.fileSize)}</span>
                )}
                <PipelineProgress currentStatus={doc.pipelineStatus} />
                {isMerged && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                    <Layers className="w-2.5 h-2.5" />
                    {sourceFiles.length} sources
                  </span>
                )}
                {documentIssues.length > 0 && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700"
                  >
                    <AlertTriangle className="w-2.5 h-2.5" />
                    {documentIssues.length} issue{documentIssues.length > 1 ? 's' : ''}
                  </motion.span>
                )}
              </div>
            </div>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Toggle */}
        <div className="px-5 py-3 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex p-0.5 bg-slate-100 rounded-lg">
              <button
                onClick={() => setActiveView('verified')}
                className={cn(
                  'px-4 py-1.5 text-xs font-medium rounded-md transition-all',
                  activeView === 'verified'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Document
                </span>
              </button>
              <button
                onClick={() => setActiveView('original')}
                className={cn(
                  'px-4 py-1.5 text-xs font-medium rounded-md transition-all',
                  activeView === 'original'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Original Evidence
                </span>
              </button>
            </div>

            {/* Status Badge */}
            <span className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
              statusColor.bg, statusColor.text, 'border', statusColor.border
            )}>
              {isReady ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : hasIssue ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              {isReady ? 'Certified' : hasIssue ? 'Has Issues' : 'Processing'}
            </span>
          </div>
        </div>

        {/* PDF Preview Area with Issue Navigator */}
        <div className="flex-1 overflow-hidden relative">
          <PdfPreviewMock
            documentName={doc.fileName || doc.name || 'Document'}
            documentType={doc.documentTypeId}
            isOriginal={activeView === 'original'}
            issues={documentIssues}
            activeIssueId={activeIssueId}
            onClearActiveIssue={() => setActiveIssueId(null)}
          />

          {/* Issue Navigator Overlay */}
          <AnimatePresence>
            {documentIssues.length > 0 && (
              <IssueNavigator
                issues={documentIssues}
                activeIssueId={activeIssueId}
                onSelectIssue={setActiveIssueId}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
