'use client';

import { useState } from 'react';
import {
  User,
  Calendar,
  MapPin,
  Briefcase,
  Building2,
  GraduationCap,
  Heart,
  FileText,
  Globe,
  Banknote,
  Clock,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentPreviewModal } from '@/components/evidence/DocumentPreviewModal';
import type { Case, Document, Issue, VisaType } from '@/types';

interface CaseProfileViewProps {
  caseData: Case;
  documents: Document[];
  issues: Issue[];
  className?: string;
  onLaunchFormPilot?: () => void;
}

type DataSource = 'passport' | 'document' | 'form' | 'preset';

interface ProfileField {
  label: string;
  value: string | null;
  source: DataSource;
  sourceLabel?: string;
  documentId?: string;        // Reference to source document for preview
  hasConflict?: boolean;
  conflictValue?: string;
}

interface ProfileSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: ProfileField[];
}

export function CaseProfileView({
  caseData,
  documents,
  issues,
  className,
  onLaunchFormPilot,
}: CaseProfileViewProps) {
  const sections = buildProfileSections(caseData, documents, issues);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [highlightField, setHighlightField] = useState<string | undefined>(undefined);

  const handleDocumentClick = (documentId: string, fieldLabel?: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (doc) {
      setPreviewDocument(doc);
      // Convert label to field key format (e.g., "Given Names" -> "givenNames")
      if (fieldLabel) {
        const fieldKey = fieldLabel
          .split(' ')
          .map((word, i) => i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('');
        setHighlightField(fieldKey);
      } else {
        setHighlightField(undefined);
      }
    }
  };

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Sticky Header */}
      <div className="flex-shrink-0 sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Case Profile
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Application data for {getVisaTypeLabel(caseData.visaType)}
            </p>
          </div>
          <button
            onClick={onLaunchFormPilot}
            className={cn(
              'group relative inline-flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-lg',
              'bg-[#0E4369] text-white text-sm font-medium',
              'hover:bg-[#0a3555]',
              'transition-all duration-200 ease-out',
              'focus:outline-none focus:ring-2 focus:ring-[#0E4369]/40 focus:ring-offset-2',
              'overflow-hidden'
            )}
          >
            {/* Subtle shimmer effect on hover */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* AI indicator dot */}
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>

            <span className="relative">Form Pilot</span>

            {/* Subtle arrow hint */}
            <svg
              className="relative w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-5">
          {sections.map((section) => (
            <ProfileSectionCard
              key={section.id}
              section={section}
              onDocumentClick={handleDocumentClick}
            />
          ))}
        </div>
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={!!previewDocument}
        onClose={() => {
          setPreviewDocument(null);
          setHighlightField(undefined);
        }}
        document={previewDocument}
        highlightField={highlightField}
      />
    </div>
  );
}

function ProfileSectionCard({
  section,
  onDocumentClick,
}: {
  section: ProfileSection;
  onDocumentClick?: (documentId: string, fieldLabel?: string) => void;
}) {
  const Icon = section.icon;
  const hasAnyConflict = section.fields.some((f) => f.hasConflict);

  return (
    <div
      className={cn(
        'rounded-xl border bg-white overflow-hidden',
        hasAnyConflict ? 'border-amber-200' : 'border-slate-200'
      )}
    >
      {/* Section Header */}
      <div
        className={cn(
          'flex items-center gap-3 px-5 py-3.5 border-b',
          hasAnyConflict
            ? 'bg-amber-50/50 border-amber-100'
            : 'bg-slate-50/50 border-slate-100'
        )}
      >
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            hasAnyConflict
              ? 'bg-amber-100 text-amber-600'
              : 'bg-slate-100 text-slate-500'
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">{section.title}</h3>
        {hasAnyConflict && (
          <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
            <AlertTriangle className="w-3 h-3" />
            Data conflict
          </span>
        )}
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-2 gap-px bg-slate-100">
        {section.fields.map((field, index) => (
          <ProfileFieldCell
            key={index}
            field={field}
            onDocumentClick={onDocumentClick}
          />
        ))}
      </div>
    </div>
  );
}

