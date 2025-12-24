'use client';

import { useState, useRef, useCallback } from 'react';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Info,
  Sparkles,
  Send,
  FileText,
  Upload,
  Eye,
  Trash2,
  Clock,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  X,
  AlertTriangle,
  File,
  Image as ImageIcon,
  ExternalLink,
  History,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentPipeline, PipelineStatusBadge } from './DocumentPipeline';
import type { EvidenceSlot, Document, AcceptableDocumentType } from '@/types';
import { getSlotStatusColor } from '@/hooks/useEvidenceSlots';

interface DocumentVersion {
  id: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  replacedAt?: string;
  reason?: string;
}

interface EvidenceSlotDetailProps {
  slot: EvidenceSlot;
  documents: Document[];
  onPreview: (docId: string) => void;
  onRemove: (docId: string) => void;
  onUpload?: (file: File, typeId?: string) => void;
  onSendRequest?: (slotId: string) => void;
  onDemoComplete?: (slotId: string) => void;
}

export function EvidenceSlotDetail({
  slot,
  documents,
  onPreview,
  onRemove,
  onUpload,
  onSendRequest,
  onDemoComplete,
}: EvidenceSlotDetailProps) {
  const colors = getSlotStatusColor(slot.status);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get document for each type
  const getDocForType = (typeId: string): Document | undefined => {
    return documents.find((doc) => doc.documentTypeId === typeId);
  };

  // Mock version history for demo
  const getMockVersionHistory = (docId: string): DocumentVersion[] => {
    return [
      {
        id: `${docId}-v2`,
        fileName: 'passport_scan_v2.pdf',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'John Liu',
      },
      {
        id: `${docId}-v1`,
        fileName: 'passport_scan.pdf',
        uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        uploadedBy: 'John Liu',
        replacedAt: new Date().toISOString(),
        reason: 'Image quality too low',
      },
    ];
  };

  const handleFileSelect = useCallback((files: FileList | null, typeId?: string) => {
    if (files && files.length > 0 && onUpload) {
      onUpload(files[0], typeId);
    }
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent, typeId?: string) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files, typeId);
  }, [handleFileSelect]);

  const handleDeleteConfirm = (docId: string) => {
    onRemove(docId);
    setShowDeleteConfirm(null);
  };

  const getStatusIcon = () => {
    switch (slot.status) {
      case 'satisfied':
        return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
      case 'partial':
        return <Circle className="w-6 h-6 text-blue-500" />;
      case 'issue':
        return <AlertCircle className="w-6 h-6 text-amber-500" />;
      default:
        return <Circle className="w-6 h-6 text-gray-300" />;
    }
  };

  const getStatusLabel = () => {
    switch (slot.status) {
      case 'satisfied':
        return 'Complete';
      case 'partial':
        return `In Progress (${slot.progress.current}/${slot.progress.required})`;
      case 'issue':
        return 'Has Issues';
      default:
        return 'Not Started';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (fileType?: string) => {
    if (fileType?.includes('pdf')) return <FileText className="w-5 h-5" />;
    if (fileType?.includes('image')) return <ImageIcon className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Compact Header */}
      <div className={cn('px-6 py-5 border-b bg-white', colors.bg)}>
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
              slot.status === 'satisfied'
                ? 'bg-emerald-100'
                : slot.status === 'issue'
                ? 'bg-amber-100'
                : slot.status === 'partial'
                ? 'bg-blue-100'
                : 'bg-gray-100'
            )}
          >
            {getStatusIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {slot.name}
              </h2>
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0',
                  slot.status === 'satisfied'
                    ? 'bg-emerald-100 text-emerald-700'
                    : slot.status === 'issue'
                    ? 'bg-amber-100 text-amber-700'
                    : slot.status === 'partial'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {getStatusLabel()}
              </span>
            </div>
            <p className="text-sm text-gray-500 line-clamp-1">{slot.description}</p>

            {/* Action row */}
            <div className="flex items-center gap-3 mt-3">
              {slot.priority === 'required' && slot.status !== 'satisfied' && (
                <span className="text-[11px] text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded">
                  Required for submission
                </span>
              )}
              {onDemoComplete && slot.status !== 'satisfied' && (
                <button
                  onClick={() => onDemoComplete(slot.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 rounded transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  Demo: Complete
                </button>
              )}
              <div className="flex-1" />
              {onSendRequest && slot.status !== 'satisfied' && (
                <button
                  onClick={() => onSendRequest(slot.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#0E4369] hover:bg-[#0B3654] rounded-lg transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Request from Client
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar for multi-doc slots */}
        {slot.progress.required > 1 && (
          <div className="mt-4 ml-15">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-600">
                {slot.progress.current} of {slot.progress.required} documents
              </span>
              <span className="font-medium text-gray-900">
                {Math.round((slot.progress.current / slot.progress.required) * 100)}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  slot.status === 'satisfied'
                    ? 'bg-emerald-500'
                    : slot.status === 'issue'
                    ? 'bg-amber-500'
                    : 'bg-blue-500'
                )}
                style={{
                  width: `${Math.min((slot.progress.current / slot.progress.required) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Acceptable Types */}
          {slot.acceptableTypes.map((type, index) => {
            const uploadedDoc = getDocForType(type.typeId);
            const hasDoc = !!uploadedDoc;
            const versionHistory = hasDoc ? getMockVersionHistory(uploadedDoc.id) : [];
            const isHistoryExpanded = expandedHistory === type.typeId;
            const isDeleteConfirmOpen = showDeleteConfirm === uploadedDoc?.id;

            return (
              <div key={type.typeId} className="relative">
                {/* OR Separator */}
                {index > 0 && (
                  <div className="flex items-center gap-4 py-4 -mt-2">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-gray-100" />
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                      or
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-200 to-gray-100" />
                  </div>
                )}

                {/* Document Type Card */}
                <div
                  className={cn(
                    'rounded-2xl border-2 transition-all duration-300 overflow-hidden',
                    hasDoc
                      ? uploadedDoc.pipelineStatus === 'ready'
                        ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white'
                        : uploadedDoc.pipelineStatus === 'quality_issue' || uploadedDoc.pipelineStatus === 'conflict'
                        ? 'border-amber-200 bg-gradient-to-br from-amber-50/80 to-white'
                        : 'border-blue-200 bg-gradient-to-br from-blue-50/80 to-white'
                      : 'border-gray-200 border-dashed bg-white hover:border-gray-300 hover:bg-gray-50/30'
                  )}
                >
                  {/* Card Header with Type Info */}
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Type Icon */}
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                          hasDoc
                            ? uploadedDoc.pipelineStatus === 'ready'
                              ? 'bg-emerald-100 text-emerald-600'
                              : uploadedDoc.pipelineStatus === 'quality_issue' || uploadedDoc.pipelineStatus === 'conflict'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-400'
                        )}
                      >
                        <FileText className="w-6 h-6" />
                      </div>

                      {/* Type Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{type.label}</h3>
                          {type.isPreferred && !hasDoc && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold">
                              Recommended
                            </span>
                          )}
                          {hasDoc && uploadedDoc.pipelineStatus && (
                            <PipelineStatusBadge status={uploadedDoc.pipelineStatus} />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{type.description}</p>
                      </div>
                    </div>

                    {/* Uploaded Document Section */}
                    {hasDoc && uploadedDoc && (
                      <div className="mt-5">
                        {/* Document Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                          {/* Document Info Row */}
                          <div className="p-4">
                            <div className="flex items-center gap-4">
                              {/* File Preview Thumbnail */}
                              <div
                                className="w-16 h-20 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#0E4369]/20 transition-all group"
                                onClick={() => onPreview(uploadedDoc.id)}
                              >
                                {uploadedDoc.fileType?.includes('pdf') ? (
                                  <div className="relative w-full h-full bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center">
                                    <FileText className="w-8 h-8 text-rose-400" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                      <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="relative w-full h-full bg-gray-50 flex items-center justify-center">
                                    {getFileIcon(uploadedDoc.fileType)}
                                  </div>
                                )}
                              </div>

                              {/* File Details */}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate mb-1">
                                  {uploadedDoc.fileName || uploadedDoc.name}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <File className="w-3 h-3" />
                                    {formatFileSize(uploadedDoc.fileSize)}
                                  </span>
                                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(uploadedDoc.uploadedAt)}
                                  </span>
                                </div>
                                {uploadedDoc.uploadedBy && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    Uploaded by {uploadedDoc.uploadedBy}
                                  </p>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onPreview(uploadedDoc.id)}
                                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Preview
                                </button>
                                <button
                                  onClick={() => onPreview(uploadedDoc.id)}
                                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Open in new tab"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Pipeline Status */}
                          {uploadedDoc.pipelineStatus && uploadedDoc.pipelineStatus !== 'ready' && (
                            <div className="px-4 pb-4">
                              <DocumentPipeline status={uploadedDoc.pipelineStatus} compact />
                            </div>
                          )}

                          {/* Quality Issues */}
                          {(uploadedDoc.pipelineStatus === 'quality_issue' || uploadedDoc.pipelineStatus === 'conflict') &&
                           uploadedDoc.qualityCheck?.issues && (
                            <div className="mx-4 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs font-semibold text-amber-800 mb-1">Issues Detected</p>
                                  <ul className="text-xs text-amber-700 space-y-0.5">
                                    {uploadedDoc.qualityCheck.issues.map((issue, i) => (
                                      <li key={i} className="flex items-start gap-1.5">
                                        <span className="text-amber-400 mt-0.5">•</span>
                                        {issue}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Action Bar */}
                          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            {/* Version History Toggle */}
                            <button
                              onClick={() => setExpandedHistory(isHistoryExpanded ? null : type.typeId)}
                              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              <History className="w-3.5 h-3.5" />
                              {versionHistory.length > 1 ? `${versionHistory.length - 1} previous version${versionHistory.length > 2 ? 's' : ''}` : 'No previous versions'}
                              {versionHistory.length > 1 && (
                                isHistoryExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                              )}
                            </button>

                            <div className="flex items-center gap-2">
                              {/* Replace Button */}
                              <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg cursor-pointer transition-all">
                                <RefreshCw className="w-3.5 h-3.5" />
                                Replace
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                  onChange={(e) => handleFileSelect(e.target.files, type.typeId)}
                                />
                              </label>

                              {/* Delete Button */}
                              <button
                                onClick={() => setShowDeleteConfirm(uploadedDoc.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 hover:border-rose-300 rounded-lg transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Remove
                              </button>
                            </div>
                          </div>

                          {/* Version History Panel */}
                          {isHistoryExpanded && versionHistory.length > 1 && (
                            <div className="border-t border-gray-100 bg-gray-50/50">
                              <div className="p-4">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                  Version History
                                </h4>
                                <div className="relative pl-4 border-l-2 border-gray-200 space-y-4">
                                  {versionHistory.map((version, i) => (
                                    <div key={version.id} className="relative">
                                      {/* Timeline dot */}
                                      <div className={cn(
                                        'absolute -left-[21px] w-4 h-4 rounded-full border-2 bg-white',
                                        i === 0 ? 'border-emerald-500' : 'border-gray-300'
                                      )} />

                                      <div className="ml-2">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className={cn(
                                            'text-xs font-medium',
                                            i === 0 ? 'text-gray-900' : 'text-gray-500'
                                          )}>
                                            {version.fileName}
                                          </span>
                                          {i === 0 && (
                                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 rounded">
                                              Current
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-[11px] text-gray-400">
                                          {formatDate(version.uploadedAt)} by {version.uploadedBy}
                                        </p>
                                        {version.reason && (
                                          <p className="text-[11px] text-amber-600 mt-1">
                                            Replaced: {version.reason}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Delete Confirmation Modal */}
                        {isDeleteConfirmOpen && (
                          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                              <div className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-rose-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-gray-900">Remove Document</h3>
                                    <p className="text-sm text-gray-500">This action affects the entire case</p>
                                  </div>
                                </div>

                                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-4">
                                  <p className="text-sm text-rose-800 mb-2">
                                    Removing <strong>{uploadedDoc.fileName}</strong> will:
                                  </p>
                                  <ul className="text-sm text-rose-700 space-y-1">
                                    <li className="flex items-start gap-2">
                                      <span className="text-rose-400 mt-1">•</span>
                                      Mark this evidence requirement as incomplete
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="text-rose-400 mt-1">•</span>
                                      Remove extracted data from case records
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="text-rose-400 mt-1">•</span>
                                      Potentially affect compliance checks
                                    </li>
                                  </ul>
                                </div>

                                <p className="text-xs text-gray-500 mb-4">
                                  This action cannot be undone. The file will be permanently removed from this case.
                                </p>
                              </div>

                              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                                <button
                                  onClick={() => setShowDeleteConfirm(null)}
                                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleDeleteConfirm(uploadedDoc.id)}
                                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                                >
                                  Remove Document
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Empty State - Upload Zone */}
                    {!hasDoc && (
                      <div className="mt-5">
                        <label
                          className={cn(
                            'block border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all',
                            isDragging
                              ? 'border-[#0E4369] bg-[#0E4369]/5'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          )}
                          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => handleDrop(e, type.typeId)}
                        >
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => handleFileSelect(e.target.files, type.typeId)}
                          />

                          <div className="text-center">
                            <div className={cn(
                              'w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4 transition-colors',
                              isDragging ? 'bg-[#0E4369]/10' : 'bg-gray-100'
                            )}>
                              <Upload className={cn(
                                'w-6 h-6 transition-colors',
                                isDragging ? 'text-[#0E4369]' : 'text-gray-400'
                              )} />
                            </div>
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              {isDragging ? 'Drop to upload' : 'Click to upload or drag and drop'}
                            </p>
                            <p className="text-xs text-gray-500">
                              PDF, JPG, PNG or DOC up to 10MB
                            </p>
                          </div>
                        </label>

                        {/* Requirements */}
                        {type.requirements.length > 0 && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                              Requirements
                            </h4>
                            <ul className="space-y-1.5">
                              {type.requirements.map((req, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {type.conditionalNote && (
                          <div className="flex items-start gap-2 mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800">{type.conditionalNote}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Styles for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in-95 {
          from { transform: scale(0.95); }
          to { transform: scale(1); }
        }
        .animate-in {
          animation: fade-in 0.2s ease-out, zoom-in-95 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
