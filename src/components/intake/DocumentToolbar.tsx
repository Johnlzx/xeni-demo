'use client';

import { useState } from 'react';
import { Button, Modal, Badge } from '@/components/ui';
import { Combine, Minimize2, FileText, CheckCircle, Loader2 } from 'lucide-react';

interface DocumentToolbarProps {
  selectedDocuments: string[];
  onMerge: (documentIds: string[]) => void;
  onCompress: (documentIds: string[]) => void;
}

export function DocumentToolbar({
  selectedDocuments,
  onMerge,
  onCompress,
}: DocumentToolbarProps) {
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showCompressModal, setShowCompressModal] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 p-4 bg-gray-50 border-t border-gray-200">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Combine className="w-4 h-4" />}
          onClick={() => setShowMergeModal(true)}
        >
          Merge PDFs
        </Button>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Minimize2 className="w-4 h-4" />}
          onClick={() => setShowCompressModal(true)}
        >
          Compress
        </Button>

        {selectedDocuments.length > 0 && (
          <span className="text-sm text-gray-500 ml-auto">
            {selectedDocuments.length} document{selectedDocuments.length > 1 ? 's' : ''} selected
          </span>
        )}
      </div>

      <MergeModal
        isOpen={showMergeModal}
        onClose={() => setShowMergeModal(false)}
        onConfirm={() => {
          onMerge(selectedDocuments);
          setShowMergeModal(false);
        }}
      />

      <CompressModal
        isOpen={showCompressModal}
        onClose={() => setShowCompressModal(false)}
        onConfirm={() => {
          onCompress(selectedDocuments);
          setShowCompressModal(false);
        }}
      />
    </>
  );
}

interface MergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function MergeModal({ isOpen, onClose, onConfirm }: MergeModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsComplete(true);
    setTimeout(() => {
      setIsComplete(false);
      onConfirm();
    }, 1500);
  };

  const handleClose = () => {
    setIsProcessing(false);
    setIsComplete(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Merge PDF Documents"
      size="md"
      footer={
        !isComplete && (
          <>
            <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} loading={isProcessing}>
              {isProcessing ? 'Merging...' : 'Merge Documents'}
            </Button>
          </>
        )
      }
    >
      <div className="py-4">
        {isComplete ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-success-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Documents Merged Successfully
            </h3>
            <p className="text-sm text-gray-500">
              The merged document has been saved to your case.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              This will combine multiple PDF documents into a single file. The documents will be
              merged in the order shown below.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">bank_statement_jan.pdf</span>
                <Badge variant="outline" size="sm" className="ml-auto">
                  1.2 MB
                </Badge>
              </div>
              <div className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">bank_statement_feb.pdf</span>
                <Badge variant="outline" size="sm" className="ml-auto">
                  1.1 MB
                </Badge>
              </div>
              <div className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">bank_statement_mar.pdf</span>
                <Badge variant="outline" size="sm" className="ml-auto">
                  1.3 MB
                </Badge>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Estimated output size: ~3.6 MB
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}

interface CompressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function CompressModal({ isOpen, onClose, onConfirm }: CompressModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsComplete(true);
    setTimeout(() => {
      setIsComplete(false);
      onConfirm();
    }, 1500);
  };

  const handleClose = () => {
    setIsProcessing(false);
    setIsComplete(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Compress Documents"
      size="md"
      footer={
        !isComplete && (
          <>
            <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} loading={isProcessing}>
              {isProcessing ? 'Compressing...' : 'Compress'}
            </Button>
          </>
        )
      }
    >
      <div className="py-4">
        {isComplete ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-success-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Compression Complete
            </h3>
            <p className="text-sm text-gray-500">
              File size reduced from 8.5 MB to 3.2 MB (62% smaller)
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Compress documents to meet file size requirements for government portal uploads.
            </p>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">bank_statements.pdf</p>
                  <p className="text-xs text-gray-500">Current size: 8.5 MB</p>
                </div>
                <Badge variant="error" className="ml-auto">
                  Exceeds 5MB limit
                </Badge>
              </div>

              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-error-500 rounded-full" style={{ width: '85%' }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0 MB</span>
                <span>5 MB limit</span>
                <span>10 MB</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Estimated compressed size: ~3.2 MB (meets requirements)
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}
