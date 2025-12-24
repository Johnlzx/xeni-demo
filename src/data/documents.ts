import type { Document } from '@/types';

export const MOCK_DOCUMENTS: Document[] = [
  // ============================================
  // Case 001 - Naturalisation (Bob Brown)
  // 展示多种业务场景 - 文档管道状态
  // 4层层级: Category → Document Type → Document Instance → Files
  // ============================================

  // ============================================
  // IDENTITY & PERSONAL STATUS
  // ============================================

  // Current Passport - 完全就绪
  {
    id: 'doc-001',
    caseId: 'case-001',
    name: 'Current Passport',
    category: 'identity',
    status: 'approved',
    fileName: 'passport_bob_brown.pdf',
    fileSize: 2458624,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-10T11:00:00Z',
    uploadedBy: 'Bob Brown',
    qualityCheck: {
      passed: true,
      issues: [],
    },
    extractedData: {
      givenNames: 'Bob',
      surname: 'Brown',
      dateOfBirth: '1988-03-15',
      nationality: 'Chinese',
      passportNumber: 'E12345678',
      issueDate: '2020-01-15',
      expiryDate: '2030-01-14',
      placeOfBirth: 'Beijing',
      countryOfBirth: 'China',
    },
    documentTypeId: 'passport',
    assignedToSlots: ['identity'],
    pipelineStatus: 'ready',
    standardizedPdfUrl: '/standardized/passport_bob_brown_std.pdf',
    pipelineHistory: [
      { status: 'uploading', timestamp: '2024-12-10T10:55:00Z', triggeredBy: 'user' },
      { status: 'processing', timestamp: '2024-12-10T10:56:00Z', triggeredBy: 'system' },
      { status: 'quality_check', timestamp: '2024-12-10T10:58:00Z', triggeredBy: 'system' },
      { status: 'compliance_check', timestamp: '2024-12-10T10:59:00Z', triggeredBy: 'system' },
      { status: 'ready', timestamp: '2024-12-10T11:00:00Z', triggeredBy: 'system', message: 'All checks passed' },
    ],
  },

  // Birth Certificate - 完全就绪
  {
    id: 'doc-001b',
    caseId: 'case-001',
    name: 'Birth Certificate',
    category: 'identity',
    status: 'approved',
    fileName: 'birth_certificate_bob.pdf',
    fileSize: 1234567,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-11T09:00:00Z',
    uploadedBy: 'Bob Brown',
    qualityCheck: {
      passed: true,
      issues: [],
    },
    extractedData: {
      fullName: 'Bob Brown',
      dateOfBirth: '1988-03-15',
      placeOfBirth: 'Beijing, China',
      fatherName: 'William Brown',
      motherName: 'Mary Brown',
    },
    documentTypeId: 'birth_cert_original',
    assignedToSlots: ['birth_certificate'],
    pipelineStatus: 'ready',
    standardizedPdfUrl: '/standardized/birth_cert_bob_std.pdf',
  },

  // ============================================
  // UK RESIDENCE / ACCOMMODATION
  // ============================================

  // Proof of Address - 质量问题阶段
  {
    id: 'doc-002',
    caseId: 'case-001',
    name: 'Utility Bill - December 2024',
    category: 'identity',
    status: 'rejected',
    fileName: 'electricity_bill_dec2024.pdf',
    fileSize: 1245678,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-12T14:30:00Z',
    uploadedBy: 'Bob Brown',
    qualityCheck: {
      passed: false,
      issues: [
        'Image resolution too low (under 300 DPI)',
        'Account holder name partially obscured',
      ],
    },
    notes: 'Please re-scan at higher resolution with all text clearly visible',
    documentTypeId: 'utility_bill',
    assignedToSlots: ['address_proof'],
    pipelineStatus: 'quality_issue',
  },

  // ============================================
  // FINANCIAL REQUIREMENT
  // Document Instances: 6 consecutive monthly bank statements
  // ============================================

  // Bank Statement - July 2024 (最早月份) - 完全就绪
  {
    id: 'doc-fin-001',
    caseId: 'case-001',
    name: 'Bank Statement - July 2024',
    category: 'financial',
    status: 'approved',
    fileName: 'hsbc_statement_jul_2024.pdf',
    fileSize: 1523456,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-15T09:00:00Z',
    uploadedBy: 'Bob Brown',
    qualityCheck: {
      passed: true,
      issues: [],
    },
    extractedData: {
      accountHolder: 'Bob Brown',
      bankName: 'HSBC',
      statementPeriod: 'July 2024',
      openingBalance: '£10,250.00',
      closingBalance: '£11,480.50',
    },
    documentTypeId: 'bank_statement_monthly',
    assignedToSlots: ['financial_evidence'],
    pipelineStatus: 'ready',
    standardizedPdfUrl: '/standardized/hsbc_statement_jul_2024_std.pdf',
  },

  // Bank Statement - August 2024 - 完全就绪
  {
    id: 'doc-fin-002',
    caseId: 'case-001',
    name: 'Bank Statement - August 2024',
    category: 'financial',
    status: 'approved',
    fileName: 'hsbc_statement_aug_2024.pdf',
    fileSize: 1534567,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-15T09:05:00Z',
    uploadedBy: 'Bob Brown',
    qualityCheck: {
      passed: true,
      issues: [],
    },
    extractedData: {
      accountHolder: 'Bob Brown',
      bankName: 'HSBC',
      statementPeriod: 'August 2024',
      openingBalance: '£11,480.50',
      closingBalance: '£12,150.25',
    },
    documentTypeId: 'bank_statement_monthly',
    assignedToSlots: ['financial_evidence'],
    pipelineStatus: 'ready',
    standardizedPdfUrl: '/standardized/hsbc_statement_aug_2024_std.pdf',
  },

  // Bank Statement - September 2024 - 完全就绪
  {
    id: 'doc-fin-003',
    caseId: 'case-001',
    name: 'Bank Statement - September 2024',
    category: 'financial',
    status: 'approved',
    fileName: 'hsbc_statement_sep_2024.pdf',
    fileSize: 1545678,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-15T09:10:00Z',
    uploadedBy: 'Bob Brown',
    qualityCheck: {
      passed: true,
      issues: [],
    },
    extractedData: {
      accountHolder: 'Bob Brown',
      bankName: 'HSBC',
      statementPeriod: 'September 2024',
      openingBalance: '£12,150.25',
      closingBalance: '£13,420.00',
    },
    documentTypeId: 'bank_statement_monthly',
    assignedToSlots: ['financial_evidence'],
    pipelineStatus: 'ready',
    standardizedPdfUrl: '/standardized/hsbc_statement_sep_2024_std.pdf',
  },

  // Bank Statement - October 2024 - 发现数据冲突（日期格式）
  {
    id: 'doc-fin-004',
    caseId: 'case-001',
    name: 'Bank Statement - October 2024',
    category: 'financial',
    status: 'approved',
    fileName: 'hsbc_statement_oct_2024.pdf',
    fileSize: 1623456,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-15T09:15:00Z',
    uploadedBy: 'Bob Brown',
    qualityCheck: {
      passed: true,
      issues: [],
    },
    extractedData: {
      accountHolder: 'Bob Brown',
      bankName: 'HSBC',
      statementPeriod: 'October 2024',
      dateOfBirth: '1988-15-03', // 日期格式冲突 - DD/MM vs MM/DD
      openingBalance: '£13,420.00',
      closingBalance: '£14,230.50',
    },
    documentTypeId: 'bank_statement_monthly',
    assignedToSlots: ['financial_evidence'],
    pipelineStatus: 'conflict',
  },

  // Bank Statement - November 2024 - 完全就绪
  {
    id: 'doc-fin-005',
    caseId: 'case-001',
    name: 'Bank Statement - November 2024',
    category: 'financial',
    status: 'approved',
    fileName: 'hsbc_statement_nov_2024.pdf',
    fileSize: 1589012,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-15T09:20:00Z',
    uploadedBy: 'Bob Brown',
    qualityCheck: {
      passed: true,
      issues: [],
    },
    extractedData: {
      accountHolder: 'Bob Brown',
      bankName: 'HSBC',
      statementPeriod: 'November 2024',
      openingBalance: '£14,230.50',
      closingBalance: '£15,678.25',
    },
    documentTypeId: 'bank_statement_monthly',
    assignedToSlots: ['financial_evidence'],
    pipelineStatus: 'ready',
    standardizedPdfUrl: '/standardized/hsbc_statement_nov_2024_std.pdf',
  },

  // Bank Statement - December 2024 - 正在处理中
  {
    id: 'doc-fin-006',
    caseId: 'case-001',
    name: 'Bank Statement - December 2024',
    category: 'financial',
    status: 'processing',
    fileName: 'hsbc_statement_dec_2024.pdf',
    fileSize: 1567234,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-18T09:00:00Z',
    uploadedBy: 'Bob Brown',
    documentTypeId: 'bank_statement_monthly',
    assignedToSlots: ['financial_evidence'],
    pipelineStatus: 'processing',
  },

  // ============================================
  // EMPLOYMENT & INCOME
  // ============================================

  // Employment Letter - 质量问题（过期）
  {
    id: 'doc-004',
    caseId: 'case-001',
    name: 'Employment Letter',
    category: 'employment',
    status: 'rejected',
    fileName: 'employment_letter_aug2024.pdf',
    fileSize: 456789,
    fileType: 'application/pdf',
    uploadedAt: '2024-09-01T10:00:00Z',
    uploadedBy: 'Bob Brown',
    qualityCheck: {
      passed: false,
      issues: [
        'Document dated more than 90 days ago (dated August 2024)',
        'Employment verification letter must be recent',
      ],
    },
    notes: 'Please request a new employment letter from your employer dated within 90 days',
    documentTypeId: 'employment_letter',
    assignedToSlots: ['employment_proof'],
    pipelineStatus: 'quality_issue',
  },

  // Recent Payslip - October 2024 - 完全就绪
  {
    id: 'doc-emp-001',
    caseId: 'case-001',
    name: 'Payslip - October 2024',
    category: 'employment',
    status: 'approved',
    fileName: 'payslip_oct_2024.pdf',
    fileSize: 234567,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-15T11:00:00Z',
    uploadedBy: 'Bob Brown',
    qualityCheck: {
      passed: true,
      issues: [],
    },
    extractedData: {
      employerName: 'Tech Corp Ltd',
      employeeName: 'Bob Brown',
      payPeriod: 'October 2024',
      grossPay: '£5,416.67',
      netPay: '£3,850.00',
      taxDeducted: '£1,083.33',
    },
    documentTypeId: 'payslips',
    assignedToSlots: ['employment_proof'],
    pipelineStatus: 'ready',
    standardizedPdfUrl: '/standardized/payslip_oct_2024_std.pdf',
  },

  // Recent Payslip - November 2024 - 完全就绪
  {
    id: 'doc-emp-002',
    caseId: 'case-001',
    name: 'Payslip - November 2024',
    category: 'employment',
    status: 'approved',
    fileName: 'payslip_nov_2024.pdf',
    fileSize: 234890,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-15T11:05:00Z',
    uploadedBy: 'Bob Brown',
    qualityCheck: {
      passed: true,
      issues: [],
    },
    extractedData: {
      employerName: 'Tech Corp Ltd',
      employeeName: 'Bob Brown',
      payPeriod: 'November 2024',
      grossPay: '£5,416.67',
      netPay: '£3,850.00',
      taxDeducted: '£1,083.33',
    },
    documentTypeId: 'payslips',
    assignedToSlots: ['employment_proof'],
    pipelineStatus: 'ready',
    standardizedPdfUrl: '/standardized/payslip_nov_2024_std.pdf',
  },

  // ============================================
  // ENGLISH LANGUAGE
  // ============================================

  // IELTS Certificate - 质量问题（信息不完整）
  {
    id: 'doc-006',
    caseId: 'case-001',
    name: 'IELTS Certificate',
    category: 'education',
    status: 'rejected',
    fileName: 'ielts_certificate.pdf',
    fileSize: 567890,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-16T14:00:00Z',
    uploadedBy: 'Bob Brown',
    qualityCheck: {
      passed: false,
      issues: [
        'Test Reference Number (TRF) not visible',
        'Overall band score section is cut off',
      ],
    },
    documentTypeId: 'ielts',
    assignedToSlots: ['english_proof'],
    pipelineStatus: 'quality_issue',
  },

  // ============================================
  // KNOWLEDGE OF LIFE IN UK
  // ============================================

  // Life in the UK Test Certificate - 质量检查阶段
  {
    id: 'doc-005',
    caseId: 'case-001',
    name: 'Life in the UK Test Certificate',
    category: 'other',
    status: 'uploaded',
    fileName: 'life_in_uk_cert.pdf',
    fileSize: 234567,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-17T11:00:00Z',
    uploadedBy: 'Bob Brown',
    extractedData: {
      candidateName: 'Bob Brown',
      testDate: '2024-10-20',
      result: 'PASS',
      certificateNumber: 'LITUK-2024-123456',
    },
    documentTypeId: 'life_in_uk',
    assignedToSlots: ['life_in_uk_test'],
    pipelineStatus: 'quality_check',
  },

  // ============================================
  // IMMIGRATION HISTORY
  // ============================================

  // Previous BRP - 合规检查阶段
  {
    id: 'doc-007',
    caseId: 'case-001',
    name: 'Biometric Residence Permit (Current)',
    category: 'identity',
    status: 'approved',
    fileName: 'current_brp_scan.pdf',
    fileSize: 345678,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-14T15:00:00Z',
    uploadedBy: 'Bob Brown',
    qualityCheck: {
      passed: true,
      issues: [],
    },
    extractedData: {
      brpNumber: 'ZQJ123456',
      expiryDate: '2025-06-30',
      visaType: 'Tier 2 (General)',
      issueDate: '2022-07-01',
    },
    documentTypeId: 'brp',
    assignedToSlots: ['previous_visas'],
    pipelineStatus: 'compliance_check',
  },

  // Previous BRP (Older) - 完全就绪
  {
    id: 'doc-007b',
    caseId: 'case-001',
    name: 'Biometric Residence Permit (2019-2022)',
    category: 'identity',
    status: 'approved',
    fileName: 'old_brp_scan.pdf',
    fileSize: 312456,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-14T15:10:00Z',
    uploadedBy: 'Bob Brown',
    qualityCheck: {
      passed: true,
      issues: [],
    },
    extractedData: {
      brpNumber: 'ZQJ098765',
      expiryDate: '2022-06-30',
      visaType: 'Tier 2 (General)',
      issueDate: '2019-07-01',
    },
    documentTypeId: 'brp',
    assignedToSlots: ['previous_visas'],
    pipelineStatus: 'ready',
    standardizedPdfUrl: '/standardized/old_brp_std.pdf',
  },

  // ============================================
  // CHARACTER & CONDUCT
  // ============================================

  // Character Reference 1 - 完全就绪
  {
    id: 'doc-char-001',
    caseId: 'case-001',
    name: 'Character Reference - Dr. James Smith',
    category: 'other',
    status: 'approved',
    fileName: 'character_ref_smith.pdf',
    fileSize: 189234,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-16T10:00:00Z',
    uploadedBy: 'Bob Brown',
    qualityCheck: {
      passed: true,
      issues: [],
    },
    extractedData: {
      refereeName: 'Dr. James Smith',
      occupation: 'General Practitioner',
      relationship: 'Family Doctor',
      yearsKnown: '5 years',
    },
    documentTypeId: 'character_reference',
    assignedToSlots: ['character_references'],
    pipelineStatus: 'ready',
    standardizedPdfUrl: '/standardized/char_ref_smith_std.pdf',
  },

  // Character Reference 2 - 质量检查中
  {
    id: 'doc-char-002',
    caseId: 'case-001',
    name: 'Character Reference - Ms. Sarah Johnson',
    category: 'other',
    status: 'uploaded',
    fileName: 'character_ref_johnson.pdf',
    fileSize: 178901,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-17T14:00:00Z',
    uploadedBy: 'Bob Brown',
    extractedData: {
      refereeName: 'Ms. Sarah Johnson',
      occupation: 'Solicitor',
      relationship: 'Neighbour',
      yearsKnown: '4 years',
    },
    documentTypeId: 'character_reference',
    assignedToSlots: ['character_references'],
    pipelineStatus: 'quality_check',
  },

  // ============================================
  // RELATIONSHIP EVIDENCE
  // ============================================

  // Marriage Certificate - 完全就绪
  {
    id: 'doc-008',
    caseId: 'case-001',
    name: 'Marriage Certificate',
    category: 'relationship',
    status: 'approved',
    fileName: 'marriage_cert.pdf',
    fileSize: 567890,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-13T09:00:00Z',
    uploadedBy: 'applicant-001',
    qualityCheck: {
      passed: true,
      issues: [],
    },
    extractedData: {
      marriageDate: '2018-06-15',
      spouseName: 'Sarah Brown',
      registrationNumber: 'MC-2018-123456',
    },
    documentTypeId: 'marriage_cert',
    assignedToSlots: ['marriage_certificate'],
    pipelineStatus: 'ready',
    standardizedPdfUrl: '/standardized/marriage_cert_std.pdf',
  },

  // Child Birth Certificate 1 - 完全就绪
  {
    id: 'doc-child-001',
    caseId: 'case-001',
    name: 'Birth Certificate - Emily Brown',
    category: 'relationship',
    status: 'approved',
    fileName: 'birth_cert_emily.pdf',
    fileSize: 456789,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-14T10:00:00Z',
    uploadedBy: 'Bob Brown',
    qualityCheck: {
      passed: true,
      issues: [],
    },
    extractedData: {
      childName: 'Emily Brown',
      dateOfBirth: '2020-05-20',
      fatherName: 'Bob Brown',
      motherName: 'Sarah Brown',
      placeOfBirth: 'London, UK',
    },
    documentTypeId: 'birth_certificate',
    assignedToSlots: ['child_documents'],
    pipelineStatus: 'ready',
    standardizedPdfUrl: '/standardized/birth_cert_emily_std.pdf',
  },

  // Child Birth Certificate 2 - 完全就绪
  {
    id: 'doc-child-002',
    caseId: 'case-001',
    name: 'Birth Certificate - Oliver Brown',
    category: 'relationship',
    status: 'approved',
    fileName: 'birth_cert_oliver.pdf',
    fileSize: 467890,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-14T10:05:00Z',
    uploadedBy: 'Bob Brown',
    qualityCheck: {
      passed: true,
      issues: [],
    },
    extractedData: {
      childName: 'Oliver Brown',
      dateOfBirth: '2022-08-15',
      fatherName: 'Bob Brown',
      motherName: 'Sarah Brown',
      placeOfBirth: 'London, UK',
    },
    documentTypeId: 'birth_certificate',
    assignedToSlots: ['child_documents'],
    pipelineStatus: 'ready',
    standardizedPdfUrl: '/standardized/birth_cert_oliver_std.pdf',
  },

  // ============================================
  // Case 002 - Skilled Worker (Emma Wilson)
  // 已完成的案例，所有文档都已就绪
  // ============================================
  {
    id: 'doc-010',
    caseId: 'case-002',
    name: 'Current Passport',
    category: 'identity',
    status: 'approved',
    fileName: 'passport_emma_wilson.pdf',
    fileSize: 2156789,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-05T10:00:00Z',
    uploadedBy: 'applicant-002',
    qualityCheck: { passed: true, issues: [] },
    extractedData: {
      givenNames: 'Emma',
      surname: 'Wilson',
      nationality: 'American',
    },
    documentTypeId: 'passport',
    assignedToSlots: ['identity'],
    pipelineStatus: 'ready',
  },
  {
    id: 'doc-011',
    caseId: 'case-002',
    name: 'Certificate of Sponsorship',
    category: 'employment',
    status: 'approved',
    fileName: 'cos_document.pdf',
    fileSize: 345678,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-06T11:00:00Z',
    uploadedBy: 'user-001',
    qualityCheck: { passed: true, issues: [] },
    extractedData: {
      cosNumber: 'ABCD1234567890',
      employerName: 'Tech Corp Ltd',
      startDate: '2025-01-15',
    },
    documentTypeId: 'cos_certificate',
    assignedToSlots: ['cos'],
    pipelineStatus: 'ready',
  },
  {
    id: 'doc-012',
    caseId: 'case-002',
    name: 'Employment Contract',
    category: 'employment',
    status: 'approved',
    fileName: 'employment_contract.pdf',
    fileSize: 789012,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-07T14:00:00Z',
    uploadedBy: 'applicant-002',
    qualityCheck: { passed: true, issues: [] },
    extractedData: {
      employerName: 'Tech Corp Ltd',
      startDate: '2020-03-01',
      salary: '65000',
      jobTitle: 'Senior Software Engineer',
    },
    pipelineStatus: 'ready',
  },
  {
    id: 'doc-013',
    caseId: 'case-002',
    name: 'Reference Letter',
    category: 'employment',
    status: 'approved',
    fileName: 'reference_letter.pdf',
    fileSize: 234567,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-08T09:00:00Z',
    uploadedBy: 'applicant-002',
    qualityCheck: { passed: true, issues: [] },
    extractedData: {
      employerName: 'Tech Corp Ltd',
      startDate: '2020-04-15',
      givenNames: 'Ema',  // 故意的名字拼写差异，用于逻辑冲突演示
    },
    pipelineStatus: 'conflict', // 有冲突
  },
  {
    id: 'doc-014',
    caseId: 'case-002',
    name: 'English Language Certificate',
    category: 'education',
    status: 'approved',
    fileName: 'ielts_emma.pdf',
    fileSize: 345678,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-09T10:00:00Z',
    uploadedBy: 'applicant-002',
    qualityCheck: { passed: true, issues: [] },
    extractedData: {
      testType: 'IELTS Academic',
      overallScore: '7.5',
      testDate: '2024-06-15',
    },
    documentTypeId: 'ielts_certificate',
    assignedToSlots: ['english_proof'],
    pipelineStatus: 'ready',
  },
  {
    id: 'doc-015',
    caseId: 'case-002',
    name: 'Bank Statement',
    category: 'financial',
    status: 'approved',
    fileName: 'barclays_statement_nov.pdf',
    fileSize: 1234567,
    fileType: 'application/pdf',
    uploadedAt: '2024-12-09T11:00:00Z',
    uploadedBy: 'applicant-002',
    qualityCheck: { passed: true, issues: [] },
    extractedData: {
      accountHolder: 'Emma Wilson',
      balance: '15000',
      currency: 'GBP',
    },
    documentTypeId: 'bank_statement',
    assignedToSlots: ['financial_requirement'],
    pipelineStatus: 'ready',
  },
];

export function getDocumentsByCaseId(caseId: string): Document[] {
  return MOCK_DOCUMENTS.filter(doc => doc.caseId === caseId);
}

export function getDocumentById(id: string): Document | undefined {
  return MOCK_DOCUMENTS.find(doc => doc.id === id);
}

export function getDocumentsBySlotId(caseId: string, slotId: string): Document[] {
  return MOCK_DOCUMENTS.filter(
    doc => doc.caseId === caseId && doc.assignedToSlots?.includes(slotId)
  );
}
