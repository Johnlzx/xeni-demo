'use client';

import { useState } from 'react';
import { ChevronRight, Globe, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { getPassportBookColors } from '@/lib/passport-colors';
import { PassportDetailsModal } from './PassportDetailsModal';
import type { Case, Issue, Document } from '@/types';
import { VISA_TYPES } from '@/data/constants';

interface CaseStatusHeaderProps {
  caseData: Case;
  documents: Document[];
  issues: Issue[];
  onSlotJump?: (slotId: string) => void;
  /** Demo mode: callback to simulate resolving an issue */
  onDemoResolveIssue?: (issueId: string) => void;
  /** Callback for toggling reference panel */
  onToggleReferencePanel?: () => void;
  /** Whether reference panel is open */
  isReferencePanelOpen?: boolean;
  className?: string;
}

// Passport Book Icon - Mini version for header button, nationality-aware
function PassportBookIconMini({
  nationality,
  className,
}: {
  nationality: string;
  className?: string;
}) {
  const colors = getPassportBookColors(nationality);

  return (
    <div className={cn('relative w-7 h-8', className)}>
      {/* Book base */}
      <div className={cn(
        'w-full h-full rounded bg-gradient-to-b shadow-sm relative overflow-hidden',
        colors.gradient
      )}>
        {/* Spine shadow */}
        <div className={cn(
          'absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r to-transparent',
          colors.spine
        )} />
        {/* Cover emboss */}
        <div className={cn('absolute inset-1 border rounded-sm', colors.border)} />
        {/* Emblem */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            'w-4 h-4 rounded-full border flex items-center justify-center',
            colors.emblem
          )}>
            <div className={cn('w-2 h-2 rounded-full', colors.emblemInner)} />
          </div>
        </div>
        {/* Page edges */}
        <div className={cn(
          'absolute right-0 top-1 bottom-1 w-0.5 rounded-r',
          colors.pages
        )} />
      </div>
    </div>
  );
}

export function CaseStatusHeader({
  caseData,
  documents,
  issues,
  onSlotJump,
  onDemoResolveIssue,
  onToggleReferencePanel,
  isReferencePanelOpen,
  className,
}: CaseStatusHeaderProps) {
  const [isPassportModalOpen, setIsPassportModalOpen] = useState(false);

  const visaConfig = VISA_TYPES[caseData.visaType];
  const applicantName = `${caseData.applicant.passport.givenNames} ${caseData.applicant.passport.surname}`;
  const advisorName = caseData.advisor?.name || 'Unassigned';

  return (
    <>
      <div className={cn('bg-white border-b border-slate-200', className)}>
        <div className="px-6 py-3">
          <div className="flex items-center gap-4">
            {/* Left Section: Back + Cases */}
            <a
              href="/cases"
              className="flex items-center gap-1.5 px-2 py-1 -ml-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors group flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Cases</span>
            </a>

            {/* Separator */}
            <div className="h-6 w-px bg-slate-200 flex-shrink-0" />

            {/* Client Name Button */}
            <button
              onClick={() => setIsPassportModalOpen(true)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-1.5 rounded-lg',
                'bg-slate-50 hover:bg-slate-100 border border-slate-200',
                'transition-all duration-150',
                'group'
              )}
            >
              <PassportBookIconMini nationality={caseData.applicant.passport.nationality} />
              <span className="text-sm font-semibold text-slate-900">
                {applicantName}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-slate-200 flex-shrink-0" />

            {/* Reference Number */}
            <span className="text-sm font-mono text-slate-600 flex-shrink-0">
              {caseData.referenceNumber}
            </span>

            {/* Visa Type Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 bg-white flex-shrink-0">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-medium text-slate-700">
                {visaConfig.label}
              </span>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right Section: Date + Advisor */}
            <div className="flex items-center gap-1.5 text-sm text-slate-500 flex-shrink-0">
              <span>{formatDate(caseData.createdAt, 'short')}</span>
              <span className="text-slate-300">·</span>
              <span className="font-medium text-slate-700">{advisorName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Passport Details Modal */}
      <PassportDetailsModal
        isOpen={isPassportModalOpen}
        onClose={() => setIsPassportModalOpen(false)}
        passport={caseData.applicant.passport}
        isVerified={true}
      />
    </>
  );
}
