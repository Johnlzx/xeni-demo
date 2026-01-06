'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp,
  Loader2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Check,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEvidenceTemplateForVisaType } from '@/data/evidence-templates';
import type { VisaType, Document, Issue, DocumentPipelineStatus } from '@/types';

// Filter types
type FilterType = 'all' | 'flagged' | 'pending';

interface ChecklistNavigationProps {
  visaType: VisaType;
  documents: Document[];
  issues: Issue[];
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
  className?: string;
}

interface SectionStats {
  id: string;
  name: string;
  priority: 'required' | 'optional' | 'conditional';
  progress: {
    current: number;
    required: number;
  };
  issueCount: number;
  qualityCount: number;
  complianceCount: number;
  hasCritical: boolean;
  isComplete: boolean;
  isMissing: boolean;
}

interface ProcessingFile {
  id: string;
  name: string;
  status: DocumentPipelineStatus;
  progress: number; // 0-100
}

/**
 * Progress Ring - Refined circular indicator
 */
function ProgressRing({
  progress,
  size = 16,
  strokeWidth = 2,
  isComplete,
  hasCritical,
  isMissing,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  isComplete: boolean;
  hasCritical: boolean;
  isMissing: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  let strokeColor = '#CBD5E1'; // slate-300
  if (isComplete) {
    strokeColor = '#10B981'; // emerald-500
  } else if (hasCritical) {
    strokeColor = '#F43F5E'; // rose-500
  } else if (isMissing) {
    strokeColor = '#F59E0B'; // amber-500
  } else if (progress > 0) {
    strokeColor = '#0E4369'; // brand
  }

  return (
    <svg
      width={size}
      height={size}
      className="flex-shrink-0 -rotate-90"
      viewBox={`0 0 ${size} ${size}`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#F1F5F9"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        className="transition-all duration-500 ease-out"
      />
    </svg>
  );
}

/**
 * Filter Tab - Single filter option
 */
function FilterTab({
  label,
  count,
  isActive,
  onClick,
  variant = 'default',
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  variant?: 'default' | 'warning' | 'danger';
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex-1 px-2 py-1.5 text-[10px] font-semibold rounded-md transition-all duration-200',
        isActive
          ? 'bg-white text-slate-800 shadow-sm'
          : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
      )}
    >
      <span className="flex items-center justify-center gap-1">
        {label}
        <span
          className={cn(
            'tabular-nums',
            isActive
              ? variant === 'danger'
                ? 'text-rose-500'
                : variant === 'warning'
                ? 'text-amber-500'
                : 'text-slate-600'
              : 'text-slate-400'
          )}
        >
          {count}
        </span>
      </span>
    </button>
  );
}

/**
 * Filter Bar - Segmented control for filtering
 */
function FilterBar({
  activeFilter,
  onFilterChange,
  counts,
}: {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: { all: number; flagged: number; pending: number };
}) {
  return (
    <div className="px-3 py-3 border-b border-slate-100">
      <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-lg">
        <FilterTab
          label="All"
          count={counts.all}
          isActive={activeFilter === 'all'}
          onClick={() => onFilterChange('all')}
        />
        <FilterTab
          label="Flagged"
          count={counts.flagged}
          isActive={activeFilter === 'flagged'}
          onClick={() => onFilterChange('flagged')}
          variant="danger"
        />
        <FilterTab
          label="Pending"
          count={counts.pending}
          isActive={activeFilter === 'pending'}
          onClick={() => onFilterChange('pending')}
          variant="warning"
        />
      </div>
    </div>
  );
}

/**
 * Summary Stats - Compact header
 */
