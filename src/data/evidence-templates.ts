import type { VisaType, EvidenceSlotTemplate, VisaEvidenceTemplate, EvidenceCategoryId, EvidenceCategoryConfig } from '@/types';

// ============================================
// Evidence Category Configurations
// 对应 Home Office 的证据分类方式
// ============================================

export const EVIDENCE_CATEGORIES: Record<EvidenceCategoryId, EvidenceCategoryConfig> = {
  identity_personal: {
    id: 'identity_personal',
    name: 'Identity & Personal Status',
    description: 'Passport, BRP, birth certificates, and personal identification',
    icon: 'user',
    order: 1,
  },
  financial: {
    id: 'financial',
    name: 'Financial Requirement',
    description: 'Bank statements, savings, and proof of income',
    icon: 'banknote',
    order: 2,
  },
  employment: {
    id: 'employment',
    name: 'Employment & Income',
    description: 'Employment letters, payslips, contracts, and tax returns',
    icon: 'briefcase',
    order: 3,
  },
  english_language: {
    id: 'english_language',
    name: 'English Language',
    description: 'IELTS, degree certificates, or other English proficiency evidence',
    icon: 'graduation-cap',
    order: 4,
  },
  knowledge_life_uk: {
    id: 'knowledge_life_uk',
    name: 'Knowledge of Life in UK',
    description: 'Life in the UK test certificate',
    icon: 'book-open',
    order: 5,
  },
  residence: {
    id: 'residence',
    name: 'UK Residence',
    description: 'Proof of address, tenancy agreements, council tax',
    icon: 'home',
    order: 6,
  },
  immigration_history: {
    id: 'immigration_history',
    name: 'Immigration History',
    description: 'Previous visas, BRPs, travel history',
    icon: 'globe',
    order: 7,
  },
  character_conduct: {
    id: 'character_conduct',
    name: 'Character & Conduct',
    description: 'Criminal record checks, good character references',
    icon: 'shield-check',
    order: 8,
  },
  relationship: {
    id: 'relationship',
    name: 'Relationship Evidence',
    description: 'Marriage certificates, photos, communication evidence',
    icon: 'heart',
    order: 9,
  },
  sponsor: {
    id: 'sponsor',
    name: 'Sponsor Eligibility',
    description: 'Certificate of Sponsorship, sponsor documents',
    icon: 'building',
    order: 10,
  },
  translations: {
    id: 'translations',
    name: 'Translations',
    description: 'Certified translations of foreign documents',
    icon: 'languages',
    order: 11,
  },
  other: {
    id: 'other',
    name: 'Other Supporting Evidence',
    description: 'Additional documents to support your application',
    icon: 'folder',
    order: 99,
  },
};

/**
 * Get categories for a visa type in display order
 */
export function getCategoriesForVisaType(visaType: VisaType): EvidenceCategoryConfig[] {
  const templates = EVIDENCE_TEMPLATES[visaType] || [];
  const categoryIds = new Set(templates.map(t => t.categoryId));

  return Array.from(categoryIds)
    .map(id => EVIDENCE_CATEGORIES[id])
    .filter(Boolean)
    .sort((a, b) => a.order - b.order);
}

/**
 * Group slots by category
 */
export function groupSlotsByCategory(slots: EvidenceSlotTemplate[]): Map<EvidenceCategoryId, EvidenceSlotTemplate[]> {
  const grouped = new Map<EvidenceCategoryId, EvidenceSlotTemplate[]>();

  slots.forEach(slot => {
    const categoryId = slot.categoryId;
    if (!grouped.has(categoryId)) {
      grouped.set(categoryId, []);
    }
    grouped.get(categoryId)!.push(slot);
  });

  return grouped;
}

// ============================================
// Naturalisation 签证的证据槽模板
// 按 Home Office 分类组织
// ============================================

