'use client';

import { ChevronDown, ChevronUp, X, Upload, Send, Square, CheckSquare, User, Banknote, Briefcase, GraduationCap, BookOpen, Home, Globe, ShieldCheck, Heart, Building, Languages, Folder } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { EvidenceSlotItem } from './EvidenceSlotItem';
import type { EvidenceSlot, SlotStatus, EvidenceCategoryId } from '@/types';
import { EVIDENCE_CATEGORIES } from '@/data/evidence-templates';

type StatusFilter = SlotStatus | null;

// Category icon mapping
const CATEGORY_ICONS: Record<EvidenceCategoryId, React.ComponentType<{ className?: string }>> = {
  identity_personal: User,
  financial: Banknote,
  employment: Briefcase,
  english_language: GraduationCap,
  knowledge_life_uk: BookOpen,
  residence: Home,
  immigration_history: Globe,
  character_conduct: ShieldCheck,
  relationship: Heart,
  sponsor: Building,
  translations: Languages,
  other: Folder,
};

interface EvidenceSlotListProps {
  slots: EvidenceSlot[];
  selectedSlotId: string | null;
  onSlotSelect: (slotId: string) => void;
  onUpload?: () => void;
  onRequestDocuments?: (slotIds: string[]) => void;
  progress: {
    total: number;
    satisfied: number;
    required: number;
    requiredSatisfied: number;
  };
}

