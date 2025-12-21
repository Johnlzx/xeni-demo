'use client';

import { ArrowLeft, Globe, Send, CheckCircle, Rocket, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { StatusRibbon } from './StatusRibbon';
import { IssueCounter } from './IssueCounter';
import { ResponsibilityBadge } from './ResponsibilityBadge';
import type { CasePhase } from '@/hooks/useCasePhase';
import type { Case, Issue, VisaType } from '@/types';
import { VISA_TYPES } from '@/data/constants';
import { formatDate } from '@/lib/utils';

interface CaseStatusHeaderProps {
  caseData: Case;
  phase: CasePhase;
  issues: Issue[];
  responsibleParty: 'applicant' | 'lawyer' | 'system' | null;
  blockingReason: string | null;
  primaryAction: { label: string; action: string } | null;
  onPrimaryAction?: (action: string) => void;
  onIssueClick?: (type: 'quality' | 'logic') => void;
  className?: string;
}

export function CaseStatusHeader({
  caseData,
  phase,
  issues,
  responsibleParty,
  blockingReason,
  primaryAction,
  onPrimaryAction,
  onIssueClick,
  className,
}: CaseStatusHeaderProps) {
  const visaConfig = VISA_TYPES[caseData.visaType];
  const qualityIssues = issues.filter((i) => i.type === 'quality' && i.status === 'open').length;
  const logicIssues = issues.filter((i) => i.type === 'logic' && i.status === 'open').length;

  // Calculate time in current status
  const updatedDate = new Date(caseData.updatedAt);
  const now = new Date();
  const daysInStatus = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));

  const getPrimaryActionIcon = () => {
    if (!primaryAction) return null;
    switch (primaryAction.action) {
      case 'request_documents':
        return <Send className="w-4 h-4" />;
      case 'start_compliance':
      case 'mark_ready':
        return <CheckCircle className="w-4 h-4" />;
      case 'launch_form_pilot':
        return <Rocket className="w-4 h-4" />;
      case 'view_submission':
        return <ExternalLink className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('bg-white border-b border-gray-100', className)}>
      {/* Top Bar: Navigation & Meta */}
      <div className="px-6 py-4 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/cases"
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Cases</span>
            </Link>
            <div className="w-px h-5 bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Ref:</span>
              <span className="text-sm font-mono font-medium text-gray-900">
                {caseData.referenceNumber}
              </span>
            </div>
          </div>

          {/* Time in status indicator */}
          {daysInStatus > 0 && (
            <div className="flex items-center gap-2 text-gray-500">
              <span className="text-xs">In current status for</span>
              <span
                className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-full',
                  daysInStatus > 7 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                )}
              >
                {daysInStatus} day{daysInStatus !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Header Content */}
      <div className="px-6 py-5">
        <div className="flex items-start justify-between">
          {/* Left: Applicant Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                {caseData.applicant.passport.givenNames} {caseData.applicant.passport.surname}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                <Globe className="w-3.5 h-3.5" />
                {visaConfig.label}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Created {formatDate(caseData.createdAt, 'long')}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>Advisor: {caseData.advisor.name}</span>
            </div>
          </div>

          {/* Right: Primary Action */}
          {primaryAction && (
            <button
              onClick={() => onPrimaryAction?.(primaryAction.action)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0E4369] text-white rounded-lg font-medium text-sm hover:bg-[#0B3654] transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              {getPrimaryActionIcon()}
              {primaryAction.label}
            </button>
          )}
        </div>
      </div>

      {/* Status Ribbon */}
      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <StatusRibbon currentPhase={phase} />

          {/* Issue Counter & Responsibility */}
          <div className="flex items-center gap-4">
            <IssueCounter
              qualityIssues={qualityIssues}
              logicIssues={logicIssues}
              onQualityClick={() => onIssueClick?.('quality')}
              onLogicClick={() => onIssueClick?.('logic')}
            />
            <div className="w-px h-8 bg-gray-200" />
            <ResponsibilityBadge party={responsibleParty} blockingReason={blockingReason} />
          </div>
        </div>
      </div>
    </div>
  );
}
