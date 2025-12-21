import { useMemo } from 'react';
import type { CaseStatus, Issue } from '@/types';

export type CasePhase = 'intake' | 'compliance' | 'ready';

interface CasePhaseResult {
  phase: CasePhase;
  isIntake: boolean;
  isCompliance: boolean;
  isReady: boolean;
  canProgress: boolean;
  blockingReason: string | null;
  responsibleParty: 'applicant' | 'lawyer' | 'system' | null;
  primaryAction: {
    label: string;
    action: string;
  } | null;
}

const STATUS_TO_PHASE: Record<CaseStatus, CasePhase> = {
  draft: 'intake',
  intake: 'intake',
  review: 'compliance',
  compliance: 'compliance',
  ready: 'ready',
  submitted: 'ready',
  approved: 'ready',
  rejected: 'ready',
};

export function useCasePhase(
  status: CaseStatus,
  issues: Issue[] = []
): CasePhaseResult {
  return useMemo(() => {
    const phase = STATUS_TO_PHASE[status];
    const openIssues = issues.filter((i) => i.status === 'open');
    const qualityIssues = openIssues.filter((i) => i.type === 'quality');
    const logicIssues = openIssues.filter((i) => i.type === 'logic');

    const isIntake = phase === 'intake';
    const isCompliance = phase === 'compliance';
    const isReady = phase === 'ready';

    // Determine blocking reason and responsible party
    let blockingReason: string | null = null;
    let responsibleParty: 'applicant' | 'lawyer' | 'system' | null = null;
    let canProgress = true;

    if (isIntake && qualityIssues.length > 0) {
      blockingReason = `${qualityIssues.length} quality issue${qualityIssues.length > 1 ? 's' : ''} need attention`;
      responsibleParty = 'applicant';
      canProgress = false;
    } else if (isCompliance && logicIssues.length > 0) {
      blockingReason = `${logicIssues.length} logic conflict${logicIssues.length > 1 ? 's' : ''} need resolution`;
      responsibleParty = 'lawyer';
      canProgress = false;
    }

    // Determine primary action based on phase and status
    let primaryAction: CasePhaseResult['primaryAction'] = null;

    if (isIntake) {
      if (qualityIssues.length > 0) {
        primaryAction = {
          label: 'Send Request to Applicant',
          action: 'request_documents',
        };
      } else {
        primaryAction = {
          label: 'Start Compliance Review',
          action: 'start_compliance',
        };
      }
    } else if (isCompliance) {
      if (logicIssues.length > 0) {
        primaryAction = {
          label: 'Resolve Conflicts',
          action: 'resolve_conflicts',
        };
      } else {
        primaryAction = {
          label: 'Mark as Ready',
          action: 'mark_ready',
        };
      }
    } else if (isReady) {
      if (status === 'ready') {
        primaryAction = {
          label: 'Launch Form Pilot',
          action: 'launch_form_pilot',
        };
      } else if (status === 'submitted') {
        primaryAction = {
          label: 'View Submission',
          action: 'view_submission',
        };
      }
    }

    return {
      phase,
      isIntake,
      isCompliance,
      isReady,
      canProgress,
      blockingReason,
      responsibleParty,
      primaryAction,
    };
  }, [status, issues]);
}

// Helper function to get phase label
export function getPhaseLabel(phase: CasePhase): string {
  switch (phase) {
    case 'intake':
      return 'Document Intake';
    case 'compliance':
      return 'Compliance Review';
    case 'ready':
      return 'Ready to Submit';
    default:
      return 'Unknown';
  }
}

// Helper function to get phase description
export function getPhaseDescription(phase: CasePhase): string {
  switch (phase) {
    case 'intake':
      return 'Collecting and verifying documents';
    case 'compliance':
      return 'Reviewing business logic and resolving conflicts';
    case 'ready':
      return 'Case is ready for submission';
    default:
      return '';
  }
}
