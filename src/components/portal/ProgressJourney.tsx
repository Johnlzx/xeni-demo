'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Loader2,
  Briefcase,
  FileStack,
  Send,
  Award,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import type { ProgressStep } from '@/types';

interface ProgressJourneyProps {
  steps: ProgressStep[];
  estimatedWaitTime?: string;
}

const stepIcons: Record<string, React.ElementType> = {
  'step-1': Briefcase,  // Case Created
  'step-2': FileStack,  // Document Collection
  'step-3': Send,       // Application Submitted
  'step-4': Award,      // Visa Issued
};

const stepColors: Record<string, { bg: string; text: string; glow: string }> = {
  'step-1': { bg: 'bg-[#144368]', text: 'text-[#144368]', glow: 'shadow-[#144368]/20' },
  'step-2': { bg: 'bg-[#144368]', text: 'text-[#144368]', glow: 'shadow-[#144368]/20' },
  'step-3': { bg: 'bg-[#144368]', text: 'text-[#144368]', glow: 'shadow-[#144368]/20' },
  'step-4': { bg: 'bg-[#22c55e]', text: 'text-[#22c55e]', glow: 'shadow-[#22c55e]/20' },
};

export function ProgressJourney({ steps, estimatedWaitTime = '6-8 weeks' }: ProgressJourneyProps) {
  const currentStepIndex = steps.findIndex(s => s.status === 'current');
  const progressPercentage = currentStepIndex >= 0
    ? (currentStepIndex / (steps.length - 1)) * 100
    : 0;

  const currentStep = steps[currentStepIndex];

  return (
    <div className="relative">
      {/* Hero Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#144368] via-[#1a5580] to-[#0d3a5c] p-5 sm:p-6 text-white mb-6 shadow-xl shadow-[#144368]/25"
      >
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10">
          {/* Current status */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium mb-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#86efac] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#4ade80]"></span>
                </span>
                Step {currentStepIndex + 1} of {steps.length}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold mb-1">
                {currentStep?.title || 'Getting Started'}
              </h2>
              <p className="text-white/70 text-sm max-w-lg">
                {currentStep?.description || 'Your journey is about to begin'}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-1.5 bg-white/20 rounded-full overflow-hidden mb-3">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#60a5fa] to-[#93c5fd] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            />
          </div>

          {/* Estimated time - only show for submitted status */}
          {currentStep?.id === 'step-3' && (
            <div className="flex items-center gap-2 text-white/60 text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>Typical processing time: <span className="text-white font-medium">{estimatedWaitTime}</span></span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Journey Steps - 4 columns */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {steps.map((step, index) => {
          const Icon = stepIcons[step.id] || Circle;
          const colors = stepColors[step.id] || stepColors['step-1'];
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isUpcoming = step.status === 'upcoming';
          const isLast = index === steps.length - 1;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-0.5 bg-[#e5e7eb] z-0">
                  <motion.div
                    className="h-full bg-[#144368]"
                    initial={{ width: 0 }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                  />
                </div>
              )}

              {/* Step card */}
              <div
                className={cn(
                  'relative z-10 flex flex-col items-center text-center p-2 sm:p-3 rounded-xl transition-all duration-300',
                  isCurrent && 'bg-white shadow-lg shadow-[#144368]/10 border-2 border-[#144368]',
                  isCompleted && 'bg-[#144368]/5',
                  isUpcoming && 'opacity-50'
                )}
              >
                {/* Icon */}
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all',
                  isCompleted && `${colors.bg} shadow-lg ${colors.glow}`,
                  isCurrent && `${colors.bg} shadow-lg ${colors.glow} ring-4 ring-[#144368]/20`,
                  isUpcoming && 'bg-[#e5e7eb]',
                  isLast && isCompleted && 'bg-[#22c55e] shadow-lg shadow-[#22c55e]/20'
                )}>
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {isLast ? (
                        <Award className="w-5 h-5 text-white" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      )}
                    </motion.div>
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5 text-[#9ca3af]" />
                  )}
                </div>

                {/* Step title */}
                <h4 className={cn(
                  'text-xs sm:text-sm font-semibold leading-tight',
                  isCompleted && colors.text,
                  isCurrent && 'text-[#144368]',
                  isUpcoming && 'text-[#9ca3af]',
                  isLast && isCompleted && 'text-[#22c55e]'
                )}>
                  {step.title}
                </h4>

                {/* Completion date - only on larger screens */}
                {step.completedAt && (
                  <p className="hidden sm:block text-[10px] text-[#144368]/50 mt-1">
                    {formatDate(step.completedAt, 'short')}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
