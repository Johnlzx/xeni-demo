import type { ComplianceRule, ComplianceReport } from '@/types';

export const MOCK_COMPLIANCE_RULES: Record<string, ComplianceRule[]> = {
  'case-001': [
    {
      id: 'rule-001-1',
      name: 'Passport Validity Check',
      category: 'document_validity',
      description: 'Passport must be valid for at least 6 months from application date',
      result: 'pass',
      details: 'Passport valid until 23-01-2026 (more than 1 year remaining)',
      relatedDocuments: ['doc-001'],
    },
    {
      id: 'rule-001-2',
      name: 'Identity Verification',
      category: 'identity_verification',
      description: 'Verify applicant identity from passport',
      result: 'pass',
      details: 'All identity fields successfully extracted and verified',
      relatedDocuments: ['doc-001'],
    },
    {
      id: 'rule-001-3',
      name: 'Residence Requirement',
      category: 'timeline_consistency',
      description: 'Applicant must have resided in UK for continuous 5 years',
      result: 'pending',
      details: 'Awaiting complete proof of residence documentation',
      relatedDocuments: ['doc-002'],
    },
    {
      id: 'rule-001-4',
      name: 'Financial Stability',
      category: 'financial_requirement',
      description: 'Bank statements must show stable financial situation',
      result: 'warning',
      details: 'Bank statements need to be re-uploaded due to quality issues',
      relatedDocuments: ['doc-003'],
    },
    {
      id: 'rule-001-5',
      name: 'Name Consistency',
      category: 'cross_reference',
      description: 'Name must match across all submitted documents',
      result: 'pass',
      details: 'Name "Bob Brown" consistent across all uploaded documents',
      relatedDocuments: ['doc-001', 'doc-002', 'doc-004'],
    },
  ],
  'case-002': [
    {
      id: 'rule-002-1',
      name: 'Passport Validity Check',
      category: 'document_validity',
      description: 'Passport must be valid for visa duration',
      result: 'pass',
      details: 'Passport valid until 10-03-2032',
      relatedDocuments: ['doc-010'],
    },
    {
      id: 'rule-002-2',
      name: 'Certificate of Sponsorship',
      category: 'identity_verification',
      description: 'Valid CoS from licensed sponsor',
      result: 'pass',
      details: 'CoS verified with Home Office records',
      relatedDocuments: ['doc-011'],
    },
    {
      id: 'rule-002-3',
      name: 'Name Consistency',
      category: 'cross_reference',
      description: 'Name must match across all documents',
      result: 'fail',
      details: 'Name mismatch detected: "Emma" vs "Ema" in reference letter',
      relatedDocuments: ['doc-010', 'doc-013'],
    },
    {
      id: 'rule-002-4',
      name: 'Employment Date Consistency',
      category: 'timeline_consistency',
      description: 'Employment dates must be consistent',
      result: 'warning',
      details: 'Start date discrepancy of 6 weeks between documents',
      relatedDocuments: ['doc-012', 'doc-013'],
    },
    {
      id: 'rule-002-5',
      name: 'Salary Verification',
      category: 'financial_requirement',
      description: 'Salary must meet minimum threshold for visa type',
      result: 'pass',
      details: 'Salary of £65,000 meets Skilled Worker threshold',
      relatedDocuments: ['doc-012'],
    },
  ],
  'case-003': [
    {
      id: 'rule-003-1',
      name: 'Passport Validity',
      category: 'document_validity',
      description: 'Passport valid for course duration',
      result: 'pass',
      details: 'Passport valid until 2033',
      relatedDocuments: [],
    },
    {
      id: 'rule-003-2',
      name: 'CAS Verification',
      category: 'identity_verification',
      description: 'Valid CAS from licensed sponsor',
      result: 'pass',
      details: 'CAS verified',
      relatedDocuments: [],
    },
    {
      id: 'rule-003-3',
      name: 'Financial Evidence',
      category: 'financial_requirement',
      description: 'Sufficient funds for tuition and living costs',
      result: 'pass',
      details: 'Funds meet requirements',
      relatedDocuments: [],
    },
    {
      id: 'rule-003-4',
      name: 'English Language',
      category: 'cross_reference',
      description: 'English proficiency meets course requirements',
      result: 'pass',
      details: 'IELTS 7.0 exceeds minimum requirement',
      relatedDocuments: [],
    },
  ],
};

export function getComplianceReportByCaseId(caseId: string): ComplianceReport | null {
  const rules = MOCK_COMPLIANCE_RULES[caseId];
  if (!rules) return null;

  const summary = {
    passed: rules.filter(r => r.result === 'pass').length,
    failed: rules.filter(r => r.result === 'fail').length,
    warnings: rules.filter(r => r.result === 'warning').length,
    pending: rules.filter(r => r.result === 'pending').length,
  };

  let overallStatus: ComplianceReport['overallStatus'] = 'approved';
  if (summary.failed > 0) {
    overallStatus = 'rejected';
  } else if (summary.warnings > 0 || summary.pending > 0) {
    overallStatus = 'needs_review';
  }

  return {
    id: `report-${caseId}`,
    caseId,
    generatedAt: new Date().toISOString(),
    rules,
    summary,
    overallStatus,
  };
}
