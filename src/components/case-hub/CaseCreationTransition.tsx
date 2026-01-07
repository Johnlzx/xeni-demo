'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { PassportReveal } from './PassportReveal';
import { PreScreeningFlow } from './PreScreeningFlow';
import { ROUTES } from '@/data/constants';
import type { PreScreeningAnswers } from '@/data/prescreening-questions';
import type { PassportInfo, VisaType } from '@/types';

export interface CreatedCaseData {
  id: string;
  visaType: VisaType;
  referenceNumber: string;
  passport: PassportInfo;
}

type TransitionPhase = 'idle' | 'passport' | 'prescreening' | 'navigating';

interface CaseCreationTransitionProps {
  /** The created case data, triggers the transition when set */
  createdCase: CreatedCaseData | null;
  /** Callback when transition completes and we should navigate */
  onTransitionComplete: () => void;
  /** Whether to skip directly to case detail (for quick mode) */
  skipAnimation?: boolean;
}

/**
 * CaseCreationTransition - Orchestrates the modal → passport → prescreening flow
 *
 * This component manages the transition phases:
 * 1. idle: No transition active
 * 2. passport: Passport reveal animation (book opening)
 * 3. prescreening: Pre-screening cards to customize the checklist (with case detail layout)
 * 4. navigating: Transitioning to case detail page
 *
 * The animation sequence creates a delightful "document journey" metaphor
 * that reinforces the immigration/visa application context.
 */
export function CaseCreationTransition({
  createdCase,
  onTransitionComplete,
  skipAnimation = false,
}: CaseCreationTransitionProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<TransitionPhase>('idle');
  const [displayCase, setDisplayCase] = useState<CreatedCaseData | null>(null);

  // Start transition when createdCase is set
  useEffect(() => {
    if (createdCase) {
      setDisplayCase(createdCase);

      if (skipAnimation) {
        // Skip to navigation directly
        router.push(ROUTES.CASE_DETAIL(createdCase.id));
        onTransitionComplete();
      } else {
        // Start passport animation
        setPhase('passport');
      }
    }
  }, [createdCase, skipAnimation, router, onTransitionComplete]);

  // Handle passport reveal completion - proceed to prescreening
  const handlePassportComplete = useCallback(() => {
    setPhase('prescreening');
  }, []);

  // Handle prescreening completion - navigate to case detail
  const handlePrescreeningComplete = useCallback(
    (answers: PreScreeningAnswers, sections: string[]) => {
      if (!displayCase) return;

      // Store prescreening data in sessionStorage for the case detail page
      const existingData = sessionStorage.getItem(`new-case-${displayCase.id}`);
      if (existingData) {
        const parsed = JSON.parse(existingData);
        sessionStorage.setItem(`new-case-${displayCase.id}`, JSON.stringify({
          ...parsed,
          prescreeningAnswers: answers,
          removedSections: sections,
        }));
      }

      setPhase('navigating');

      // Brief delay for exit animation, then navigate
      setTimeout(() => {
        router.push(ROUTES.CASE_DETAIL(displayCase.id));
        onTransitionComplete();

        // Reset after navigation
        setTimeout(() => {
          setPhase('idle');
          setDisplayCase(null);
        }, 500);
      }, 300);
    },
    [displayCase, router, onTransitionComplete]
  );

  // Handle prescreening skip - navigate directly to case detail
  const handlePrescreeningSkip = useCallback(() => {
    if (!displayCase) return;

    setPhase('navigating');

    setTimeout(() => {
      router.push(ROUTES.CASE_DETAIL(displayCase.id));
      onTransitionComplete();

      setTimeout(() => {
        setPhase('idle');
        setDisplayCase(null);
      }, 500);
    }, 300);
  }, [displayCase, router, onTransitionComplete]);

  // Don't render if idle
  if (phase === 'idle' && !displayCase) return null;

  return (
    <>
      {/* Passport Reveal */}
      {displayCase && (
        <PassportReveal
          isVisible={phase === 'passport'}
          passport={displayCase.passport}
          visaType={displayCase.visaType}
          onComplete={handlePassportComplete}
        />
      )}

      {/* Pre-screening Flow (with case detail layout) */}
      {displayCase && (
        <PreScreeningFlow
          visaType={displayCase.visaType}
          passport={displayCase.passport}
          caseId={displayCase.id}
          referenceNumber={displayCase.referenceNumber}
          isVisible={phase === 'prescreening'}
          onComplete={handlePrescreeningComplete}
          onSkip={handlePrescreeningSkip}
        />
      )}

      {/* Navigation transition overlay */}
      <AnimatePresence>
        {phase === 'navigating' && (
          <motion.div
            key="nav-overlay"
            className="fixed inset-0 z-[95] bg-gray-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Hook to manage case creation transition state
 */
export function useCaseCreationTransition() {
  const [createdCase, setCreatedCase] = useState<CreatedCaseData | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startTransition = useCallback((caseData: CreatedCaseData) => {
    setCreatedCase(caseData);
    setIsTransitioning(true);
  }, []);

  const endTransition = useCallback(() => {
    setIsTransitioning(false);
    // Don't clear createdCase immediately - let animations finish
    setTimeout(() => setCreatedCase(null), 1000);
  }, []);

  return {
    createdCase,
    isTransitioning,
    startTransition,
    endTransition,
  };
}
