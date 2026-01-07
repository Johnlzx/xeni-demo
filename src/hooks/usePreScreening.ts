import { useState, useCallback, useMemo } from 'react';
import {
  PRESCREENING_QUESTIONS,
  TOTAL_REMOVABLE_SECTIONS,
  calculateRemovedSections,
  convertToFormConditions,
  type PreScreeningAnswers,
} from '@/data/prescreening-questions';

export interface UsePreScreeningOptions {
  /** Case ID for sessionStorage key */
  caseId: string;
  /** Callback when all questions are answered */
  onComplete?: (answers: PreScreeningAnswers, removedSections: string[]) => void;
}

export interface UsePreScreeningReturn {
  // State
  currentCardIndex: number;
  selections: Record<string, string | boolean>;
  isComplete: boolean;

  // Computed
  totalCards: number;
  currentQuestion: typeof PRESCREENING_QUESTIONS[number] | null;
  removedSections: string[];
  removedSectionLabels: string[];
  simplificationPercentage: number;

  // Latest selection feedback
  latestFeedback: {
    sectionsRemoved: string[];
    labels: string[];
  } | null;

  // Actions
  selectOption: (questionId: string, value: string | boolean) => void;
  goToNextCard: () => void;
  goToPreviousCard: () => void;
  reset: () => void;
  getFormConditions: () => PreScreeningAnswers;

  // Navigation flags
  canGoBack: boolean;
  canGoForward: boolean;
}

/**
 * Hook for managing pre-screening card flow state
 *
 * Handles:
 * - Card navigation (next/previous)
 * - Selection tracking
 * - Section removal calculation
 * - Simplification percentage
 * - SessionStorage persistence
 */
export function usePreScreening({
  caseId,
  onComplete,
}: UsePreScreeningOptions): UsePreScreeningReturn {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string | boolean>>({});
  const [latestFeedback, setLatestFeedback] = useState<{
    sectionsRemoved: string[];
    labels: string[];
  } | null>(null);

  const totalCards = PRESCREENING_QUESTIONS.length;
  const currentQuestion = PRESCREENING_QUESTIONS[currentCardIndex] ?? null;
  const isComplete = currentCardIndex >= totalCards;

  // Calculate removed sections based on current selections
  const { sections: removedSections, labels: removedSectionLabels } = useMemo(
    () => calculateRemovedSections(selections),
    [selections]
  );

  // Calculate simplification percentage
  const simplificationPercentage = useMemo(() => {
    if (TOTAL_REMOVABLE_SECTIONS === 0) return 0;
    return Math.round((removedSections.length / TOTAL_REMOVABLE_SECTIONS) * 100);
  }, [removedSections.length]);

  // Select an option for a question
  const selectOption = useCallback((questionId: string, value: string | boolean) => {
    const question = PRESCREENING_QUESTIONS.find(q => q.id === questionId);
    if (!question) return;

    const selectedOption = question.options.find(opt => opt.value === value);
    if (!selectedOption) return;

    // Update selections
    setSelections(prev => ({
      ...prev,
      [questionId]: value,
    }));

    // Set latest feedback for animation
    if (selectedOption.sectionsRemoved.length > 0) {
      setLatestFeedback({
        sectionsRemoved: selectedOption.sectionsRemoved,
        labels: selectedOption.sectionLabels,
      });
    } else {
      setLatestFeedback(null);
    }
  }, []);

  // Navigate to next card
  const goToNextCard = useCallback(() => {
    const nextIndex = currentCardIndex + 1;

    if (nextIndex >= totalCards) {
      // Complete - save to sessionStorage and call callback
      const formConditions = convertToFormConditions(selections);
      const { sections } = calculateRemovedSections(selections);

      // Save to sessionStorage
      const storageKey = `prescreening-${caseId}`;
      const existingData = sessionStorage.getItem(`new-case-${caseId}`);
      if (existingData) {
        const parsed = JSON.parse(existingData);
        sessionStorage.setItem(`new-case-${caseId}`, JSON.stringify({
          ...parsed,
          prescreeningAnswers: formConditions,
          sectionsRemoved: sections,
          prescreeningCompletedAt: new Date().toISOString(),
        }));
      }

      setCurrentCardIndex(nextIndex);
      onComplete?.(formConditions, sections);
    } else {
      setCurrentCardIndex(nextIndex);
      setLatestFeedback(null);
    }
  }, [currentCardIndex, totalCards, selections, caseId, onComplete]);

  // Navigate to previous card
  const goToPreviousCard = useCallback(() => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setLatestFeedback(null);
    }
  }, [currentCardIndex]);

  // Reset to beginning
  const reset = useCallback(() => {
    setCurrentCardIndex(0);
    setSelections({});
    setLatestFeedback(null);
  }, []);

  // Get form conditions from current selections
  const getFormConditions = useCallback(() => {
    return convertToFormConditions(selections);
  }, [selections]);

  // Navigation flags
  const canGoBack = currentCardIndex > 0;
  const canGoForward = currentQuestion
    ? selections[currentQuestion.id] !== undefined
    : false;

  return {
    currentCardIndex,
    selections,
    isComplete,
    totalCards,
    currentQuestion,
    removedSections,
    removedSectionLabels,
    simplificationPercentage,
    latestFeedback,
    selectOption,
    goToNextCard,
    goToPreviousCard,
    reset,
    getFormConditions,
    canGoBack,
    canGoForward,
  };
}
