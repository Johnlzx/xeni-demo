'use client';

import { useState } from 'react';
import {
  CheckCircle,
  Lock,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Heart,
  Wallet,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Case } from '@/types';

interface SchemaField {
  key: string;
  label: string;
  value: string;
  verified: boolean;
  source?: string;
}

interface SchemaSection {
  id: string;
  title: string;
  icon: typeof User;
  fields: SchemaField[];
}

interface SchemaPreviewWallProps {
  caseData: Case;
  schemaData?: SchemaSection[];
  isLocked?: boolean;
}

// Generate schema sections from case data
function generateSchemaFromCase(caseData: Case): SchemaSection[] {
  const passport = caseData.applicant.passport;

  return [
    {
      id: 'personal',
      title: 'Personal Information',
      icon: User,
      fields: [
        { key: 'given_names', label: 'Given Names', value: passport.givenNames, verified: true, source: 'Passport' },
        { key: 'surname', label: 'Surname', value: passport.surname, verified: true, source: 'Passport' },
        { key: 'dob', label: 'Date of Birth', value: passport.dateOfBirth, verified: true, source: 'Passport' },
        { key: 'sex', label: 'Sex', value: passport.sex === 'M' ? 'Male' : 'Female', verified: true, source: 'Passport' },
        { key: 'nationality', label: 'Nationality', value: passport.nationality, verified: true, source: 'Passport' },
        { key: 'country_of_birth', label: 'Country of Birth', value: passport.countryOfBirth, verified: true, source: 'Passport' },
      ],
    },
    {
      id: 'passport',
      title: 'Passport Details',
      icon: FileText,
      fields: [
        { key: 'passport_number', label: 'Passport Number', value: passport.passportNumber, verified: true, source: 'Passport' },
        { key: 'date_of_issue', label: 'Date of Issue', value: passport.dateOfIssue, verified: true, source: 'Passport' },
        { key: 'date_of_expiry', label: 'Date of Expiry', value: passport.dateOfExpiry, verified: true, source: 'Passport' },
      ],
    },
    {
      id: 'employment',
      title: 'Employment Details',
      icon: Briefcase,
      fields: [
        { key: 'employer', label: 'Current Employer', value: 'Tech Solutions Ltd', verified: true, source: 'Employment Letter' },
        { key: 'job_title', label: 'Job Title', value: 'Senior Software Engineer', verified: true, source: 'Employment Letter' },
        { key: 'start_date', label: 'Employment Start Date', value: '2020-03-15', verified: true, source: 'Employment Letter' },
        { key: 'salary', label: 'Annual Salary', value: '£75,000', verified: true, source: 'Payslips' },
      ],
    },
    {
      id: 'financial',
      title: 'Financial Information',
      icon: Wallet,
      fields: [
        { key: 'bank_name', label: 'Bank Name', value: 'HSBC UK', verified: true, source: 'Bank Statements' },
        { key: 'account_balance', label: 'Average Balance', value: '£15,420', verified: true, source: 'Bank Statements' },
        { key: 'funds_available', label: 'Funds Available', value: 'Sufficient', verified: true, source: 'Calculated' },
      ],
    },
    {
      id: 'application',
      title: 'Application Details',
      icon: FileText,
      fields: [
        { key: 'visa_type', label: 'Visa Type', value: caseData.visaType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), verified: true, source: 'System' },
        { key: 'reference', label: 'Reference Number', value: caseData.referenceNumber, verified: true, source: 'System' },
        { key: 'advisor', label: 'Assigned Advisor', value: caseData.advisor.name, verified: true, source: 'System' },
      ],
    },
  ];
}

export function SchemaPreviewWall({
  caseData,
  schemaData,
  isLocked = true,
}: SchemaPreviewWallProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['personal', 'passport']);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const sections = schemaData || generateSchemaFromCase(caseData);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const copyToClipboard = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const totalFields = sections.reduce((acc, s) => acc + s.fields.length, 0);
  const verifiedFields = sections.reduce(
    (acc, s) => acc + s.fields.filter((f) => f.verified).length,
    0
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Final Application Schema</h2>
              <p className="text-sm text-gray-500">
                All data has been verified and is ready for submission
              </p>
            </div>
          </div>

          {isLocked && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-gray-600">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Data Locked</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(verifiedFields / totalFields) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-emerald-600">
            {verifiedFields}/{totalFields} verified
          </span>
        </div>
      </div>

      {/* Schema Sections */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections.includes(section.id);
            const sectionVerified = section.fields.every((f) => f.verified);

            return (
              <div
                key={section.id}
                className={cn(
                  'border rounded-xl overflow-hidden transition-all duration-200',
                  isExpanded ? 'border-gray-200' : 'border-gray-100'
                )}
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      sectionVerified ? 'bg-emerald-100' : 'bg-gray-100'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4',
                        sectionVerified ? 'text-emerald-600' : 'text-gray-500'
                      )}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-sm font-semibold text-gray-900">{section.title}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {section.fields.length} fields
                    </span>
                  </div>
                  {sectionVerified && (
                    <div className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Verified</span>
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* Section Content */}
                {isExpanded && (
                  <div className="divide-y divide-gray-50">
                    {section.fields.map((field) => (
                      <div
                        key={field.key}
                        className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-1/3">
                          <span className="text-sm text-gray-500">{field.label}</span>
                        </div>
                        <div className="flex-1 flex items-center gap-3">
                          <span className="font-mono text-sm text-gray-900">{field.value}</span>
                          {field.verified && (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {field.source && (
                            <span className="text-xs text-gray-400">{field.source}</span>
                          )}
                          <button
                            onClick={() => copyToClipboard(field.value, field.key)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            {copiedField === field.key ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
