'use client';

import { useState, useMemo } from 'react';
import {
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  Send,
  ChevronRight,
  X,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/utils';
import type { ChecklistItem, Document, Issue } from '@/types';

interface IntakePhaseViewProps {
  checklistItems: ChecklistItem[];
  documents: Document[];
  issues: Issue[];
  onUpload: (checklistItemId: string, file: File) => void;
  onPreview: (documentId: string) => void;
  onSendRequest: (checklistItemIds: string[]) => void;
}

export function IntakePhaseView({
  checklistItems,
  documents,
  issues,
  onUpload,
  onPreview,
  onSendRequest,
}: IntakePhaseViewProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, ChecklistItem[]> = {};
    checklistItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [checklistItems]);

  // Get document for a checklist item
  const getDocumentForItem = (item: ChecklistItem): Document | null => {
    return documents.find(
      (doc) => doc.name.toLowerCase() === item.documentName.toLowerCase()
    ) || null;
  };

  // Get issues for a document
  const getIssuesForDocument = (docId: string): Issue[] => {
    return issues.filter(
      (issue) => issue.documentIds.includes(docId) && issue.status === 'open'
    );
  };

  // Get pending items (for send request)
  const pendingItems = checklistItems.filter((item) => {
    const doc = getDocumentForItem(item);
    return !doc || doc.status === 'pending';
  });

  const selectedItem = checklistItems.find((item) => item.id === selectedItemId);
  const selectedDocument = selectedItem ? getDocumentForItem(selectedItem) : null;
  const selectedDocumentIssues = selectedDocument
    ? getIssuesForDocument(selectedDocument.id)
    : [];

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    setDragOverItemId(itemId);
  };

  const handleDragLeave = () => {
    setDragOverItemId(null);
  };

  const handleDrop = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    setDragOverItemId(null);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onUpload(itemId, files[0]);
    }
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      identity: 'Identity Documents',
      financial: 'Financial Documents',
      employment: 'Employment Documents',
      education: 'Education Documents',
      relationship: 'Relationship Documents',
      other: 'Other Documents',
    };
    return labels[category] || category;
  };

  return (
    <div className="flex h-full">
      {/* Left Panel: Document Checklist */}
      <div className="w-96 border-r border-gray-200 flex flex-col bg-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Document Checklist</h2>
            <span className="text-sm text-gray-500">
              {checklistItems.filter((i) => i.completed).length} / {checklistItems.length}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0E4369] rounded-full transition-all duration-500"
              style={{
                width: `${(checklistItems.filter((i) => i.completed).length / checklistItems.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Checklist Items */}
        <div className="flex-1 overflow-y-auto">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="border-b border-gray-100 last:border-b-0">
              <div className="px-5 py-3 bg-gray-50/70">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getCategoryLabel(category)}
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map((item) => {
                  const doc = getDocumentForItem(item);
                  const itemIssues = doc ? getIssuesForDocument(doc.id) : [];
                  const hasIssues = itemIssues.length > 0;
                  const isSelected = selectedItemId === item.id;
                  const isDragOver = dragOverItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'px-5 py-3 cursor-pointer transition-all duration-200',
                        isSelected && 'bg-[#0E4369]/5 border-l-2 border-l-[#0E4369]',
                        !isSelected && 'hover:bg-gray-50 border-l-2 border-l-transparent',
                        isDragOver && 'bg-blue-50 border-l-2 border-l-blue-500'
                      )}
                      onClick={() => setSelectedItemId(item.id)}
                      onDragOver={(e) => handleDragOver(e, item.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, item.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Status Icon */}
                        <div className="mt-0.5">
                          {doc?.status === 'approved' ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                          ) : hasIssues ? (
                            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            </div>
                          ) : doc ? (
                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                              <FileText className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {item.documentName}
                            </span>
                            {item.status === 'required' && !doc && (
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-100 text-rose-600 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          {doc && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              {doc.fileName} • {formatFileSize(doc.fileSize || 0)}
                            </p>
                          )}
                          {/* Inline Issue Alert */}
                          {hasIssues && (
                            <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-amber-700">
                                    {itemIssues[0].title}
                                  </p>
                                  {itemIssues.length > 1 && (
                                    <p className="text-[10px] text-amber-600 mt-0.5">
                                      +{itemIssues.length - 1} more issue{itemIssues.length > 2 ? 's' : ''}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <ChevronRight
                          className={cn(
                            'w-4 h-4 text-gray-300 transition-colors',
                            isSelected && 'text-[#0E4369]'
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Send Request Button */}
        {pendingItems.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-white">
            <button
              onClick={() => onSendRequest(pendingItems.map((i) => i.id))}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0E4369] text-white rounded-lg font-medium text-sm hover:bg-[#0B3654] transition-colors"
            >
              <Send className="w-4 h-4" />
              Request {pendingItems.length} Document{pendingItems.length > 1 ? 's' : ''} from Applicant
            </button>
          </div>
        )}
      </div>

      {/* Right Panel: Document Preview / Upload Zone */}
      <div className="flex-1 bg-gray-50 flex flex-col">
        {selectedItem ? (
          <>
            {/* Selected Item Header */}
            <div className="px-6 py-4 bg-white border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedItem.documentName}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {selectedItem.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedItemId(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {selectedDocument ? (
                <DocumentPreviewCard
                  document={selectedDocument}
                  issues={selectedDocumentIssues}
                  onPreview={() => onPreview(selectedDocument.id)}
                />
              ) : (
                <UploadDropzone
                  itemId={selectedItem.id}
                  requirements={selectedItem.requirements}
                  onUpload={(file) => onUpload(selectedItem.id, file)}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Select a document
              </h3>
              <p className="text-sm text-gray-500">
                Click on an item from the checklist to view or upload
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Document Preview Card
function DocumentPreviewCard({
  document,
  issues,
  onPreview,
}: {
  document: Document;
  issues: Issue[];
  onPreview: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Document Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Preview Area */}
        <div
          className="h-64 bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={onPreview}
        >
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{document.fileName}</p>
            <button className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#0E4369] hover:underline">
              <Eye className="w-4 h-4" />
              View Full Document
            </button>
          </div>
        </div>

        {/* Document Info */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{document.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatFileSize(document.fileSize || 0)} • Uploaded{' '}
                {document.uploadedAt ? new Date(document.uploadedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <span
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-full',
                document.status === 'approved' && 'bg-emerald-100 text-emerald-700',
                document.status === 'rejected' && 'bg-rose-100 text-rose-700',
                document.status === 'uploaded' && 'bg-blue-100 text-blue-700',
                document.status === 'processing' && 'bg-amber-100 text-amber-700'
              )}
            >
              {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Quality Issues ({issues.length})
          </h4>
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="p-4 bg-amber-50 rounded-xl border border-amber-100"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">{issue.title}</p>
                  <p className="text-sm text-amber-700 mt-1">{issue.description}</p>
                  {issue.suggestion && (
                    <p className="text-xs text-amber-600 mt-2 italic">
                      Suggestion: {issue.suggestion}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Upload Dropzone
function UploadDropzone({
  itemId,
  requirements,
  onUpload,
}: {
  itemId: string;
  requirements: string[];
  onUpload: (file: File) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200',
          isDragging
            ? 'border-[#0E4369] bg-[#0E4369]/5'
            : 'border-gray-300 hover:border-gray-400 bg-white'
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
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
        />
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Upload className="w-7 h-7 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-900 mb-1">
          Drop file here or click to upload
        </p>
        <p className="text-xs text-gray-500">
          Supports PDF, JPG, PNG (max 10MB)
        </p>
      </div>

      {/* Requirements */}
      {requirements.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Requirements</h4>
          <ul className="space-y-2">
            {requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