export function EvidenceSlotList({
  slots,
  selectedSlotId,
  onSlotSelect,
  onUpload,
  onRequestDocuments,
  progress,
}: EvidenceSlotListProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(null);
  const [selectedSlotIds, setSelectedSlotIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Initialize with all categories collapsed (computed from initial slots)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(() => {
    const categoryIds = new Set<string>();
    slots.filter(s => s.status !== 'hidden').forEach(slot => {
      categoryIds.add(slot.categoryId || 'other');
    });
    return categoryIds;
  });

  // Filter out hidden slots
  const visibleSlots = slots.filter(s => s.status !== 'hidden');

  // Group slots by category
  const slotsByCategory = useMemo(() => {
    const grouped = new Map<EvidenceCategoryId, EvidenceSlot[]>();

    visibleSlots.forEach(slot => {
      const categoryId = slot.categoryId || 'other';
      if (!grouped.has(categoryId)) {
        grouped.set(categoryId, []);
      }
      grouped.get(categoryId)!.push(slot);
    });

    // Sort by category order
    return Array.from(grouped.entries())
      .sort(([a], [b]) => {
        const orderA = EVIDENCE_CATEGORIES[a]?.order ?? 99;
        const orderB = EVIDENCE_CATEGORIES[b]?.order ?? 99;
        return orderA - orderB;
      });
  }, [visibleSlots]);

  // Progress calculations
  const requiredSlots = visibleSlots.filter(s => s.priority === 'required');
  const requiredProgress = {
    total: requiredSlots.length,
    satisfied: requiredSlots.filter(s => s.status === 'satisfied').length,
  };

  // Status counts
  const statusCounts = useMemo(() => ({
    satisfied: visibleSlots.filter((s) => s.status === 'satisfied').length,
    partial: visibleSlots.filter((s) => s.status === 'partial').length,
    issue: visibleSlots.filter((s) => s.status === 'issue').length,
    empty: visibleSlots.filter((s) => s.status === 'empty').length,
  }), [visibleSlots]);

  // Toggle category collapse
  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Toggle status filter
  const toggleFilter = (status: SlotStatus) => {
    setStatusFilter((prev) => (prev === status ? null : status));
  };

  // Filter slots based on status filter
  const filterSlots = (slotList: EvidenceSlot[]) => {
    if (!statusFilter) return slotList;
    return slotList.filter((s) => s.status === statusFilter);
  };

  const requiredPercent = requiredProgress.total > 0
    ? (requiredProgress.satisfied / requiredProgress.total) * 100
    : 0;

  // Multi-select handlers
  const toggleSlotSelection = (slotId: string) => {
    setSelectedSlotIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(slotId)) {
        newSet.delete(slotId);
      } else {
        newSet.add(slotId);
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedSlotIds(new Set());
    setIsSelectionMode(false);
  };

  const handleRequestDocuments = () => {
    if (onRequestDocuments && selectedSlotIds.size > 0) {
      onRequestDocuments(Array.from(selectedSlotIds));
      clearSelection();
    }
  };

  const allRequiredComplete = requiredProgress.satisfied === requiredProgress.total && requiredProgress.total > 0;

  // Get category progress
  const getCategoryProgress = (categorySlots: EvidenceSlot[]) => {
    const required = categorySlots.filter(s => s.priority === 'required');
    const satisfied = categorySlots.filter(s => s.status === 'satisfied');
    return {
      total: categorySlots.length,
      satisfied: satisfied.length,
      required: required.length,
      requiredSatisfied: required.filter(s => s.status === 'satisfied').length,
    };
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header with Progress */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 text-sm tracking-tight">
            Evidence Checklist
          </h2>
          {/* Completion badge */}
          {allRequiredComplete && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              Ready
            </span>
          )}
        </div>

        {/* Required Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600">Required Evidence</span>
            <span className="text-[11px] tabular-nums text-gray-500">
              {requiredProgress.satisfied}/{requiredProgress.total}
            </span>
          </div>
          <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out',
                requiredPercent === 100 ? 'bg-emerald-500' : 'bg-[#0E4369]'
              )}
              style={{ width: `${requiredPercent}%` }}
            />
          </div>
        </div>

        {/* Status Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => toggleFilter('satisfied')}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all',
              statusFilter === 'satisfied'
                ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300'
                : 'text-gray-500 hover:bg-gray-100'
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {statusCounts.satisfied}
          </button>
          <button
            onClick={() => toggleFilter('partial')}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all',
              statusFilter === 'partial'
                ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                : 'text-gray-500 hover:bg-gray-100'
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            {statusCounts.partial}
          </button>
          {statusCounts.issue > 0 && (
            <button
              onClick={() => toggleFilter('issue')}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all',
                statusFilter === 'issue'
                  ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
                  : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              {statusCounts.issue}
            </button>
          )}
          {statusFilter && (
            <button
              onClick={() => setStatusFilter(null)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Selection Mode Toggle */}
          <div className="flex-1" />
          <button
            onClick={() => {
              if (isSelectionMode) {
                clearSelection();
              } else {
                setIsSelectionMode(true);
              }
            }}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all',
              isSelectionMode
                ? 'bg-[#0E4369] text-white'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            )}
          >
            {isSelectionMode ? (
              <CheckSquare className="w-3 h-3" />
            ) : (
              <Square className="w-3 h-3" />
            )}
            {isSelectionMode ? 'Done' : 'Select'}
          </button>
        </div>
      </div>

      {/* Categorized Slots List */}
      <div className="flex-1 overflow-y-auto">
        {slotsByCategory.map(([categoryId, categorySlots]) => {
          const category = EVIDENCE_CATEGORIES[categoryId];
          const CategoryIcon = CATEGORY_ICONS[categoryId] || Folder;
          const isCollapsed = collapsedCategories.has(categoryId);
          const filteredSlots = filterSlots(categorySlots);
          const categoryProgress = getCategoryProgress(categorySlots);

          // Skip if no slots match filter
          if (statusFilter && filteredSlots.length === 0) return null;

          const allSatisfied = categoryProgress.satisfied === categoryProgress.total;
          const hasIssues = categorySlots.some(s => s.status === 'issue');

          return (
            <div key={categoryId} className="border-b border-gray-100 last:border-b-0">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryId)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                  'hover:bg-gray-50',
                  isCollapsed ? 'bg-white' : 'bg-gray-50/50'
                )}
              >
                {/* Category Icon */}
                <div className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                  allSatisfied
                    ? 'bg-emerald-100 text-emerald-600'
                    : hasIssues
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-gray-100 text-gray-500'
                )}>
                  <CategoryIcon className="w-4 h-4" />
                </div>

                {/* Category Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {category?.name || 'Other'}
                    </span>
                    {/* Mini progress indicator */}
                    <span className={cn(
                      'text-[10px] font-medium tabular-nums',
                      allSatisfied ? 'text-emerald-600' : 'text-gray-400'
                    )}>
                      {categoryProgress.satisfied}/{categoryProgress.total}
                    </span>
                  </div>
                </div>

                {/* Expand/Collapse */}
                <div className="flex items-center gap-2">
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Category Slots */}
              {!isCollapsed && (
                <div className="px-4 pb-3 space-y-1.5">
                  {filteredSlots.map((slot) => (
                    <EvidenceSlotItem
                      key={slot.id}
                      slot={slot}
                      isSelected={selectedSlotId === slot.id}
                      isChecked={selectedSlotIds.has(slot.id)}
                      showCheckbox={isSelectionMode}
                      onClick={() => {
                        if (isSelectionMode) {
                          toggleSlotSelection(slot.id);
                        } else {
                          onSlotSelect(slot.id);
                        }
                      }}
                      onCheckChange={() => toggleSlotSelection(slot.id)}
                      compact
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state when filter active */}
        {statusFilter && slotsByCategory.every(([, categorySlots]) => filterSlots(categorySlots).length === 0) && (
          <div className="p-8 text-center text-gray-400">
            <p className="text-sm">No items match the filter</p>
            <button
              onClick={() => setStatusFilter(null)}
              className="text-[#0E4369] hover:underline text-sm mt-2"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="border-t border-gray-200 bg-white">
        {/* Selection Action - Slides in when items selected */}
        {selectedSlotIds.size > 0 ? (
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-gray-700">
                {selectedSlotIds.size} selected
              </span>
              <button
                onClick={clearSelection}
                className="text-[10px] text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
            <button
              onClick={handleRequestDocuments}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#0E4369] rounded-lg hover:bg-[#0B3654] transition-colors"
            >
              <Send className="w-4 h-4" />
              Request from Client
            </button>
          </div>
        ) : (
          <div className="p-3">
            <button
              onClick={onUpload}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Documents
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
