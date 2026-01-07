import type { VisaType, EvidenceSlotTemplate, VisaEvidenceTemplate, EvidenceCategoryId, EvidenceCategoryConfig } from '@/types';

// ============================================
// Checklist Section Type
// 定义 checklist 的标准化结构
// ============================================

export type ChecklistSectionType =
  | 'questionnaire'      // 仅问卷
  | 'documents'          // 仅文档上传
  | 'mixed';             // 问卷 + 文档

export interface ChecklistSection {
  id: string;
  name: string;                    // 宽泛的信息类别名称
  description: string;             // 简短描述
  categoryId: EvidenceCategoryId;  // 所属分类
  sectionType: ChecklistSectionType;
  order: number;
  priority: 'required' | 'conditional' | 'optional';
  // 关联的 Schema 字段 (用于数据绑定)
  schemaFields?: string[];
  // 文档相关配置 (sectionType 为 documents 或 mixed 时)
  documentConfig?: {
    minFiles: number;
    maxFiles: number;
    acceptableTypes: Array<{
      typeId: string;
      label: string;
      description: string;
      requirements?: string[];
      isPreferred?: boolean;
    }>;
  };
  // 条件显示 (与 FormCondition 类型对齐)
  formCondition?: {
    questionId: string;
    operator: 'equals' | 'not_equals' | 'exists';
    value: string | boolean;
  };
}

// ============================================
// Evidence Category Configurations
// 对应 Home Office 的证据分类方式
// ============================================

