'use client';

import { useState } from 'react';
import {
  FileText,
  Combine,
  ArrowRight,
  Check,
  Loader2,
  ChevronUp,
  ChevronDown,
  X,
  FileStack,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/utils';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface FileMergeSelectorProps {
  files: FileItem[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onMerge: (orderedIds: string[]) => Promise<void>;
  onCancel: () => void;
}

export function FileMergeSelector({
  files,
  selectedIds,
  onSelectionChange,
  onMerge,
  onCancel,
}: FileMergeSelectorProps) {
  const [orderedIds, setOrderedIds] = useState<string[]>(selectedIds);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [mergeComplete, setMergeComplete] = useState(false);

  const selectedFiles = orderedIds
    .map((id) => files.find((f) => f.id === id))
    .filter(Boolean) as FileItem[];

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const index = orderedIds.indexOf(id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= orderedIds.length) return;

    const newOrder = [...orderedIds];
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setOrderedIds(newOrder);
  };

  const removeItem = (id: string) => {
    const newOrder = orderedIds.filter((oid) => oid !== id);
    setOrderedIds(newOrder);
    onSelectionChange(newOrder);
  };

  const handleMerge = async () => {
    if (orderedIds.length < 2) return;

    setIsMerging(true);
    setMergeProgress(0);

    // Simulate merge progress
    const progressInterval = setInterval(() => {
      setMergeProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      await onMerge(orderedIds);
      clearInterval(progressInterval);
      setMergeProgress(100);
      setMergeComplete(true);
    } catch (error) {
      clearInterval(progressInterval);
      setIsMerging(false);
    }
  };

  const totalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  if (mergeComplete) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          PDFs Merged Successfully
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {selectedFiles.length} files have been combined into a single document
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
          <FileStack className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            merged_{selectedFiles[0]?.name || 'document'}.pdf
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0E4369]/10 flex items-center justify-center">
            <Combine className="w-5 h-5 text-[#0E4369]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Merge PDFs</h3>
            <p className="text-sm text-gray-500">
              Drag to reorder, then merge into a single document
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* File Order List */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">
              {selectedFiles.length} PDFs to merge
            </span>
            <span className="text-gray-500">
              Total: {formatFileSize(totalSize)}
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {selectedFiles.map((file, index) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
            >
              {/* Order Number */}
              <div className="w-6 h-6 rounded-full bg-[#0E4369] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                {index + 1}
              </div>

              {/* Reorder Controls */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveItem(file.id, 'up')}
                  disabled={index === 0}
                  className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => moveItem(file.id, 'down')}
                  disabled={index === selectedFiles.length - 1}
                  className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {/* File Icon */}
              <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-rose-500" />
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeItem(file.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Merge Preview */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-[#0E4369]/5 rounded-xl border border-gray-200">
        <div className="flex -space-x-2">
          {selectedFiles.slice(0, 3).map((file, i) => (
            <div
              key={file.id}
              className="w-8 h-10 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center"
              style={{ zIndex: 3 - i }}
            >
              <FileText className="w-4 h-4 text-gray-400" />
            </div>
          ))}
          {selectedFiles.length > 3 && (
            <div className="w-8 h-10 bg-gray-100 border border-gray-200 rounded shadow-sm flex items-center justify-center text-xs font-medium text-gray-500">
              +{selectedFiles.length - 3}
            </div>
          )}
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400" />
        <div className="w-10 h-12 bg-[#0E4369] rounded shadow-md flex items-center justify-center">
          <FileStack className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            merged_{selectedFiles[0]?.name?.replace('.pdf', '') || 'document'}.pdf
          </p>
          <p className="text-xs text-gray-500">
            Combined from {selectedFiles.length} files
          </p>
        </div>
      </div>

      {/* Progress Bar (when merging) */}
      {isMerging && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Merging documents...</span>
            <span className="font-medium text-[#0E4369]">
              {Math.round(mergeProgress)}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0E4369] to-[#1a5a8a] rounded-full transition-all duration-300"
              style={{ width: `${mergeProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          disabled={isMerging}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleMerge}
          disabled={orderedIds.length < 2 || isMerging}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all',
            orderedIds.length < 2 || isMerging
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-[#0E4369] hover:bg-[#0B3654]'
          )}
        >
          {isMerging ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Merging...
            </>
          ) : (
            <>
              <Combine className="w-4 h-4" />
              Merge {orderedIds.length} PDFs
            </>
          )}
        </button>
      </div>
    </div>
  );
}
