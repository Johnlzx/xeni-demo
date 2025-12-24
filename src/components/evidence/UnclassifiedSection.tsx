'use client';

import { useState, useCallback } from 'react';
import {
  FileQuestion,
  Upload,
  FileText,
  Sparkles,
  ArrowRight,
  X,
  Eye,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/utils';
import type { Document, EvidenceSlot } from '@/types';

interface UnclassifiedSectionProps {
  documents: Document[];
  slots: EvidenceSlot[];
  onUpload: (file: File) => void;
  onAssign: (docId: string, slotIds: string[], typeId: string) => void;
  onPreview: (docId: string) => void;
  onRemove: (docId: string) => void;
}

export function UnclassifiedSection({
  documents,
  slots,
  onUpload,
  onAssign,
  onPreview,
  onRemove,
}: UnclassifiedSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [assigningDoc, setAssigningDoc] = useState<Document | null>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        Array.from(files).forEach((file) => {
          onUpload(file);
        });
      }
    },
    [onUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        Array.from(files).forEach((file) => {
          onUpload(file);
        });
      }
      e.target.value = '';
    },
    [onUpload]
  );

  // Get suggested slots for a document (mock AI suggestion)
  const getSuggestedSlots = (doc: Document): EvidenceSlot[] => {
    // In a real app, this would use AI to detect document type
    // For now, return slots that aren't already satisfied
    return slots.filter(
      (s) =>
        s.status !== 'hidden' &&
        s.status !== 'satisfied' &&
        s.progress.current < (s.maxCount ?? 1)
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <FileQuestion className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Unclassified Documents
            </h2>
            <p className="text-sm text-gray-600">
              {documents.length === 0
                ? 'Upload documents here to classify them later'
                : `${documents.length} document${documents.length > 1 ? 's' : ''} waiting to be classified`}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Upload Drop Zone */}
        <div
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 mb-6',
            isDragging
              ? 'border-amber-400 bg-amber-50'
              : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
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
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="hidden"
            id="unclassified-upload"
            onChange={handleFileSelect}
          />
          <label htmlFor="unclassified-upload" className="cursor-pointer">
            <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-gray-500">
              We'll help you classify them using AI
            </p>
          </label>
        </div>

        {/* Unclassified Documents List */}
        {documents.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Awaiting Classification
            </h3>
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* File Icon */}
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.fileName || doc.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {doc.fileSize ? formatFileSize(doc.fileSize) : 'Unknown size'}{' '}
                      · {doc.fileType || 'Document'}
                    </p>

                    {/* AI Suggestion */}
                    <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 rounded-lg">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-xs text-amber-700">
                        AI suggests: Assign to available slots
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onPreview(doc.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemove(doc.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Assign Button */}
                <button
                  onClick={() => setAssigningDoc(doc)}
                  className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0E4369] text-white text-sm font-medium rounded-lg hover:bg-[#0B3654] transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  Assign to Slot
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {documents.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FileQuestion className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500 mb-1">No unclassified documents</p>
            <p className="text-xs text-gray-400">
              All documents have been assigned to slots
            </p>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {assigningDoc && (
        <SlotAssignmentModal
          document={assigningDoc}
          slots={getSuggestedSlots(assigningDoc)}
          onAssign={(slotIds, typeId) => {
            onAssign(assigningDoc.id, slotIds, typeId);
            setAssigningDoc(null);
          }}
          onClose={() => setAssigningDoc(null)}
        />
      )}
    </div>
  );
}

// Inline Slot Assignment Modal
interface SlotAssignmentModalProps {
  document: Document;
  slots: EvidenceSlot[];
  onAssign: (slotIds: string[], typeId: string) => void;
  onClose: () => void;
}

function SlotAssignmentModal({
  document,
  slots,
  onAssign,
  onClose,
}: SlotAssignmentModalProps) {
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');

  const handleSlotToggle = (slotId: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId]
    );
  };

  const handleConfirm = () => {
    if (selectedSlots.length > 0) {
      // Get the first acceptable type from the first selected slot
      const firstSlot = slots.find((s) => s.id === selectedSlots[0]);
      const typeId = selectedType || firstSlot?.acceptableTypes[0]?.typeId || '';
      onAssign(selectedSlots, typeId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Assign Document to Slots
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Document Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-6">
            <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {document.fileName || document.name}
              </p>
              <p className="text-xs text-gray-500">
                {document.fileSize ? formatFileSize(document.fileSize) : 'Document'}
              </p>
            </div>
          </div>

          {/* Slot Selection */}
          <p className="text-sm text-gray-600 mb-3">
            Select which requirement(s) this document satisfies:
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {slots.map((slot) => (
              <label
                key={slot.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                  selectedSlots.includes(slot.id)
                    ? 'border-[#0E4369] bg-[#0E4369]/5'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedSlots.includes(slot.id)}
                  onChange={() => handleSlotToggle(slot.id)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0E4369] focus:ring-[#0E4369]"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{slot.name}</p>
                  <p className="text-xs text-gray-500">
                    {slot.progress.current}/{slot.progress.required} docs
                  </p>
                </div>
              </label>
            ))}
          </div>

          {slots.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">
                No available slots for this document
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedSlots.length === 0}
            className={cn(
              'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
              selectedSlots.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[#0E4369] hover:bg-[#0B3654]'
            )}
          >
            Assign to {selectedSlots.length || 0} Slot
            {selectedSlots.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
