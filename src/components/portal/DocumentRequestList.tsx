'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, Badge, Button } from '@/components/ui';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  Clock,
  ChevronRight,
} from 'lucide-react';
import type { ChecklistItem, Document } from '@/types';

interface DocumentRequestListProps {
  items: ChecklistItem[];
  documents: Document[];
  onUpload: (itemId: string, file: File) => void;
}

export function DocumentRequestList({
  items,
  documents,
  onUpload,
}: DocumentRequestListProps) {
  const requiredItems = items.filter((i) => i.status === 'required');
  const pendingItems = requiredItems.filter((i) => {
    const doc = documents.find(
      (d) => d.name.toLowerCase() === i.documentName.toLowerCase()
    );
    return !doc || doc.status === 'pending';
  });
  const uploadedItems = requiredItems.filter((i) => {
    const doc = documents.find(
      (d) => d.name.toLowerCase() === i.documentName.toLowerCase()
    );
    return doc && doc.status !== 'pending';
  });

  return (
    <div className="space-y-6">
      {/* Pending Documents */}
      {pendingItems.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-warning-500" />
            Documents Needed ({pendingItems.length})
          </h3>
          <div className="space-y-3">
            {pendingItems.map((item) => (
              <DocumentRequestCard
                key={item.id}
                item={item}
                document={null}
                onUpload={(file) => onUpload(item.id, file)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Documents */}
      {uploadedItems.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success-500" />
            Uploaded ({uploadedItems.length})
          </h3>
          <div className="space-y-3">
            {uploadedItems.map((item) => {
              const doc = documents.find(
                (d) => d.name.toLowerCase() === item.documentName.toLowerCase()
              );
              return (
                <DocumentRequestCard
                  key={item.id}
                  item={item}
                  document={doc || null}
                  onUpload={(file) => onUpload(item.id, file)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface DocumentRequestCardProps {
  item: ChecklistItem;
  document: Document | null;
  onUpload: (file: File) => void;
}

function DocumentRequestCard({ item, document, onUpload }: DocumentRequestCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const hasIssue = document?.qualityCheck && !document.qualityCheck.passed;
  const isUploaded = document && document.status !== 'pending';
  const isApproved = document?.status === 'approved';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onUpload(files[0]);
      setIsUploading(false);
    }
  };

  return (
    <Card
      padding="none"
      className={cn(
        hasIssue && 'border-warning-200 bg-warning-50/50',
        isApproved && 'border-success-200 bg-success-50/50'
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-3 text-left"
      >
        {/* Icon */}
        {isApproved ? (
          <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-success-600" />
          </div>
        ) : hasIssue ? (
          <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-warning-600" />
          </div>
        ) : isUploaded ? (
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-600" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Upload className="w-5 h-5 text-gray-400" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900">{item.documentName}</p>
          <p className="text-sm text-gray-500 truncate">{item.description}</p>
        </div>

        {/* Status Badge */}
        {isApproved ? (
          <Badge variant="success">Approved</Badge>
        ) : hasIssue ? (
          <Badge variant="warning">Needs Attention</Badge>
        ) : isUploaded ? (
          <Badge variant="primary">Uploaded</Badge>
        ) : (
          <Badge variant="default">Required</Badge>
        )}

        <ChevronRight
          className={cn(
            'w-5 h-5 text-gray-400 transition-transform',
            isExpanded && 'rotate-90'
          )}
        />
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
          {/* Requirements */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Requirements
            </p>
            <ul className="space-y-1">
              {item.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Issue Alert */}
          {hasIssue && document?.qualityCheck && (
            <div className="bg-warning-100 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-warning-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warning-800">
                    Issues with your upload
                  </p>
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

          {/* Upload Button */}
          {!isApproved && (
            <label className="block cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
              <span
                className={cn(
                  'inline-flex items-center justify-center w-full font-medium rounded-lg transition-colors px-4 py-2 text-sm',
                  isUploaded
                    ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'bg-primary-600 text-white hover:bg-primary-700',
                  isUploading && 'opacity-70 cursor-not-allowed'
                )}
              >
                {isUploading ? (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {isUploading
                  ? 'Uploading...'
                  : isUploaded
                  ? 'Replace Document'
                  : 'Upload Document'}
              </span>
            </label>
          )}
        </div>
      )}
    </Card>
  );
}
