'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Shield,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileCheck,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Document, DocumentPipelineStatus } from '@/types';

interface SourceFile {
  id: string;
  name: string;
  uploadedAt?: string;
}

interface DocumentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  // For merged documents - source files
  sourceFiles?: SourceFile[];
  // Handler to view original evidence
  onViewOriginal?: (fileId: string) => void;
}

// Pipeline stages in order
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
 * High-Fidelity PDF Preview Mock
 * Simulates a real PDF document with realistic content
 */
function PdfPreviewMock({
  documentName,
  documentType,
  isOriginal = false,
}: {
  documentName: string;
  documentType?: string;
  isOriginal?: boolean;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const totalPages = 2;

  // Determine document content based on type
  const isPassport = documentName.toLowerCase().includes('passport');
  const isBankStatement = documentName.toLowerCase().includes('bank') || documentName.toLowerCase().includes('statement');
  const isEmployment = documentName.toLowerCase().includes('employment') || documentName.toLowerCase().includes('letter');

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
      <div className="flex-1 bg-slate-700 p-4 overflow-auto rounded-b-lg">
        <div
          className="mx-auto bg-white shadow-2xl transition-transform origin-top"
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
              <PassportContent isOriginal={isOriginal} />
            ) : isBankStatement ? (
              <BankStatementContent isOriginal={isOriginal} />
            ) : isEmployment ? (
              <EmploymentLetterContent isOriginal={isOriginal} />
            ) : (
              <GenericDocumentContent documentName={documentName} isOriginal={isOriginal} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PassportContent({ isOriginal }: { isOriginal: boolean }) {
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
          "w-32 h-40 rounded flex items-center justify-center",
          isOriginal ? "bg-slate-100 border-2 border-dashed border-slate-300" : "bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300"
        )}>
          {isOriginal ? (
            <span className="text-[10px] text-slate-400 text-center px-2">Photo<br/>Area</span>
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
              <p className="font-mono text-sm">15 MAR 1985</p>
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

function BankStatementContent({ isOriginal }: { isOriginal: boolean }) {
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
              <td className="py-2 text-right font-semibold">£24,521.45</td>
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

function EmploymentLetterContent({ isOriginal }: { isOriginal: boolean }) {
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
          His current annual salary is £82,000 (Eighty-Two Thousand Pounds Sterling),
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
 * Document Detail Modal
 * Shows document preview with Verified/Original toggle
 */
export function DocumentDetailModal({
  isOpen,
  onClose,
  document: doc,
  sourceFiles = [],
  onViewOriginal,
}: DocumentDetailModalProps) {
  const [activeView, setActiveView] = useState<'verified' | 'original'>('verified');

  // Reset view when document changes
  useEffect(() => {
    if (doc) {
      setActiveView('verified');
    }
  }, [doc?.id]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

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
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden"
        style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Header - Compact */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4 min-w-0">
            {/* Document Icon */}
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              isReady
                ? 'bg-emerald-100'
                : hasIssue
                ? 'bg-amber-100'
                : 'bg-slate-100'
            )}>
              <FileText className={cn(
                'w-5 h-5',
                isReady ? 'text-emerald-600' : hasIssue ? 'text-amber-600' : 'text-slate-500'
              )} />
            </div>

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

        {/* PDF Preview Area */}
        <div className="flex-1 overflow-hidden">
          <PdfPreviewMock
            documentName={doc.fileName || doc.name || 'Document'}
            documentType={doc.documentTypeId}
            isOriginal={activeView === 'original'}
          />
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
