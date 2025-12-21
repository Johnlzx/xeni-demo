import type { ProgressStep, CaseStatus } from '@/types';

export function generateProgressSteps(status: CaseStatus): ProgressStep[] {
  const allSteps: ProgressStep[] = [
    {
      id: 'step-1',
      title: 'Case Created',
      description: 'Your case has been created and assigned to a legal advisor',
      status: 'upcoming',
    },
    {
      id: 'step-2',
      title: 'Document Collection',
      description: 'Upload required documents according to the checklist',
      status: 'upcoming',
    },
    {
      id: 'step-3',
      title: 'Quality Review',
      description: 'Documents are being reviewed for quality and completeness',
      status: 'upcoming',
    },
    {
      id: 'step-4',
      title: 'Compliance Check',
      description: 'Verifying information consistency across all documents',
      status: 'upcoming',
    },
    {
      id: 'step-5',
      title: 'Ready for Submission',
      description: 'All checks passed, case ready for submission',
      status: 'upcoming',
    },
    {
      id: 'step-6',
      title: 'Submitted',
      description: 'Application submitted to immigration authorities',
      status: 'upcoming',
    },
  ];

  const statusToStepIndex: Record<CaseStatus, number> = {
    draft: 0,
    intake: 1,
    review: 2,
    compliance: 3,
    ready: 4,
    submitted: 5,
    approved: 6,
    rejected: 6,
  };

  const currentIndex = statusToStepIndex[status] || 0;

  return allSteps.map((step, index) => {
    if (index < currentIndex) {
      return { ...step, status: 'completed' as const, completedAt: '2024-12-15T10:00:00Z' };
    } else if (index === currentIndex) {
      return { ...step, status: 'current' as const };
    }
    return step;
  });
}
