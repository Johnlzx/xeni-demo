'use client';

import { CheckCircle2, Circle, AlertCircle, ChevronRight, Square, CheckSquare } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { EvidenceSlot } from '@/types';
import { getSlotStatusColor } from '@/hooks/useEvidenceSlots';

interface EvidenceSlotItemProps {
  slot: EvidenceSlot;
  isSelected: boolean;
  isChecked?: boolean;
  showCheckbox?: boolean;
  onClick: () => void;
  onCheckChange?: () => void;
  compact?: boolean;
}

export function EvidenceSlotItem({
  slot,
  isSelected,
  isChecked = false,
  showCheckbox = false,
  onClick,
  onCheckChange,
  compact = false,
}: EvidenceSlotItemProps) {
  const colors = getSlotStatusColor(slot.status);
  const progressPercent = Math.min(
    (slot.progress.current / slot.progress.required) * 100,
    100
  );

  // Track status changes for animation
  const prevStatusRef = useRef(slot.status);
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    // Detect transition to satisfied state
    if (prevStatusRef.current !== 'satisfied' && slot.status === 'satisfied') {
      setJustCompleted(true);
      const timer = setTimeout(() => setJustCompleted(false), 600);
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = slot.status;
  }, [slot.status]);

  const iconSize = compact ? 'w-4 h-4' : 'w-5 h-5';

  const getStatusIcon = () => {
    switch (slot.status) {
      case 'satisfied':
        return (
          <CheckCircle2
            className={cn(
              iconSize,
              'text-emerald-500',
              justCompleted && 'animate-checkmark-pop'
            )}
          />
        );
      case 'partial':
        return (
          <div className={cn('relative', iconSize)}>
            <Circle className={cn(iconSize, 'text-blue-300')} />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(${100 - progressPercent}% 0 0 0)` }}
            >
              <Circle className={cn(iconSize, 'text-blue-500 fill-blue-500')} />
            </div>
          </div>
        );
      case 'issue':
        return <AlertCircle className={cn(iconSize, 'text-amber-500')} />;
      case 'empty':
      default:
        return <Circle className={cn(iconSize, 'text-gray-300')} />;
    }
  };

  const getProgressText = () => {
    if (slot.status === 'satisfied') {
      return 'Complete';
    }
    if (slot.progress.required > 1) {
      return `${slot.progress.current}/${slot.progress.required} docs`;
    }
    if (slot.status === 'partial') {
      return 'Processing...';
    }
    return 'Awaiting';
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl border transition-all duration-200',
        'hover:shadow-md hover:border-gray-300',
        'focus:outline-none focus:ring-2 focus:ring-[#0E4369]/20 focus:ring-offset-1',
        'group relative overflow-hidden',
        // Compact vs full padding
        compact ? 'p-3 rounded-lg' : 'p-4 rounded-xl',
        // Selected state (when viewing details)
        isSelected && !showCheckbox
          ? 'bg-[#0E4369]/5 border-[#0E4369] shadow-sm'
          : 'bg-white border-gray-200',
        // Checked state (when in selection mode)
        showCheckbox && isChecked && 'bg-[#0E4369]/5 border-[#0E4369]',
        // Visual hierarchy: dim completed items (only when not in selection mode)
        slot.status === 'satisfied' && !isSelected && !showCheckbox && 'opacity-75 border-gray-100',
        // Visual hierarchy: highlight issue items with left border
        slot.status === 'issue' && 'border-l-4 border-l-amber-400',
        // Completion animation
        justCompleted && 'animate-slot-complete'
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          'bg-gradient-to-r from-transparent via-white/50 to-transparent',
          'pointer-events-none'
        )}
      />

      <div className={cn('flex items-start relative', compact ? 'gap-2.5' : 'gap-3')}>
        {/* Checkbox or Status Icon */}
        <div className={cn('flex-shrink-0', compact ? 'mt-0' : 'mt-0.5')}>
          {showCheckbox ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onCheckChange?.();
              }}
              className="cursor-pointer"
            >
              {isChecked ? (
                <CheckSquare className={cn(iconSize, 'text-[#0E4369]')} />
              ) : (
                <Square className={cn(iconSize, 'text-gray-300 hover:text-gray-400')} />
              )}
            </div>
          ) : (
            getStatusIcon()
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3
              className={cn(
                'font-semibold text-sm truncate',
                (isSelected || isChecked) ? 'text-[#0E4369]' : 'text-gray-900'
              )}
            >
              {slot.name}
            </h3>
            {slot.priority === 'required' && slot.status !== 'satisfied' && (
              <span className="flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-rose-100 text-rose-600">
                Required
              </span>
            )}
            {slot.priority === 'optional' && (
              <span className="flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                Optional
              </span>
            )}
          </div>

          {/* Progress Info */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-xs',
                slot.status === 'satisfied'
                  ? 'text-emerald-600'
                  : slot.status === 'issue'
                  ? 'text-amber-600'
                  : 'text-gray-500'
              )}
            >
              {getProgressText()}
            </span>

            {/* Mini progress bar for multi-doc slots */}
            {slot.progress.required > 1 && slot.status !== 'satisfied' && (
              <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    slot.status === 'issue' ? 'bg-amber-400' : 'bg-blue-400'
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>

          {/* Acceptable types hint - hide in compact mode */}
          {!compact && (
            <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-1">
              {slot.acceptableTypes.length === 1
                ? slot.acceptableTypes[0].label
                : `${slot.acceptableTypes.length} acceptable types`}
            </p>
          )}
        </div>

        {/* Arrow indicator (hide in selection mode) */}
        {!showCheckbox && (
          <ChevronRight
            className={cn(
              'w-4 h-4 flex-shrink-0 transition-transform duration-200',
              isSelected ? 'text-[#0E4369] translate-x-0.5' : 'text-gray-300'
            )}
          />
        )}
      </div>
    </button>
  );
}