const NATURALISATION_SLOTS: EvidenceSlotTemplate[] = [
  // ============================================
  // Identity & Personal Status
  // ============================================
  {
    id: 'identity',
    name: 'Identity Documents',
    categoryId: 'identity_personal',
    category: 'identity',
    description: 'Valid passport and photo identification',
    priority: 'required',
    minCount: 1,
    maxCount: 2,
    acceptableTypes: [
      {
        typeId: 'passport',
        label: 'Current Passport',
        description: 'Valid passport with at least 6 months validity',
        requirements: [
          'Clear scan of bio page',
          'All visa pages with stamps',
          'File size under 5MB',
        ],
        isPreferred: true,
      },
      {
        typeId: 'national_id',
        label: 'National ID Card',
        description: 'Government-issued national identity card',
        requirements: [
          'Front and back scan',
          'Must be valid (not expired)',
        ],
      },
    ],
  },
  {
    id: 'birth_certificate',
    name: 'Birth Certificate',
    categoryId: 'identity_personal',
    category: 'identity',
    description: 'Your official birth certificate',
    priority: 'required',
    minCount: 1,
    maxCount: 1,
    acceptableTypes: [
      {
        typeId: 'birth_cert_original',
        label: 'Birth Certificate',
        description: 'Full birth certificate showing parents\' details',
        requirements: [
          'Original or certified copy',
          'Shows full name and date of birth',
          'Shows parents\' names',
          'Translated if not in English',
        ],
        isPreferred: true,
      },
    ],
  },

  // ============================================
  // UK Residence / Accommodation
  // ============================================
  {
    id: 'address_proof',
    name: 'Proof of Address',
    categoryId: 'residence',
    category: 'financial',
    description: 'Document confirming your current UK address',
    priority: 'required',
    minCount: 1,
    maxCount: 3,
    acceptableTypes: [
      {
        typeId: 'bank_statement',
        label: 'Bank Statement',
        description: 'Official bank statement showing your address',
        requirements: [
          'Dated within last 3 months',
          'Shows full name and address',
          'Official letterhead or e-statement',
        ],
        isPreferred: true,
      },
      {
        typeId: 'utility_bill',
        label: 'Utility Bill',
        description: 'Gas, electricity, or water bill',
        requirements: [
          'Dated within last 3 months',
          'Shows full name and address',
          'Not a mobile phone bill',
        ],
      },
      {
        typeId: 'council_tax',
        label: 'Council Tax Bill',
        description: 'Current year council tax statement',
        requirements: [
          'Current financial year',
          'Shows property address',
        ],
      },
      {
        typeId: 'tenancy_agreement',
        label: 'Tenancy Agreement',
        description: 'Current signed tenancy agreement',
        requirements: [
          'Signed by landlord and tenant',
          'Shows current address',
          'Within validity period',
        ],
      },
    ],
  },

  // ============================================
  // Financial Requirement
  // ============================================
  {
    id: 'financial_evidence',
    name: 'Bank Statements (6 months)',
    categoryId: 'financial',
    category: 'financial',
    description: '6 consecutive months of bank statements showing financial stability',
    priority: 'required',
    minCount: 6,
    maxCount: 12,
    acceptableTypes: [
      {
        typeId: 'bank_statement_monthly',
        label: 'Monthly Bank Statement',
        description: 'One statement per month for the last 6 months',
        requirements: [
          'Consecutive months required',
          'Shows regular income/transactions',
          'Account holder name matches passport',
        ],
        isPreferred: true,
      },
      {
        typeId: 'savings_statement',
        label: 'Savings Account Statement',
        description: 'Statement from savings account',
        requirements: [
          'Shows minimum balance requirement',
          'Official bank document',
        ],
      },
    ],
  },
  {
    id: 'overseas_assets',
    name: 'Overseas Asset Documentation',
    categoryId: 'financial',
    category: 'financial',
    description: 'Evidence of overseas property or investments',
    priority: 'conditional',
    minCount: 1,
    maxCount: 5,
    formCondition: {
      questionId: 'has_overseas_assets',
      operator: 'equals',
      value: true,
    },
    acceptableTypes: [
      {
        typeId: 'property_deed',
        label: 'Property Deed/Title',
        description: 'Ownership documents for overseas property',
        requirements: [
          'Shows property ownership',
          'Translated if not in English',
          'Recent valuation if available',
        ],
      },
      {
        typeId: 'investment_statement',
        label: 'Investment Statement',
        description: 'Statements for overseas investments',
        requirements: [
          'From financial institution',
          'Shows current value',
          'Within last 3 months',
        ],
      },
    ],
  },

  // ============================================
  // Employment & Income
  // ============================================
  {
    id: 'employment_proof',
    name: 'Employment Evidence',
    categoryId: 'employment',
    category: 'employment',
    description: 'Evidence of current employment status',
    priority: 'required',
    minCount: 1,
    maxCount: 3,
    acceptableTypes: [
      {
        typeId: 'employment_letter',
        label: 'Employment Letter',
        description: 'Letter from employer confirming employment',
        requirements: [
          'On company letterhead',
          'Signed by HR or manager',
          'States job title and salary',
          'Dated within last 3 months',
        ],
        isPreferred: true,
      },
      {
        typeId: 'payslips',
        label: 'Recent Payslips',
        description: 'Last 3 months of payslips',
        requirements: [
          'Shows employer name',
          'Shows gross and net salary',
          'Consecutive months',
        ],
      },
      {
        typeId: 'contract',
        label: 'Employment Contract',
        description: 'Current employment contract',
        requirements: [
          'Signed by both parties',
          'Shows terms of employment',
        ],
      },
    ],
  },
  {
    id: 'employer_reference',
    name: 'Employer Reference Letter',
    categoryId: 'employment',
    category: 'employment',
    description: 'Reference letter from current employer',
    priority: 'conditional',
    minCount: 1,
    maxCount: 1,
    dependsOn: {
      slotId: 'employment_proof',
      condition: 'satisfied',
    },
    acceptableTypes: [
      {
        typeId: 'reference_letter',
        label: 'Reference Letter',
        description: 'Character reference from employer',
        requirements: [
          'On company letterhead',
          'Signed by senior manager',
          'Describes job performance',
        ],
      },
    ],
  },
  {
    id: 'business_documents',
    name: 'Self-Employment Evidence',
    categoryId: 'employment',
    category: 'employment',
    description: 'Business ownership and registration documents',
    priority: 'conditional',
    minCount: 1,
    maxCount: 5,
    formCondition: {
      questionId: 'is_self_employed',
      operator: 'equals',
      value: true,
    },
    acceptableTypes: [
      {
        typeId: 'company_registration',
        label: 'Company Registration Certificate',
        description: 'Companies House registration or equivalent',
        requirements: [
          'Shows company name and number',
          'Currently active status',
        ],
        isPreferred: true,
      },
      {
        typeId: 'self_assessment',
        label: 'Self Assessment Tax Return',
        description: 'HMRC self-assessment tax returns',
        requirements: [
          'Last 2-3 years',
          'Shows income declared',
        ],
      },
      {
        typeId: 'accountant_letter',
        label: 'Accountant\'s Letter',
        description: 'Letter from registered accountant',
        requirements: [
          'On accountant\'s letterhead',
          'Confirms business income',
          'Signed and dated',
        ],
      },
    ],
  },

  // ============================================
  // English Language
  // ============================================
  {
    id: 'english_proof',
    name: 'English Language Proof',
    categoryId: 'english_language',
    category: 'education',
    description: 'Evidence of English language proficiency',
    priority: 'required',
    minCount: 1,
    maxCount: 1,
    acceptableTypes: [
      {
        typeId: 'ielts',
        label: 'IELTS Certificate',
        description: 'IELTS test result with required scores',
        requirements: [
          'Overall score 6.0 or above',
          'Within last 2 years',
          'TRF number visible',
        ],
        isPreferred: true,
      },
      {
        typeId: 'degree_uk',
        label: 'UK Degree Certificate',
        description: 'Degree from a UK university (taught in English)',
        requirements: [
          'Bachelor\'s degree or higher',
          'From recognized UK institution',
        ],
      },
    ],
  },

  // ============================================
  // Knowledge of Life in UK
  // ============================================
  {
    id: 'life_in_uk_test',
    name: 'Life in the UK Test',
    categoryId: 'knowledge_life_uk',
    category: 'education',
    description: 'Life in the UK test pass certificate',
    priority: 'required',
    minCount: 1,
    maxCount: 1,
    acceptableTypes: [
      {
        typeId: 'life_in_uk',
        label: 'Life in the UK Test Pass',
        description: 'Life in the UK test pass notification',
        requirements: [
          'Pass certificate or letter',
          'Test reference number visible',
        ],
        isPreferred: true,
      },
    ],
  },

  // ============================================
  // Immigration History
  // ============================================
  {
    id: 'travel_history',
    name: 'Travel History',
    categoryId: 'immigration_history',
    category: 'identity',
    description: 'Evidence of travel during residency period',
    priority: 'optional',
    minCount: 0,
    maxCount: 10,
    acceptableTypes: [
      {
        typeId: 'old_passport',
        label: 'Previous Passports',
        description: 'Old passports showing travel stamps',
        requirements: [
          'All pages with entry/exit stamps',
          'Clear scans',
        ],
      },
      {
        typeId: 'travel_tickets',
        label: 'Flight Tickets/Boarding Passes',
        description: 'Evidence of international travel',
        requirements: [
          'Shows dates and destinations',
          'Name matches passport',
        ],
      },
    ],
  },
  {
    id: 'previous_visas',
    name: 'Previous Visas & BRPs',
    categoryId: 'immigration_history',
    category: 'identity',
    description: 'All previous UK visas and biometric residence permits',
    priority: 'required',
    minCount: 1,
    maxCount: 10,
    acceptableTypes: [
      {
        typeId: 'brp',
        label: 'Biometric Residence Permit',
        description: 'Current or previous BRP cards',
        requirements: [
          'Front and back scan',
          'All BRPs held during UK residence',
        ],
        isPreferred: true,
      },
      {
        typeId: 'visa_vignette',
        label: 'Visa Vignette',
        description: 'Entry clearance visa stamps in passport',
        requirements: [
          'Clear scan of visa page',
          'All previous UK visas',
        ],
      },
    ],
  },

  // ============================================
  // Character & Conduct (Suitability)
  // ============================================
  {
    id: 'character_references',
    name: 'Character References',
    categoryId: 'character_conduct',
    category: 'other',
    description: 'References from people who know you well',
    priority: 'required',
    minCount: 2,
    maxCount: 4,
    acceptableTypes: [
      {
        typeId: 'character_reference',
        label: 'Character Reference Letter',
        description: 'Letter from someone who has known you for 3+ years',
        requirements: [
          'From UK resident',
          'Signed and dated',
          'States how long they\'ve known you',
          'Professional person preferred',
        ],
        isPreferred: true,
      },
    ],
  },
  {
    id: 'criminal_record',
    name: 'Criminal Record Check',
    categoryId: 'character_conduct',
    category: 'other',
    description: 'Police certificate or criminal record check',
    priority: 'conditional',
    minCount: 1,
    maxCount: 3,
    formCondition: {
      questionId: 'lived_abroad_12_months',
      operator: 'equals',
      value: true,
    },
    acceptableTypes: [
      {
        typeId: 'police_certificate',
        label: 'Police Certificate',
        description: 'Criminal record certificate from countries lived in',
        requirements: [
          'From each country lived in 12+ months',
          'Within last 6 months',
          'Translated if not in English',
        ],
        isPreferred: true,
      },
    ],
  },

  // ============================================
  // Relationship Evidence (for dependants)
  // ============================================
  {
    id: 'child_documents',
    name: 'Child Birth Certificates',
    categoryId: 'relationship',
    category: 'relationship',
    description: 'Birth certificates for all dependent children',
    priority: 'conditional',
    minCount: 1,
    maxCount: 10,
    formCondition: {
      questionId: 'has_children',
      operator: 'equals',
      value: true,
    },
    acceptableTypes: [
      {
        typeId: 'birth_certificate',
        label: 'Birth Certificate',
        description: 'Official birth certificate for each child',
        requirements: [
          'Original or certified copy',
          'Shows both parents\' names',
          'Translated if not in English',
        ],
        isPreferred: true,
      },
      {
        typeId: 'adoption_certificate',
        label: 'Adoption Certificate',
        description: 'Legal adoption papers if applicable',
        requirements: [
          'Court-issued adoption order',
          'Translated if not in English',
        ],
      },
    ],
  },
  {
    id: 'marriage_certificate',
    name: 'Marriage Certificate',
    categoryId: 'relationship',
    category: 'relationship',
    description: 'Official marriage certificate if applicable',
    priority: 'conditional',
    minCount: 1,
    maxCount: 1,
    formCondition: {
      questionId: 'marital_status',
      operator: 'equals',
      value: 'married',
    },
    acceptableTypes: [
      {
        typeId: 'marriage_cert',
        label: 'Marriage Certificate',
        description: 'Official marriage certificate',
        requirements: [
          'Original or certified copy',
          'Translated if not in English',
        ],
        isPreferred: true,
      },
    ],
  },
];

