'use client';

import { Check, Circle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CasePhase } from '@/hooks/useCasePhase';

interface StatusRibbonProps {
  currentPhase: CasePhase;
  className?: string;
}

const PHASES: { key: CasePhase; label: string; shortLabel: string }[] = [
  { key: 'intake', label: 'Document Intake', shortLabel: 'Intake' },
  { key: 'compliance', label: 'Compliance Review', shortLabel: 'Compliance' },
  { key: 'ready', label: 'Ready to Submit', shortLabel: 'Ready' },
];

const PHASE_ORDER: Record<CasePhase, number> = {
  intake: 0,
  compliance: 1,
  ready: 2,
};

export function StatusRibbon({ currentPhase, className }: StatusRibbonProps) {
  const currentIndex = PHASE_ORDER[currentPhase];

  return (
    <div className={cn('flex items-center', className)}>
      {PHASES.map((phase, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;

        return (
          <div key={phase.key} className="flex items-center">
            {/* Phase Step */}
            <div className="flex items-center gap-3">
              {/* Step Indicator */}
              <div
                className={cn(
                  'relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-500',
                  isCompleted && 'bg-[#0E4369] text-white',
                  isCurrent && 'bg-[#0E4369] text-white ring-4 ring-[#0E4369]/20',
                  isUpcoming && 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" strokeWidth={3} />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}

                {/* Pulse animation for current step */}
                {isCurrent && (
                  <span className="absolute inset-0 rounded-full bg-[#0E4369]/30 animate-ping" />
                )}
              </div>

              {/* Phase Label */}
              <div className="flex flex-col">
                <span
                  className={cn(
                    'text-sm font-medium transition-colors duration-300',
                    isCompleted && 'text-[#0E4369]',
                    isCurrent && 'text-[#0E4369]',
                    isUpcoming && 'text-gray-400'
                  )}
                >
                  {phase.label}
                </span>
                {isCurrent && (
                  <span className="text-xs text-[#0E4369]/70 font-medium">
                    Current Stage
                  </span>
                )}
              </div>
            </div>

            {/* Connector */}
            {index < PHASES.length - 1 && (
              <div className="mx-6 flex items-center">
                <div
                  className={cn(
                    'w-16 h-0.5 transition-all duration-500',
                    index < currentIndex ? 'bg-[#0E4369]' : 'bg-gray-200'
                  )}
                />
                <ChevronRight
                  className={cn(
                    'w-4 h-4 -ml-1 transition-colors duration-300',
                    index < currentIndex ? 'text-[#0E4369]' : 'text-gray-300'
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Compact version for smaller spaces
export function StatusRibbonCompact({ currentPhase, className }: StatusRibbonProps) {
  const currentIndex = PHASE_ORDER[currentPhase];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {PHASES.map((phase, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={phase.key} className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300',
                isCompleted && 'bg-[#0E4369]/10 text-[#0E4369]',
                isCurrent && 'bg-[#0E4369] text-white shadow-sm',
                !isCompleted && !isCurrent && 'bg-gray-100 text-gray-400'
              )}
            >
              {isCompleted && <Check className="w-3 h-3" />}
              {phase.shortLabel}
            </div>
            {index < PHASES.length - 1 && (
              <ChevronRight className="w-3 h-3 text-gray-300" />
            )}
          </div>
        );
      })}
    </div>
  );
}
