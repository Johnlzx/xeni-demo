'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Check,
  ChevronDown,
  ChevronRight,
  Sparkles,
  FileStack,
  GitMerge,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  Star,
  Info,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Document, EvidenceSlotTemplate, DocumentPipelineStatus } from '@/types';
import type { MergeSuggestion } from '@/services/mergeDetection';

interface SectionOverviewProps {
  section: EvidenceSlotTemplate;
  documents: Document[];
  completedMerges?: MergeSuggestion[];
  onPreviewDocument: (docId: string) => void;
  className?: string;
}

// Document status helpers
function getStatusConfig(status: DocumentPipelineStatus) {
  switch (status) {
    case 'ready':
      return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Verified' };
    case 'quality_issue':
      return { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Needs Review' };
    case 'conflict':
      return { icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Conflict' };
    case 'processing':
    case 'quality_check':
    case 'compliance_check':
      return { icon: Clock, color: 'text-slate-500', bg: 'bg-slate-50', label: 'Processing' };
    default:
      return { icon: FileText, color: 'text-slate-400', bg: 'bg-slate-50', label: 'Uploading' };
  }
}

/**
 * Document Card - Compact card for document display
 */
function DocumentCard({
  document,
  isMerged,
  sourceCount,
  onPreview,
}: {
  document: Document;
  isMerged?: boolean;
  sourceCount?: number;
  onPreview: () => void;
}) {
  const status = getStatusConfig(document.pipelineStatus);
  const StatusIcon = status.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onPreview}
      className={cn(
        'group relative w-full text-left p-3 rounded-xl transition-all duration-200',
        'border border-slate-200 hover:border-slate-300',
        'bg-white hover:bg-slate-50/50',
        'hover:shadow-sm'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
          isMerged ? 'bg-violet-50' : status.bg
        )}>
          {isMerged ? (
            <GitMerge className="w-5 h-5 text-violet-600" />
          ) : (
            <StatusIcon className={cn('w-5 h-5', status.color)} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-900 truncate group-hover:text-[#0E4369]">
              {document.fileName || document.name}
            </p>
            {isMerged && (
              <span className="px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 text-[10px] font-semibold">
                Merged
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn('text-[11px] font-medium', status.color)}>
              {status.label}
            </span>
            {sourceCount && sourceCount > 1 && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] text-slate-500">
                  {sourceCount} source files
                </span>
              </>
            )}
          </div>
        </div>

        {/* Preview indicator */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Eye className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </motion.button>
  );
}

/**
 * Schema Requirement Item
 */
function SchemaRequirement({
  requirement,
  index,
}: {
  requirement: string;
  index: number;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-start gap-2 text-[11px] text-slate-600"
    >
      <Check className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
      <span>{requirement}</span>
    </motion.li>
  );
}

/**
 * Acceptable Type Card - Shows an acceptable document type from the schema
 */
function AcceptableTypeCard({
  type,
  index,
  isPreferred,
}: {
  type: {
    typeId: string;
    label: string;
    description: string;
    requirements: string[];
    isPreferred?: boolean;
  };
  index: number;
  isPreferred?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'rounded-xl border transition-all duration-200',
        isPreferred
          ? 'border-primary-200 bg-primary-50/30'
          : 'border-slate-200 bg-white'
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left px-4 py-3 flex items-start gap-3"
      >
        {/* Icon */}
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          isPreferred ? 'bg-primary-100' : 'bg-slate-100'
        )}>
          <FileText className={cn(
            'w-4 h-4',
            isPreferred ? 'text-primary-600' : 'text-slate-500'
          )} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-900">
              {type.label}
            </span>
            {isPreferred && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-semibold">
                <Star className="w-2.5 h-2.5" />
                Preferred
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            {type.description}
          </p>
        </div>

        {/* Expand indicator */}
        <ChevronDown className={cn(
          'w-4 h-4 text-slate-400 transition-transform flex-shrink-0',
          isExpanded && 'rotate-180'
        )} />
      </button>

      {/* Requirements (expanded) */}
      <AnimatePresence>
        {isExpanded && type.requirements.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-1 border-t border-slate-100 ml-11">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Requirements
              </p>
              <ul className="space-y-1.5">
                {type.requirements.map((req, i) => (
                  <SchemaRequirement key={i} requirement={req} index={i} />
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Collapsible Section
 */
function CollapsibleSection({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  defaultOpen = true,
  badge,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors"
      >
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
          iconColor
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            {badge}
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        <ChevronRight className={cn(
          'w-5 h-5 text-slate-400 transition-transform',
          isOpen && 'rotate-90'
        )} />
      </button>

      {/* Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-slate-100">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * SectionOverview - Displays documents and schema for a section
 */
export function SectionOverview({
  section,
  documents,
  completedMerges = [],
  onPreviewDocument,
  className,
}: SectionOverviewProps) {
  // Separate original and merged documents
  const { originalDocs, verifiedDocs, mergeMap } = useMemo(() => {
    // Build a map of which documents are source files for merges
    const mergedSourceIds = new Set<string>();
    const mergeResults: Array<{ merge: MergeSuggestion; virtualDoc: Document }> = [];

    completedMerges.forEach(merge => {
      if (merge.status === 'accepted') {
        merge.fileIds.forEach(id => mergedSourceIds.add(id));
        // Create a virtual document for the merge result
        mergeResults.push({
          merge,
          virtualDoc: {
            id: merge.id,
            caseId: documents[0]?.caseId || '',
            name: merge.suggestedName,
            fileName: merge.suggestedName,
            category: 'other',
            status: 'approved',
            documentTypeId: 'merged',
            fileType: 'application/pdf',
            fileSize: 0,
            pipelineStatus: 'ready',
            uploadedAt: new Date().toISOString(),
          },
        });
      }
    });

    // Original docs = not part of any merge
    const originals = documents.filter(d => !mergedSourceIds.has(d.id));

    // Verified docs = ready status docs that aren't source files + merged results
    const verified = [
      ...originals.filter(d => d.pipelineStatus === 'ready'),
      ...mergeResults.map(r => r.virtualDoc),
    ];

    return {
      originalDocs: documents, // All original uploads
      verifiedDocs: verified,
      mergeMap: new Map(mergeResults.map(r => [r.merge.id, r.merge.fileIds.length])),
    };
  }, [documents, completedMerges]);

  // Stats
  const stats = useMemo(() => ({
    total: documents.length,
    verified: verifiedDocs.length,
    pending: documents.filter(d => d.pipelineStatus !== 'ready').length,
    minRequired: section.minCount ?? 1,
    maxAllowed: section.maxCount ?? 99,
  }), [documents, verifiedDocs, section]);

  // If no documents and minimal schema info, show condensed view
  if (documents.length === 0) {
    return (
      <div className={cn('px-6 py-4', className)}>
        <CollapsibleSection
          title="Evidence Requirements"
          subtitle={`${section.acceptableTypes.length} acceptable document types`}
          icon={ClipboardList}
          iconColor="bg-slate-100 text-slate-600"
          defaultOpen={true}
        >
          <div className="mt-3 space-y-2">
            {section.acceptableTypes.map((type, index) => (
              <AcceptableTypeCard
                key={type.typeId}
                type={type}
                index={index}
                isPreferred={type.isPreferred}
              />
            ))}
          </div>
        </CollapsibleSection>
      </div>
    );
  }

  return (
    <div className={cn('px-6 py-4 space-y-4', className)}>
      {/* Documents Section - Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original Documents */}
        <CollapsibleSection
          title="Original Documents"
          subtitle="Uploaded source files"
          icon={FileStack}
          iconColor="bg-slate-100 text-slate-600"
          defaultOpen={true}
          badge={
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
              {originalDocs.length}
            </span>
          }
        >
          <div className="mt-3 space-y-2">
            {originalDocs.length > 0 ? (
              originalDocs.map(doc => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onPreview={() => onPreviewDocument(doc.id)}
                />
              ))
            ) : (
              <div className="py-6 text-center">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No documents uploaded</p>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Verified Documents */}
        <CollapsibleSection
          title="Verified Documents"
          subtitle="AI-processed and merged"
          icon={Sparkles}
          iconColor="bg-emerald-50 text-emerald-600"
          defaultOpen={true}
          badge={
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">
              {verifiedDocs.length}
            </span>
          }
        >
          <div className="mt-3 space-y-2">
            {verifiedDocs.length > 0 ? (
              verifiedDocs.map(doc => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  isMerged={mergeMap.has(doc.id)}
                  sourceCount={mergeMap.get(doc.id)}
                  onPreview={() => onPreviewDocument(doc.id)}
                />
              ))
            ) : (
              <div className="py-6 text-center">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Processing documents...</p>
              </div>
            )}
          </div>
        </CollapsibleSection>
      </div>

      {/* Schema Section */}
      <CollapsibleSection
        title="Evidence Schema"
        subtitle={`${section.acceptableTypes.length} acceptable types · ${stats.minRequired} required`}
        icon={Layers}
        iconColor="bg-violet-50 text-violet-600"
        defaultOpen={false}
        badge={
          stats.verified >= stats.minRequired ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" />
              Satisfied
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold">
              {stats.minRequired - stats.verified} more needed
            </span>
          )
        }
      >
        {/* Progress indicator */}
        <div className="mt-3 mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600">Section Progress</span>
            <span className="text-xs font-semibold text-slate-900">
              {stats.verified} / {stats.minRequired}
              {stats.maxAllowed < 99 && ` (max ${stats.maxAllowed})`}
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (stats.verified / stats.minRequired) * 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full',
                stats.verified >= stats.minRequired ? 'bg-emerald-500' : 'bg-primary-500'
              )}
            />
          </div>
        </div>

        {/* Acceptable Types */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Acceptable Document Types
          </p>
          {section.acceptableTypes.map((type, index) => (
            <AcceptableTypeCard
              key={type.typeId}
              type={type}
              index={index}
              isPreferred={type.isPreferred}
            />
          ))}
        </div>

        {/* Conditional note if exists */}
        {section.formCondition && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-100 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-800">Conditional Requirement</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                This section is required based on form responses.
              </p>
            </div>
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
}
