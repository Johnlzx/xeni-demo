'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Layers,
  FileText,
  Image as ImageIcon,
  ChevronRight,
  GripVertical,
  Plus,
  Check,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Document, VisaType } from '@/types';
import { getEvidenceTemplateForVisaType } from '@/data/evidence-templates';

interface DocumentOverviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  visaType: VisaType;
  documents: Document[];
  onSelectSection?: (sectionId: string) => void;
}

interface SectionGroup {
  id: string;
  name: string;
  files: {
    id: string;
    name: string;
    type: 'pdf' | 'image';
    size: number;
  }[];
  status: 'empty' | 'partial' | 'complete';
  isCollapsed: boolean;
}

// Generate section groups from visa type and documents
function generateSectionGroups(
  visaType: VisaType,
  documents: Document[]
): SectionGroup[] {
  const slots = getEvidenceTemplateForVisaType(visaType);

  return slots.map(slot => {
    const slotDocs = documents.filter(d =>
      d.assignedToSlots?.includes(slot.id)
    );

    const minRequired = slot.minCount ?? 1;
    const status = slotDocs.length === 0
      ? 'empty'
      : slotDocs.length >= minRequired
        ? 'complete'
        : 'partial';

    return {
      id: slot.id,
      name: slot.name,
      files: slotDocs.map(d => ({
        id: d.id,
        name: d.fileName || d.name,
        type: (d.fileType?.includes('pdf') ? 'pdf' : 'image') as 'pdf' | 'image',
        size: d.fileSize || 0,
      })),
      status,
      isCollapsed: status === 'complete',
    };
  });
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function DocumentOverviewPanel({
  isOpen,
  onClose,
  visaType,
  documents,
  onSelectSection,
}: DocumentOverviewPanelProps) {
  const [groups, setGroups] = useState<SectionGroup[]>(() =>
    generateSectionGroups(visaType, documents)
  );

  const [draggedFile, setDraggedFile] = useState<{
    groupId: string;
    fileId: string;
  } | null>(null);

  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  // Toggle group collapse
  const toggleGroup = useCallback((groupId: string) => {
    setGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, isCollapsed: !g.isCollapsed } : g
    ));
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((groupId: string, fileId: string) => {
    setDraggedFile({ groupId, fileId });
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    if (draggedFile && draggedFile.groupId !== groupId) {
      setDropTargetId(groupId);
    }
  }, [draggedFile]);

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setDropTargetId(null);
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();

    if (!draggedFile || draggedFile.groupId === targetGroupId) {
      setDropTargetId(null);
      setDraggedFile(null);
      return;
    }

    setGroups(prev => {
      const sourceGroup = prev.find(g => g.id === draggedFile.groupId);
      const file = sourceGroup?.files.find(f => f.id === draggedFile.fileId);

      if (!file) return prev;

      return prev.map(g => {
        if (g.id === draggedFile.groupId) {
          return {
            ...g,
            files: g.files.filter(f => f.id !== draggedFile.fileId),
            status: g.files.length <= 1 ? 'empty' : g.status,
          };
        }
        if (g.id === targetGroupId) {
          return {
            ...g,
            files: [...g.files, file],
            status: 'partial',
            isCollapsed: false,
          };
        }
        return g;
      });
    });

    setDropTargetId(null);
    setDraggedFile(null);
  }, [draggedFile]);

  // Stats
  const stats = useMemo(() => {
    const complete = groups.filter(g => g.status === 'complete').length;
    const total = groups.length;
    const totalFiles = groups.reduce((acc, g) => acc + g.files.length, 0);
    return { complete, total, totalFiles };
  }, [groups]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed right-0 top-0 bottom-0 w-[360px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0E4369]/10 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-[#0E4369]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Document Overview
                  </h2>
                  <p className="text-xs text-slate-500">
                    {stats.complete}/{stats.total} sections • {stats.totalFiles} files
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Groups List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {groups.map((group) => (
                <GroupContainer
                  key={group.id}
                  group={group}
                  isDropTarget={dropTargetId === group.id}
                  onToggle={() => toggleGroup(group.id)}
                  onDragStart={(fileId) => handleDragStart(group.id, fileId)}
                  onDragOver={(e) => handleDragOver(e, group.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, group.id)}
                  onSelectSection={() => onSelectSection?.(group.id)}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50">
              <p className="text-xs text-slate-500 text-center">
                Drag files between sections to reorganize
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Group Container Component
interface GroupContainerProps {
  group: SectionGroup;
  isDropTarget: boolean;
  onToggle: () => void;
  onDragStart: (fileId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onSelectSection: () => void;
}

function GroupContainer({
  group,
  isDropTarget,
  onToggle,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onSelectSection,
}: GroupContainerProps) {
  return (
    <motion.div
      layout
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        'rounded-xl border-2 transition-all duration-200 overflow-hidden',
        isDropTarget
          ? 'border-[#0E4369] bg-[#0E4369]/5 shadow-lg'
          : group.status === 'complete'
          ? 'border-emerald-200 bg-emerald-50/30'
          : group.status === 'partial'
          ? 'border-amber-200 bg-white'
          : 'border-slate-200 bg-white'
      )}
    >
      {/* Group Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50/50 transition-colors"
      >
        <motion.div
          animate={{ rotate: group.isCollapsed ? 0 : 90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </motion.div>

        {/* Status Icon */}
        <div className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
          group.status === 'complete'
            ? 'bg-emerald-500'
            : group.status === 'partial'
            ? 'bg-amber-500'
            : 'bg-slate-200'
        )}>
          {group.status === 'complete' ? (
            <Check className="w-3.5 h-3.5 text-white" />
          ) : group.status === 'partial' ? (
            <AlertCircle className="w-3.5 h-3.5 text-white" />
          ) : (
            <Plus className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>

        {/* Group Name */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-medium truncate',
            group.status === 'complete' ? 'text-emerald-800' : 'text-slate-900'
          )}>
            {group.name}
          </p>
        </div>

        {/* File Count */}
        <span className={cn(
          'text-xs font-medium px-2 py-0.5 rounded-full',
          group.files.length > 0
            ? 'bg-slate-100 text-slate-600'
            : 'bg-slate-100 text-slate-400'
        )}>
          {group.files.length} file{group.files.length !== 1 ? 's' : ''}
        </span>
      </button>

      {/* Files List */}
      <AnimatePresence>
        {!group.isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-1.5">
              {group.files.length > 0 ? (
                group.files.map((file) => (
                  <FileItem
                    key={file.id}
                    file={file}
                    onDragStart={() => onDragStart(file.id)}
                  />
                ))
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs text-slate-400">No files yet</p>
                  <button
                    onClick={onSelectSection}
                    className="mt-2 text-xs font-medium text-[#0E4369] hover:text-[#0B3654] transition-colors"
                  >
                    Add documents
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// File Item Component
interface FileItemProps {
  file: {
    id: string;
    name: string;
    type: 'pdf' | 'image';
    size: number;
  };
  onDragStart: () => void;
}

function FileItem({ file, onDragStart }: FileItemProps) {
  const isPDF = file.type === 'pdf';

  return (
    <motion.div
      layout
      draggable
      onDragStart={onDragStart}
      className={cn(
        'group flex items-center gap-2 px-3 py-2 rounded-lg',
        'bg-white border border-slate-200',
        'hover:border-slate-300 hover:shadow-sm',
        'cursor-grab active:cursor-grabbing',
        'transition-all duration-150'
      )}
    >
      {/* Drag Handle */}
      <GripVertical className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />

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
      <span className="flex-1 text-xs text-slate-700 truncate">
        {file.name}
      </span>

      {/* Size */}
      <span className="text-[10px] text-slate-400">
        {formatFileSize(file.size)}
      </span>
    </motion.div>
  );
}

export default DocumentOverviewPanel;
