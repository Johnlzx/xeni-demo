'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
  Sparkles,
  Plus,
  GripVertical,
  Loader2,
  AlertTriangle,
  X,
  Merge,
  Eye,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Document, EvidenceSlotTemplate } from '@/types';

// Container status types
export type ContainerStatus =
  | 'empty'           // No files uploaded
  | 'uploading'       // File being uploaded
  | 'has_files'       // Has files, can merge
  | 'merging'         // Merge in progress
  | 'analyzing'       // AI analyzing merged file
  | 'analyzed'        // Merged and analyzed complete
  | 'error';          // Error state

// File item in a container
interface ContainerFile {
  id: string;
  name: string;
  type: 'pdf' | 'image';
  size: number;
  uploadedAt: Date;
  status: 'uploading' | 'ready' | 'error';
  progress?: number;
}

// Container data structure
interface FileContainer {
  id: string;
  name: string;
  description: string;
  minFiles: number;
  maxFiles: number;
  files: ContainerFile[];
  status: ContainerStatus;
  mergedFile?: {
    id: string;
    name: string;
    analyzedAt: Date;
    includedFileIds: string[]; // IDs of files included in this merge
  };
  // New files added after merge (pending re-merge)
  pendingFiles: ContainerFile[];
}

interface DocumentsTabProps {
  section: EvidenceSlotTemplate | null;
  documents: Document[];
  selectedDocumentId: string | null;
  onSelectDocument: (id: string) => void;
  onPreviewDocument?: (id: string) => void;
}

// Mock container data generator - creates rich examples
function generateContainersFromSection(section: EvidenceSlotTemplate | null, documents: Document[]): FileContainer[] {
  if (!section) return [];

  // Create mock containers with varied states for demo
  const mockContainerData: Array<{
    name: string;
    description: string;
    files: ContainerFile[];
    status: ContainerStatus;
    hasMerged: boolean;
  }> = [
    {
      name: 'Bank Statements',
      description: '6 months of consecutive bank statements',
      files: [
        { id: 'bs-1', name: 'Barclays_Statement_Dec2024.pdf', type: 'pdf', size: 245000, uploadedAt: new Date('2024-12-20'), status: 'ready' },
        { id: 'bs-2', name: 'Barclays_Statement_Nov2024.pdf', type: 'pdf', size: 238000, uploadedAt: new Date('2024-12-20'), status: 'ready' },
        { id: 'bs-3', name: 'Barclays_Statement_Oct2024.pdf', type: 'pdf', size: 251000, uploadedAt: new Date('2024-12-20'), status: 'ready' },
      ],
      status: 'analyzed',
      hasMerged: true,
    },
    {
      name: 'Employment Letter',
      description: 'Official letter confirming employment and salary',
      files: [
        { id: 'emp-1', name: 'TechCorp_Employment_Letter.pdf', type: 'pdf', size: 89000, uploadedAt: new Date('2024-12-18'), status: 'ready' },
        { id: 'emp-2', name: 'TechCorp_Salary_Confirmation.pdf', type: 'pdf', size: 67000, uploadedAt: new Date('2024-12-18'), status: 'ready' },
      ],
      status: 'has_files',
      hasMerged: false,
    },
    {
      name: 'Payslips',
      description: 'Last 3 months of payslips',
      files: [
        { id: 'pay-1', name: 'Payslip_December_2024.pdf', type: 'pdf', size: 45000, uploadedAt: new Date('2024-12-15'), status: 'ready' },
      ],
      status: 'has_files',
      hasMerged: false,
    },
    {
      name: 'Proof of Address',
      description: 'Utility bill or council tax dated within 3 months',
      files: [],
      status: 'empty',
      hasMerged: false,
    },
    {
      name: 'Passport Photos',
      description: 'Bio data page and all stamped pages',
      files: [
        { id: 'pp-1', name: 'Passport_BioPage.jpg', type: 'image', size: 1200000, uploadedAt: new Date('2024-12-10'), status: 'ready' },
        { id: 'pp-2', name: 'Passport_VisaPage_1.jpg', type: 'image', size: 980000, uploadedAt: new Date('2024-12-10'), status: 'ready' },
        { id: 'pp-3', name: 'Passport_VisaPage_2.jpg', type: 'image', size: 1050000, uploadedAt: new Date('2024-12-10'), status: 'ready' },
        { id: 'pp-4', name: 'Passport_StampPage.jpg', type: 'image', size: 890000, uploadedAt: new Date('2024-12-10'), status: 'ready' },
      ],
      status: 'analyzed',
      hasMerged: true,
    },
    {
      name: 'Tenancy Agreement',
      description: 'Current signed tenancy or mortgage statement',
      files: [
        { id: 'ten-1', name: 'Tenancy_Agreement_2024.pdf', type: 'pdf', size: 520000, uploadedAt: new Date('2024-12-05'), status: 'ready' },
      ],
      status: 'analyzed',
      hasMerged: true,
    },
  ];

  // If section has acceptable types, use first few mock containers
  // Otherwise generate from acceptable types
  if (section.acceptableTypes.length > 0) {
    return section.acceptableTypes.slice(0, 6).map((type, index) => {
      const mockData = mockContainerData[index % mockContainerData.length];

      return {
        id: `container-${type.typeId}-${index}`,
        name: type.label,
        description: type.description || mockData.description,
        minFiles: 1,
        maxFiles: section.maxCount || 5,
        files: mockData.files,
        status: mockData.status,
        mergedFile: mockData.hasMerged ? {
          id: `merged-${type.typeId}`,
          name: `${type.label} - Combined.pdf`,
          analyzedAt: new Date(),
          includedFileIds: mockData.files.map(f => f.id),
        } : undefined,
        pendingFiles: [],
      };
    });
  }

  // Fallback: return mock containers directly
  return mockContainerData.map((data, index) => ({
    id: `container-${index}`,
    name: data.name,
    description: data.description,
    minFiles: 1,
    maxFiles: 5,
    files: data.files,
    status: data.status,
    mergedFile: data.hasMerged ? {
      id: `merged-${index}`,
      name: `${data.name} - Combined.pdf`,
      analyzedAt: new Date(),
      includedFileIds: data.files.map(f => f.id),
    } : undefined,
    pendingFiles: [],
  }));
}

