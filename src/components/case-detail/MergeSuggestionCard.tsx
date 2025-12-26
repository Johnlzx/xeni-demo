'use client';

import { useState } from 'react';
import { Check, X, Pencil, FileText, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MergeSuggestion } from '@/services/mergeDetection';

interface FileInfo {
  id: string;
  name: string;
}

interface MergeSuggestionCardProps {
  suggestion: MergeSuggestion;
  files: FileInfo[];
  onAccept: () => void;
  onEdit: () => void;
  onDismiss: () => void;
  className?: string;
}

export function MergeSuggestionCard({
  suggestion,
  files,
  onAccept,
  onEdit,
  onDismiss,
  className,
}: MergeSuggestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const confidencePercent = Math.round(suggestion.confidence * 100);
  const confidenceColor =
    suggestion.confidence >= 0.8
      ? 'text-emerald-600 bg-emerald-50/70'
      : suggestion.confidence >= 0.6
      ? 'text-amber-600 bg-amber-50/70'
      : 'text-gray-500 bg-gray-100';

  return (
    <div
      className={cn(
        'group relative rounded-lg transition-all duration-200',
        'border border-gray-200 border-l-2 border-l-gray-400',
        isHovered
          ? 'border-gray-300 shadow-sm bg-white'
          : 'bg-gray-50/30',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Icon + Info */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* AI Sparkle Icon - Restrained gray style */}
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-gray-500" />
            </div>

            <div className="min-w-0 flex-1">
              {/* Title */}
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {suggestion.suggestedName.replace('.pdf', '')}
                </h4>
                <span className={cn(
                  'px-1.5 py-0.5 text-[10px] font-medium rounded-full',
                  confidenceColor
                )}>
                  {confidencePercent}% match
                </span>
              </div>

              {/* Reason */}
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                {suggestion.reason}
              </p>

              {/* File count badge */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1 mt-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FileText className="w-3 h-3" />
                <span>{files.length} files</span>
                {isExpanded ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* Right: Quick dismiss */}
          <button
            onClick={onDismiss}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
            title="Dismiss suggestion"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable file list */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isExpanded ? 'max-h-40' : 'max-h-0'
        )}
      >
        <div className="px-4 pb-2">
          <div className="pl-11 space-y-1">
            {files.map((file, index) => (
              <div
                key={file.id}
                className="flex items-center gap-2 text-xs text-gray-600"
              >
                <span className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-500">
                  {index + 1}
                </span>
                <span className="truncate">{file.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/30 rounded-b-lg">
        <div className="flex items-center gap-2">
          {/* Accept button */}
          <button
            onClick={onAccept}
            className={cn(
              'flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5',
              'bg-[#0E4369] text-white text-xs font-medium rounded-lg',
              'hover:bg-[#0B3654] active:scale-[0.98]',
              'transition-all duration-150',
              'shadow-sm'
            )}
          >
            <Check className="w-3.5 h-3.5" />
            Accept
          </button>

          {/* Edit button */}
          <button
            onClick={onEdit}
            className={cn(
              'flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5',
              'bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg',
              'hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98]',
              'transition-all duration-150'
            )}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>

          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 px-3 py-1.5',
              'text-gray-500 text-xs font-medium rounded-lg',
              'hover:bg-gray-100 active:scale-[0.98]',
              'transition-all duration-150'
            )}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state when there are no merge suggestions
 */
export function NoMergeSuggestions() {
  return (
    <div className="text-center py-3 px-3">
      <p className="text-xs text-gray-400">
        No merge suggestions at this time
      </p>
    </div>
  );
}

/**
 * Merge suggestions section header
 */
interface MergeSuggestionsSectionProps {
  count: number;
  onAcceptAll?: () => void;
  onDismissAll?: () => void;
}

export function MergeSuggestionsHeader({
  count,
  onAcceptAll,
  onDismissAll,
}: MergeSuggestionsSectionProps) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-600 tracking-wide">
          Merge Suggestions
        </span>
        {count > 0 && (
          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded">
            {count}
          </span>
        )}
      </div>

      {count > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={onAcceptAll}
            className="text-[10px] text-gray-600 hover:text-gray-800 font-medium px-1.5 py-0.5 hover:bg-gray-100 rounded transition-colors"
          >
            Accept all
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={onDismissAll}
            className="text-[10px] text-gray-500 hover:text-gray-700 font-medium px-1.5 py-0.5 hover:bg-gray-100 rounded transition-colors"
          >
            Dismiss all
          </button>
        </div>
      )}
    </div>
  );
}
