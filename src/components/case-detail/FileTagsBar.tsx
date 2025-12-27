'use client';

import { useMemo } from 'react';
import { Check, AlertTriangle, Loader2, FileText, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Document, EvidenceSlotTemplate, DocumentPipelineStatus } from '@/types';

interface FileTagsBarProps {
  section: EvidenceSlotTemplate;
  documents: Document[];
  onPreviewDocument: (docId: string) => void;
  onUploadClick?: () => void;
  className?: string;
}

interface FileTagData {
  id: string;
  name: string;
  status: 'ready' | 'processing' | 'issue' | 'missing';
  pipelineStatus?: DocumentPipelineStatus;
}

function getStatusConfig(status: FileTagData['status']) {
  switch (status) {
    case 'ready':
      return {
        icon: Check,
        className: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
        iconClassName: 'text-emerald-500',
      };
    case 'processing':
      return {
        icon: Loader2,
        className: 'bg-slate-100 text-slate-600',
        iconClassName: 'text-slate-400 animate-spin',
      };
    case 'issue':
      return {
        icon: AlertTriangle,
        className: 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100',
        iconClassName: 'text-amber-500',
      };
    case 'missing':
      return {
        icon: FileText,
        className: 'border border-dashed border-slate-300 text-slate-400 bg-transparent hover:bg-slate-50 hover:text-slate-500',
        iconClassName: 'text-slate-300',
      };
  }
}

function mapPipelineToStatus(pipelineStatus: DocumentPipelineStatus): FileTagData['status'] {
  switch (pipelineStatus) {
    case 'ready':
      return 'ready';
    case 'uploading':
    case 'processing':
    case 'quality_check':
    case 'compliance_check':
      return 'processing';
    case 'quality_issue':
    case 'conflict':
      return 'issue';
    default:
      return 'processing';
  }
}

/**
 * Single file tag with status indicator
 */
function FileTag({
  file,
  onClick,
}: {
  file: FileTagData;
  onClick: () => void;
}) {
  const config = getStatusConfig(file.status);
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      disabled={file.status === 'missing'}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
        'transition-all duration-200',
        config.className,
        file.status === 'missing' && 'cursor-default'
      )}
    >
      <Icon className={cn('w-3 h-3 flex-shrink-0', config.iconClassName)} />
      <span className="truncate max-w-[140px]">{file.name}</span>
    </button>
  );
}

/**
 * Add file button
 */
function AddFileTag({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
        'border border-dashed border-slate-300 text-slate-400 bg-transparent',
        'hover:bg-slate-50 hover:text-slate-500 hover:border-slate-400',
        'transition-all duration-200'
      )}
    >
      <Plus className="w-3 h-3" />
      <span>Add file</span>
    </button>
  );
}

/**
 * FileTagsBar - Horizontal list of file tags with status indicators
 * Shows uploaded files and missing file placeholders
 */
export function FileTagsBar({
  section,
  documents,
  onPreviewDocument,
  onUploadClick,
  className,
}: FileTagsBarProps) {
  // Build file list: actual documents + placeholders for missing ones
  const files = useMemo((): FileTagData[] => {
    const result: FileTagData[] = [];

    // Add actual documents
    documents.forEach(doc => {
      result.push({
        id: doc.id,
        name: doc.fileName || doc.name || 'Untitled',
        status: mapPipelineToStatus(doc.pipelineStatus),
        pipelineStatus: doc.pipelineStatus,
      });
    });

    // Add placeholders for missing docs if below minCount
    const minCount = section.minCount ?? 1;
    const missing = Math.max(0, minCount - documents.length);

    for (let i = 0; i < missing; i++) {
      // Get acceptable type label for placeholder
      const typeLabel = section.acceptableTypes?.[0]?.label || section.name;
      result.push({
        id: `missing-${i}`,
        name: typeLabel,
        status: 'missing',
      });
    }

    return result;
  }, [documents, section]);

  // Calculate stats
  const stats = useMemo(() => {
    const uploaded = documents.length;
    const required = section.minCount ?? 1;
    const hasIssues = documents.some(d =>
      d.pipelineStatus === 'quality_issue' || d.pipelineStatus === 'conflict'
    );
    return { uploaded, required, hasIssues };
  }, [documents, section]);

  return (
    <div className={cn('px-6 py-4 bg-white border-b border-slate-100', className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900">
            {section.name}
          </h3>
          <span className="text-[10px] text-slate-400 tabular-nums">
            {stats.uploaded}/{stats.required} uploaded
          </span>
        </div>
        {section.description && (
          <span className="text-[10px] text-slate-400 max-w-xs truncate">
            {section.description}
          </span>
        )}
      </div>

      {/* File Tags */}
      <div className="flex flex-wrap items-center gap-2">
        {files.map(file => (
          <FileTag
            key={file.id}
            file={file}
            onClick={() => {
              if (file.status !== 'missing') {
                onPreviewDocument(file.id);
              }
            }}
          />
        ))}

        {/* Show add button if under max count */}
        {(!section.maxCount || documents.length < section.maxCount) && (
          <AddFileTag onClick={onUploadClick} />
        )}
      </div>
    </div>
  );
}
