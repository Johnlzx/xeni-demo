import type { Issue } from '@/types';

export const MOCK_ISSUES: Issue[] = [
  // Quality Issues - Case 001
  {
    id: 'issue-001',
    caseId: 'case-001',
    type: 'quality',
    severity: 'error',
    status: 'open',
    title: 'Bank statement file too large',
    description: 'The uploaded bank statement file exceeds the 5MB limit required for government portal submission.',
    suggestion: 'Use the compress tool to reduce file size, or split into multiple smaller files.',
    documentIds: ['doc-003'],
    detectedAt: '2024-12-13T09:30:00Z',
  },
  {
    id: 'issue-002',
    caseId: 'case-001',
    type: 'quality',
    severity: 'warning',
    status: 'open',
    title: 'Blurry scan detected',
    description: 'Some pages in the bank statement appear to be blurry and may not pass automated verification.',
    suggestion: 'Please re-scan the affected pages at 300 DPI or higher resolution.',
    documentIds: ['doc-003'],
    detectedAt: '2024-12-13T09:35:00Z',
  },
  {
    id: 'issue-003',
    caseId: 'case-001',
    type: 'quality',
    severity: 'info',
    status: 'resolved',
    title: 'Missing document',
    description: 'English Language Certificate has not been uploaded yet.',
    suggestion: 'Upload your IELTS or equivalent English test certificate.',
    documentIds: ['doc-006'],
    detectedAt: '2024-12-15T10:00:00Z',
  },

  // Logic Issues - Case 002
  {
    id: 'issue-004',
    caseId: 'case-002',
    type: 'logic',
    severity: 'error',
    status: 'open',
    title: 'Name spelling mismatch',
    description: 'The given name spelling differs between the passport and reference letter.',
    suggestion: 'Verify the correct spelling and request a corrected reference letter if needed.',
    documentIds: ['doc-010', 'doc-013'],
    conflictDetails: {
      field: 'Given Name',
      valueA: 'Emma',
      valueB: 'Ema',
      sourceA: 'Passport',
      sourceB: 'Reference Letter',
    },
    detectedAt: '2024-12-17T14:00:00Z',
  },
  {
    id: 'issue-005',
    caseId: 'case-002',
    type: 'logic',
    severity: 'warning',
    status: 'open',
    title: 'Employment start date inconsistency',
    description: 'The employment start date in the contract differs from the reference letter by 6 weeks.',
    suggestion: 'Clarify with the employer which date is correct and obtain a corrected document.',
    documentIds: ['doc-012', 'doc-013'],
    conflictDetails: {
      field: 'Employment Start Date',
      valueA: '2020-03-01',
      valueB: '2020-04-15',
      sourceA: 'Employment Contract',
      sourceB: 'Reference Letter',
    },
    detectedAt: '2024-12-17T14:30:00Z',
  },
  {
    id: 'issue-006',
    caseId: 'case-002',
    type: 'logic',
    severity: 'info',
    status: 'open',
    title: 'Salary figure not mentioned in reference',
    description: 'The reference letter does not confirm the salary figure mentioned in the employment contract.',
    suggestion: 'Consider requesting an updated reference letter that confirms salary details.',
    documentIds: ['doc-012', 'doc-013'],
    detectedAt: '2024-12-17T15:00:00Z',
  },

  // Quality Issue - Case 004
  {
    id: 'issue-007',
    caseId: 'case-004',
    type: 'quality',
    severity: 'warning',
    status: 'open',
    title: 'Document date approaching expiry',
    description: 'The employment letter is dated over 25 days ago and may be considered outdated.',
    suggestion: 'Request an updated employment letter if submission will take more than a few days.',
    documentIds: [],
    detectedAt: '2024-12-16T11:00:00Z',
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
