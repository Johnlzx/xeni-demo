import type { Issue } from '@/types';

export const MOCK_ISSUES: Issue[] = [
  // ============================================
  // Quality Issues - Case 001
  // 展示 AI 建议的处理方式
  // ============================================
  {
    id: 'issue-001',
    caseId: 'case-001',
    type: 'quality',
    severity: 'error',
    status: 'open',
    title: 'Utility bill scan quality too low',
    description: 'The uploaded utility bill has resolution below 300 DPI and the account holder name is partially obscured, making it unacceptable for submission.',
    suggestion: 'Request the applicant to re-scan the document at 300+ DPI with all text clearly visible.',
    documentIds: ['doc-002'],
    targetSlotId: 'address_proof',
    pipelineStage: 'quality_check',
    aiRecommendation: {
      action: 'request_reupload',
      message: 'Please re-scan your utility bill at 300 DPI or higher. Ensure the entire document is visible with all text clearly readable, especially the account holder name and address.',
      channels: ['email', 'whatsapp'],
      priority: 'high',
    },
    detectedAt: '2024-12-12T15:00:00Z',
  },
  {
    id: 'issue-002',
    caseId: 'case-001',
    type: 'quality',
    severity: 'error',
    status: 'open',
    title: 'Employment letter expired',
    description: 'The employment verification letter is dated August 2024, which is more than 90 days ago. Most immigration applications require employment letters dated within 90 days of submission.',
    suggestion: 'Request a new employment letter from the employer dated within the last 90 days.',
    documentIds: ['doc-004'],
    targetSlotId: 'employment_proof',
    pipelineStage: 'quality_check',
    aiRecommendation: {
      action: 'send_notification',
      message: 'Your employment letter has expired (dated August 2024). Please contact your HR department to request a new employment verification letter dated within the last 90 days. The letter should confirm your job title, salary, and start date.',
      channels: ['email', 'whatsapp'],
      priority: 'high',
    },
    detectedAt: '2024-12-18T09:00:00Z',
  },
  {
    id: 'issue-003',
    caseId: 'case-001',
    type: 'quality',
    severity: 'warning',
    status: 'open',
    title: 'IELTS certificate information incomplete',
    description: 'The IELTS certificate scan is missing critical information: the Test Reference Number (TRF) is not visible and the overall band score section appears to be cut off.',
    suggestion: 'Request the applicant to provide a complete scan of the IELTS certificate showing the TRF number and all scores.',
    documentIds: ['doc-006'],
    targetSlotId: 'english_proof',
    pipelineStage: 'quality_check',
    aiRecommendation: {
      action: 'request_reupload',
      message: 'Your IELTS certificate scan is incomplete. Please provide a new scan that shows:\n1. The Test Reference Number (TRF) clearly visible\n2. All component scores (Listening, Reading, Writing, Speaking)\n3. The overall band score\n\nEnsure the entire certificate is visible without any parts cut off.',
      channels: ['email'],
      priority: 'medium',
    },
    detectedAt: '2024-12-16T14:30:00Z',
  },

  // ============================================
  // Logic Issues - Case 001
  // 用于演示 compliance 阶段
  // ============================================
  {
    id: 'issue-101',
    caseId: 'case-001',
    type: 'logic',
    severity: 'error',
    status: 'open',
    title: 'Date of birth format mismatch',
    description: 'The date of birth differs between the passport (15 Mar 1988) and the bank statement (1988-15-03). This appears to be a date format confusion (DD/MM vs MM/DD).',
    suggestion: 'Verify the correct date format and confirm with the applicant.',
    documentIds: ['doc-001', 'doc-fin-004'],
    targetSlotId: 'identity',
    pipelineStage: 'compliance_check',
    conflictDetails: {
      field: 'dateOfBirth',
      valueA: '15 Mar 1988',
      valueB: '1988-15-03',
      sourceA: 'Passport',
      sourceB: 'Bank Statement (Oct 2024)',
    },
    aiRecommendation: {
      action: 'manual_review',
      message: 'Date format inconsistency detected. The passport shows March 15, 1988 while the bank statement shows what appears to be day/month reversed. This is likely a date format issue (US vs UK format). Please confirm the correct date with the applicant.',
      channels: ['email'],
      priority: 'high',
    },
    detectedAt: '2024-12-19T09:00:00Z',
  },
  {
    id: 'issue-102',
    caseId: 'case-001',
    type: 'logic',
    severity: 'warning',
    status: 'open',
    title: 'Address format inconsistency',
    description: 'The address on the utility bill shows "Flat 4, 123 High Street" while the bank statement shows "4/123 High Street". The format differs but may refer to the same address.',
    suggestion: 'Confirm both addresses refer to the same location.',
    documentIds: ['doc-002', 'doc-fin-001'],
    targetSlotId: 'address_proof',
    pipelineStage: 'compliance_check',
    conflictDetails: {
      field: 'address',
      valueA: 'Flat 4, 123 High Street',
      valueB: '4/123 High Street',
      sourceA: 'Utility Bill',
      sourceB: 'Bank Statement',
    },
    aiRecommendation: {
      action: 'manual_review',
      message: 'Address format inconsistency detected. Both documents appear to reference the same address but use different formats. "Flat 4, 123 High Street" vs "4/123 High Street" - these likely refer to the same property. Recommend accepting with note.',
      channels: ['email'],
      priority: 'medium',
    },
    detectedAt: '2024-12-19T09:15:00Z',
  },
  {
    id: 'issue-103',
    caseId: 'case-001',
    type: 'logic',
    severity: 'info',
    status: 'open',
    title: 'Employer name variation detected',
    description: 'The employment letter shows "TechCorp Ltd" while the bank statement salary credit shows "TECHCORP LIMITED". These appear to be the same company with different name formats.',
    suggestion: 'Verify this is the same employer using company registration details.',
    documentIds: ['doc-004', 'doc-fin-001'],
    targetSlotId: 'employment_proof',
    pipelineStage: 'compliance_check',
    conflictDetails: {
      field: 'employerName',
      valueA: 'TechCorp Ltd',
      valueB: 'TECHCORP LIMITED',
      sourceA: 'Employment Letter',
      sourceB: 'Bank Statement',
    },
    aiRecommendation: {
      action: 'manual_review',
      message: 'Company name format variation detected. "TechCorp Ltd" and "TECHCORP LIMITED" are likely the same entity - "Ltd" is an abbreviation of "Limited". This is a common variation and can be accepted with confidence.',
      priority: 'low',
    },
    detectedAt: '2024-12-19T09:30:00Z',
  },

  // ============================================
  // Logic Issues - Case 002
  // 展示逻辑冲突和 AI 建议
  // ============================================
  {
    id: 'issue-005',
    caseId: 'case-002',
    type: 'logic',
    severity: 'error',
    status: 'open',
    title: 'Name spelling mismatch',
    description: 'The given name spelling differs between the passport ("Emma") and reference letter ("Ema"). This inconsistency may cause delays or rejection.',
    suggestion: 'Verify the correct spelling and request a corrected reference letter if the typo is in that document.',
    documentIds: ['doc-010', 'doc-013'],
    targetSlotId: 'identity',
    conflictDetails: {
      field: 'Given Name',
      valueA: 'Emma',
      valueB: 'Ema',
      sourceA: 'Passport',
      sourceB: 'Reference Letter',
    },
    aiRecommendation: {
      action: 'manual_review',
      message: 'Name spelling inconsistency detected. The passport shows "Emma" while the reference letter shows "Ema". Please verify: (1) Is this a typo in the reference letter? If so, request a corrected letter. (2) Could this be an official name variation? If so, provide supporting documentation.',
      channels: ['email'],
      priority: 'high',
    },
    detectedAt: '2024-12-17T14:00:00Z',
  },
  {
    id: 'issue-006',
    caseId: 'case-002',
    type: 'logic',
    severity: 'warning',
    status: 'open',
    title: 'Employment start date inconsistency',
    description: 'The employment start date in the contract (2020-03-01) differs from the reference letter (2020-04-15) by 6 weeks. This discrepancy needs clarification.',
    suggestion: 'Clarify with the employer which date is correct and obtain a corrected document.',
    documentIds: ['doc-012', 'doc-013'],
    conflictDetails: {
      field: 'Employment Start Date',
      valueA: '2020-03-01',
      valueB: '2020-04-15',
      sourceA: 'Employment Contract',
      sourceB: 'Reference Letter',
    },
    aiRecommendation: {
      action: 'send_notification',
      message: 'We noticed a discrepancy in your employment start date:\n- Employment Contract: March 1, 2020\n- Reference Letter: April 15, 2020\n\nPlease clarify with your HR department which date is correct. If March 1 is the actual start date, please request an updated reference letter with the correct date.',
      channels: ['email'],
      priority: 'medium',
    },
    detectedAt: '2024-12-17T14:30:00Z',
  },
  {
    id: 'issue-007',
    caseId: 'case-002',
    type: 'logic',
    severity: 'info',
    status: 'resolved',
    title: 'Salary figure not mentioned in reference',
    description: 'The reference letter does not confirm the salary figure mentioned in the employment contract (GBP 65,000).',
    suggestion: 'Consider requesting an updated reference letter that confirms salary details.',
    documentIds: ['doc-012', 'doc-013'],
    aiRecommendation: {
      action: 'manual_review',
      message: 'The reference letter does not mention the salary. While not strictly required, confirming salary in the reference letter strengthens the application. Consider requesting an updated letter.',
      priority: 'low',
    },
    detectedAt: '2024-12-17T15:00:00Z',
    resolvedAt: '2024-12-18T10:00:00Z',
  },
];

export function getIssuesByCaseId(caseId: string): Issue[] {
  return MOCK_ISSUES.filter(issue => issue.caseId === caseId);
}

export function getOpenIssuesByCaseId(caseId: string): Issue[] {
  return MOCK_ISSUES.filter(issue => issue.caseId === caseId && issue.status === 'open');
}

export function getIssuesByType(caseId: string, type: Issue['type']): Issue[] {
  return MOCK_ISSUES.filter(issue => issue.caseId === caseId && issue.type === type);
}

export function getIssueByDocumentId(documentId: string): Issue | undefined {
  return MOCK_ISSUES.find(issue => issue.documentIds.includes(documentId));
}

export function getIssuesBySlotId(caseId: string, slotId: string): Issue[] {
  return MOCK_ISSUES.filter(
    issue => issue.caseId === caseId && issue.targetSlotId === slotId && issue.status === 'open'
  );
}
