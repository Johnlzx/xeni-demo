'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import { CircularProgress } from '@/components/ui';
import { Calendar, User, AlertCircle, FileText } from 'lucide-react';
import { VISA_TYPES, CASE_STATUSES, ROUTES } from '@/data/constants';
import { formatDate } from '@/lib/utils';
import type { Case } from '@/types';

interface CaseCardProps {
  caseData: Case;
}

export function CaseCard({ caseData }: CaseCardProps) {
  const visaConfig = VISA_TYPES[caseData.visaType];
  const statusConfig = CASE_STATUSES[caseData.status];
  const progress = caseData.stats.documentsTotal > 0
    ? Math.round((caseData.stats.documentsUploaded / caseData.stats.documentsTotal) * 100)
    : 0;
  const totalIssues = caseData.stats.qualityIssues + caseData.stats.logicIssues;

  return (
    <Link href={ROUTES.CASE_DETAIL(caseData.id)}>
      <Card hover className="transition-all">
        <div className="flex items-start justify-between">
          {/* Left: Main Info */}
          <div className="flex-1 min-w-0">
            {/* Reference & Status */}
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm font-medium text-gray-900">
                {caseData.referenceNumber}
              </span>
              <Badge
                variant={
                  caseData.status === 'ready' || caseData.status === 'approved'
                    ? 'success'
                    : caseData.status === 'rejected'
                    ? 'error'
                    : 'default'
                }
              >
                {statusConfig.label}
              </Badge>
            </div>

            {/* Applicant Name */}
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {caseData.applicant.passport.givenNames} {caseData.applicant.passport.surname}
            </h3>

            {/* Visa Type */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: visaConfig.color }}
              />
              <span className="text-sm text-gray-600">{visaConfig.label}</span>
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>{caseData.advisor.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(caseData.createdAt)}</span>
              </div>
              {totalIssues > 0 && (
                <div className="flex items-center gap-1.5 text-warning-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{totalIssues} issue{totalIssues > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Progress */}
          <div className="flex flex-col items-center ml-6">
            <CircularProgress value={progress} size={56} />
            <span className="text-xs text-gray-500 mt-2">
              {caseData.stats.documentsUploaded}/{caseData.stats.documentsTotal} docs
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