function ProfileFieldCell({
  field,
  onDocumentClick,
}: {
  field: ProfileField;
  onDocumentClick?: (documentId: string, fieldLabel?: string) => void;
}) {
  return (
    <div
      className={cn(
        'px-5 py-4 bg-white',
        field.hasConflict && 'bg-amber-50/30'
      )}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {field.label}
        </span>
        <DataSourceBadge
          source={field.source}
          label={field.sourceLabel}
          documentId={field.documentId}
          fieldLabel={field.label}
          onDocumentClick={onDocumentClick}
        />
      </div>

      {field.hasConflict ? (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">
              {field.value || '—'}
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xs text-amber-600">
            Conflicting value: <span className="font-medium">{field.conflictValue}</span>
          </div>
        </div>
      ) : (
        <div className="text-sm font-semibold text-slate-800">
          {field.value || (
            <span className="text-slate-300 font-normal italic">Not provided</span>
          )}
        </div>
      )}
    </div>
  );
}

function DataSourceBadge({
  source,
  label,
  documentId,
  fieldLabel,
  onDocumentClick,
}: {
  source: DataSource;
  label?: string;
  documentId?: string;
  fieldLabel?: string;
  onDocumentClick?: (documentId: string, fieldLabel?: string) => void;
}) {
  const config = {
    passport: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      hoverBg: 'hover:bg-rose-100',
      icon: FileText,
      defaultLabel: 'Passport',
    },
    document: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      hoverBg: 'hover:bg-blue-100',
      icon: FileText,
      defaultLabel: 'Document',
    },
    form: {
      bg: 'bg-violet-50',
      text: 'text-violet-600',
      hoverBg: 'hover:bg-violet-100',
      icon: CheckCircle,
      defaultLabel: 'Form',
    },
    preset: {
      bg: 'bg-slate-50',
      text: 'text-slate-500',
      hoverBg: '',
      icon: HelpCircle,
      defaultLabel: 'Dummy Data',
    },
  }[source];

  const Icon = config.icon;
  const isClickable = documentId && onDocumentClick;

  if (isClickable) {
    return (
      <button
        onClick={() => onDocumentClick(documentId, fieldLabel)}
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium',
          'transition-colors cursor-pointer',
          config.bg,
          config.text,
          config.hoverBg
        )}
        title={`View ${label || config.defaultLabel}`}
      >
        <Icon className="w-2.5 h-2.5" />
        {label || config.defaultLabel}
        <ExternalLink className="w-2 h-2 ml-0.5 opacity-60" />
      </button>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium',
        config.bg,
        config.text
      )}
    >
      <Icon className="w-2.5 h-2.5" />
      {label || config.defaultLabel}
    </span>
  );
}