function SummaryStats({
  completedSections,
  totalSections,
  qualityCount,
  complianceCount,
}: {
  completedSections: number;
  totalSections: number;
  qualityCount: number;
  complianceCount: number;
}) {
  const progressPercent = totalSections > 0
    ? Math.round((completedSections / totalSections) * 100)
    : 0;

  return (
    <div className="px-4 py-4 border-b border-slate-100">
      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-900 mb-1">
        Build Your Case
      </h3>
      <p className="text-[11px] text-slate-500 mb-3">
        Complete all required evidence sections
      </p>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex gap-0.5">
          {Array.from({ length: totalSections }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-1.5 flex-1 rounded-sm transition-colors',
                index < completedSections ? 'bg-[#0E4369]' : 'bg-slate-200'
              )}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">{progressPercent}%</span> Complete
          </span>
          <div className="flex items-center gap-2">
            {qualityCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                {qualityCount}
              </span>
            )}
            {complianceCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {complianceCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Section Item - Clean checklist item with icon-only status
 */
function SectionItem({
  section,
  isSelected,
  onClick,
}: {
  section: SectionStats;
  isSelected: boolean;
  onClick: () => void;
}) {
  const hasQuality = section.qualityCount > 0;
  const hasCompliance = section.complianceCount > 0;
  const hasIssues = section.issueCount > 0;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'w-full text-left mx-2 mb-1 px-3 py-2.5 rounded-lg transition-all duration-150',
        'border border-transparent',
        isSelected
          ? 'bg-slate-50 border-l-2 border-l-[#0E4369] rounded-l-none'
          : 'hover:bg-slate-50'
      )}
      style={{ width: 'calc(100% - 16px)' }}
    >
      <div className="flex items-center gap-2.5">
        {/* Status Icon - Leading */}
        <div className="flex-shrink-0">
          {section.isComplete ? (
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          ) : section.hasCritical ? (
            <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center">
              <AlertCircle className="w-3 h-3 text-white" />
            </div>
          ) : hasIssues ? (
            <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
              <AlertCircle className="w-3 h-3 text-white" />
            </div>
          ) : section.progress.current > 0 ? (
            <div className="w-5 h-5 rounded-full border-2 border-[#0E4369] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0E4369]" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-dashed border-slate-300" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <span
            className={cn(
              'text-[12px] font-medium truncate leading-tight block',
              isSelected ? 'text-[#0E4369]' : 'text-slate-700'
            )}
          >
            {section.name}
          </span>
          {/* Issue counts - subtle inline text */}
          {hasIssues && (
            <div className="flex items-center gap-1.5 mt-0.5">
              {hasQuality && (
                <span className="text-[10px] text-slate-400">
                  {section.qualityCount} QC
                </span>
              )}
              {hasQuality && hasCompliance && (
                <span className="text-[10px] text-slate-300">·</span>
              )}
              {hasCompliance && (
                <span className="text-[10px] text-amber-500">
                  {section.complianceCount} issue{section.complianceCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Progress fraction */}
        {!section.isComplete && section.priority === 'required' && (
          <span className="text-[10px] text-slate-400 tabular-nums">
            {section.progress.current}/{section.progress.required}
          </span>
        )}
      </div>
    </motion.button>
  );
}

/**
 * Processing File Item
 */
function ProcessingFileItem({ file, index }: { file: ProcessingFile; index: number }) {
  const getStatusConfig = (status: DocumentPipelineStatus) => {
    switch (status) {
      case 'uploading':
        return { label: 'Uploading', color: 'bg-slate-400' };
      case 'processing':
        return { label: 'Processing', color: 'bg-sky-500' };
      case 'quality_check':
        return { label: 'Quality check', color: 'bg-amber-500' };
      case 'compliance_check':
        return { label: 'Compliance', color: 'bg-violet-500' };
      default:
        return { label: 'Processing', color: 'bg-slate-400' };
    }
  };

  const config = getStatusConfig(file.status);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className="flex items-center gap-2 py-1.5"
    >
      <Loader2 className="w-3 h-3 text-slate-400 animate-spin flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-slate-600 truncate">{file.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${file.progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={cn('h-full rounded-full', config.color)}
            />
          </div>
          <span className="text-[8px] text-slate-400 flex-shrink-0">{config.label}</span>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Processing Tray - Bottom collapsible section
 */
function ProcessingTray({ files }: { files: ProcessingFile[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const count = files.length;

  if (count === 0) return null;

  return (
    <div className="border-t border-slate-200 bg-slate-50/50">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-100/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-sky-500 rounded-full"
            />
          </div>
          <span className="text-[10px] font-semibold text-slate-600">
            Processing
          </span>
          <span className="text-[10px] font-medium text-slate-400 tabular-nums">
            · {count} file{count !== 1 ? 's' : ''}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-0.5">
              {files.map((file, index) => (
                <ProcessingFileItem key={file.id} file={file} index={index} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Empty State for filters
 */
function EmptyFilterState({ filter }: { filter: FilterType }) {
  const config = {
    all: {
      icon: FileText,
      title: 'No sections',
      description: 'No evidence sections available',
    },
    flagged: {
      icon: CheckCircle2,
      title: 'No flagged items',
      description: 'All sections are clear',
    },
    pending: {
      icon: CheckCircle2,
      title: 'Nothing pending',
      description: 'All required documents uploaded',
    },
  }[filter];

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
      <p className="text-xs font-medium text-slate-600">{config.title}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{config.description}</p>
    </motion.div>
  );
}

/**
 * ChecklistNavigation - Left sidebar with filters and processing tray
 */
export function ChecklistNavigation({
  visaType,
  documents,
  issues,
  selectedSectionId,
  onSelectSection,
  className,
}: ChecklistNavigationProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Get evidence slot templates
  const slots = useMemo(() => {
    return getEvidenceTemplateForVisaType(visaType);
  }, [visaType]);

  // Compute stats for each section
  const sectionStats = useMemo((): SectionStats[] => {
    return slots.map(slot => {
      const slotDocs = documents.filter(d =>
        d.assignedToSlots?.includes(slot.id)
      );
      const slotIssues = issues.filter(
        i => i.targetSlotId === slot.id && i.status === 'open'
      );

      const current = slotDocs.length;
      const required = slot.minCount ?? 1;
      const hasCritical = slotIssues.some(i => i.severity === 'error');
      const isMissing = current === 0 && slot.priority === 'required';

      const qualityCount = slotIssues.filter(i => i.type === 'quality').length;
      const complianceCount = slotIssues.filter(i => i.type === 'logic').length;

      const hasDocumentIssues = slotDocs.some(
        d => d.pipelineStatus === 'quality_issue' || d.pipelineStatus === 'conflict'
      );

      const isComplete = current >= required && slotIssues.length === 0 && !hasDocumentIssues;

      return {
        id: slot.id,
        name: slot.name,
        priority: slot.priority,
        progress: { current, required },
        issueCount: slotIssues.length,
        qualityCount,
        complianceCount,
        hasCritical,
        isComplete,
        isMissing,
      };
    });
  }, [slots, documents, issues]);

  // Get processing files (demo - simulated from documents)
  const processingFiles = useMemo((): ProcessingFile[] => {
    const processingStatuses: DocumentPipelineStatus[] = [
      'uploading',
      'processing',
      'quality_check',
      'compliance_check',
    ];

    return documents
      .filter(d => processingStatuses.includes(d.pipelineStatus))
      .map(d => ({
        id: d.id,
        name: d.fileName || d.name || 'Unknown file',
        status: d.pipelineStatus,
        progress: d.pipelineStatus === 'uploading' ? 30 :
                  d.pipelineStatus === 'processing' ? 50 :
                  d.pipelineStatus === 'quality_check' ? 70 : 85,
      }));
  }, [documents]);

  // Add mock processing files for demo
  const allProcessingFiles = useMemo(() => {
    const mockFiles: ProcessingFile[] = [
      { id: 'mock-1', name: 'passport_scan.pdf', status: 'quality_check', progress: 75 },
      { id: 'mock-2', name: 'bank_statement_dec.pdf', status: 'processing', progress: 45 },
    ];
    return [...processingFiles, ...mockFiles];
  }, [processingFiles]);

  // Filter sections based on active filter
  const filteredSections = useMemo(() => {
    switch (activeFilter) {
      case 'flagged':
        return sectionStats.filter(s => s.issueCount > 0);
      case 'pending':
        return sectionStats.filter(s => s.isMissing);
      default:
        return sectionStats;
    }
  }, [sectionStats, activeFilter]);

  // Sort filtered sections
  const sortedSections = useMemo(() => {
    const sections = [...filteredSections];

    // Sort: critical first, then by issue count, then incomplete, then complete
    sections.sort((a, b) => {
      // Critical issues first
      if (a.hasCritical !== b.hasCritical) return a.hasCritical ? -1 : 1;
      // Then by issue count
      if (a.issueCount !== b.issueCount) return b.issueCount - a.issueCount;
      // Then incomplete before complete
      if (a.isComplete !== b.isComplete) return a.isComplete ? 1 : -1;
      // Then missing before not missing
      if (a.isMissing !== b.isMissing) return a.isMissing ? -1 : 1;
      return 0;
    });

    return sections;
  }, [filteredSections]);

  // Compute filter counts
  const filterCounts = useMemo(() => ({
    all: sectionStats.length,
    flagged: sectionStats.filter(s => s.issueCount > 0).length,
    pending: sectionStats.filter(s => s.isMissing).length,
  }), [sectionStats]);

  // Count totals
  const completedSections = sectionStats.filter(s => s.isComplete).length;
  const openIssues = issues.filter(i => i.status === 'open');
  const qualityCount = openIssues.filter(i => i.type === 'quality').length;
  const complianceCount = openIssues.filter(i => i.type === 'logic').length;

  return (
    <div
      className={cn(
        'w-56 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full',
        className
      )}
    >
      {/* Summary Stats */}
      <SummaryStats
        completedSections={completedSections}
        totalSections={sectionStats.length}
        qualityCount={qualityCount}
        complianceCount={complianceCount}
      />

      {/* Filter Bar */}
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={filterCounts}
      />

      {/* Section List */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-1">
          <AnimatePresence mode="popLayout">
            {sortedSections.length > 0 ? (
              sortedSections.map(section => (
                <SectionItem
                  key={section.id}
                  section={section}
                  isSelected={selectedSectionId === section.id}
                  onClick={() => onSelectSection(section.id)}
                />
              ))
            ) : (
              <EmptyFilterState filter={activeFilter} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Processing Tray */}
      <ProcessingTray files={allProcessingFiles} />
    </div>
  );
}
