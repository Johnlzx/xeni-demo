'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, Sparkles, FileCheck, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CasePhase } from '@/hooks/useCasePhase';

interface PhaseTransitionProps {
  fromPhase: CasePhase;
  toPhase: CasePhase;
  isVisible: boolean;
  onProceed: () => void;
  onDismiss: () => void;
}

const PHASE_CONFIG = {
  intake: {
    label: 'Document Intake',
    icon: FileCheck,
    color: 'emerald',
  },
  compliance: {
    label: 'Compliance Review',
    icon: Shield,
    color: 'blue',
  },
  ready: {
    label: 'Ready to Submit',
    icon: CheckCircle2,
    color: 'violet',
  },
};

export function PhaseTransition({
  fromPhase,
  toPhase,
  isVisible,
  onProceed,
  onDismiss,
}: PhaseTransitionProps) {
  const [animationStage, setAnimationStage] = useState<'enter' | 'visible' | 'exit'>('enter');

  useEffect(() => {
    if (isVisible) {
      setAnimationStage('enter');
      const timer = setTimeout(() => setAnimationStage('visible'), 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const fromConfig = PHASE_CONFIG[fromPhase];
  const toConfig = PHASE_CONFIG[toPhase];
  const ToIcon = toConfig.icon;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center transition-all duration-500',
        animationStage === 'enter' ? 'opacity-0' : 'opacity-100'
      )}
    >
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-900/70 to-gray-800/80 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* Content Card */}
      <div
        className={cn(
          'relative w-full max-w-md mx-4 transition-all duration-700 ease-out',
          animationStage === 'enter'
            ? 'opacity-0 scale-95 translate-y-4'
            : 'opacity-100 scale-100 translate-y-0'
        )}
      >
        {/* Decorative glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-violet-500/20 rounded-3xl blur-xl opacity-70" />

        {/* Main card */}
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Success header with animated gradient */}
          <div className="relative px-8 pt-10 pb-8 text-center overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-blue-400 to-violet-400" />
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="celebration-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="1.5" fill="currentColor" className="text-gray-900" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#celebration-pattern)" />
              </svg>
            </div>

            {/* Success icon with pulse animation */}
            <div className="relative inline-flex mb-6">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-20" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
            </div>

            {/* Celebration text */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {fromPhase === 'intake' && 'Evidence Collection Complete!'}
              {fromPhase === 'compliance' && 'Compliance Review Complete!'}
              {fromPhase !== 'intake' && fromPhase !== 'compliance' && 'Phase Complete!'}
            </h2>
            <p className="text-gray-600">
              {fromPhase === 'intake' && 'All required documents have been verified and quality issues resolved.'}
              {fromPhase === 'compliance' && 'All data conflicts have been reviewed and resolved.'}
              {fromPhase !== 'intake' && fromPhase !== 'compliance' && 'All tasks have been completed.'}
            </p>
          </div>

          {/* Phase transition visualization */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-center gap-4">
              {/* From phase */}
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {fromConfig.label}
                </span>
              </div>

              {/* Arrow with animation */}
              <div className="flex items-center gap-1">
                <div className="w-8 h-0.5 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full" />
                <ArrowRight className="w-5 h-5 text-blue-500 animate-pulse" />
                <div className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" />
              </div>

              {/* To phase */}
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-2 ring-2 ring-blue-200 ring-offset-2">
                  <ToIcon className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                  {toConfig.label}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 py-6 bg-white border-t border-gray-100">
            <button
              onClick={onProceed}
              className="w-full group relative flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#0E4369] to-[#1a5a8a] text-white rounded-xl font-semibold text-sm shadow-lg shadow-[#0E4369]/25 hover:shadow-xl hover:shadow-[#0E4369]/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              Proceed to {toConfig.label}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onDismiss}
              className="w-full mt-3 px-6 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              {fromPhase === 'intake' && 'Continue reviewing documents'}
              {fromPhase === 'compliance' && 'Continue reviewing conflicts'}
              {fromPhase !== 'intake' && fromPhase !== 'compliance' && 'Continue current phase'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