export function DocumentsTab({
  section,
  documents,
  selectedDocumentId,
  onSelectDocument,
  onPreviewDocument,
}: DocumentsTabProps) {
  // Generate containers from section
  const initialContainers = useMemo(() =>
    generateContainersFromSection(section, documents),
    [section, documents]
  );

  const [containers, setContainers] = useState<FileContainer[]>(initialContainers);
  const [draggedFile, setDraggedFile] = useState<{ containerId: string; file: ContainerFile; isPending?: boolean } | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  // File preview modal state
  const [previewFile, setPreviewFile] = useState<{ file: ContainerFile; containerName: string } | null>(null);

  // Handle file upload
  const handleFileUpload = useCallback((containerId: string, files: FileList) => {
    setContainers(prev => prev.map(container => {
      if (container.id !== containerId) return container;

      const newFiles: ContainerFile[] = Array.from(files).map((file, i) => ({
        id: `file-${Date.now()}-${i}`,
        name: file.name,
        type: file.type.includes('pdf') ? 'pdf' : 'image',
        size: file.size,
        uploadedAt: new Date(),
        status: 'uploading' as const,
        progress: 0,
      }));

      // If container is already merged, add to pendingFiles
      if (container.status === 'analyzed' && container.mergedFile) {
        return {
          ...container,
          pendingFiles: [...container.pendingFiles, ...newFiles],
        };
      }

      return {
        ...container,
        files: [...container.files, ...newFiles],
        status: 'uploading',
      };
    }));

    // Simulate upload progress
    setTimeout(() => {
      setContainers(prev => prev.map(container => {
        if (container.id !== containerId) return container;

        // If container is already merged, update pending files status
        if (container.status === 'analyzed' && container.mergedFile) {
          return {
            ...container,
            pendingFiles: container.pendingFiles.map(f => ({ ...f, status: 'ready' as const })),
          };
        }

        return {
          ...container,
          files: container.files.map(f => ({ ...f, status: 'ready' as const })),
          status: container.files.length >= 2 ? 'has_files' : 'has_files',
        };
      }));
    }, 1500);
  }, []);

  // Handle merge (initial or re-merge)
  const handleMerge = useCallback((containerId: string, isReMerge: boolean = false) => {
    setContainers(prev => prev.map(container => {
      if (container.id !== containerId) return container;

      // For re-merge, combine all files including pending
      if (isReMerge) {
        return {
          ...container,
          files: [...container.files, ...container.pendingFiles],
          pendingFiles: [],
          status: 'merging',
          mergedFile: undefined,
        };
      }

      return { ...container, status: 'merging' };
    }));

    // Simulate merge process
    setTimeout(() => {
      setContainers(prev => prev.map(container => {
        if (container.id !== containerId) return container;
        return { ...container, status: 'analyzing' };
      }));
    }, 1500);

    // Simulate analysis complete
    setTimeout(() => {
      setContainers(prev => prev.map(container => {
        if (container.id !== containerId) return container;
        return {
          ...container,
          status: 'analyzed',
          mergedFile: {
            id: `merged-${containerId}-${Date.now()}`,
            name: `${container.name} - Combined.pdf`,
            analyzedAt: new Date(),
            includedFileIds: container.files.map(f => f.id),
          },
          pendingFiles: [],
        };
      }));
    }, 3000);
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((containerId: string, file: ContainerFile) => {
    setDraggedFile({ containerId, file });
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, containerId: string) => {
    e.preventDefault();
    if (draggedFile && draggedFile.containerId !== containerId) {
      setDropTargetId(containerId);
    }
  }, [draggedFile]);

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setDropTargetId(null);
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent, targetContainerId: string) => {
    e.preventDefault();

    if (!draggedFile || draggedFile.containerId === targetContainerId) {
      setDropTargetId(null);
      setDraggedFile(null);
      return;
    }

    // Move file from source to target container
    setContainers(prev => prev.map(container => {
      if (container.id === draggedFile.containerId) {
        // Remove from source (check both files and pendingFiles)
        const newFiles = container.files.filter(f => f.id !== draggedFile.file.id);
        const newPendingFiles = container.pendingFiles.filter(f => f.id !== draggedFile.file.id);
        return {
          ...container,
          files: newFiles,
          pendingFiles: newPendingFiles,
          status: newFiles.length === 0 ? 'empty' : container.status,
        };
      }
      if (container.id === targetContainerId) {
        // If target is merged, add to pending files
        if (container.status === 'analyzed' && container.mergedFile) {
          return {
            ...container,
            pendingFiles: [...container.pendingFiles, draggedFile.file],
          };
        }
        // Otherwise add to files
        return {
          ...container,
          files: [...container.files, draggedFile.file],
          status: 'has_files',
        };
      }
      return container;
    }));

    setDropTargetId(null);
    setDraggedFile(null);
  }, [draggedFile]);

  // Handle remove file
  const handleRemoveFile = useCallback((containerId: string, fileId: string, isPending: boolean = false) => {
    setContainers(prev => prev.map(container => {
      if (container.id !== containerId) return container;

      if (isPending) {
        // Remove from pending files
        return {
          ...container,
          pendingFiles: container.pendingFiles.filter(f => f.id !== fileId),
        };
      }

      // Remove from main files
      const newFiles = container.files.filter(f => f.id !== fileId);
      return {
        ...container,
        files: newFiles,
        status: newFiles.length === 0 ? 'empty' : 'has_files',
        mergedFile: undefined,
        pendingFiles: [],
      };
    }));
  }, []);

  // Handle file preview
  const handlePreviewFile = useCallback((file: ContainerFile, containerName: string) => {
    setPreviewFile({ file, containerName });
  }, []);

  if (!section) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyStateIllustration />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Section Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{section.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{section.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
              {containers.filter(c => c.status === 'analyzed').length} / {containers.length} analyzed
            </span>
          </div>
        </div>
      </div>

      {/* Container Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {containers.map((container) => (
            <DocumentContainer
              key={container.id}
              container={container}
              isDropTarget={dropTargetId === container.id}
              onFileUpload={(files) => handleFileUpload(container.id, files)}
              onMerge={(isReMerge) => handleMerge(container.id, isReMerge)}
              onDragStart={(file) => handleDragStart(container.id, file)}
              onDragOver={(e) => handleDragOver(e, container.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, container.id)}
              onRemoveFile={(fileId, isPending) => handleRemoveFile(container.id, fileId, isPending)}
              onPreviewFile={(file) => handlePreviewFile(file, container.name)}
            />
          ))}
        </div>

        {containers.length === 0 && (
          <EmptyStateIllustration />
        )}
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        file={previewFile?.file || null}
        containerName={previewFile?.containerName || ''}
      />
    </div>
  );
}

// Document Container Component
interface DocumentContainerProps {
  container: FileContainer;
  isDropTarget: boolean;
  onFileUpload: (files: FileList) => void;
  onMerge: (isReMerge?: boolean) => void;
  onDragStart: (file: ContainerFile) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onRemoveFile: (fileId: string, isPending?: boolean) => void;
  onPreviewFile?: (file: ContainerFile) => void;
}

function DocumentContainer({
  container,
  isDropTarget,
  onFileUpload,
  onMerge,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveFile,
  onPreviewFile,
}: DocumentContainerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showSourceFiles, setShowSourceFiles] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
    onDragOver(e);
  }, [onDragOver]);

  const handleDragLeave = useCallback(() => {
    setIsDraggingOver(false);
    onDragLeave();
  }, [onDragLeave]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    // Check if it's a file from the system
    if (e.dataTransfer.files?.length > 0) {
      onFileUpload(e.dataTransfer.files);
    } else {
      onDrop(e);
    }
  }, [onDrop, onFileUpload]);

  const statusConfig = getStatusConfig(container.status);
  const canMerge = container.files.length >= 2 && container.status === 'has_files';
  const isMerged = container.status === 'analyzed' && !!container.mergedFile;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative rounded-2xl border-2 transition-all duration-300',
        'bg-white overflow-hidden',
        isDropTarget || isDraggingOver
          ? 'border-primary-400 bg-primary-50/30 shadow-lg shadow-primary-100'
          : container.status === 'analyzed'
          ? 'border-emerald-200 bg-emerald-50/20'
          : container.status === 'error'
          ? 'border-rose-200'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Container Header */}
      <div className={cn(
        'px-4 py-3 border-b flex items-center justify-between',
        container.status === 'analyzed'
          ? 'bg-gradient-to-r from-emerald-50 to-emerald-50/30 border-emerald-100'
          : 'bg-gradient-to-r from-slate-50 to-white border-slate-100'
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center',
            statusConfig.iconBg
          )}>
            {statusConfig.icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{container.name}</h3>
            <p className="text-xs text-slate-500">
              {container.files.length} / {container.maxFiles} files
            </p>
          </div>
        </div>

        {/* Status Badge & Actions */}
        <div className="flex items-center gap-2">
          <StatusBadge status={container.status} />

          {canMerge && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onMerge(false)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold',
                'bg-gradient-to-r from-primary-600 to-primary-500 text-white',
                'shadow-md shadow-primary-200 hover:shadow-lg hover:shadow-primary-300',
                'transition-all duration-200'
              )}
            >
              <Merge className="w-3.5 h-3.5" />
              Merge
            </motion.button>
          )}
        </div>
      </div>

      {/* Container Body */}
      <div className="p-4">
        {/* Merged File View */}
        {isMerged && container.mergedFile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4"
          >
            <MergedFileCard
              mergedFile={container.mergedFile}
              sourceCount={container.files.length}
              hasPendingFiles={container.pendingFiles.length > 0}
              pendingCount={container.pendingFiles.length}
              onPreview={() => onPreviewFile?.({
                id: container.mergedFile!.id,
                name: container.mergedFile!.name,
                type: 'pdf',
                size: 0,
                uploadedAt: container.mergedFile!.analyzedAt,
                status: 'ready',
              })}
              onReMerge={() => onMerge(true)}
            />
          </motion.div>
        )}

        {/* Source Files Section (for merged containers) */}
        {isMerged && container.files.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowSourceFiles(!showSourceFiles)}
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition-colors mb-2"
            >
              <motion.span
                animate={{ rotate: showSourceFiles ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.span>
              <span className="font-medium">Source files ({container.files.length})</span>
            </button>
            <AnimatePresence>
              {showSourceFiles && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {container.files.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      showAsMerged={true}
                      onDragStart={() => onDragStart(file)}
                      onRemove={() => onRemoveFile(file.id)}
                      onPreview={() => onPreviewFile?.(file)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Pending Files Section (for merged containers) - Thumbnail Grid */}
        {isMerged && container.pendingFiles.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs text-amber-600 mb-3">
              <Plus className="w-3.5 h-3.5" />
              <span className="font-medium">New files to merge ({container.pendingFiles.length})</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <AnimatePresence mode="popLayout">
                {container.pendingFiles.map((file) => (
                  <ThumbnailCard
                    key={file.id}
                    file={file}
                    showAsMerged={false}
                    isPending={true}
                    onRemove={() => onRemoveFile(file.id, true)}
                    onPreview={() => onPreviewFile?.(file)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* File Thumbnail Grid (for non-merged containers) */}
        {!isMerged && container.files.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <AnimatePresence mode="popLayout">
              {container.files.map((file) => (
                <ThumbnailCard
                  key={file.id}
                  file={file}
                  showAsMerged={false}
                  onRemove={() => onRemoveFile(file.id)}
                  onPreview={() => onPreviewFile?.(file)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Compact Upload Button - for non-merged containers */}
        {!isMerged && container.files.length < container.maxFiles && container.files.length > 0 && (
          <motion.button
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'mt-2 px-3 py-1.5 rounded-lg border',
              'flex items-center gap-1.5',
              'transition-all duration-200 text-xs font-medium',
              isDraggingOver
                ? 'border-primary-400 bg-primary-50 text-primary-600'
                : 'border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            Add more
          </motion.button>
        )}

        {/* Add more files button - for merged containers */}
        {isMerged && (
          <motion.button
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'w-full py-3 rounded-xl border-2 border-dashed',
              'flex items-center justify-center gap-2',
              'transition-all duration-200',
              isDraggingOver
                ? 'border-primary-400 bg-primary-50 text-primary-600'
                : 'border-slate-200 hover:border-slate-300 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            )}
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-medium">Add more files to re-merge</span>
          </motion.button>
        )}

        {/* Empty State Upload Zone */}
        {!isMerged && container.files.length === 0 && (
          <motion.button
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'w-full py-8 rounded-xl border-2 border-dashed',
              'flex flex-col items-center justify-center gap-2',
              'transition-all duration-200',
              isDraggingOver
                ? 'border-primary-400 bg-primary-50 text-primary-600'
                : 'border-slate-200 hover:border-slate-300 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              isDraggingOver ? 'bg-primary-100' : 'bg-slate-100'
            )}>
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">
              {isDraggingOver ? 'Drop files here' : 'Drop files or click to upload'}
            </span>
          </motion.button>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => e.target.files && onFileUpload(e.target.files)}
        />
      </div>

      {/* Processing Overlay */}
      <AnimatePresence>
        {(container.status === 'merging' || container.status === 'analyzing') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 mx-auto mb-3"
              >
                {container.status === 'merging' ? (
                  <Layers className="w-12 h-12 text-primary-500" />
                ) : (
                  <Sparkles className="w-12 h-12 text-amber-500" />
                )}
              </motion.div>
              <p className="text-sm font-medium text-slate-700">
                {container.status === 'merging' ? 'Merging files...' : 'AI analyzing...'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {container.status === 'merging'
                  ? 'Combining PDFs into single document'
                  : 'Extracting data and verifying content'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Thumbnail Card Component - Visual document preview
interface ThumbnailCardProps {
  file: ContainerFile;
  showAsMerged?: boolean;
  isPending?: boolean;
  onRemove: () => void;
  onPreview: () => void;
}

function ThumbnailCard({ file, showAsMerged, isPending, onRemove, onPreview }: ThumbnailCardProps) {
  const isPDF = file.type === 'pdf';
  const isUploading = file.status === 'uploading';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'group relative rounded-xl overflow-hidden cursor-pointer',
        'border-2 transition-all duration-200',
        showAsMerged && !isPending
          ? 'opacity-50 border-slate-200'
          : isPending
          ? 'border-amber-300 hover:border-amber-400 hover:shadow-lg'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
      )}
      onClick={onPreview}
    >
      {/* Thumbnail Preview Area */}
      <div className={cn(
        'relative aspect-[4/3] flex items-center justify-center',
        isPending ? 'bg-amber-50' : isPDF ? 'bg-rose-50' : 'bg-sky-50'
      )}>
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            <span className="text-xs text-slate-400">Uploading...</span>
          </div>
        ) : isPDF ? (
          // PDF Preview Mock
          <div className="w-3/4 h-3/4 bg-white rounded-lg shadow-sm border border-slate-200 p-3 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-slate-100 rounded" />
              <div className="flex-1 space-y-1">
                <div className="w-2/3 h-2 bg-slate-100 rounded" />
                <div className="w-1/2 h-1.5 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="w-full h-1.5 bg-slate-100 rounded" />
              <div className="w-full h-1.5 bg-slate-100 rounded" />
              <div className="w-3/4 h-1.5 bg-slate-100 rounded" />
              <div className="w-full h-1.5 bg-slate-100 rounded" />
              <div className="w-1/2 h-1.5 bg-slate-100 rounded" />
            </div>
          </div>
        ) : (
          // Image Preview Mock
          <div className="w-3/4 h-3/4 bg-gradient-to-br from-sky-200 via-sky-100 to-slate-100 rounded-lg shadow-sm flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-sky-400/60" />
          </div>
        )}

        {/* Action Overlay on Hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onPreview(); }}
              className="p-2 rounded-full bg-white/90 text-slate-700 hover:bg-white transition-colors shadow-lg"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="p-2 rounded-full bg-white/90 text-rose-600 hover:bg-white transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Badge - Top Right */}
        <div className="absolute top-2 right-2">
          {isPending ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700 shadow-sm">
              <Plus className="w-2.5 h-2.5" />
              New
            </span>
          ) : showAsMerged ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 shadow-sm">
              <Layers className="w-2.5 h-2.5" />
              Merged
            </span>
          ) : file.status === 'ready' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700 shadow-sm">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Ready
            </span>
          ) : null}
        </div>
      </div>

      {/* File Info */}
      <div className="p-3 bg-white">
        <div className="flex items-start gap-2">
          <div className={cn(
            'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
            isPending ? 'bg-amber-100' : isPDF ? 'bg-rose-100' : 'bg-sky-100'
          )}>
            {isPDF ? (
              <FileText className={cn('w-3.5 h-3.5', isPending ? 'text-amber-600' : 'text-rose-600')} />
            ) : (
              <ImageIcon className={cn('w-3.5 h-3.5', isPending ? 'text-amber-600' : 'text-sky-600')} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {file.name}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {isUploading && file.progress !== undefined && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${file.progress}%` }}
            className="h-full bg-primary-500"
          />
        </div>
      )}
    </motion.div>
  );
}

// Legacy File Card - For source files list (compact)
interface FileCardProps {
  file: ContainerFile;
  showAsMerged?: boolean;
  isPending?: boolean;
  onDragStart: () => void;
  onRemove: () => void;
  onPreview: () => void;
}

function FileCard({ file, showAsMerged, isPending, onDragStart, onRemove, onPreview }: FileCardProps) {
  const isPDF = file.type === 'pdf';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={cn(
        'group flex items-center gap-2 px-3 py-2 rounded-lg',
        'border transition-all duration-200',
        showAsMerged ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200'
      )}
    >
      {/* File Icon */}
      <div className={cn(
        'w-6 h-6 rounded flex items-center justify-center flex-shrink-0',
        isPDF ? 'bg-rose-100' : 'bg-sky-100'
      )}>
        {isPDF ? (
          <FileText className="w-3 h-3 text-rose-500" />
        ) : (
          <ImageIcon className="w-3 h-3 text-sky-500" />
        )}
      </div>

      {/* File Name */}
      <span className="flex-1 text-xs text-slate-600 truncate">{file.name}</span>

      {/* Size */}
      <span className="text-[10px] text-slate-400">{formatFileSize(file.size)}</span>
    </motion.div>
  );
}

// Merged File Card Component
interface MergedFileCardProps {
  mergedFile: { id: string; name: string; analyzedAt: Date };
  sourceCount: number;
  hasPendingFiles?: boolean;
  pendingCount?: number;
  onPreview: () => void;
  onReMerge?: () => void;
}

function MergedFileCard({ mergedFile, sourceCount, hasPendingFiles, pendingCount, onPreview, onReMerge }: MergedFileCardProps) {
  return (
    <motion.div
      className={cn(
        'w-full p-4 rounded-xl',
        'bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-teal-50/30',
        hasPendingFiles
          ? 'border-2 border-amber-300'
          : 'border-2 border-emerald-200',
      )}
    >
      <motion.button
        onClick={onPreview}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        className="w-full text-left"
      >
        <div className="flex items-start gap-4">
          {/* Success Icon */}
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center"
            >
              <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
            </motion.div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-emerald-900">{mergedFile.name}</h4>
            </div>
            <p className="text-xs text-emerald-700 mt-0.5">
              {sourceCount} files merged • AI analyzed
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Enhanced
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                <Layers className="w-2.5 h-2.5" />
                Ready to submit
              </span>
            </div>
          </div>

          {/* Preview hint */}
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <Eye className="w-3.5 h-3.5" />
            Preview
          </div>
        </div>
      </motion.button>

      {/* Pending files indicator & Re-merge button */}
      {hasPendingFiles && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-amber-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-amber-700">
                {pendingCount} new file{pendingCount !== 1 ? 's' : ''} added
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); onReMerge?.(); }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold',
                'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
                'shadow-md shadow-amber-200 hover:shadow-lg hover:shadow-amber-300',
                'transition-all duration-200'
              )}
            >
              <Merge className="w-3.5 h-3.5" />
              Re-merge
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// File Preview Modal Component
interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: ContainerFile | null;
  containerName: string;
}

function FilePreviewModal({ isOpen, onClose, file, containerName }: FilePreviewModalProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3; // Mock total pages

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  if (!file) return null;

  const isPDF = file.type === 'pdf';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  isPDF ? 'bg-rose-100' : 'bg-sky-100'
                )}>
                  {isPDF ? (
                    <FileText className="w-5 h-5 text-rose-600" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-sky-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 truncate max-w-md">
                    {file.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {containerName} • {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {/* Download */}}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-100">
              {/* Page Navigation (for PDFs) */}
              {isPDF && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-medium text-slate-600 min-w-[80px] text-center">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {!isPDF && <div />}

              {/* Zoom & Rotate Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-medium text-slate-600 min-w-[50px] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-200 mx-2" />
                <button
                  onClick={handleRotate}
                  className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-white transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Preview Area */}
            <div className="h-[60vh] overflow-auto bg-slate-100 p-6">
              <div className="flex items-center justify-center min-h-full">
                <motion.div
                  animate={{ scale: zoom / 100, rotate: rotation }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  {isPDF ? (
                    // PDF Preview Mock
                    <div className="w-[595px] h-[842px] bg-white p-12 flex flex-col">
                      {/* Mock Document Content */}
                      <div className="flex-1 space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-200 rounded-lg" />
                            <div className="space-y-1">
                              <div className="w-32 h-4 bg-slate-200 rounded" />
                              <div className="w-24 h-3 bg-slate-100 rounded" />
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="w-28 h-3 bg-slate-100 rounded ml-auto" />
                            <div className="w-20 h-3 bg-slate-100 rounded ml-auto" />
                          </div>
                        </div>

                        {/* Title */}
                        <div className="w-64 h-6 bg-slate-800 rounded" />

                        {/* Content Blocks */}
                        <div className="space-y-3">
                          <div className="w-full h-3 bg-slate-100 rounded" />
                          <div className="w-full h-3 bg-slate-100 rounded" />
                          <div className="w-3/4 h-3 bg-slate-100 rounded" />
                        </div>

                        <div className="space-y-3 mt-6">
                          <div className="w-full h-3 bg-slate-100 rounded" />
                          <div className="w-full h-3 bg-slate-100 rounded" />
                          <div className="w-full h-3 bg-slate-100 rounded" />
                          <div className="w-2/3 h-3 bg-slate-100 rounded" />
                        </div>

                        {/* Table Mock */}
                        <div className="mt-8 border border-slate-200 rounded-lg overflow-hidden">
                          <div className="bg-slate-50 p-3 border-b border-slate-200">
                            <div className="flex gap-4">
                              <div className="w-24 h-3 bg-slate-200 rounded" />
                              <div className="w-32 h-3 bg-slate-200 rounded" />
                              <div className="w-20 h-3 bg-slate-200 rounded" />
                            </div>
                          </div>
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="p-3 border-b border-slate-100 last:border-0">
                              <div className="flex gap-4">
                                <div className="w-24 h-2.5 bg-slate-100 rounded" />
                                <div className="w-32 h-2.5 bg-slate-100 rounded" />
                                <div className="w-20 h-2.5 bg-slate-100 rounded" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-auto">
                        <div className="w-24 h-2.5 bg-slate-100 rounded" />
                        <div className="w-16 h-2.5 bg-slate-100 rounded" />
                      </div>
                    </div>
                  ) : (
                    // Image Preview Mock
                    <div className="w-[600px] h-[400px] bg-gradient-to-br from-sky-100 via-sky-50 to-slate-100 flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="w-16 h-16 text-sky-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-400">Image Preview</p>
                        <p className="text-xs text-slate-300 mt-1">{file.name}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Footer with file info */}
            <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-100">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>Uploaded: {file.uploadedAt.toLocaleDateString()}</span>
                <span>Size: {formatFileSize(file.size)}</span>
                <span>Type: {file.type.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                  file.status === 'ready'
                    ? 'bg-emerald-100 text-emerald-700'
                    : file.status === 'uploading'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-rose-100 text-rose-700'
                )}>
                  {file.status === 'ready' && <CheckCircle2 className="w-3 h-3" />}
                  {file.status === 'uploading' && <Loader2 className="w-3 h-3 animate-spin" />}
                  {file.status === 'error' && <AlertTriangle className="w-3 h-3" />}
                  {file.status === 'ready' ? 'Ready' : file.status === 'uploading' ? 'Uploading' : 'Error'}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: ContainerStatus }) {
  const config = getStatusConfig(status);

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
      config.badgeBg, config.badgeText
    )}>
      {status === 'uploading' || status === 'merging' || status === 'analyzing' ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : null}
      {config.label}
    </span>
  );
}

// Empty State Illustration
function EmptyStateIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col items-center justify-center text-center py-12"
    >
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="mb-6"
      >
        <img
          src="/images/document-illustration.png"
          alt="Document illustration"
          className="w-40 h-40 object-contain drop-shadow-lg"
        />
      </motion.div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">
        No documents yet
      </h3>
      <p className="text-sm text-slate-500 max-w-xs">
        Select a section from the checklist to view and manage required documents
      </p>
    </motion.div>
  );
}

// Helper functions
function getStatusConfig(status: ContainerStatus) {
  switch (status) {
    case 'empty':
      return {
        label: 'Empty',
        icon: <FileText className="w-4 h-4 text-slate-400" />,
        iconBg: 'bg-slate-100',
        badgeBg: 'bg-slate-100',
        badgeText: 'text-slate-600',
      };
    case 'uploading':
      return {
        label: 'Uploading',
        icon: <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />,
        iconBg: 'bg-sky-100',
        badgeBg: 'bg-sky-100',
        badgeText: 'text-sky-700',
      };
    case 'has_files':
      return {
        label: 'Ready to merge',
        icon: <FileText className="w-4 h-4 text-amber-600" />,
        iconBg: 'bg-amber-100',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-700',
      };
    case 'merging':
      return {
        label: 'Merging',
        icon: <Layers className="w-4 h-4 text-primary-500" />,
        iconBg: 'bg-primary-100',
        badgeBg: 'bg-primary-100',
        badgeText: 'text-primary-700',
      };
    case 'analyzing':
      return {
        label: 'Analyzing',
        icon: <Sparkles className="w-4 h-4 text-amber-500" />,
        iconBg: 'bg-amber-100',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-700',
      };
    case 'analyzed':
      return {
        label: 'Analyzed',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
        iconBg: 'bg-emerald-100',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-700',
      };
    case 'error':
      return {
        label: 'Error',
        icon: <AlertTriangle className="w-4 h-4 text-rose-500" />,
        iconBg: 'bg-rose-100',
        badgeBg: 'bg-rose-100',
        badgeText: 'text-rose-700',
      };
    default:
      return {
        label: 'Unknown',
        icon: <FileText className="w-4 h-4 text-slate-400" />,
        iconBg: 'bg-slate-100',
        badgeBg: 'bg-slate-100',
        badgeText: 'text-slate-600',
      };
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