/**
 * Skilled Worker 签证的证据槽模板
 */
const SKILLED_WORKER_SLOTS: EvidenceSlotTemplate[] = [
  // ============================================
  // Identity & Personal Status
  // ============================================
  {
    id: 'identity',
    name: 'Identity Documents',
    categoryId: 'identity_personal',
    category: 'identity',
    description: 'Valid passport for travel',
    priority: 'required',
    minCount: 1,
    maxCount: 1,
    acceptableTypes: [
      {
        typeId: 'passport',
        label: 'Current Passport',
        description: 'Valid passport with at least 6 months validity',
        requirements: [
          'Clear scan of bio page',
          'At least 6 months validity',
          'Empty pages for visa stamp',
        ],
        isPreferred: true,
      },
    ],
  },

  // ============================================
  // Sponsor Eligibility
  // ============================================
  {
    id: 'cos',
    name: 'Certificate of Sponsorship',
    categoryId: 'sponsor',
    category: 'employment',
    description: 'CoS from licensed UK employer',
    priority: 'required',
    minCount: 1,
    maxCount: 1,
    acceptableTypes: [
      {
        typeId: 'cos_reference',
        label: 'CoS Reference Number',
        description: 'Certificate of Sponsorship reference from employer',
        requirements: [
          'Valid CoS reference number',
          'Issued by licensed sponsor',
          'Job details match application',
        ],
        isPreferred: true,
      },
    ],
  },

  // ============================================
  // Employment & Income (Qualifications)
  // ============================================
  {
    id: 'qualifications',
    name: 'Qualifications',
    categoryId: 'employment',
    category: 'education',
    description: 'Evidence of required qualifications for the role',
    priority: 'conditional',
    minCount: 1,
    maxCount: 5,
    acceptableTypes: [
      {
        typeId: 'degree',
        label: 'Degree Certificate',
        description: 'University degree certificate',
        requirements: [
          'Original or certified copy',
          'Translated if not in English',
        ],
        isPreferred: true,
      },
      {
        typeId: 'transcript',
        label: 'Academic Transcript',
        description: 'Official academic transcript',
        requirements: [
          'From issuing institution',
          'Shows all grades/credits',
        ],
      },
      {
        typeId: 'professional_cert',
        label: 'Professional Certification',
        description: 'Industry or professional certifications',
        requirements: [
          'From recognized body',
          'Currently valid',
        ],
        conditionalNote: 'If required for your profession',
      },
    ],
  },

  // ============================================
  // English Language
  // ============================================
  {
    id: 'english_proof',
    name: 'English Language Proof',
    categoryId: 'english_language',
    category: 'education',
    description: 'Evidence of English language ability',
    priority: 'required',
    minCount: 1,
    maxCount: 1,
    acceptableTypes: [
      {
        typeId: 'ielts_selt',
        label: 'IELTS for UKVI',
        description: 'IELTS SELT test result',
        requirements: [
          'Minimum B1 level',
          'Within last 2 years',
          'SELT approved center',
        ],
        isPreferred: true,
      },
      {
        typeId: 'degree_english',
        label: 'Degree Taught in English',
        description: 'Degree from English-speaking country',
        requirements: [
          'From majority English-speaking country',
          'Or NARIC confirmation',
        ],
      },
    ],
  },

  // ============================================
  // Financial Requirement
  // ============================================
  {
    id: 'financial_proof',
    name: 'Financial Requirement',
    categoryId: 'financial',
    category: 'financial',
    description: 'Evidence of required maintenance funds',
    priority: 'required',
    minCount: 1,
    maxCount: 3,
    acceptableTypes: [
      {
        typeId: 'bank_statement_28days',
        label: 'Bank Statement (28 days)',
        description: 'Bank statements showing required funds for 28 consecutive days',
        requirements: [
          'Minimum £1,270 held for 28 days',
          'Dated within 31 days of application',
          'Shows account holder name',
        ],
        isPreferred: true,
      },
      {
        typeId: 'sponsor_letter',
        label: 'Sponsor Certification',
        description: 'Letter from sponsor certifying maintenance',
        requirements: [
          'A-rated sponsor only',
          'States maintenance covered',
        ],
        conditionalNote: 'Only if sponsor is A-rated',
      },
    ],
  },
];