export const EVIDENCE_CATEGORIES: Record<EvidenceCategoryId, EvidenceCategoryConfig> = {
  identity_personal: {
    id: 'identity_personal',
    name: 'Identity & Personal Status',
    description: 'Personal information and identity verification',
    icon: 'user',
    order: 1,
  },
  financial: {
    id: 'financial',
    name: 'Financial Information',
    description: 'Income, savings, and financial evidence',
    icon: 'banknote',
    order: 2,
  },
  employment: {
    id: 'employment',
    name: 'Employment & Income',
    description: 'Employment history and income verification',
    icon: 'briefcase',
    order: 3,
  },
  english_language: {
    id: 'english_language',
    name: 'English Language',
    description: 'English language proficiency evidence',
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
    name: 'Accommodation',
    description: 'Where you will live in the UK',
    icon: 'home',
    order: 6,
  },
  immigration_history: {
    id: 'immigration_history',
    name: 'Immigration & Travel',
    description: 'Previous visas, travel history, and immigration status',
    icon: 'globe',
    order: 7,
  },
  character_conduct: {
    id: 'character_conduct',
    name: 'Character & Conduct',
    description: 'Criminal history and character assessment',
    icon: 'shield-check',
    order: 8,
  },
  relationship: {
    id: 'relationship',
    name: 'Relationship & Family',
    description: 'Relationship status and family information',
    icon: 'heart',
    order: 9,
  },
  sponsor: {
    id: 'sponsor',
    name: 'Sponsor Information',
    description: 'Details about your UK-based sponsor',
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
    name: 'Additional Information',
    description: 'Other supporting information',
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

// ============================================
// Partner Visa (Outside UK) - 标准化 Checklist
// 基于 PartnerOutsideUK.json Schema 结构
// 每个 item 是宽泛的信息类别，而非具体文档
// ============================================

export const PARTNER_VISA_CHECKLIST: ChecklistSection[] = [
  // ============================================
  // 1. Personal Details - 个人信息
  // Schema: personalDetails, identityDocuments
  // ============================================
  {
    id: 'personal_details',
    name: 'Personal Details',
    description: 'Your personal information including name, date of birth, nationality, and identity documents',
    categoryId: 'identity_personal',
    sectionType: 'mixed',
    order: 1,
    priority: 'required',
    schemaFields: ['personalDetails', 'identityDocuments', 'biometrics'],
    documentConfig: {
      minFiles: 1,
      maxFiles: 3,
      acceptableTypes: [
        {
          typeId: 'passport',
          label: 'Current Passport',
          description: 'Valid passport with bio data page',
          requirements: ['Bio data page clearly visible', 'All pages with stamps/visas'],
          isPreferred: true,
        },
        {
          typeId: 'national_id',
          label: 'National ID Card',
          description: 'Government-issued ID card',
          requirements: ['Front and back', 'Currently valid'],
        },
        {
          typeId: 'birth_certificate',
          label: 'Birth Certificate',
          description: 'Your official birth certificate',
          requirements: ['Original or certified copy', 'Translated if not in English'],
        },
      ],
    },
  },

  // ============================================
  // 2. Contact Information - 联系方式
  // Schema: contactInformation, addressInformation
  // ============================================
  {
    id: 'contact_information',
    name: 'Contact Information',
    description: 'Your current contact details and address information',
    categoryId: 'identity_personal',
    sectionType: 'questionnaire',
    order: 2,
    priority: 'required',
    schemaFields: ['contactInformation', 'addressInformation'],
  },

  // ============================================
  // 3. Relationship Details - 关系信息
  // Schema: sexRelationship
  // ============================================
  {
    id: 'relationship_details',
    name: 'Relationship Details',
    description: 'Information about your relationship with your UK partner',
    categoryId: 'relationship',
    sectionType: 'mixed',
    order: 3,
    priority: 'required',
    schemaFields: ['sexRelationship'],
    documentConfig: {
      minFiles: 1,
      maxFiles: 5,
      acceptableTypes: [
        {
          typeId: 'marriage_certificate',
          label: 'Marriage Certificate',
          description: 'Official marriage or civil partnership certificate',
          requirements: ['Original or certified copy', 'Translated if not in English'],
          isPreferred: true,
        },
        {
          typeId: 'relationship_photos',
          label: 'Relationship Photos',
          description: 'Photos showing your relationship over time',
          requirements: ['Various occasions', 'Dates where possible'],
        },
        {
          typeId: 'communication_evidence',
          label: 'Communication Evidence',
          description: 'Messages, calls, and other communication records',
          requirements: ['Shows ongoing communication', 'Dates visible'],
        },
      ],
    },
  },

  // ============================================
  // 4. Family Information - 家庭信息
  // Schema: familyInformation
  // ============================================
  {
    id: 'family_information',
    name: 'Family Information',
    description: 'Details about your parents, children, and other family members',
    categoryId: 'relationship',
    sectionType: 'mixed',
    order: 4,
    priority: 'conditional',
    schemaFields: ['familyInformation'],
    formCondition: {
      questionId: 'has_dependants',
      operator: 'equals',
      value: true,
    },
    documentConfig: {
      minFiles: 1,
      maxFiles: 10,
      acceptableTypes: [
        {
          typeId: 'child_birth_certificate',
          label: 'Child Birth Certificate',
          description: 'Birth certificates for dependent children',
          requirements: ['Shows both parents names', 'Translated if not in English'],
          isPreferred: true,
        },
        {
          typeId: 'custody_documents',
          label: 'Custody Documents',
          description: 'Legal custody or guardianship documents',
          requirements: ['Court-issued if applicable'],
        },
      ],
    },
  },

  // ============================================
  // 5. Sponsor Information - 担保人信息
  // Schema: sponsor
  // ============================================
  {
    id: 'sponsor_information',
    name: 'Sponsor Information',
    description: 'Details about your UK-based sponsor (your partner)',
    categoryId: 'sponsor',
    sectionType: 'mixed',
    order: 5,
    priority: 'required',
    schemaFields: ['sponsor'],
    documentConfig: {
      minFiles: 1,
      maxFiles: 3,
      acceptableTypes: [
        {
          typeId: 'sponsor_passport',
          label: 'Sponsor Passport/ID',
          description: 'Sponsor identity document',
          requirements: ['Bio data page', 'Proof of UK status'],
          isPreferred: true,
        },
        {
          typeId: 'sponsor_brp',
          label: 'Sponsor BRP',
          description: 'Biometric Residence Permit (if applicable)',
          requirements: ['Front and back'],
        },
      ],
    },
  },

  // ============================================
  // 6. Financial Information - 财务信息
  // Schema: sponsorFinance, applicantPublicFunds
  // ============================================
  {
    id: 'financial_information',
    name: 'Financial Information',
    description: 'Evidence showing the financial requirement is met (minimum £29,000/year)',
    categoryId: 'financial',
    sectionType: 'mixed',
    order: 6,
    priority: 'required',
    schemaFields: ['sponsorFinance', 'applicantPublicFunds'],
    documentConfig: {
      minFiles: 6,
      maxFiles: 12,
      acceptableTypes: [
        {
          typeId: 'bank_statements',
          label: 'Bank Statements',
          description: '6 months consecutive bank statements',
          requirements: ['6 consecutive months', 'Shows salary deposits', 'Account holder name visible'],
          isPreferred: true,
        },
        {
          typeId: 'payslips',
          label: 'Payslips',
          description: 'Recent payslips showing income',
          requirements: ['6 consecutive months', 'Shows gross salary'],
        },
        {
          typeId: 'employment_letter',
          label: 'Employment Letter',
          description: 'Letter confirming employment and salary',
          requirements: ['On company letterhead', 'States salary and start date'],
        },
        {
          typeId: 'tax_returns',
          label: 'Tax Returns',
          description: 'Tax documents if self-employed',
          requirements: ['Last 2 years', 'HMRC documents'],
        },
      ],
    },
  },

  // ============================================
  // 7. Employment History - 就业历史
  // Schema: employmentHistory
  // ============================================
  {
    id: 'employment_history',
    name: 'Employment History',
    description: 'Your employment and work history for the past 10 years',
    categoryId: 'employment',
    sectionType: 'questionnaire',
    order: 7,
    priority: 'required',
    schemaFields: ['employmentHistory'],
  },

  // ============================================
  // 8. Accommodation - 住宿
  // Schema: accommodation
  // ============================================
  {
    id: 'accommodation',
    name: 'Accommodation',
    description: 'Where you will live together in the UK',
    categoryId: 'residence',
    sectionType: 'mixed',
    order: 8,
    priority: 'required',
    schemaFields: ['accommodation'],
    documentConfig: {
      minFiles: 1,
      maxFiles: 3,
      acceptableTypes: [
        {
          typeId: 'tenancy_agreement',
          label: 'Tenancy Agreement',
          description: 'Current rental agreement',
          requirements: ['Shows address', 'Names of tenants', 'Currently valid'],
          isPreferred: true,
        },
        {
          typeId: 'property_deed',
          label: 'Property Ownership',
          description: 'Mortgage statement or property deed',
          requirements: ['Shows ownership', 'Address visible'],
        },
        {
          typeId: 'accommodation_letter',
          label: 'Accommodation Letter',
          description: 'Letter from person providing accommodation',
          requirements: ['Signed', 'States relationship and terms'],
        },
      ],
    },
  },

  // ============================================
  // 9. English Language - 英语能力
  // Schema: language
  // ============================================
  {
    id: 'english_language',
    name: 'English Language',
    description: 'Evidence of your English language ability (A1 level required)',
    categoryId: 'english_language',
    sectionType: 'documents',
    order: 9,
    priority: 'required',
    schemaFields: ['language'],
    documentConfig: {
      minFiles: 1,
      maxFiles: 2,
      acceptableTypes: [
        {
          typeId: 'ielts_certificate',
          label: 'IELTS Life Skills',
          description: 'IELTS Life Skills A1 or higher',
          requirements: ['Pass at A1 level', 'From approved test center', 'Within 2 years'],
          isPreferred: true,
        },
        {
          typeId: 'english_degree',
          label: 'Degree Taught in English',
          description: 'Degree from English-speaking country',
          requirements: ['NARIC confirmation if needed'],
        },
      ],
    },
  },

  // ============================================
  // 10. Immigration Status - 移民状态
  // Schema: currentImmigrationStatus, immigrationHistory, immigrationBreach
  // ============================================
  {
    id: 'immigration_status',
    name: 'Immigration Status',
    description: 'Your current immigration status and any previous visa applications',
    categoryId: 'immigration_history',
    sectionType: 'mixed',
    order: 10,
    priority: 'required',
    schemaFields: ['currentImmigrationStatus', 'immigrationHistory', 'immigrationBreach'],
    documentConfig: {
      minFiles: 0,
      maxFiles: 5,
      acceptableTypes: [
        {
          typeId: 'previous_visas',
          label: 'Previous Visas',
          description: 'Copies of any previous UK visas',
          requirements: ['Clear scans', 'All visa pages'],
        },
        {
          typeId: 'refusal_letters',
          label: 'Refusal Letters',
          description: 'Any visa refusal letters (if applicable)',
          requirements: ['Complete documents'],
        },
      ],
    },
  },

  // ============================================
  // 11. Travel History - 旅行历史
  // Schema: ukTravelHistory, worldTravelHistory, specialCountryTravelHistory, plannedTravel
  // ============================================
  {
    id: 'travel_history',
    name: 'Travel History',
    description: 'Your travel history including visits to the UK and other countries',
    categoryId: 'immigration_history',
    sectionType: 'mixed',
    order: 11,
    priority: 'required',
    schemaFields: ['ukTravelHistory', 'worldTravelHistory', 'specialCountryTravelHistory', 'plannedTravel'],
    documentConfig: {
      minFiles: 0,
      maxFiles: 10,
      acceptableTypes: [
        {
          typeId: 'passport_stamps',
          label: 'Passport Pages',
          description: 'Pages with entry/exit stamps',
          requirements: ['All stamped pages', 'Previous passports if applicable'],
        },
        {
          typeId: 'travel_itinerary',
          label: 'Travel Itinerary',
          description: 'Planned travel dates to the UK',
          requirements: ['Intended arrival date'],
        },
      ],
    },
  },

  // ============================================
  // 12. Character & Conduct - 品行
  // Schema: convictions, character
  // ============================================
  {
    id: 'character_conduct',
    name: 'Character & Conduct',
    description: 'Information about criminal history and character declarations',
    categoryId: 'character_conduct',
    sectionType: 'mixed',
    order: 12,
    priority: 'required',
    schemaFields: ['convictions', 'character'],
    documentConfig: {
      minFiles: 0,
      maxFiles: 5,
      acceptableTypes: [
        {
          typeId: 'police_certificate',
          label: 'Police Certificate',
          description: 'Criminal record check from countries lived in',
          requirements: ['From each country lived 12+ months', 'Within 6 months', 'Translated if needed'],
        },
        {
          typeId: 'court_documents',
          label: 'Court Documents',
          description: 'Any relevant court documents (if applicable)',
          requirements: ['Official documents', 'Translated if needed'],
        },
      ],
    },
  },

  // ============================================
  // 13. Medical Information - 医疗信息
  // Schema: ukMedical, nationalInsurance, crownDependency
  // ============================================
  {
    id: 'medical_information',
    name: 'Medical & Health',
    description: 'TB test and any previous UK medical/NHS registration',
    categoryId: 'identity_personal',
    sectionType: 'mixed',
    order: 13,
    priority: 'required',
    schemaFields: ['ukMedical', 'nationalInsurance', 'crownDependency'],
    documentConfig: {
      minFiles: 1,
      maxFiles: 3,
      acceptableTypes: [
        {
          typeId: 'tb_certificate',
          label: 'TB Test Certificate',
          description: 'Tuberculosis test from approved clinic',
          requirements: ['From IOM approved clinic', 'Within 6 months'],
          isPreferred: true,
        },
        {
          typeId: 'nhs_registration',
          label: 'NHS Registration',
          description: 'Previous NHS number (if applicable)',
          requirements: ['Shows NHS number'],
        },
      ],
    },
  },

  // ============================================
  // 14. Additional Information - 其他信息
  // Schema: immigrationAdviser, feeWaiver
  // ============================================
  {
    id: 'additional_information',
    name: 'Additional Information',
    description: 'Immigration adviser details and fee waiver application (if applicable)',
    categoryId: 'other',
    sectionType: 'questionnaire',
    order: 14,
    priority: 'optional',
    schemaFields: ['immigrationAdviser', 'feeWaiver'],
  },
];

// 将 ChecklistSection 转换为 EvidenceSlotTemplate (向后兼容)
function checklistToSlots(checklist: ChecklistSection[]): EvidenceSlotTemplate[] {
  return checklist
    .filter(section => section.sectionType !== 'questionnaire') // 仅包含有文档的 section
    .map(section => ({
      id: section.id,
      name: section.name,
      categoryId: section.categoryId,
      category: section.categoryId as any, // Legacy compatibility
      description: section.description,
      priority: section.priority,
      minCount: section.documentConfig?.minFiles ?? 1,
      maxCount: section.documentConfig?.maxFiles ?? 5,
      acceptableTypes: (section.documentConfig?.acceptableTypes ?? []).map(type => ({
        ...type,
        requirements: type.requirements ?? [],
      })),
      formCondition: section.formCondition,
    }));
}

const PARTNER_VISA_SLOTS: EvidenceSlotTemplate[] = checklistToSlots(PARTNER_VISA_CHECKLIST);

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
  partner: PARTNER_VISA_SLOTS,
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
// Checklist 相关函数
// ============================================

/**
 * 所有签证类型的标准化 Checklist
 */
export const VISA_CHECKLISTS: Partial<Record<VisaType, ChecklistSection[]>> = {
  partner: PARTNER_VISA_CHECKLIST,
  // TODO: Add checklists for other visa types
};

/**
 * 根据签证类型获取标准化 Checklist
 */
export function getChecklistForVisaType(visaType: VisaType): ChecklistSection[] {
  return VISA_CHECKLISTS[visaType] || [];
}

/**
 * 获取 Checklist 中需要问卷的 sections
 */
export function getQuestionnaireSections(visaType: VisaType): ChecklistSection[] {
  const checklist = getChecklistForVisaType(visaType);
  return checklist.filter(s => s.sectionType === 'questionnaire' || s.sectionType === 'mixed');
}

/**
 * 获取 Checklist 中需要文档的 sections
 */
export function getDocumentSections(visaType: VisaType): ChecklistSection[] {
  const checklist = getChecklistForVisaType(visaType);
  return checklist.filter(s => s.sectionType === 'documents' || s.sectionType === 'mixed');
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
