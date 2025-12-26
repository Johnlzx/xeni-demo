'use client';

import { ChevronDown, Archive, List, Maximize2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
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
  const visaConfig = VISA_TYPES[caseData.visaType];
  const applicantFullName = `${caseData.applicant.passport.givenNames} ${caseData.applicant.passport.surname}`.toUpperCase();

  return (
    <div className={cn('bg-white border-b border-gray-200', className)}>
      <div className="px-6 py-3.5">
        <div className="flex items-center justify-between">
          {/* Left: Breadcrumb Navigation */}
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/cases"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
            >
              Cases
            </Link>
            <span className="text-gray-300 flex-shrink-0">›</span>
            <h1 className="text-sm font-medium text-gray-900 truncate">
              {applicantFullName}'s {visaConfig.label}
            </h1>

            {/* Status Badge */}
            <span className="ml-2 inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium flex-shrink-0">
              Intake
            </span>

            {/* Dropdown Arrow */}
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors flex-shrink-0">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Action Icons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Reference Panel Toggle (Box/Archive Icon) */}
            <button
              onClick={onToggleReferencePanel}
              className={cn(
                'p-2.5 rounded-lg transition-all duration-150',
                isReferencePanelOpen
                  ? 'bg-[#0E4369]/10 text-[#0E4369]'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              )}
              title="Toggle reference panel"
            >
              <Archive className="w-5 h-5" />
            </button>

            {/* List View Icon */}
            <button
              className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="List view"
            >
              <List className="w-5 h-5" />
            </button>

            {/* Expand Icon */}
            <button
              className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Expand"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