/**
 * 所有签证类型的证据槽配置
 */
export const EVIDENCE_TEMPLATES: Record<VisaType, EvidenceSlotTemplate[]> = {
  naturalisation: NATURALISATION_SLOTS,
  skilled_worker: SKILLED_WORKER_SLOTS,
  visitor: [], // TODO: Add visitor slots
  partner: [],  // TODO: Add partner slots
};

/**
 * 根据签证类型获取证据槽模板
 */
export function getEvidenceTemplateForVisaType(visaType: VisaType): EvidenceSlotTemplate[] {
  return EVIDENCE_TEMPLATES[visaType] || [];
}

/**
 * 生成 Case 的证据槽实例（带运行时状态）
 */
export function generateEvidenceSlotsForCase(
  visaType: VisaType,
  caseId: string
): import('@/types').EvidenceSlot[] {
  const templates = getEvidenceTemplateForVisaType(visaType);

  return templates.map((template) => ({
    ...template,
    id: `${caseId}-${template.id}`,
    minCount: template.minCount ?? 1,
    maxCount: template.maxCount ?? 1,
    // 初始化运行时状态
    status: template.dependsOn ? 'hidden' : 'empty',
    satisfiedByDocIds: [],
    progress: {
      current: 0,
      required: template.minCount ?? 1,
    },
  }));
}

