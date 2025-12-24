import { useMemo } from 'react';
import type { EvidenceSlot, EvidenceSlotTemplate, CaseFormResponses } from '@/types';
import { evaluateFormCondition, getFormResponsesForCase } from '@/data/evidence-templates';

interface UseFormConditionSlotsProps {
  slots: EvidenceSlot[];
  caseId: string;
  formResponses?: CaseFormResponses;
}

interface UseFormConditionSlotsReturn {
  /** Slots that should be visible based on form conditions */
  visibleSlots: EvidenceSlot[];
  /** Slots that are hidden due to unmet form conditions */
  hiddenSlots: EvidenceSlot[];
  /** Check if a specific form question has been answered */
  isQuestionAnswered: (questionId: string) => boolean;
  /** Get form response for a specific question */
  getFormResponse: (questionId: string) => string | boolean | number | undefined;
  /** Check if all conditional slots have their conditions evaluated */
  hasConditionalSlots: boolean;
  /** Count of conditional slots that are currently visible */
  visibleConditionalCount: number;
}

/**
 * Hook for filtering slots based on form conditions (progressive disclosure)
 *
 * This hook evaluates form conditions on slots and determines which slots
 * should be visible based on user's form responses. Slots without form conditions
 * are always visible. Slots with form conditions are only visible when the
 * condition is satisfied.
 *
 * @example
 * ```tsx
 * const { visibleSlots } = useFormConditionSlots({
 *   slots,
 *   caseId: 'case-001',
 * });
 *
 * // Only render visible slots
 * return visibleSlots.map(slot => <SlotCard key={slot.id} slot={slot} />);
 * ```
 */
export function useFormConditionSlots({
  slots,
  caseId,
  formResponses,
}: UseFormConditionSlotsProps): UseFormConditionSlotsReturn {
  // Get form responses for this case (from prop or mock data)
  const responses = useMemo(() => {
    if (formResponses) {
      return formResponses.responses;
    }
    // Fall back to mock data
    const mockResponse = getFormResponsesForCase(caseId);
    return mockResponse?.responses || {};
  }, [formResponses, caseId]);

  // Evaluate each slot's form condition
  const { visibleSlots, hiddenSlots } = useMemo(() => {
    const visible: EvidenceSlot[] = [];
    const hidden: EvidenceSlot[] = [];

    slots.forEach(slot => {
      // If slot has no form condition, it's always visible
      if (!slot.formCondition) {
        visible.push(slot);
        return;
      }

      // Evaluate the form condition
      const conditionMet = evaluateFormCondition(slot.formCondition, responses);

      if (conditionMet) {
        visible.push(slot);
      } else {
        hidden.push({
          ...slot,
          status: 'hidden', // Override status for hidden slots
        });
      }
    });

    return { visibleSlots: visible, hiddenSlots: hidden };
  }, [slots, responses]);

  // Helper to check if a question has been answered
  const isQuestionAnswered = useMemo(() => {
    return (questionId: string): boolean => {
      return responses[questionId] !== undefined;
    };
  }, [responses]);

  // Helper to get a form response
  const getFormResponse = useMemo(() => {
    return (questionId: string): string | boolean | number | undefined => {
      return responses[questionId];
    };
  }, [responses]);

  // Check if there are any conditional slots
  const hasConditionalSlots = useMemo(() => {
    return slots.some(slot => slot.formCondition);
  }, [slots]);

  // Count visible conditional slots
  const visibleConditionalCount = useMemo(() => {
    return visibleSlots.filter(slot => slot.formCondition).length;
  }, [visibleSlots]);

  return {
    visibleSlots,
    hiddenSlots,
    isQuestionAnswered,
    getFormResponse,
    hasConditionalSlots,
    visibleConditionalCount,
  };
}

/**
 * Get all unique form questions from slots
 * Useful for displaying a form to collect required information
 */
export function getFormQuestionsFromSlots(slots: EvidenceSlotTemplate[]): string[] {
  const questions = new Set<string>();

  slots.forEach(slot => {
    if (slot.formCondition?.questionId) {
      questions.add(slot.formCondition.questionId);
    }
  });

  return Array.from(questions);
}

/**
 * Pretty labels for common form questions
 */
export const FORM_QUESTION_LABELS: Record<string, string> = {
  has_children: 'Do you have dependent children?',
  has_overseas_assets: 'Do you have assets overseas?',
  is_self_employed: 'Are you self-employed?',
  has_previous_applications: 'Have you made previous visa applications?',
  has_criminal_record: 'Do you have any criminal convictions?',
  has_medical_conditions: 'Do you have any medical conditions to declare?',
};
