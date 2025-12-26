'use client';

import { useState, useMemo } from 'react';
import { X, Copy, Check, FileImage, FileText, ChevronDown, ChevronUp, Layers, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MergeSuggestion } from '@/services/mergeDetection';

export interface ReferenceFile {
  id: string;
  name: string;
  category: string;
  uploadedAt: Date;
  type: string;
  // Number of source files if this is a merged document
  sourceCount?: number;
  // Whether this file is a merged result
  isMerged?: boolean;
}

interface ReferencePanelProps {
  isOpen: boolean;
  onClose: () => void;
  files: ReferenceFile[];
  caseEmail?: string;
  className?: string;
  // Completed merges for display in history
  completedMerges?: MergeSuggestion[];
  // Preview handler - receives file ID (can be merge ID for merged docs)
  onPreview?: (fileId: string) => void;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return '1 day ago';
  return `${diffInDays} days ago`;
}

function getFileIcon(type: string, isMerged?: boolean) {
  if (isMerged) {
    return <Layers className="w-5 h-5 text-slate-600" />;
  }
  if (type.includes('image')) {
    return <FileImage className="w-5 h-5 text-sky-600" />;
  }
  return <FileText className="w-5 h-5 text-slate-600" />;
}

function getFileIconBg(type: string, isMerged?: boolean) {
  if (isMerged) {
    return 'bg-slate-100';
  }
  if (type.includes('image')) {
    return 'bg-sky-100';
  }
  return 'bg-slate-100';
}

/**
 * Collapsible Merge History Section
 * Shows completed merges - clickable to preview
 */
function MergeHistorySection({
  merges,
  onPreview,
}: {
  merges: MergeSuggestion[];
  onPreview?: (mergeId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayMerges = merges.filter(m => m.status === 'accepted');

  if (displayMerges.length === 0) return null;

  return (
    <div className="px-5 py-3 border-b border-slate-100">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between group"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">
            Merge History
          </span>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
            {displayMerges.length}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
        )}
      </button>

      <div className={cn(
        'overflow-hidden transition-all duration-200',
        isExpanded ? 'max-h-[300px] opacity-100 mt-3' : 'max-h-0 opacity-0'
      )}>
        <div className="space-y-1.5">
          {displayMerges.map(merge => (
            <button
              key={merge.id}
              onClick={() => onPreview?.(merge.id)}
              className={cn(
                'w-full text-left border-l-2 border-l-slate-200 bg-slate-50/50 rounded-r-lg px-3 py-2',
                'hover:bg-slate-100 hover:border-l-slate-400 transition-all group'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-[10px] text-slate-400 flex-shrink-0">
                    {merge.fileIds.length} files →
                  </span>
                  <span className="text-xs font-medium text-slate-600 truncate group-hover:text-slate-900">
                    {merge.suggestedName}
                  </span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-slate-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReferencePanel({
  isOpen,
  onClose,
  files,
  caseEmail = 'cosx+34567234@msg.xeni.legal',
  className,
  completedMerges = [],
  onPreview,
}: ReferencePanelProps) {
  const [copied, setCopied] = useState(false);

  // Group files by category
  const groupedFiles = useMemo(() => {
    return files.reduce((acc, file) => {
      if (!acc[file.category]) {
        acc[file.category] = [];
      }
      acc[file.category].push(file);
      return acc;
    }, {} as Record<string, ReferenceFile[]>);
  }, [files]);

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText(caseEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileClick = (fileId: string) => {
    onPreview?.(fileId);
  };

  return (
    <div
      className={cn(
        'h-full bg-white border-l border-slate-200 flex flex-col flex-shrink-0',
        'transition-all duration-300 ease-out overflow-hidden',
        isOpen ? 'w-[340px]' : 'w-0',
        className
      )}
    >
      <div className="min-w-[340px] h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Verified Documents</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Click to preview & view originals</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Collapsible Merge History */}
          <MergeHistorySection
            merges={completedMerges}
            onPreview={onPreview}
          />

          {/* Documents Section */}
          <div className="px-5 py-4">
            {Object.entries(groupedFiles).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(groupedFiles).map(([category, categoryFiles]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{category}</h4>
                      <span className="text-[10px] text-slate-400">{categoryFiles.length}</span>
                    </div>
                    <div className="space-y-1.5">
                      {categoryFiles.map((file) => (
                        <div
                          key={file.id}
                          onClick={() => handleFileClick(file.id)}
                          className={cn(
                            'flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer',
                            'bg-slate-50 hover:bg-slate-100 group'
                          )}
                        >
                          {/* File icon */}
                          <div
                            className={cn(
                              'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                              getFileIconBg(file.type, file.isMerged)
                            )}
                          >
                            {getFileIcon(file.type, file.isMerged)}
                          </div>

                          {/* File info */}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 truncate group-hover:text-[#0E4369]">
                              {file.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-slate-500">
                                {formatTimeAgo(file.uploadedAt)}
                              </span>
                              {file.sourceCount && file.sourceCount > 0 && (
                                <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <Layers className="w-2.5 h-2.5" />
                                  {file.sourceCount} sources
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Hover indicator */}
                          <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-slate-500 rotate-[-90deg] opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                  <svg
                    className="w-7 h-7 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-900">No documents yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Documents will appear here after verification
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Email Forward Section */}
        <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/50">
          <p className="text-xs text-slate-500 leading-relaxed mb-2.5">
            Forward client emails to auto-extract documents
          </p>
          <button
            onClick={handleCopyEmail}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors group"
          >
            <span className="text-xs font-mono text-slate-700 truncate">
              {caseEmail}
            </span>
            <span className="flex-shrink-0 text-slate-400 group-hover:text-slate-600 transition-colors">
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
