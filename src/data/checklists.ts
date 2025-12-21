import type { VisaType, ChecklistItem, DocumentCategory } from '@/types';

type ChecklistTemplate = Omit<ChecklistItem, 'id' | 'documentId' | 'completed'>;

export const CHECKLIST_TEMPLATES: Record<VisaType, ChecklistTemplate[]> = {
  naturalisation: [
    {
      documentName: 'Current Passport',
      category: 'identity',
      status: 'required',
      description: 'Valid passport with at least 6 months validity',
      requirements: [
        'Clear scan of bio page',
        'All visa pages with stamps',
        'File size under 5MB',
      ],
    },
    {
      documentName: 'Proof of Residence',
      category: 'identity',
      status: 'required',
      description: 'Documents proving 5 years residence in UK',
      requirements: [
        'Utility bills, bank statements, or council tax',
        'Cover continuous 5-year period',
        'Recent documents within last 3 months',
      ],
    },
    {
      documentName: 'Bank Statements',
      category: 'financial',
      status: 'required',
      description: 'Last 6 months bank statements',
      requirements: [
        'Show regular income',
        'Account holder name matches passport',
        'Official bank letterhead or e-statement',
      ],
    },
    {
      documentName: 'Employment Letter',
      category: 'employment',
      status: 'required',
      description: 'Current employment confirmation',
      requirements: [
        'On company letterhead',
        'Include job title and salary',
        'Dated within last month',
      ],
    },
    {
      documentName: 'Life in the UK Test Certificate',
      category: 'other',
      status: 'required',
      description: 'Proof of passing the Life in UK test',
      requirements: [
        'Original certificate or official copy',
        'Clear readable scan',
      ],
    },
    {
      documentName: 'English Language Certificate',
      category: 'education',
      status: 'required',
      description: 'IELTS or equivalent English test results',
      requirements: [
        'Minimum B1 level (CEFR)',
        'Within validity period',
        'TRN number visible',
      ],
    },
    {
      documentName: 'Previous Visa/BRP',
      category: 'identity',
      status: 'optional',
      description: 'Previous immigration documents',
      requirements: [
        'All previous BRP cards',
        'Previous visa vignettes',
      ],
    },
    {
      documentName: 'Marriage Certificate',
      category: 'relationship',
      status: 'conditional',
      description: 'If applying based on marriage to British citizen',
      requirements: [
        'Original or certified copy',
        'Translation if not in English',
      ],
    },
  ],
  skilled_worker: [
    {
      documentName: 'Current Passport',
      category: 'identity',
      status: 'required',
      description: 'Valid passport',
      requirements: ['Clear scan of bio page', 'At least 6 months validity'],
    },
    {
      documentName: 'Certificate of Sponsorship',
      category: 'employment',
      status: 'required',
      description: 'CoS from licensed sponsor',
      requirements: ['Valid CoS reference number', 'Job details matching application'],
    },
    {
      documentName: 'Bank Statements',
      category: 'financial',
      status: 'required',
      description: 'Proof of funds for 28 days',
      requirements: ['Show minimum balance of £1,270', 'Dated within 31 days of application'],
    },
    {
      documentName: 'English Language Proof',
      category: 'education',
      status: 'required',
      description: 'English language qualification',
      requirements: ['IELTS or equivalent', 'Minimum CEFR B1 level'],
    },
    {
      documentName: 'TB Test Certificate',
      category: 'other',
      status: 'conditional',
      description: 'If from listed country',
      requirements: ['From approved clinic', 'Within validity period'],
    },
  ],
  visitor: [
    {
      documentName: 'Current Passport',
      category: 'identity',
      status: 'required',
      description: 'Valid passport',
      requirements: ['Clear scan of bio page', 'At least 6 months validity'],
    },
    {
      documentName: 'Financial Evidence',
      category: 'financial',
      status: 'required',
      description: 'Proof of funds for visit',
      requirements: ['Bank statements', 'Proof of accommodation'],
    },
    {
      documentName: 'Travel Itinerary',
      category: 'other',
      status: 'required',
      description: 'Planned travel arrangements',
      requirements: ['Flight bookings', 'Hotel reservations'],
    },
    {
      documentName: 'Employment Letter',
      category: 'employment',
      status: 'optional',
      description: 'Proof of employment in home country',
      requirements: ['On company letterhead', 'Approval for leave'],
    },
    {
      documentName: 'Invitation Letter',
      category: 'other',
      status: 'conditional',
      description: 'If visiting family or friends',
      requirements: ['Host details', 'Relationship proof'],
    },
  ],
  partner: [
    {
      documentName: 'Current Passport',
      category: 'identity',
      status: 'required',
      description: 'Valid passport',
      requirements: ['Bio page scan'],
    },
    {
      documentName: 'Marriage Certificate',
      category: 'relationship',
      status: 'required',
      description: 'Proof of relationship',
      requirements: ['Original or certified copy'],
    },
    {
      documentName: 'Sponsor Passport',
      category: 'identity',
      status: 'required',
      description: 'UK sponsor passport',
      requirements: ['Bio page showing British citizenship or settled status'],
    },
    {
      documentName: 'Proof of Relationship',
      category: 'relationship',
      status: 'required',
      description: 'Evidence of genuine relationship',
      requirements: ['Photos together', 'Communication records', 'Joint bills'],
    },
    {
      documentName: 'Financial Evidence',
      category: 'financial',
      status: 'required',
      description: 'Meet minimum income requirement (£29,000)',
      requirements: ['Payslips', 'Bank statements', 'Tax returns'],
    },
    {
      documentName: 'English Language Certificate',
      category: 'education',
      status: 'required',
      description: 'A1 level English',
      requirements: ['Approved test provider'],
    },
    {
      documentName: 'Accommodation Evidence',
      category: 'other',
      status: 'required',
      description: 'Proof of adequate housing',
      requirements: ['Tenancy agreement', 'Property inspection report'],
    },
  ],
};

export function generateChecklistForCase(visaType: VisaType, caseId: string): ChecklistItem[] {
  const template = CHECKLIST_TEMPLATES[visaType] || [];
  return template.map((item, index) => ({
    ...item,
    id: `checklist-${caseId}-${index}`,
    completed: false,
  }));
}
