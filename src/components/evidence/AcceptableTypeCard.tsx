'use client';

import { useState } from 'react';
import {
  FileText,
  Star,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PipelineStatusBadge, getPipelineStatusConfig } from './DocumentPipeline';
import type { AcceptableDocumentType, Document } from '@/types';

interface AcceptableTypeCardProps {
  type: AcceptableDocumentType;
  uploadedDoc?: Document;
  onPreview?: (docId: string) => void;
  onRemove?: (docId: string) => void;
  showOrSeparator?: boolean;
}

export function AcceptableTypeCard({
  type,
  uploadedDoc,
  onPreview,
  onRemove,
  showOrSeparator = false,
}: AcceptableTypeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDoc = !!uploadedDoc;

  // Use pipeline status for document state
  const pipelineStatus = uploadedDoc?.pipelineStatus;
  const isReady = pipelineStatus === 'ready';
  const isProcessing = pipelineStatus === 'uploading' || pipelineStatus === 'processing' ||
                       pipelineStatus === 'quality_check' || pipelineStatus === 'compliance_check';
  const hasIssue = pipelineStatus === 'quality_issue' || pipelineStatus === 'conflict';

  return (
    <div className="relative">
      {/* OR Separator */}
      {showOrSeparator && (
        <div className="flex items-center gap-3 py-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            or
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>
      )}

      {/* Card */}
      <div
        className={cn(
          'rounded-xl border transition-all duration-200',
          hasDoc
            ? isReady
              ? 'bg-emerald-50/50 border-emerald-200'
              : hasIssue
              ? 'bg-amber-50/50 border-amber-200'
              : 'bg-blue-50/50 border-blue-200'
            : 'bg-white border-gray-200 border-dashed hover:border-gray-300 hover:bg-gray-50/50'
        )}
      >
        {/* Header */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                hasDoc
                  ? isReady
                    ? 'bg-emerald-100'
                    : hasIssue
                    ? 'bg-amber-100'
                    : 'bg-blue-100'
                  : 'bg-gray-100'
              )}
            >
              <FileText
                className={cn(
                  'w-5 h-5',
                  hasDoc
                    ? isReady
                      ? 'text-emerald-600'
                      : hasIssue
                      ? 'text-amber-600'
                      : 'text-blue-600'
                    : 'text-gray-400'
                )}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm text-gray-900 truncate">
                  {type.label}
                </h4>
                {type.isPreferred && !hasDoc && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-medium">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    Recommended
                  </span>
                )}
                {hasDoc && pipelineStatus && (
                  <PipelineStatusBadge status={pipelineStatus} />
                )}
              </div>

              {/* Description or Uploaded File Info */}
              {hasDoc ? (
                <div className="text-xs text-gray-600">
                  <p className="font-medium truncate">{uploadedDoc.fileName}</p>
                  <p className="text-gray-400 mt-0.5">
                    {uploadedDoc.fileSize
                      ? `${(uploadedDoc.fileSize / 1024 / 1024).toFixed(2)} MB`
                      : ''}{' '}
                    {uploadedDoc.uploadedAt && (
                      <>
                        · Uploaded{' '}
                        {new Date(uploadedDoc.uploadedAt).toLocaleDateString()}
                      </>
                    )}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500 line-clamp-2">
                  {type.description}
                </p>
              )}

              {/* Conditional Note */}
              {type.conditionalNote && !hasDoc && (
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-400">
                  <Info className="w-3 h-3" />
                  {type.conditionalNote}
                </div>
              )}
            </div>

            {/* Actions (only show when document is uploaded) */}
            {hasDoc && (
              <div className="flex items-center gap-2">
                {onPreview && (
                  <button
                    onClick={() => onPreview(uploadedDoc.id)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Preview
                  </button>
                )}
                {onRemove && (
                  <button
                    onClick={() => onRemove(uploadedDoc.id)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Issue Details */}
          {hasIssue && uploadedDoc?.qualityCheck?.issues && (
            <div className="mt-3 p-3 bg-amber-100/50 rounded-lg">
              <p className="text-xs font-medium text-amber-800 mb-1">Issues found:</p>
              <ul className="text-xs text-amber-700 space-y-0.5">
                {uploadedDoc.qualityCheck.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-500 mt-0.5">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Requirements Accordion */}
        {!hasDoc && type.requirements.length > 0 && (
          <>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between px-4 py-2 border-t border-gray-100 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <span>View requirements ({type.requirements.length})</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50/50">
                <ul className="space-y-1.5">
                  {type.requirements.map((req, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-gray-600"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
