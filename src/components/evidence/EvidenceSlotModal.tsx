'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
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
  AlertTriangle,
  File,
  Image as ImageIcon,
  ExternalLink,
  History,
  RefreshCw,
  X,
  Zap,
  ArrowLeft,
  Mail,
  MessageCircle,
  Copy,
  Check,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentPipeline, PipelineStatusBadge } from './DocumentPipeline';
import type { EvidenceSlot, Document, Issue, AcceptableDocumentType } from '@/types';
import { getSlotStatusColor } from '@/hooks/useEvidenceSlots';

type ModalView = 'details' | 'request';
type Channel = 'email' | 'whatsapp';

interface EvidenceSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: EvidenceSlot;
  documents: Document[];
  issues: Issue[];
  onPreview: (docId: string) => void;
  onRemove: (docId: string) => void;
  onUpload?: (file: File, typeId?: string) => void;
  onSendRequest?: (slotId: string, channel: Channel, message: string) => void;
  onResolveIssue?: (issueId: string) => void;
  // Applicant info for request form
  applicantName?: string;
  applicantEmail?: string;
  applicantPhone?: string;
  caseReference?: string;
}

// AI Message Generator
function generateMessage(
  channel: Channel,
  slot: EvidenceSlot,
  applicantName: string,
  caseReference: string
): string {
  const firstName = applicantName.split(' ')[0];
  const requirements = slot.acceptableTypes[0]?.requirements || [];
  const acceptedTypes = slot.acceptableTypes.map(t => t.label).slice(0, 2);

  if (channel === 'whatsapp') {
    let msg = `Hi ${firstName}! 👋\n\n`;
    msg += `Quick update on your application (Ref: ${caseReference}).\n\n`;
    msg += `We need: *${slot.name}*\n\n`;
    if (acceptedTypes.length > 0) {
      msg += `Accepted: ${acceptedTypes.join(' or ')}\n`;
    }
    if (requirements.length > 0) {
      msg += `\n⚠️ ${requirements[0]}\n`;
    }
    msg += `\nPlease upload via your portal or reply with a photo/scan.\n\nQuestions? Just reply! 📱`;
    return msg;
  } else {
    let msg = `Dear ${applicantName},\n\n`;
    msg += `I hope this email finds you well. Regarding your application (Reference: ${caseReference}).\n\n`;
    msg += `We require the following documentation:\n\n`;
    msg += `• ${slot.name}\n`;
    if (acceptedTypes.length > 0) {
      msg += `  Acceptable formats: ${acceptedTypes.join(', ')}\n`;
    }
    if (requirements.length > 0) {
      requirements.slice(0, 3).forEach(req => {
        msg += `  - ${req}\n`;
      });
    }
    msg += `\nPlease upload through your secure client portal at your earliest convenience.\n\n`;
    msg += `Kind regards,\n[Your Name]\nImmigration Advisor`;
    return msg;
  }
}

