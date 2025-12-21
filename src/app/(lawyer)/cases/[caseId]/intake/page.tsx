'use client';

import { useState, useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { Card } from '@/components/ui';
import {
  DocumentChecklist,
  DocumentUploadZone,
  QualityIssuePanel,
  DocumentToolbar,
} from '@/components/intake';
import { getCaseById } from '@/data/cases';
import { getDocumentsByCaseId } from '@/data/documents';
import { getIssuesByCaseId } from '@/data/issues';
import { generateChecklistForCase } from '@/data/checklists';
import { ROUTES } from '@/data/constants';
import type { ChecklistItem, Document, Issue } from '@/types';

export default function IntakeManagerPage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const caseData = getCaseById(caseId);

  if (!caseData) {
    notFound();
  }

  // State
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  // Data
  const documents = getDocumentsByCaseId(caseId);
  const issues = getIssuesByCaseId(caseId);
  const checklistItems = useMemo(
    () => generateChecklistForCase(caseData.visaType, caseId),
    [caseData.visaType, caseId]
  );

  // Get document for selected checklist item
  const selectedDocument = useMemo(() => {
    if (!selectedItem) return null;
    return documents.find(
      (doc) => doc.name.toLowerCase() === selectedItem.documentName.toLowerCase()
    ) || null;
  }, [selectedItem, documents]);

  // Handlers
  const handleSelectItem = (item: ChecklistItem) => {
    setSelectedItem(item);
  };

  const handleUpload = (file: File) => {
    console.log('Uploading file:', file.name);
    // In a real app, this would upload the file
  };

  const handleDeleteDocument = () => {
    console.log('Deleting document');
    // In a real app, this would delete the document
  };

  const handleViewIssue = (issue: Issue) => {
    // Find the related checklist item and select it
    const relatedDoc = documents.find((d) => issue.documentIds.includes(d.id));
    if (relatedDoc) {
      const relatedItem = checklistItems.find(
        (item) => item.documentName.toLowerCase() === relatedDoc.name.toLowerCase()
      );
      if (relatedItem) {
        setSelectedItem(relatedItem);
      }
    }
  };

  const handleResolveIssue = (issueId: string) => {
    console.log('Resolving issue:', issueId);
    // In a real app, this would mark the issue as resolved
  };

  const handleMerge = (documentIds: string[]) => {
    console.log('Merging documents:', documentIds);
  };

  const handleCompress = (documentIds: string[]) => {
    console.log('Compressing documents:', documentIds);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <PageHeader
          title="Intake Manager"
          subtitle={`${caseData.applicant.passport.givenNames} ${caseData.applicant.passport.surname} - ${caseData.referenceNumber}`}
          backHref={ROUTES.CASE_DETAIL(caseId)}
          breadcrumbs={[
            { label: 'Cases', href: ROUTES.CASES },
            { label: caseData.referenceNumber, href: ROUTES.CASE_DETAIL(caseId) },
            { label: 'Intake Manager' },
          ]}
        />
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Checklist */}
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
          <DocumentChecklist
            items={checklistItems}
            documents={documents}
            onSelectItem={handleSelectItem}
            selectedItemId={selectedItem?.id}
          />
        </div>

        {/* Middle Column - Upload Zone */}
        <div className="flex-1 bg-white flex flex-col">
          <DocumentUploadZone
            selectedItem={selectedItem}
            document={selectedDocument}
            onUpload={handleUpload}
            onDelete={handleDeleteDocument}
          />
          <DocumentToolbar
            selectedDocuments={selectedDocuments}
            onMerge={handleMerge}
            onCompress={handleCompress}
          />
        </div>

        {/* Right Column - Issues Panel */}
        <div className="w-96 border-l border-gray-200 bg-white flex flex-col">
          <QualityIssuePanel
            issues={issues}
            onViewIssue={handleViewIssue}
            onResolveIssue={handleResolveIssue}
          />
        </div>
      </div>
    </div>
  );
}
