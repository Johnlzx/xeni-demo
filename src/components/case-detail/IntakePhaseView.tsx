'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  ChevronRight,
  X,
  AlertCircle,
  Send,
} from 'lucide-react';
import {
  EvidenceSlotList,
  EvidenceSlotModal,
  DocumentPreviewModal,
} from '@/components/evidence';
import { CaseProfileView } from './CaseProfileView';
import { RequestDocumentsModal } from './RequestDocumentsModal';
import { useEvidenceSlots } from '@/hooks/useEvidenceSlots';
import { cn, formatFileSize } from '@/lib/utils';
import type { Case, Document, VisaType, Issue, EvidenceSlot, ChecklistItem } from '@/types';

interface IntakePhaseViewProps {
  caseId: string;
  visaType: VisaType;
  documents: Document[];
  issues: Issue[];
  /** Case data for profile view */
  caseData?: Case;
  /** Applicant info for request modal */
  applicantName: string;
  applicantEmail?: string;
  applicantPhone?: string;
  caseReference: string;
  onUploadUnclassified: (file: File) => void;
  /** Upload to specific document type */
  onUploadToSlot?: (file: File, slotId: string, typeId: string) => void;
  onPreview: (documentId: string) => void;
  onRemove: (documentId: string) => void;
  onSendRequest: (slotIds: string[], channel: 'email' | 'whatsapp', message: string) => void;
  /** Callback for resolving issues */
  onResolveIssue?: (issueId: string) => void;
  /** External slot selection - when set, will navigate to that slot */
  jumpToSlotId?: string | null;
  /** External trigger to open upload modal */
  uploadTrigger?: number;
  /** Callback to launch Form Pilot */
  onLaunchFormPilot?: () => void;
}

