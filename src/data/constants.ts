import type { VisaType, CaseStatus, DocumentCategory, IssueSeverity, RuleCategory } from '@/types';

// ============================================
// Visa Type Configuration
// ============================================
export const VISA_TYPES: Record<VisaType, { label: string; description: string; color: string }> = {
  naturalisation: {
    label: 'Naturalisation',
    description: 'British citizenship application',
    color: '#0E4369',
  },
  skilled_worker: {
    label: 'Skilled Worker Visa',
    description: 'Work visa for skilled professionals',
    color: '#059669',
  },
  visitor: {
    label: 'Visitor Visa',
    description: 'Temporary visitor visa',
    color: '#7C3AED',
  },
  partner: {
    label: 'Partner Visa',
    description: 'Partner/spouse visa application',
    color: '#DB2777',
  },
};

// ============================================
// Case Status Configuration
// ============================================
export const CASE_STATUSES: Record<CaseStatus, { label: string; color: string; bgColor: string }> = {
  draft: {
    label: 'Draft',
    color: '#6B7280',
    bgColor: '#F3F4F6',
  },
  intake: {
    label: 'Intake',
    color: '#0E4369',
    bgColor: '#E8F0F5',
  },
  review: {
    label: 'Review',
    color: '#D97706',
    bgColor: '#FEF3C7',
  },
  compliance: {
    label: 'Compliance',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
  },
  ready: {
    label: 'Ready',
    color: '#059669',
    bgColor: '#D1FAE5',
  },
  submitted: {
    label: 'Submitted',
    color: '#0891B2',
    bgColor: '#CFFAFE',
  },
  approved: {
    label: 'Approved',
    color: '#059669',
    bgColor: '#ECFDF5',
  },
  rejected: {
    label: 'Rejected',
    color: '#DC2626',
    bgColor: '#FEE2E2',
  },
};

// ============================================
// Document Category Configuration
// ============================================
export const DOCUMENT_CATEGORIES: Record<DocumentCategory, { label: string; icon: string }> = {
  identity: { label: 'Identity', icon: 'user' },
  financial: { label: 'Financial', icon: 'banknote' },
  employment: { label: 'Employment', icon: 'briefcase' },
  education: { label: 'Education', icon: 'graduation-cap' },
  relationship: { label: 'Relationship', icon: 'heart' },
  other: { label: 'Other', icon: 'file' },
};

// ============================================
// Issue Severity Configuration
// ============================================
export const ISSUE_SEVERITIES: Record<IssueSeverity, { label: string; color: string; bgColor: string; icon: string }> = {
  error: {
    label: 'Error',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    icon: 'x-circle',
  },
  warning: {
    label: 'Warning',
    color: '#D97706',
    bgColor: '#FEF3C7',
    icon: 'alert-triangle',
  },
  info: {
    label: 'Info',
    color: '#0E4369',
    bgColor: '#E8F0F5',
    icon: 'info',
  },
};

// ============================================
// Rule Category Configuration
// ============================================
export const RULE_CATEGORIES: Record<RuleCategory, { label: string; description: string }> = {
  identity_verification: {
    label: 'Identity Verification',
    description: 'Verify applicant identity documents',
  },
  financial_requirement: {
    label: 'Financial Requirement',
    description: 'Check financial eligibility',
  },
  document_validity: {
    label: 'Document Validity',
    description: 'Ensure documents are valid and current',
  },
  timeline_consistency: {
    label: 'Timeline Consistency',
    description: 'Check date consistency across documents',
  },
  cross_reference: {
    label: 'Cross Reference',
    description: 'Verify information matches across documents',
  },
};

// ============================================
// Navigation Routes
// ============================================
export const ROUTES = {
  HOME: '/',
  CASES: '/cases',
  CASE_DETAIL: (caseId: string) => `/cases/${caseId}`,
  INTAKE: (caseId: string) => `/cases/${caseId}/intake`,
  COMPLIANCE: (caseId: string) => `/cases/${caseId}/compliance`,
  PORTAL: '/portal',
  PORTAL_CASE: (caseId: string) => `/portal/${caseId}`,
} as const;
