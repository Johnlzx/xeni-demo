import type { ProgressStep, CaseStatus } from '@/types';

export function generateProgressSteps(status: CaseStatus): ProgressStep[] {
  const allSteps: ProgressStep[] = [
    {
      id: 'step-1',
      title: 'Case Created',
      description: 'Your case has been opened and a legal advisor has been assigned to guide you through the process.',
      status: 'upcoming',
    },
    {
      id: 'step-2',
      title: 'Document Collection',
      description: 'We are collecting and reviewing your documents. Please upload any pending items to keep things moving.',
      status: 'upcoming',
    },
    {
      id: 'step-3',
      title: 'Application Submitted',
      description: 'Your application has been submitted to the immigration authorities. Now we wait for their decision.',
      status: 'upcoming',
    },
    {
      id: 'step-4',
      title: 'Visa Issued',
      description: 'Congratulations! Your visa has been approved and issued. Welcome to your new journey.',
      status: 'upcoming',
    },
  ];

  // Map case status to progress step index
  // draft/intake/review/compliance/ready -> Document Collection (step 2)
  // submitted -> Application Submitted (step 3)
  // approved -> Visa Issued (step 4)
  const statusToStepIndex: Record<CaseStatus, number> = {
    draft: 1,       // Document Collection
    intake: 1,      // Document Collection
    review: 1,      // Document Collection
    compliance: 1,  // Document Collection
    ready: 1,       // Document Collection (ready to submit)
    submitted: 2,   // Application Submitted
    approved: 3,    // Visa Issued
    rejected: 2,    // Stay at submitted (with rejection)
  };

  const currentIndex = statusToStepIndex[status] ?? 1;

  return allSteps.map((step, index) => {
    if (index < currentIndex) {
      // Completed steps
      const completionDates: Record<number, string> = {
        0: '2024-12-10T10:00:00Z', // Case Created
        1: '2024-12-18T14:30:00Z', // Document Collection
        2: '2024-12-20T09:00:00Z', // Application Submitted
      };
      return {
        ...step,
        status: 'completed' as const,
        completedAt: completionDates[index] || '2024-12-15T10:00:00Z'
      };
    } else if (index === currentIndex) {
      // Current step - only show estimated date for submitted step
      return {
        ...step,
        status: 'current' as const,
        estimatedDate: index === 2 ? '2025-02-15T00:00:00Z' : undefined
      };
    }
    return step;
  });
}
