'use client';

import { useState, useMemo, useCallback } from 'react';
import { notFound, useParams } from 'next/navigation';
import {
  CaseStatusHeader,
  IntakePhaseView,
} from '@/components/case-detail';
import { getCaseById } from '@/data/cases';
import { getDocumentsByCaseId } from '@/data/documents';
import { getIssuesByCaseId } from '@/data/issues';

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const caseData = getCaseById(caseId);
  const [jumpToSlotId, setJumpToSlotId] = useState<string | null>(null);

  // Demo mode: track resolved issues
  const [demoResolvedIssues, setDemoResolvedIssues] = useState<Set<string>>(new Set());

  if (!caseData) {
    notFound();
  }

  // Fetch related data
  const documents = getDocumentsByCaseId(caseId);
  const rawIssues = getIssuesByCaseId(caseId);

  // Apply demo resolved overrides to issues
  const issues = useMemo(() => {
    return rawIssues.map(issue =>
      demoResolvedIssues.has(issue.id)
        ? { ...issue, status: 'resolved' as const }
        : issue
    );
  }, [rawIssues, demoResolvedIssues]);

  // Demo: resolve an issue
  const handleDemoResolveIssue = useCallback((issueId: string) => {
    setDemoResolvedIssues(prev => {
      const newSet = new Set(prev);
      newSet.add(issueId);
      return newSet;
    });
  }, []);

  const handleSlotJump = (slotId: string) => {
    setJumpToSlotId(slotId);
    setTimeout(() => setJumpToSlotId(null), 100);
  };

  // Evidence slot handlers
  const handleUploadUnclassified = (file: File) => {
    console.log('Uploading file via AI classification:', file.name);
  };

  const handleUploadToSlot = (file: File, slotId: string, typeId: string) => {
    console.log('Uploading file to slot:', file.name, 'slot:', slotId, 'type:', typeId);
  };

  const handlePreview = (documentId: string) => {
    console.log('Preview document:', documentId);
  };

  const handleRemove = (documentId: string) => {
    console.log('Remove document:', documentId);
  };

  const handleSendRequest = (slotIds: string[], channel: 'email' | 'whatsapp', message: string) => {
    console.log('Send request for slots:', slotIds, 'via', channel);
    console.log('Message:', message);
  };

  // Applicant info for request modal
  const applicantName = `${caseData.applicant.passport.givenNames} ${caseData.applicant.passport.surname}`;
  const applicantEmail = caseData.applicant.email;
  const applicantPhone = '+44 7700 900123'; // Mock phone for demo
  const caseReference = caseData.referenceNumber;

  const handleLaunchFormPilot = () => {
    console.log('Launching Form Pilot...');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Status Header */}
      <CaseStatusHeader
        caseData={caseData}
        documents={documents}
        issues={issues}
        onSlotJump={handleSlotJump}
        onDemoResolveIssue={handleDemoResolveIssue}
      />

      {/* Main Content - Case Profile + Evidence Checklist */}
      <div className="flex-1 overflow-hidden">
        <IntakePhaseView
          caseId={caseId}
          visaType={caseData.visaType}
          documents={documents}
          issues={issues}
          caseData={caseData}
          applicantName={applicantName}
          applicantEmail={applicantEmail}
          applicantPhone={applicantPhone}
          caseReference={caseReference}
          onUploadUnclassified={handleUploadUnclassified}
          onUploadToSlot={handleUploadToSlot}
          onPreview={handlePreview}
          onRemove={handleRemove}
          onSendRequest={handleSendRequest}
          onResolveIssue={handleDemoResolveIssue}
          jumpToSlotId={jumpToSlotId}
          onLaunchFormPilot={handleLaunchFormPilot}
        />
      </div>
    </div>
  );
}
