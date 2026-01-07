'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Document } from '@/types';
import type { HighlightState } from '../hooks/useWorkspaceState';

interface EvidenceTabProps {
  documents: Document[];
  selectedDocumentId: string | null;
  onSelectDocument: (id: string) => void;
  viewMode: 'original' | 'optimized';
  onViewModeChange: (mode: 'original' | 'optimized') => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  highlight: HighlightState | null;
}

export function EvidenceTab({
  documents,
  selectedDocumentId,
  onSelectDocument,
  viewMode,
  onViewModeChange,
  currentPage,
  onPageChange,
  zoomLevel,
  onZoomChange,
  highlight,
}: EvidenceTabProps) {
  const [isDragging, setIsDragging] = useState(false);

  const selectedDocument = documents.find(d => d.id === selectedDocumentId) || documents[0];
  const totalPages = 3; // Mock total pages

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file drop
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Upload Cards Row */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {/* Add File Card */}
          <motion.button
            className={cn(
              'flex-shrink-0 flex flex-col items-center justify-center gap-2',
              'w-28 h-24 rounded-xl border-2 border-dashed transition-all',
              isDragging
                ? 'border-primary-400 bg-primary-50 text-primary-600'
                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-400 hover:text-slate-600'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Upload className="w-5 h-5" />
            <span className="text-xs font-medium">Add File</span>
          </motion.button>

          {/* Document Cards */}
          {documents.map((doc, index) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              isSelected={doc.id === selectedDocumentId || (!selectedDocumentId && index === 0)}
              onSelect={() => onSelectDocument(doc.id)}
            />
          ))}

          {/* Empty state placeholder cards */}
          {documents.length === 0 && (
            <>
              <EmptyDocumentSlot />
              <EmptyDocumentSlot />
            </>
          )}
        </div>
      </div>

      {/* Document Viewer */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Viewer Toolbar */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex items-center justify-between">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <motion.button
              onClick={() => onViewModeChange('original')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                viewMode === 'original'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
              whileTap={{ scale: 0.98 }}
            >
              <Eye className="w-3.5 h-3.5" />
              Original
            </motion.button>
            <motion.button
              onClick={() => onViewModeChange('optimized')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                viewMode === 'optimized'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Enhanced
            </motion.button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onZoomChange(Math.max(50, zoomLevel - 25))}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              disabled={zoomLevel <= 50}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-600 w-12 text-center font-medium">
              {zoomLevel}%
            </span>
            <button
              onClick={() => onZoomChange(Math.min(200, zoomLevel + 25))}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              disabled={zoomLevel >= 200}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-600 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Preview Area */}
        <div className="flex-1 overflow-auto bg-slate-100 p-6">
          <div className="flex items-center justify-center min-h-full">
            {selectedDocument ? (
              <DocumentPreview
                document={selectedDocument}
                viewMode={viewMode}
                zoomLevel={zoomLevel}
                highlight={highlight}
              />
            ) : (
              <EmptyDocumentPreview />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Document Card Component
interface DocumentCardProps {
  document: Document;
  isSelected: boolean;
  onSelect: () => void;
}

function DocumentCard({ document, isSelected, onSelect }: DocumentCardProps) {
  const isComplete = document.pipelineStatus === 'ready';
  const fileName = document.fileName || document.name || 'Unknown';
  const isPDF = fileName.endsWith('.pdf');

  return (
    <motion.button
      onClick={onSelect}
      className={cn(
        'flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
        'w-28 h-24',
        isSelected
          ? 'border-primary-500 bg-primary-50'
          : 'border-slate-200 bg-white hover:border-slate-300'
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          isPDF ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
        )}>
          {isPDF ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
        </div>
        {isComplete && (
          <motion.div
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <CheckCircle2 className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </div>
      <span className="text-xs font-medium text-slate-700 truncate w-full text-center">
        {fileName.length > 12
          ? fileName.slice(0, 10) + '...'
          : fileName}
      </span>
    </motion.button>
  );
}

// Empty Document Slot
function EmptyDocumentSlot() {
  return (
    <div className="flex-shrink-0 flex flex-col items-center justify-center gap-2 w-28 h-24 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
        <FileText className="w-5 h-5 text-slate-300" />
      </div>
      <span className="text-xs text-slate-400">No file</span>
    </div>
  );
}

// Document Preview Component
interface DocumentPreviewProps {
  document: Document;
  viewMode: 'original' | 'optimized';
  zoomLevel: number;
  highlight: HighlightState | null;
}

function DocumentPreview({ document, viewMode, zoomLevel, highlight }: DocumentPreviewProps) {
  const fileName = document.fileName || document.name || 'Unknown';
  const isPDF = fileName.endsWith('.pdf');
  const scale = zoomLevel / 100;

  return (
    <motion.div
      className="relative bg-white rounded-lg shadow-lg overflow-hidden"
      style={{
        width: `${600 * scale}px`,
        height: `${800 * scale}px`,
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Mock document content */}
      <div className="absolute inset-0 p-8">
        {isPDF ? (
          <MockPassportDocument viewMode={viewMode} />
        ) : (
          <MockImageDocument />
        )}
      </div>

      {/* Highlight overlay */}
      <AnimatePresence>
        {highlight && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: `${highlight.region.bbox.x * 100}%`,
              top: `${highlight.region.bbox.y * 100}%`,
              width: `${highlight.region.bbox.width * 100}%`,
              height: `${highlight.region.bbox.height * 100}%`,
            }}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{
              opacity: highlight.animationPhase === 'exiting' ? 0 : 1,
              scale: 1,
              boxShadow: [
                '0 0 0 0 rgba(14, 67, 105, 0.4)',
                '0 0 0 8px rgba(14, 67, 105, 0.2)',
                '0 0 0 4px rgba(14, 67, 105, 0.3)',
              ],
            }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-full h-full rounded border-2 border-primary-500 bg-primary-100/30" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Mock Passport Document
function MockPassportDocument({ viewMode }: { viewMode: 'original' | 'optimized' }) {
  const isOptimized = viewMode === 'optimized';

  return (
    <div className={cn(
      'w-full h-full flex flex-col gap-4 font-mono text-sm',
      isOptimized ? 'text-slate-900' : 'text-slate-700'
    )}>
      <div className="text-center border-b pb-4 border-slate-200">
        <div className="text-xs text-slate-500 uppercase tracking-wider">United Kingdom</div>
        <div className="text-lg font-bold text-rose-800">PASSPORT</div>
      </div>

      <div className="flex gap-6">
        {/* Photo placeholder */}
        <div className="w-24 h-32 bg-slate-200 rounded flex items-center justify-center text-slate-400">
          Photo
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3 text-xs">
          <div>
            <div className="text-slate-400 text-[10px] uppercase">Surname</div>
            <div className={cn('font-semibold', isOptimized && 'text-slate-900')}>SMITH</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px] uppercase">Given Names</div>
            <div className={cn('font-semibold', isOptimized && 'text-slate-900')}>JOHN WILLIAM</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px] uppercase">Date of Birth</div>
            <div className={cn('font-semibold', isOptimized && 'text-slate-900')}>15 MAR 1988</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px] uppercase">Nationality</div>
            <div className={cn('font-semibold', isOptimized && 'text-slate-900')}>BRITISH CITIZEN</div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-200 space-y-2">
        <div className="flex justify-between text-xs">
          <div>
            <div className="text-slate-400 text-[10px] uppercase">Passport No.</div>
            <div className="font-semibold">GB1234567890</div>
          </div>
          <div className="text-right">
            <div className="text-slate-400 text-[10px] uppercase">Expiry Date</div>
            <div className="font-semibold">15 SEP 2030</div>
          </div>
        </div>

        {/* MRZ zone */}
        <div className="mt-4 p-2 bg-slate-100 rounded text-[8px] tracking-wider text-slate-600">
          P&lt;GBRSMITH&lt;&lt;JOHN&lt;WILLIAM&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
          <br />
          GB12345678901GBR8803151M3009155&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;02
        </div>
      </div>
    </div>
  );
}

// Mock Image Document
function MockImageDocument() {
  return (
    <div className="w-full h-full bg-slate-100 rounded flex items-center justify-center">
      <div className="text-slate-400 text-center">
        <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
        <div>Image Preview</div>
      </div>
    </div>
  );
}

// Empty Document Preview
function EmptyDocumentPreview() {
  return (
    <div className="flex flex-col items-center justify-center text-slate-400 p-12">
      <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center mb-4">
        <FileText className="w-12 h-12 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-600 mb-1">No document selected</h3>
      <p className="text-sm text-slate-500">Upload or select a document to preview</p>
    </div>
  );
}