export function EvidenceSlotModal({
  isOpen,
  onClose,
  slot,
  documents,
  issues,
  onPreview,
  onRemove,
  onUpload,
  onSendRequest,
  onResolveIssue,
  applicantName = 'Client',
  applicantEmail,
  applicantPhone,
  caseReference = 'REF-000',
}: EvidenceSlotModalProps) {
  const colors = getSlotStatusColor(slot.status);
  const [currentView, setCurrentView] = useState<ModalView>('details');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Request form state
  const [channel, setChannel] = useState<Channel>('email');
  const [customMessage, setCustomMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Reset view when modal opens/closes or slot changes
  useEffect(() => {
    if (isOpen) {
      setCurrentView('details');
      setCustomMessage(null);
      setCopied(false);
      setIsSending(false);
    }
  }, [isOpen, slot.id]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (currentView === 'request') {
          setCurrentView('details');
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, currentView, onClose]);

  // Generated message
  const generatedMessage = useMemo(() => {
    return generateMessage(channel, slot, applicantName, caseReference);
  }, [channel, slot, applicantName, caseReference]);

  const message = customMessage ?? generatedMessage;

  if (!isOpen) return null;

  // Get all documents for each type
  const getDocsForType = (typeId: string): Document[] => {
    return documents.filter((doc) => doc.documentTypeId === typeId);
  };

  // Filter issues for this slot
  const templateSlotId = slot.id.replace(/^case-\d+-/, '');
  const slotIssues = issues.filter(
    (issue) =>
      issue.targetSlotId === templateSlotId ||
      issue.documentIds.some((docId) =>
        documents.find((d) => d.id === docId)?.assignedToSlots?.includes(templateSlotId)
      )
  );

  const handleFileSelect = (files: FileList | null, typeId?: string) => {
    if (files && files.length > 0 && onUpload) {
      onUpload(files[0], typeId);
    }
  };

  const handleDrop = (e: React.DragEvent, typeId?: string) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files, typeId);
  };

  const handleDeleteConfirm = (docId: string) => {
    onRemove(docId);
    setShowDeleteConfirm(null);
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setCustomMessage(null);
      setIsGenerating(false);
    }, 800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      if (onSendRequest) {
        onSendRequest(slot.id, channel, message);
      }
      setIsSending(false);
      onClose();
    }, 1000);
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
    });
  };

  const getFileIcon = (fileType?: string) => {
    if (fileType?.includes('pdf')) return <FileText className="w-5 h-5" />;
    if (fileType?.includes('image')) return <ImageIcon className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          'relative w-full max-w-2xl max-h-[90vh]',
          'bg-white rounded-2xl shadow-2xl',
          'overflow-hidden flex flex-col'
        )}
        style={{
          animation: 'modalSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div className={cn(
          'px-6 py-5 border-b transition-all duration-300',
          currentView === 'request'
            ? 'bg-gradient-to-r from-slate-50 to-white'
            : colors.bg
        )}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Request View Header */}
          {currentView === 'request' ? (
            <div className="flex items-center gap-4 pr-10">
              <button
                onClick={() => setCurrentView('details')}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Request Document</h2>
                <p className="text-sm text-gray-500 mt-0.5">{slot.name}</p>
              </div>
            </div>
          ) : (
            /* Details View Header */
            <div className="flex items-start gap-4 pr-10">
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
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
                <p className="text-sm text-gray-500">{slot.description}</p>

                {/* Priority Badge */}
                <div className="flex items-center gap-3 mt-3">
                  {slot.priority === 'required' && (
                    <span className="text-[11px] text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded">
                      Required for submission
                    </span>
                  )}
                  {slot.priority === 'optional' && (
                    <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                      Optional
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar for multi-doc slots (only in details view) */}
          {currentView === 'details' && slot.progress.required > 1 && (
            <div className="mt-4">
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

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* ========== DETAILS VIEW ========== */}
          {currentView === 'details' && (
            <>
              {/* Issues Section - Prominent at Top */}
              {slotIssues.length > 0 && (
                <div className="p-4 bg-amber-50 border-b border-amber-100">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-semibold text-amber-800">
                      {slotIssues.length} Issue{slotIssues.length > 1 ? 's' : ''} to Resolve
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {slotIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="bg-white rounded-lg border border-amber-200 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={cn(
                                  'text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded',
                                  issue.type === 'quality'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-rose-100 text-rose-700'
                                )}
                              >
                                {issue.type}
                              </span>
                              <span
                                className={cn(
                                  'text-[10px] font-medium px-1.5 py-0.5 rounded',
                                  issue.severity === 'error'
                                    ? 'bg-rose-50 text-rose-600'
                                    : issue.severity === 'warning'
                                    ? 'bg-amber-50 text-amber-600'
                                    : 'bg-slate-50 text-slate-600'
                                )}
                              >
                                {issue.severity}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              {issue.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {issue.description}
                            </p>
                            {issue.suggestion && (
                              <div className="flex items-start gap-1.5 mt-2 text-xs text-blue-600">
                                <Zap className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span>{issue.suggestion}</span>
                              </div>
                            )}
                          </div>
                          {onResolveIssue && issue.status === 'open' && (
                            <button
                              onClick={() => onResolveIssue(issue.id)}
                              className="flex-shrink-0 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Acceptable Types Section */}
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Acceptable Documents
                  </h3>
                  {slot.status !== 'satisfied' && (
                    <button
                      onClick={() => setCurrentView('request')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#0E4369] hover:bg-[#0B3654] rounded-lg transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Request from Client
                    </button>
                  )}
                </div>

                {slot.acceptableTypes.map((type, index) => {
                  const uploadedDocs = getDocsForType(type.typeId);
                  const hasDoc = uploadedDocs.length > 0;

                  return (
                    <div key={type.typeId}>
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
                      <DocumentTypeCard
                        type={type}
                        uploadedDocs={uploadedDocs}
                        hasDoc={hasDoc}
                        isDragging={isDragging}
                        setIsDragging={setIsDragging}
                        onPreview={onPreview}
                        onRemove={onRemove}
                        onUpload={onUpload}
                        handleDrop={handleDrop}
                        handleFileSelect={handleFileSelect}
                        formatFileSize={formatFileSize}
                        formatDate={formatDate}
                        getFileIcon={getFileIcon}
                        showDeleteConfirm={showDeleteConfirm}
                        setShowDeleteConfirm={setShowDeleteConfirm}
                        handleDeleteConfirm={handleDeleteConfirm}
                        expandedHistory={expandedHistory}
                        setExpandedHistory={setExpandedHistory}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ========== REQUEST VIEW ========== */}
          {currentView === 'request' && (
            <>
              {/* Recipient Info */}
              <div className="px-6 py-4 bg-slate-50/50 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#0E4369]/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#0E4369]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{applicantName}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      {applicantEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {applicantEmail}
                        </span>
                      )}
                      {applicantPhone && (
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {applicantPhone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Case Ref</span>
                    <p className="text-sm font-mono text-gray-700">{caseReference}</p>
                  </div>
                </div>
              </div>

              {/* Channel Selector */}
              <div className="px-6 py-4 border-b border-gray-100">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 block">
                  Send via
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setChannel('email');
                      setCustomMessage(null);
                    }}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all',
                      channel === 'email'
                        ? 'border-[#0E4369] bg-[#0E4369]/5 text-[#0E4369]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <Mail className="w-5 h-5" />
                    <span className="font-medium">Email</span>
                  </button>
                  <button
                    onClick={() => {
                      setChannel('whatsapp');
                      setCustomMessage(null);
                    }}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all',
                      channel === 'whatsapp'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* AI-Generated Message */}
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                    AI-Drafted Message
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRegenerate}
                      disabled={isGenerating}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={cn('w-3 h-3', isGenerating && 'animate-spin')} />
                      Regenerate
                    </button>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Message Preview */}
                <div
                  className={cn(
                    'relative rounded-xl border overflow-hidden transition-all',
                    channel === 'whatsapp'
                      ? 'bg-[#e5ddd5] border-[#d1c8be]'
                      : 'bg-white border-gray-200'
                  )}
                >
                  {channel === 'whatsapp' ? (
                    <div className="p-4">
                      <div className="bg-[#dcf8c6] rounded-lg rounded-tr-none p-3 max-w-[90%] ml-auto shadow-sm">
                        <textarea
                          value={message}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          className="w-full bg-transparent text-sm text-gray-800 resize-none outline-none min-h-[180px]"
                          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                        />
                        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-500">
                          <span>Now</span>
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="pb-3 mb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                          <span className="font-medium text-gray-700">To:</span>
                          {applicantEmail || 'client@email.com'}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="font-medium text-gray-700">Subject:</span>
                          Document Request - {caseReference}
                        </div>
                      </div>
                      <textarea
                        value={message}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        className="w-full bg-transparent text-sm text-gray-700 resize-none outline-none min-h-[200px] leading-relaxed"
                        style={{ fontFamily: 'Georgia, serif' }}
                      />
                    </div>
                  )}

                  {isGenerating && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" />
                        Regenerating...
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {channel === 'whatsapp'
                    ? 'WhatsApp messages are concise for mobile reading'
                    : 'Email messages are formal for professional communication'
                  }
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer - Only in Request View */}
        {currentView === 'request' && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <button
              onClick={() => setCurrentView('details')}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
            >
              Back
            </button>
            <button
              onClick={handleSend}
              disabled={isSending}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all',
                channel === 'whatsapp'
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-[#0E4369] text-white hover:bg-[#0B3654]',
                isSending && 'opacity-70 cursor-not-allowed'
              )}
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send via {channel === 'whatsapp' ? 'WhatsApp' : 'Email'}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

interface DocumentTypeCardProps {
  type: AcceptableDocumentType;
  uploadedDocs: Document[];
  hasDoc: boolean;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  onPreview: (docId: string) => void;
  onRemove: (docId: string) => void;
  onUpload?: (file: File, typeId?: string) => void;
  handleDrop: (e: React.DragEvent, typeId?: string) => void;
  handleFileSelect: (files: FileList | null, typeId?: string) => void;
  formatFileSize: (bytes?: number) => string;
  formatDate: (dateString?: string) => string;
  getFileIcon: (fileType?: string) => React.ReactNode;
  showDeleteConfirm: string | null;
  setShowDeleteConfirm: (v: string | null) => void;
  handleDeleteConfirm: (docId: string) => void;
  expandedHistory: string | null;
  setExpandedHistory: (v: string | null) => void;
}

function DocumentTypeCard({
  type,
  uploadedDocs,
  hasDoc,
  isDragging,
  setIsDragging,
  onPreview,
  handleDrop,
  handleFileSelect,
  formatFileSize,
  formatDate,
  getFileIcon,
  showDeleteConfirm,
  setShowDeleteConfirm,
  handleDeleteConfirm,
  expandedHistory,
  setExpandedHistory,
}: DocumentTypeCardProps) {
  const isHistoryExpanded = expandedHistory === type.typeId;

  const hasIssues = uploadedDocs.some(doc =>
    doc.pipelineStatus === 'quality_issue' || doc.pipelineStatus === 'conflict'
  );
  const allReady = uploadedDocs.length > 0 && uploadedDocs.every(doc => doc.pipelineStatus === 'ready');

  return (
    <div
      className={cn(
        'rounded-xl border-2 transition-all duration-300 overflow-hidden',
        hasDoc
          ? allReady
            ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white'
            : hasIssues
            ? 'border-amber-200 bg-gradient-to-br from-amber-50/80 to-white'
            : 'border-blue-200 bg-gradient-to-br from-blue-50/80 to-white'
          : 'border-gray-200 border-dashed bg-white hover:border-gray-300 hover:bg-gray-50/30'
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              hasDoc
                ? allReady
                  ? 'bg-emerald-100 text-emerald-600'
                  : hasIssues
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-400'
            )}
          >
            <FileText className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="font-medium text-gray-900 text-sm">{type.label}</h4>
              {type.isPreferred && !hasDoc && (
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-semibold">
                  Recommended
                </span>
              )}
              {hasDoc && (
                <span className={cn(
                  'px-1.5 py-0.5 rounded text-[10px] font-semibold',
                  allReady
                    ? 'bg-emerald-100 text-emerald-700'
                    : hasIssues
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                )}>
                  {uploadedDocs.length} file{uploadedDocs.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{type.description}</p>
          </div>
        </div>

        {/* Uploaded Documents */}
        {hasDoc && (
          <div className="mt-4 space-y-2">
            {uploadedDocs.map((uploadedDoc) => (
              <div key={uploadedDoc.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-14 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-[#0E4369]/20 transition-all group overflow-hidden"
                      onClick={() => onPreview(uploadedDoc.id)}
                    >
                      {uploadedDoc.fileType?.includes('pdf') ? (
                        <div className="relative w-full h-full bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-rose-400" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <Eye className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                          {getFileIcon(uploadedDoc.fileType)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {uploadedDoc.fileName || uploadedDoc.name}
                        </p>
                        {uploadedDoc.pipelineStatus && (
                          <PipelineStatusBadge status={uploadedDoc.pipelineStatus} />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                        <span>{formatFileSize(uploadedDoc.fileSize)}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span>{formatDate(uploadedDoc.uploadedAt)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onPreview(uploadedDoc.id)}
                      className="px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {uploadedDoc.pipelineStatus && uploadedDoc.pipelineStatus !== 'ready' && (
                  <div className="px-3 pb-3">
                    <DocumentPipeline status={uploadedDoc.pipelineStatus} compact />
                  </div>
                )}

                {(uploadedDoc.pipelineStatus === 'quality_issue' || uploadedDoc.pipelineStatus === 'conflict') &&
                 uploadedDoc.qualityCheck?.issues && (
                  <div className="mx-3 mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <ul className="text-xs text-amber-700 space-y-0.5">
                        {uploadedDoc.qualityCheck.issues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
              <button
                onClick={() => setExpandedHistory(isHistoryExpanded ? null : type.typeId)}
                className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-700 transition-colors"
              >
                <History className="w-3 h-3" />
                History
              </button>

              <label className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#0E4369] bg-white border border-[#0E4369]/20 hover:bg-[#0E4369]/5 rounded-lg cursor-pointer transition-all">
                <Upload className="w-3 h-3" />
                Add more
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => handleFileSelect(e.target.files, type.typeId)}
                />
              </label>
            </div>
          </div>
        )}

        {/* Empty State - Upload Zone */}
        {!hasDoc && (
          <div className="mt-3">
            <label
              className={cn(
                'block border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all',
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
                <Upload className={cn(
                  'w-5 h-5 mx-auto mb-2 transition-colors',
                  isDragging ? 'text-[#0E4369]' : 'text-gray-400'
                )} />
                <p className="text-xs font-medium text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  PDF, JPG, PNG up to 10MB
                </p>
              </div>
            </label>

            {type.requirements.length > 0 && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <h5 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Requirements
                </h5>
                <ul className="space-y-1">
                  {type.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-gray-600">
                      <span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && uploadedDocs.some(d => d.id === showDeleteConfirm) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Remove Document</h3>
                  <p className="text-xs text-gray-500">This affects the entire case</p>
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 mb-3">
                <p className="text-xs text-rose-700">
                  This will mark the evidence requirement as incomplete and remove extracted data.
                </p>
              </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
