'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button, Badge } from '@/components/ui';
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Trash2,
  Download,
  Eye,
} from 'lucide-react';
import { formatFileSize } from '@/lib/utils';
import type { ChecklistItem, Document } from '@/types';

interface DocumentUploadZoneProps {
  selectedItem: ChecklistItem | null;
  document: Document | null;
  onUpload: (file: File) => void;
  onDelete: () => void;
}

export function DocumentUploadZone({
  selectedItem,
  document,
  onUpload,
  onDelete,
}: DocumentUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleUpload(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleUpload(files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onUpload(file);
    setIsUploading(false);
  };

  if (!selectedItem) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
        <FileText className="w-12 h-12 mb-4" />
        <p className="text-sm text-center">
          Select a document from the checklist to view details or upload
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">{selectedItem.documentName}</h3>
        <p className="text-sm text-gray-500 mt-1">{selectedItem.description}</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        {/* Requirements */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Requirements</h4>
          <ul className="space-y-1">
            {selectedItem.requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* Upload Zone or Document Preview */}
        {document && document.status !== 'pending' ? (
          <DocumentPreview document={document} onDelete={onDelete} />
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              isDragging
                ? 'border-primary-400 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            {isUploading ? (
              <>
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm text-gray-600">Uploading...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop your file here, or
                </p>
                <label>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                  />
                  <span className="text-sm font-medium text-primary-600 hover:text-primary-700 cursor-pointer">
                    browse to upload
                  </span>
                </label>
                <p className="text-xs text-gray-400 mt-2">
                  PDF, JPG, or PNG (max 5MB)
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface DocumentPreviewProps {
  document: Document;
  onDelete: () => void;
}

function DocumentPreview({ document, onDelete }: DocumentPreviewProps) {
  const hasIssues = document.qualityCheck && !document.qualityCheck.passed;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* File Info */}
      <div className="p-4 bg-gray-50 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
          <FileText className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {document.fileName}
          </p>
          <p className="text-xs text-gray-500">
            {document.fileSize && formatFileSize(document.fileSize)}
          </p>
        </div>
        <Badge
          variant={
            document.status === 'approved'
              ? 'success'
              : document.status === 'rejected'
              ? 'error'
              : hasIssues
              ? 'warning'
              : 'primary'
          }
        >
          {document.status === 'approved'
            ? 'Approved'
            : document.status === 'rejected'
            ? 'Rejected'
            : hasIssues
            ? 'Has Issues'
            : 'Uploaded'}
        </Badge>
      </div>

      {/* Quality Issues */}
      {hasIssues && document.qualityCheck && (
        <div className="p-4 bg-warning-50 border-t border-warning-100">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-warning-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warning-800">Quality Issues</p>
              <ul className="mt-1 space-y-1">
                {document.qualityCheck.issues.map((issue, index) => (
                  <li key={index} className="text-sm text-warning-700">
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {document.notes && (
        <div className="p-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">{document.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 flex items-center gap-2">
        <Button variant="outline" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
          Preview
        </Button>
        <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
          Download
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-error-600 hover:text-error-700 hover:bg-error-50 ml-auto"
          leftIcon={<Trash2 className="w-4 h-4" />}
          onClick={onDelete}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
