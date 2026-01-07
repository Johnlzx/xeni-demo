'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import { usePreScreening } from '@/hooks/usePreScreening';
import { PRESCREENING_QUESTIONS, type PreScreeningAnswers } from '@/data/prescreening-questions';
import { VISA_TYPES } from '@/data/constants';
import { getPassportBookColors } from '@/lib/passport-colors';
import { cn } from '@/lib/utils';
import { SimplificationProgress } from './SimplificationProgress';
import { ReductionFeedback } from './ReductionFeedback';
import { PreScreeningCard } from './PreScreeningCard';
import type { VisaType, PassportInfo } from '@/types';

interface PreScreeningFlowProps {
  visaType: VisaType;
  passport: PassportInfo;
  caseId: string;
  referenceNumber: string;
  isVisible: boolean;
  onComplete: (answers: PreScreeningAnswers, removedSections: string[]) => void;
  onSkip?: () => void;
}

// Passport Book Icon - Mini version for header button, nationality-aware
function PassportBookIconMini({
  nationality,
  className,
}: {
  nationality: string;
  className?: string;
}) {
  const colors = getPassportBookColors(nationality);

  return (
    <div className={cn('relative w-7 h-8', className)}>
      {/* Book base */}
      <div className={cn(
        'w-full h-full rounded bg-gradient-to-b shadow-sm relative overflow-hidden',
        colors.gradient
      )}>
        {/* Spine shadow */}
        <div className={cn(
          'absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r to-transparent',
          colors.spine
        )} />
        {/* Cover emboss */}
        <div className={cn('absolute inset-1 border rounded-sm', colors.border)} />
        {/* Emblem */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            'w-4 h-4 rounded-full border flex items-center justify-center',
            colors.emblem
          )}>
            <div className={cn('w-2 h-2 rounded-full', colors.emblemInner)} />
          </div>
        </div>
        {/* Page edges */}
        <div className={cn(
          'absolute right-0 top-1 bottom-1 w-0.5 rounded-r',
          colors.pages
        )} />
      </div>
    </div>
  );
}

/**
 * PreScreeningFlow - Full-screen orchestrator for the pre-screening cards
 *
 * Uses the case detail layout structure:
 * - Header with navigation, client info, and visa type
 * - Main content area with pre-screening cards
 * - Bottom progress and navigation
 */
export function PreScreeningFlow({
  visaType,
  passport,
  caseId,
  referenceNumber,
  isVisible,
  onComplete,
  onSkip,
}: PreScreeningFlowProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const {
    currentCardIndex,
    selections,
    currentQuestion,
    simplificationPercentage,
    latestFeedback,
    selectOption,
    goToNextCard,
    goToPreviousCard,
    canGoBack,
    canGoForward,
    totalCards,
    isComplete,
  } = usePreScreening({
    caseId,
    onComplete,
  });

  const visaConfig = VISA_TYPES[visaType];
  const applicantName = `${passport.givenNames} ${passport.surname}`;

  // Handle option selection
  const handleSelect = useCallback(
    (value: string | boolean) => {
      if (!currentQuestion || isTransitioning) return;

      selectOption(currentQuestion.id, value);

      // Show feedback if sections were removed
      const selectedOption = currentQuestion.options.find((opt) => opt.value === value);
      if (selectedOption?.sectionsRemoved.length) {
        setShowFeedback(true);
      }

      // Auto-advance after selection with delay
      setIsTransitioning(true);
      setTimeout(() => {
        goToNextCard();
        setIsTransitioning(false);
        setShowFeedback(false);
      }, selectedOption?.sectionsRemoved.length ? 1200 : 600);
    },
    [currentQuestion, selectOption, goToNextCard, isTransitioning]
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && canGoBack && !isTransitioning) {
        goToPreviousCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGoBack, goToPreviousCard, isTransitioning]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[95] bg-gray-50 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Case Detail Style Header */}
      <motion.div
        className="bg-white border-b border-slate-200 flex-shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="px-6 py-3">
          <div className="flex items-center gap-4">
            {/* Left Section: Back + Cases */}
            <a
              href="/cases"
              className="flex items-center gap-1.5 px-2 py-1 -ml-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors group flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Cases</span>
            </a>

            {/* Separator */}
            <div className="h-6 w-px bg-slate-200 flex-shrink-0" />

            {/* Client Name with Passport Icon */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 flex-shrink-0">
              <PassportBookIconMini nationality={passport.nationality} />
              <span className="text-sm font-semibold text-slate-900">
                {applicantName}
              </span>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-slate-200 flex-shrink-0" />

            {/* Reference Number */}
            <span className="text-sm font-mono text-slate-600 flex-shrink-0">
              {referenceNumber}
            </span>

            {/* Visa Type Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 bg-white flex-shrink-0">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-medium text-slate-700">
                {visaConfig.label}
              </span>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right Section: Pre-screening badge + Skip */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                <span className="text-xs font-medium text-primary-700">
                  Pre-screening
                </span>
              </div>

              {onSkip && (
                <button
                  onClick={onSkip}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Skip
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Progress Bar */}
        <motion.div
          className="px-6 lg:px-12 pt-6 pb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SimplificationProgress
            percentage={simplificationPercentage}
            currentCard={currentCardIndex}
            totalCards={totalCards}
          />
        </motion.div>

        {/* Card Area - Centered */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-12 pb-24">
          <AnimatePresence mode="wait">
            {currentQuestion && !isComplete && (
              <PreScreeningCard
                key={currentQuestion.id}
                question={currentQuestion}
                selectedValue={selections[currentQuestion.id]}
                onSelect={handleSelect}
                isAnimatingOut={isTransitioning}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 px-6 lg:px-12 py-6 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {/* Back button */}
            <button
              onClick={goToPreviousCard}
              disabled={!canGoBack || isTransitioning}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 disabled:opacity-0 disabled:pointer-events-none transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {/* Step indicator */}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalCards }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-300',
                    i === currentCardIndex
                      ? 'bg-primary-500 w-6'
                      : i < currentCardIndex
                      ? 'bg-primary-300'
                      : 'bg-slate-200'
                  )}
                />
              ))}
            </div>

            {/* Spacer for alignment */}
            <div className="w-16" />
          </div>
        </motion.div>
      </div>

      {/* Reduction feedback toast */}
      <ReductionFeedback
        removedLabels={latestFeedback?.labels ?? []}
        isVisible={showFeedback}
      />
    </motion.div>
  );
}
