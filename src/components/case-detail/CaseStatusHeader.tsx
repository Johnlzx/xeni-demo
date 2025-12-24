'use client';

import { ArrowLeft, Globe } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { IssueCounter } from './IssueCounter';
import { PassportButton } from './PassportButton';
import type { Case, Issue, Document } from '@/types';
import { VISA_TYPES } from '@/data/constants';
import { formatDate } from '@/lib/utils';

interface CaseStatusHeaderProps {
  caseData: Case;
  documents: Document[];
  issues: Issue[];
  onSlotJump?: (slotId: string) => void;
  /** Demo mode: callback to simulate resolving an issue */
  onDemoResolveIssue?: (issueId: string) => void;
  className?: string;
}

export function CaseStatusHeader({
  caseData,
  documents,
  issues,
  onSlotJump,
  onDemoResolveIssue,
  className,
}: CaseStatusHeaderProps) {
  const visaConfig = VISA_TYPES[caseData.visaType];
  const totalIssues = issues.filter((i) => i.status === 'open').length;

  // Find the passport document for preview
  const passportDocument = documents.find(
    d => d.documentTypeId === 'passport' || d.name?.toLowerCase().includes('passport')
  );

  return (
    <div className={cn('bg-white border-b border-gray-200', className)}>
      {/* Single Row: Navigation + Passport + Info + Issue Counter + Actions */}
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Navigation + Passport Button + Case Info */}
          <div className="flex items-center gap-4">
            <Link
              href="/cases"
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="text-sm font-medium">Cases</span>
            </Link>
            <div className="w-px h-5 bg-gray-200" />

            {/* Passport Button - Primary Identity */}
            <PassportButton
              passport={caseData.applicant.passport}
              passportDocument={passportDocument}
            />

            <div className="w-px h-5 bg-gray-200" />
            <span className="text-sm font-mono text-gray-500">
              {caseData.referenceNumber}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
              <Globe className="w-3 h-3" />
              {visaConfig.label}
            </span>
            <span className="text-xs text-gray-400">
              {formatDate(caseData.createdAt, 'short')} · {caseData.advisor.name}
            </span>
          </div>

          {/* Right: Issue Counter + Launch Button */}
          <div className="flex items-center gap-3">
            {/* Unified Issue Counter */}
            <IssueCounter
              issues={issues}
              onSlotJump={onSlotJump}
              onDemoResolve={onDemoResolveIssue}
            />

          </div>
        </div>
      </div>
    </div>
  );
}