export function IntakePhaseView({
  caseId,
  visaType,
  documents,
  issues,
  caseData,
  applicantName,
  applicantEmail,
  applicantPhone,
  caseReference,
  onUploadUnclassified,
  onUploadToSlot,
  onPreview,
  onRemove,
  onSendRequest,
  onResolveIssue,
  jumpToSlotId,
  uploadTrigger,
  onLaunchFormPilot,
}: IntakePhaseViewProps) {
  // Modal slot - the slot currently open in modal (null = no modal)
  const [modalSlotId, setModalSlotId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [slotsToRequest, setSlotsToRequest] = useState<EvidenceSlot[]>([]);
  const [previewDocId, setPreviewDocId] = useState<string | null>(null);
  // Demo mode: track slots that have been "completed" for animation demo
  const [demoCompletedSlots, setDemoCompletedSlots] = useState<Set<string>>(new Set());

  // Sync with external slot jump request - open modal for that slot
  useEffect(() => {
    if (jumpToSlotId) {
      setModalSlotId(jumpToSlotId);
    }
  }, [jumpToSlotId]);

  // Handle external upload trigger
  useEffect(() => {
    if (uploadTrigger && uploadTrigger > 0) {
      setShowUploadModal(true);
    }
  }, [uploadTrigger]);

  // Use the Evidence Slots hook
  const { slots: rawSlots, progress: rawProgress, getDocsForSlot, getSlotById } =
    useEvidenceSlots({
      visaType,
      caseId,
      documents,
    });

  // Apply demo completion overrides
  const slots = rawSlots.map(slot =>
    demoCompletedSlots.has(slot.id)
      ? { ...slot, status: 'satisfied' as const }
      : slot
  );

  // Recalculate progress with demo overrides
  const progress = {
    ...rawProgress,
    satisfied: slots.filter(s => s.status === 'satisfied').length,
    requiredSatisfied: slots.filter(s => s.priority === 'required' && s.status === 'satisfied').length,
  };

  // Get modal slot data
  const modalSlot = modalSlotId ? slots.find(s => s.id === modalSlotId) : null;
  const modalSlotDocs = modalSlotId ? getDocsForSlot(modalSlotId) : [];

  // Get issues for the modal slot
  const modalSlotIssues = modalSlotId
    ? issues.filter(
        issue =>
          issue.targetSlotId === modalSlotId ||
          issue.documentIds.some(docId =>
            documents.find(d => d.id === docId)?.assignedToSlots?.includes(modalSlotId)
          )
      )
    : [];

  // Get document to preview
  const previewDocument = previewDocId ? documents.find(d => d.id === previewDocId) : null;

  // Handle preview
  const handlePreview = useCallback((docId: string) => {
    setPreviewDocId(docId);
  }, []);

  // Demo: simulate completing a slot
  const handleDemoComplete = useCallback((slotId: string) => {
    setDemoCompletedSlots(prev => {
      const newSet = new Set(prev);
      newSet.add(slotId);
      return newSet;
    });
  }, []);

  // Open slot modal
  const handleSlotSelect = useCallback((slotId: string) => {
    setModalSlotId(slotId);
  }, []);

  // Close slot modal
  const handleCloseSlotModal = useCallback(() => {
    setModalSlotId(null);
  }, []);

  // Handle global upload (AI classification)
  const handleGlobalUpload = useCallback((files: File[]) => {
    files.forEach(file => onUploadUnclassified(file));
    setShowUploadModal(false);
  }, [onUploadUnclassified]);

  // Handle request documents from client
  const handleRequestDocuments = useCallback((slotIds: string[]) => {
    const selectedSlots = slotIds
      .map(id => slots.find(s => s.id === id))
      .filter((s): s is EvidenceSlot => s !== undefined);

    if (selectedSlots.length > 0) {
      setSlotsToRequest(selectedSlots);
      setShowRequestModal(true);
    }
  }, [slots]);

  // Handle send request (after modal confirmation)
  const handleSendRequest = useCallback((channel: 'email' | 'whatsapp', message: string) => {
    const slotIds = slotsToRequest.map(s => s.id);
    onSendRequest(slotIds, channel, message);
    setShowRequestModal(false);
    setSlotsToRequest([]);
  }, [slotsToRequest, onSendRequest]);

  // Handle slot-specific upload (from EvidenceSlotModal)
  const handleSlotUpload = useCallback((file: File, typeId?: string) => {
    if (modalSlotId && onUploadToSlot && typeId) {
      onUploadToSlot(file, modalSlotId, typeId);
    } else {
      // Fallback to unclassified upload if no slot context
      onUploadUnclassified(file);
    }
  }, [modalSlotId, onUploadToSlot, onUploadUnclassified]);

  return (
    <div className="flex h-full">
      {/* Left Panel: Case Profile View */}
      <div className="flex-1 overflow-hidden border-r border-gray-200 bg-gray-50">
        {caseData ? (
          <CaseProfileView
            caseData={caseData}
            documents={documents}
            issues={issues}
            onLaunchFormPilot={onLaunchFormPilot}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">Loading case profile...</p>
          </div>
        )}
      </div>

      {/* Right Panel: Evidence Slot List */}
      <div className="w-96 flex flex-col bg-white">
        <EvidenceSlotList
          slots={slots}
          selectedSlotId={null}
          onSlotSelect={handleSlotSelect}
          onUpload={() => setShowUploadModal(true)}
          onRequestDocuments={handleRequestDocuments}
          progress={progress}
        />
      </div>

      {/* Evidence Slot Modal */}
      {modalSlot && (
        <EvidenceSlotModal
          isOpen={!!modalSlot}
          onClose={handleCloseSlotModal}
          slot={modalSlot}
          documents={modalSlotDocs}
          issues={modalSlotIssues}
          onPreview={handlePreview}
          onRemove={onRemove}
          onUpload={handleSlotUpload}
          onSendRequest={(slotId) => handleRequestDocuments([slotId])}
          onResolveIssue={onResolveIssue}
        />
      )}

      {/* Global Upload Modal */}
      {showUploadModal && (
        <GlobalUploadModal
          slots={slots}
          onUpload={handleGlobalUpload}
          onClose={() => setShowUploadModal(false)}
          onSlotJump={handleSlotSelect}
        />
      )}

      {/* Request Documents Modal */}
      <RequestDocumentsModal
        isOpen={showRequestModal}
        onClose={() => {
          setShowRequestModal(false);
          setSlotsToRequest([]);
        }}
        selectedSlots={slotsToRequest}
        applicantName={applicantName}
        applicantEmail={applicantEmail}
        applicantPhone={applicantPhone}
        caseReference={caseReference}
        onSend={handleSendRequest}
      />

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={!!previewDocId}
        onClose={() => setPreviewDocId(null)}
        document={previewDocument || null}
      />
    </div>
  );
}

// Global Upload Modal Component
interface GlobalUploadModalProps {
  slots: EvidenceSlot[];
  onUpload: (files: File[]) => void;
  onClose: () => void;
  onSlotJump: (slotId: string) => void;
}

function GlobalUploadModal({ slots, onUpload, onClose, onSlotJump }: GlobalUploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Array<{
    file: File;
    slotId: string;
    slotName: string;
    confidence: number;
  }>>([]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
    setUploadedFiles(files);
    setIsProcessing(true);

    // Simulate AI classification (in real app, this would be an API call)
    setTimeout(() => {
      const mockResults = files.map(file => {
        // Simple mock classification based on filename
        let slotId = 'identity';
        let slotName = 'Identity Documents';
        let confidence = 0.95;

        const fileName = file.name.toLowerCase();
        if (fileName.includes('passport')) {
          slotId = 'identity';
          slotName = 'Identity Documents';
          confidence = 0.98;
        } else if (fileName.includes('bank') || fileName.includes('statement')) {
          slotId = 'financial_evidence';
          slotName = 'Financial Evidence';
          confidence = 0.92;
        } else if (fileName.includes('employment') || fileName.includes('letter')) {
          slotId = 'employment_proof';
          slotName = 'Employment Proof';
          confidence = 0.88;
        } else if (fileName.includes('ielts') || fileName.includes('english')) {
          slotId = 'english_proof';
          slotName = 'English Language Proof';
          confidence = 0.95;
        } else if (fileName.includes('utility') || fileName.includes('bill')) {
          slotId = 'address_proof';
          slotName = 'Proof of Address';
          confidence = 0.90;
        } else {
          confidence = 0.45; // Low confidence for unrecognized files
        }

        return { file, slotId, slotName, confidence };
      });

      setResults(mockResults);
      setIsProcessing(false);
    }, 1500);
  };

  const handleConfirm = () => {
    onUpload(uploadedFiles);
    onClose();
  };

  const handleGoToSlot = (slotId: string) => {
    onClose();
    onSlotJump(slotId);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Upload Documents</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Drop files here and AI will automatically classify them
          </p>
        </div>

        <div className="p-6">
          {!uploadedFiles.length ? (
            // Drop zone
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragging ? 'border-[#0E4369] bg-[#0E4369]/5' : 'border-gray-200 hover:border-gray-300'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
                id="global-upload"
                onChange={handleFileSelect}
              />
              <label htmlFor="global-upload" className="cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Drop files here or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  Supports PDF, JPG, PNG, DOC (max 10MB each)
                </p>
              </label>
            </div>
          ) : isProcessing ? (
            // Processing state
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-[#0E4369]/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-6 h-6 text-[#0E4369] animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">AI is analyzing your documents...</p>
              <p className="text-xs text-gray-500 mt-1">This usually takes a few seconds</p>
            </div>
          ) : (
            // Results
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Classification Results
              </p>
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    result.confidence > 0.7 ? 'bg-emerald-100' : 'bg-amber-100'
                  }`}>
                    {result.confidence > 0.7 ? (
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{result.file.name}</p>
                    <p className="text-xs text-gray-500">
                      → {result.slotName}
                      <span className={`ml-2 ${result.confidence > 0.7 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        ({Math.round(result.confidence * 100)}% confident)
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleGoToSlot(result.slotId)}
                    className="text-xs text-[#0E4369] hover:underline"
                  >
                    View Slot
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {results.length > 0 && !isProcessing && (
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0E4369] hover:bg-[#0B3654] rounded-lg transition-colors"
            >
              Confirm Upload
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ onSelectFirstSlot }: { onSelectFirstSlot: () => void }) {
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
      <div className="text-center max-w-sm">
        {/* Decorative illustration */}
        <div className="relative mx-auto mb-6 w-32 h-32">
          <div className="absolute inset-0 bg-[#0E4369]/5 rounded-full animate-pulse" />
          <div className="absolute inset-4 bg-[#0E4369]/10 rounded-full" />
          <div className="absolute inset-8 bg-white rounded-full shadow-inner flex items-center justify-center">
            <svg
              className="w-10 h-10 text-[#0E4369]/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Select an Evidence Requirement
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Choose a requirement from the left panel to view acceptable document types and upload documents.
        </p>
        <button
          onClick={onSelectFirstSlot}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0E4369] bg-[#0E4369]/5 rounded-lg hover:bg-[#0E4369]/10 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
          Get Started
        </button>
      </div>
    </div>
  );
}

// =================================================================
// Legacy IntakePhaseView (keeping for backward compatibility)
// =================================================================

interface LegacyIntakePhaseViewProps {
  checklistItems: ChecklistItem[];
  documents: Document[];
  issues: Issue[];
  onUpload: (checklistItemId: string, file: File) => void;
  onPreview: (documentId: string) => void;
  onSendRequest: (checklistItemIds: string[]) => void;
}

export function LegacyIntakePhaseView({
  checklistItems,
  documents,
  issues,
  onUpload,
  onPreview,
  onSendRequest,
}: LegacyIntakePhaseViewProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

  // Group items by category
  const groupedItems = (() => {
    const groups: Record<string, ChecklistItem[]> = {};
    checklistItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  })();

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

  // Get pending items
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
      {/* Left Panel */}
      <div className="w-96 border-r border-gray-200 flex flex-col bg-white">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Document Checklist</h2>
            <span className="text-sm text-gray-500">
              {checklistItems.filter((i) => i.completed).length} / {checklistItems.length}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0E4369] rounded-full transition-all duration-500"
              style={{
                width: `${(checklistItems.filter((i) => i.completed).length / checklistItems.length) * 100}%`,
              }}
            />
          </div>
        </div>

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
                          {hasIssues && (
                            <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-amber-700">
                                    {itemIssues[0].title}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <ChevronRight className={cn('w-4 h-4 text-gray-300', isSelected && 'text-[#0E4369]')} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {pendingItems.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-white">
            <button
              onClick={() => onSendRequest(pendingItems.map((i) => i.id))}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0E4369] text-white rounded-lg font-medium text-sm hover:bg-[#0B3654] transition-colors"
            >
              <Send className="w-4 h-4" />
              Request {pendingItems.length} Document{pendingItems.length > 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-gray-50 flex flex-col">
        {selectedItem ? (
          <>
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
            <div className="flex-1 p-6 overflow-y-auto">
              {selectedDocument ? (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="font-medium">{selectedDocument.fileName}</p>
                      <p className="text-sm text-gray-500">{selectedDocument.status}</p>
                    </div>
                    <button
                      onClick={() => onPreview(selectedDocument.id)}
                      className="ml-auto px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      <Eye className="w-4 h-4 inline mr-1" /> Preview
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Drop file here to upload</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Select a document from the checklist</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
