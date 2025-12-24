'use client';

import { useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Card, Badge, Button } from '@/components/ui';
import { DocumentRequestList } from '@/components/portal';
import {
  User,
  Calendar,
  Globe,
  AlertCircle,
  MessageSquare,
  LogOut,
} from 'lucide-react';
import { getCaseById } from '@/data/cases';
import { getDocumentsByCaseId } from '@/data/documents';
import { getOpenIssuesByCaseId } from '@/data/issues';
import { generateChecklistForCase } from '@/data/checklists';
import { VISA_TYPES } from '@/data/constants';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function ApplicantCasePage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const caseData = getCaseById(caseId);

  if (!caseData) {
    notFound();
  }

  const documents = getDocumentsByCaseId(caseId);
  const issues = getOpenIssuesByCaseId(caseId);
  const checklistItems = useMemo(
    () => generateChecklistForCase(caseData.visaType, caseId),
    [caseData.visaType, caseId]
  );

  const visaConfig = VISA_TYPES[caseData.visaType];

  const handleUpload = (itemId: string, file: File) => {
    console.log('Uploading file for item:', itemId, file.name);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              Welcome, {caseData.applicant.passport.givenNames}
            </h1>
            <p className="text-sm text-gray-500">
              Case Reference: {caseData.referenceNumber}
            </p>
          </div>
          <Link href="/portal">
            <Button variant="ghost" size="sm" leftIcon={<LogOut className="w-4 h-4" />}>
              Sign Out
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Globe className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Visa Type</p>
              <p className="text-sm font-medium text-gray-900">{visaConfig.label}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Advisor</p>
              <p className="text-sm font-medium text-gray-900">{caseData.advisor.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Started</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(caseData.createdAt, 'long')}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Status Alert */}
      {issues.length > 0 && (
        <Card className="border-warning-200 bg-warning-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-warning-800">Action Required</h3>
              <p className="text-sm text-warning-700 mt-1">
                {issues.length} document{issues.length > 1 ? 's need' : ' needs'} your attention.
                Please review and re-upload the affected documents.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Document Requests */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Required Documents</h2>
          <Badge variant="primary">
            {caseData.stats.documentsUploaded}/{caseData.stats.documentsTotal} uploaded
          </Badge>
        </div>
        <DocumentRequestList
          items={checklistItems}
          documents={documents}
          onUpload={handleUpload}
        />
      </Card>

      {/* Contact Section */}
      <Card className="bg-primary-50 border-primary-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Need Help?</h3>
              <p className="text-sm text-gray-600">
                Contact your advisor {caseData.advisor.name} for assistance.
              </p>
            </div>
          </div>
          <Button variant="primary">
            Contact Advisor
          </Button>
        </div>
      </Card>
    </div>
  );
}