/**
 * 获取所有可接受的文档类型（扁平列表）
 */
export function getAllAcceptableTypes(visaType: VisaType) {
  const templates = getEvidenceTemplateForVisaType(visaType);
  const types: Array<{
    slotId: string;
    slotName: string;
    type: import('@/types').AcceptableDocumentType;
  }> = [];

  templates.forEach((slot) => {
    slot.acceptableTypes.forEach((type) => {
      types.push({
        slotId: slot.id,
        slotName: slot.name,
        type,
      });
    });
  });

  return types;
}

// ============================================
// Mock Form Responses (渐进式披露的表单数据)
// ============================================

import type { CaseFormResponses } from '@/types';

export const MOCK_FORM_RESPONSES: Record<string, CaseFormResponses> = {
  'case-001': {
    caseId: 'case-001',
    responses: {
      has_children: true,           // 有子女 → 显示 child_documents 槽位
      num_children: 2,
      has_overseas_assets: false,   // 无海外资产 → 隐藏 overseas_assets 槽位
      is_self_employed: false,      // 非自雇 → 隐藏 business_documents 槽位
      marital_status: 'married',
      has_criminal_record: false,
    },
    updatedAt: '2024-12-15T10:00:00Z',
  },
  'case-002': {
    caseId: 'case-002',
    responses: {
      has_children: false,
      has_overseas_assets: false,
      is_self_employed: false,
      marital_status: 'single',
    },
    updatedAt: '2024-12-10T14:00:00Z',
  },
};

/**
 * 获取案例的表单回答
 */
export function getFormResponsesForCase(caseId: string): CaseFormResponses | undefined {
  return MOCK_FORM_RESPONSES[caseId];
}

/**
 * 评估表单条件是否满足
 */
export function evaluateFormCondition(
  condition: import('@/types').FormCondition,
  responses: Record<string, string | boolean | number>
): boolean {
  const responseValue = responses[condition.questionId];

  switch (condition.operator) {
    case 'equals':
      return responseValue === condition.value;
    case 'not_equals':
      return responseValue !== condition.value;
    case 'exists':
      return responseValue !== undefined && responseValue !== null && responseValue !== '';
    default:
      return false;
  }
}
