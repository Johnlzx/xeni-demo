'use client';

import { useMemo, useRef } from 'react';
import { notFound, useParams } from 'next/navigation';
import { useCasePhase } from '@/hooks/useCasePhase';
import {
  CaseStatusHeader,
  IntakePhaseView,
  CompliancePhaseView,
  ReadyPhaseView,
} from '@/components/case-detail';
import { getCaseById } from '@/data/cases';
import { getDocumentsByCaseId } from '@/data/documents';
import { getIssuesByCaseId } from '@/data/issues';
import { generateChecklistForCase } from '@/data/checklists';

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const caseData = getCaseById(caseId);
  const issuesSectionRef = useRef<HTMLDivElement>(null);

  if (!caseData) {
    notFound();
  }

  // Fetch related data
  const documents = getDocumentsByCaseId(caseId);
  const issues = getIssuesByCaseId(caseId);
  const checklistItems = useMemo(
    () => generateChecklistForCase(caseData.visaType, caseId),
    [caseData.visaType, caseId]
  );

  // Determine current phase and related info
  const {
    phase,
    responsibleParty,
    blockingReason,
    primaryAction,
  } = useCasePhase(caseData.status, issues);

  // Handlers
  const handlePrimaryAction = (action: string) => {
    console.log('Primary action triggered:', action);
    switch (action) {
      case 'request_documents':
        // Navigate to intake or open request modal
        break;
      case 'start_compliance':
        // Trigger compliance review
        break;
      case 'resolve_conflicts':
        // Scroll to conflict section
        break;
      case 'mark_ready':
        // Mark case as ready
        break;
      case 'launch_form_pilot':
        // Launch form pilot
        break;
      default:
        break;
    }
  };

  const handleIssueClick = (type: 'quality' | 'logic') => {
    // Scroll to issues section
    issuesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUpload = (checklistItemId: string, file: File) => {
    console.log('Uploading file for checklist item:', checklistItemId, file.name);
  };

  const handlePreview = (documentId: string) => {
    console.log('Preview document:', documentId);
  };

  const handleSendRequest = (checklistItemIds: string[]) => {
    console.log('Send request for items:', checklistItemIds);
  };

  const handleResolveIssue = (issueId: string, action: 'override' | 'request_clarification') => {
    console.log('Resolve issue:', issueId, 'with action:', action);
  };

  const handleLaunchFormPilot = () => {
    console.log('Launching Form Pilot...');
    // In a real app, this would trigger the browser extension
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Status Header */}
      <CaseStatusHeader
        caseData={caseData}
        phase={phase}
        issues={issues}
        responsibleParty={responsibleParty}
        blockingReason={blockingReason}
        primaryAction={primaryAction}
        onPrimaryAction={handlePrimaryAction}
        onIssueClick={handleIssueClick}
      />

      {/* Phase-specific Content */}
      <div ref={issuesSectionRef} className="flex-1 overflow-hidden">
        {phase === 'intake' && (
          <IntakePhaseView
            checklistItems={checklistItems}
            documents={documents}
            issues={issues}
            onUpload={handleUpload}
            onPreview={handlePreview}
            onSendRequest={handleSendRequest}
          />
        )}

        {phase === 'compliance' && (
          <CompliancePhaseView
            issues={issues}
            onResolveIssue={handleResolveIssue}
          />
        )}

        {phase === 'ready' && (
          <ReadyPhaseView
            caseData={caseData}
            onLaunchFormPilot={handleLaunchFormPilot}
          />
        )}
      </div>
    </div>
  );
}
