'use client';

import { useState, useCallback } from 'react';
import {
  Upload,
  FileText,
  X,
  GripVertical,
  Combine,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/utils';

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

interface MultiFileUploaderProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  onMergeRequest: (fileIds: string[]) => void;
  maxFiles?: number;
  maxFileSize?: number;
  acceptedTypes?: string[];
  label?: string;
  description?: string;
}

export function MultiFileUploader({
  files,
  onFilesChange,
  onMergeRequest,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png'],
  label = 'Upload Documents',
  description = 'Drag and drop files or click to browse',
}: MultiFileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const generateId = () => Math.random().toString(36).substring(2, 11);

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const validFiles: UploadedFile[] = [];

      fileArray.forEach((file) => {
        // Check file count
        if (files.length + validFiles.length >= maxFiles) return;

        // Check file size
        if (file.size > maxFileSize) {
          console.warn(`File ${file.name} exceeds size limit`);
          return;
        }

        // Check file type
        const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
        if (!acceptedTypes.includes(ext)) {
          console.warn(`File ${file.name} has invalid type`);
          return;
        }

        validFiles.push({
          id: generateId(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
        });
      });

      onFilesChange([...files, ...validFiles]);
    },
    [files, maxFiles, maxFileSize, acceptedTypes, onFilesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleRemove = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
    setSelectedIds(selectedIds.filter((sid) => sid !== id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const moveFile = (id: string, direction: 'up' | 'down') => {
    const index = files.findIndex((f) => f.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= files.length) return;

    const newFiles = [...files];
    [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
    onFilesChange(newFiles);
  };

  const canMerge = selectedIds.length >= 2;
  const selectedPdfs = files.filter(
    (f) => selectedIds.includes(f.id) && f.type === 'application/pdf'
  );
  const canMergePdfs = selectedPdfs.length >= 2;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <span className="text-xs text-gray-400">
          {files.length}/{maxFiles} files
        </span>
      </div>

      {/* Drop Zone */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200',
          isDragging
            ? 'border-[#0E4369] bg-[#0E4369]/5'
            : 'border-gray-200 hover:border-gray-300 bg-white'
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
          <Upload className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-700 mb-1">
          Drop files here or click to upload
        </p>
        <p className="text-xs text-gray-500">
          Supports {acceptedTypes.join(', ')} (max {formatFileSize(maxFileSize)} each)
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {/* Merge Action Bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-[#0E4369]/5 rounded-lg border border-[#0E4369]/20">
              <span className="text-sm text-[#0E4369]">
                {selectedIds.length} file{selectedIds.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear selection
                </button>
                {canMergePdfs && (
                  <button
                    onClick={() => onMergeRequest(selectedIds)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#0E4369] text-white rounded-lg hover:bg-[#0B3654] transition-colors"
                  >
                    <Combine className="w-3.5 h-3.5" />
                    Merge PDFs ({selectedPdfs.length})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Files */}
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={file.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-all duration-200',
                  selectedIds.includes(file.id)
                    ? 'border-[#0E4369] bg-[#0E4369]/5'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                )}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedIds.includes(file.id)}
                  onChange={() => toggleSelect(file.id)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0E4369] focus:ring-[#0E4369]"
                />

                {/* Drag Handle */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveFile(file.id, 'up')}
                    disabled={index === 0}
                    className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveFile(file.id, 'down')}
                    disabled={index === files.length - 1}
                    className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                {/* File Icon */}
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-gray-500" />
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(file.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