function getVisaTypeLabel(visaType: VisaType): string {
  const labels: Record<VisaType, string> = {
    naturalisation: 'British Citizenship (Naturalisation)',
    skilled_worker: 'Skilled Worker Visa',
    visitor: 'Visitor Visa',
    partner: 'Partner Visa',
  };
  return labels[visaType];
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function buildProfileSections(
  caseData: Case,
  documents: Document[],
  issues: Issue[]
): ProfileSection[] {
  const passport = caseData.applicant.passport;

  // Find passport document for reference
  const passportDoc = documents.find(
    d => d.documentTypeId === 'passport' || d.name?.toLowerCase().includes('passport')
  );

  // Extract data from documents with document ID reference
  const extractedData: Record<string, { value: unknown; source: string; documentId: string }> = {};
  documents.forEach((doc) => {
    if (doc.extractedData) {
      Object.entries(doc.extractedData).forEach(([key, value]) => {
        extractedData[key] = {
          value,
          source: doc.name || doc.fileName || 'Unknown',
          documentId: doc.id,
        };
      });
    }
  });

  // Find conflicts from issues
  const conflictFields = new Map<string, string>();
  issues.forEach((issue) => {
    if (issue.type === 'logic' && issue.conflictDetails) {
      conflictFields.set(issue.conflictDetails.field, issue.conflictDetails.valueB);
    }
  });

  // Personal Information Section
  const personalSection: ProfileSection = {
    id: 'personal',
    title: 'Personal Information',
    icon: User,
    fields: [
      {
        label: 'Given Names',
        value: passport.givenNames,
        source: 'passport',
        documentId: passportDoc?.id,
      },
      {
        label: 'Surname',
        value: passport.surname,
        source: 'passport',
        documentId: passportDoc?.id,
      },
      {
        label: 'Date of Birth',
        value: formatDate(passport.dateOfBirth),
        source: 'passport',
        documentId: passportDoc?.id,
        hasConflict: conflictFields.has('dateOfBirth'),
        conflictValue: conflictFields.get('dateOfBirth'),
      },
      {
        label: 'Sex',
        value: passport.sex === 'M' ? 'Male' : 'Female',
        source: 'passport',
        documentId: passportDoc?.id,
      },
      {
        label: 'Country of Birth',
        value: passport.countryOfBirth,
        source: 'passport',
        documentId: passportDoc?.id,
      },
      {
        label: 'Nationality',
        value: passport.nationality,
        source: 'passport',
        documentId: passportDoc?.id,
      },
    ],
  };

  // Immigration Section
  const brpData = extractedData['brpNumber'] || extractedData['visaType'];
  const immigrationSection: ProfileSection = {
    id: 'immigration',
    title: 'Immigration History',
    icon: Globe,
    fields: [
      {
        label: 'Current Visa Type',
        value: extractedData['visaType']?.value as string || 'Tier 2 (General)',
        source: brpData ? 'document' : 'preset',
        sourceLabel: brpData ? 'BRP Card' : undefined,
        documentId: extractedData['visaType']?.documentId,
      },
      {
        label: 'BRP Number',
        value: extractedData['brpNumber']?.value as string || null,
        source: 'document',
        sourceLabel: 'BRP Card',
        documentId: extractedData['brpNumber']?.documentId,
      },
      {
        label: 'Visa Expiry Date',
        value: extractedData['expiryDate']?.value
          ? formatDate(extractedData['expiryDate'].value as string)
          : null,
        source: 'document',
        sourceLabel: 'BRP Card',
        documentId: extractedData['expiryDate']?.documentId,
      },
      {
        label: 'Time in UK',
        value: '5+ years',
        source: 'preset',
      },
    ],
  };

  // Employment Section
  const employmentSection: ProfileSection = {
    id: 'employment',
    title: 'Employment & Income',
    icon: Briefcase,
    fields: [
      {
        label: 'Employer',
        value: extractedData['employerName']?.value as string || 'Tech Corp Ltd',
        source: extractedData['employerName'] ? 'document' : 'preset',
        sourceLabel: extractedData['employerName']?.source,
        documentId: extractedData['employerName']?.documentId,
        hasConflict: conflictFields.has('employerName'),
        conflictValue: conflictFields.get('employerName'),
      },
      {
        label: 'Job Title',
        value: extractedData['jobTitle']?.value as string || 'Senior Software Engineer',
        source: extractedData['jobTitle'] ? 'document' : 'preset',
        sourceLabel: extractedData['jobTitle']?.source,
        documentId: extractedData['jobTitle']?.documentId,
      },
      {
        label: 'Annual Salary',
        value: extractedData['salary']?.value
          ? `£${Number(extractedData['salary'].value).toLocaleString()}`
          : '£65,000',
        source: extractedData['salary'] ? 'document' : 'preset',
        sourceLabel: extractedData['salary']?.source,
        documentId: extractedData['salary']?.documentId,
      },
      {
        label: 'Employment Start',
        value: extractedData['startDate']?.value
          ? formatDate(extractedData['startDate'].value as string)
          : '1 Mar 2020',
        source: extractedData['startDate'] ? 'document' : 'preset',
        sourceLabel: extractedData['startDate']?.source,
        documentId: extractedData['startDate']?.documentId,
        hasConflict: conflictFields.has('startDate'),
        conflictValue: conflictFields.get('startDate'),
      },
    ],
  };

  // Financial Section
  const financialSection: ProfileSection = {
    id: 'financial',
    title: 'Financial Evidence',
    icon: Banknote,
    fields: [
      {
        label: 'Bank Name',
        value: extractedData['bankName']?.value as string || 'HSBC',
        source: extractedData['bankName'] ? 'document' : 'preset',
        sourceLabel: 'Bank Statement',
        documentId: extractedData['bankName']?.documentId,
      },
      {
        label: 'Account Holder',
        value: extractedData['accountHolder']?.value as string || `${passport.givenNames} ${passport.surname}`,
        source: extractedData['accountHolder'] ? 'document' : 'passport',
        sourceLabel: extractedData['accountHolder']?.source,
        documentId: extractedData['accountHolder']?.documentId || passportDoc?.id,
      },
      {
        label: 'Current Balance',
        value: extractedData['closingBalance']?.value as string || '£15,678.25',
        source: extractedData['closingBalance'] ? 'document' : 'preset',
        sourceLabel: 'Bank Statement',
        documentId: extractedData['closingBalance']?.documentId,
      },
      {
        label: 'Statement Period',
        value: extractedData['statementPeriod']?.value as string || 'March 2024',
        source: extractedData['statementPeriod'] ? 'document' : 'preset',
        sourceLabel: 'Bank Statement',
        documentId: extractedData['statementPeriod']?.documentId,
      },
    ],
  };

  // Residence Section
  const residenceSection: ProfileSection = {
    id: 'residence',
    title: 'UK Residence',
    icon: Building2,
    fields: [
      {
        label: 'Current Address',
        value: '123 Example Street, London, SW1A 1AA',
        source: 'preset',
      },
      {
        label: 'Address Since',
        value: '1 Jan 2022',
        source: 'preset',
      },
      {
        label: 'Proof Type',
        value: 'Utility Bill',
        source: 'preset',
      },
      {
        label: 'Verification Status',
        value: 'Pending',
        source: 'preset',
      },
    ],
  };

  // English Language Section
  const englishSection: ProfileSection = {
    id: 'english',
    title: 'English Language',
    icon: GraduationCap,
    fields: [
      {
        label: 'Test Type',
        value: extractedData['testType']?.value as string || 'IELTS Academic',
        source: extractedData['testType'] ? 'document' : 'preset',
        sourceLabel: 'IELTS Certificate',
        documentId: extractedData['testType']?.documentId,
      },
      {
        label: 'Overall Score',
        value: extractedData['overallScore']?.value as string || '7.5',
        source: extractedData['overallScore'] ? 'document' : 'preset',
        sourceLabel: 'IELTS Certificate',
        documentId: extractedData['overallScore']?.documentId,
      },
      {
        label: 'Test Date',
        value: extractedData['testDate']?.value
          ? formatDate(extractedData['testDate'].value as string)
          : '15 Jun 2024',
        source: extractedData['testDate'] ? 'document' : 'preset',
        sourceLabel: 'IELTS Certificate',
        documentId: extractedData['testDate']?.documentId,
      },
      {
        label: 'TRF Number',
        value: extractedData['trfNumber']?.value as string || null,
        source: 'document',
        sourceLabel: 'IELTS Certificate',
        documentId: extractedData['trfNumber']?.documentId,
      },
    ],
  };

  // For naturalisation, add Life in UK section
  const sections: ProfileSection[] = [
    personalSection,
    immigrationSection,
    employmentSection,
    financialSection,
    residenceSection,
    englishSection,
  ];

  if (caseData.visaType === 'naturalisation') {
    sections.push({
      id: 'life_in_uk',
      title: 'Life in the UK Test',
      icon: Heart,
      fields: [
        {
          label: 'Test Result',
          value: extractedData['result']?.value as string || 'PASS',
          source: extractedData['result'] ? 'document' : 'preset',
          sourceLabel: 'Life in UK Certificate',
          documentId: extractedData['result']?.documentId,
        },
        {
          label: 'Test Date',
          value: extractedData['lifeInUkTestDate']?.value
            ? formatDate(extractedData['lifeInUkTestDate'].value as string)
            : '20 Oct 2024',
          source: extractedData['lifeInUkTestDate'] ? 'document' : 'preset',
          documentId: extractedData['lifeInUkTestDate']?.documentId,
        },
        {
          label: 'Certificate Number',
          value: extractedData['certificateNumber']?.value as string || 'LITUK-2024-123456',
          source: extractedData['certificateNumber'] ? 'document' : 'preset',
          documentId: extractedData['certificateNumber']?.documentId,
        },
        {
          label: 'Candidate Name',
          value: extractedData['candidateName']?.value as string || `${passport.givenNames} ${passport.surname}`,
          source: extractedData['candidateName'] ? 'document' : 'passport',
          documentId: extractedData['candidateName']?.documentId || passportDoc?.id,
        },
      ],
    });
  }

  return sections;
}
