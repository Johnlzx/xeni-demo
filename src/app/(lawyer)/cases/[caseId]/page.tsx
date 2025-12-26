'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import {
  CaseStatusHeader,
  ReferencePanel,
  ActionBar,
  DocumentDetailModal,
  IssueWorkspace,
} from '@/components/case-detail';
import { getCaseById } from '@/data/cases';
import { getDocumentsByCaseId } from '@/data/documents';
import { getIssuesByCaseId } from '@/data/issues';
import {
  detectMergeCandidates,
  type MergeSuggestion,
  type FileInfo,
} from '@/services/mergeDetection';
import type { Document } from '@/types';

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const caseData = getCaseById(caseId);
  const [isReferencePanelOpen, setIsReferencePanelOpen] = useState(true);

  // Demo mode: track resolved issues
  const [demoResolvedIssues, setDemoResolvedIssues] = useState<Set<string>>(new Set());

  // Completed merges (auto-accepted by AI)
  const [completedMerges, setCompletedMerges] = useState<MergeSuggestion[]>([]);

  // Document detail modal state
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

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

  // Run merge detection and auto-accept when documents change
  useEffect(() => {
    const fileInfos: FileInfo[] = documents.map(doc => ({
      id: doc.id,
      name: doc.fileName || doc.name || 'Unknown file',
      size: doc.fileSize || 0,
      type: doc.fileType || 'application/pdf',
      uploadedAt: doc.uploadedAt,
      category: doc.documentTypeId === 'passport' ? 'Passport' : 'Documents',
    }));

    const result = detectMergeCandidates(fileInfos);

    // Auto-accept all merge suggestions (AI does the work)
    const autoAccepted = result.suggestions.map(s => ({
      ...s,
      status: 'accepted' as const,
    }));

    // Demo: Add mock completed merges to show the UI
    const mockMerges: MergeSuggestion[] = [
      {
        id: 'mock-merge-1',
        fileIds: ['doc-fin-001', 'doc-fin-002', 'doc-fin-003'],
        suggestedName: 'Bank Statements Q4 2024.pdf',
        reason: '3 bank statement pages merged',
        confidence: 0.92,
        status: 'accepted',
        category: 'Financial',
      },
      {
        id: 'mock-merge-2',
        fileIds: ['doc-emp-001', 'doc-emp-002'],
        suggestedName: 'Employment Letter Combined.pdf',
        reason: '2 employment documents merged',
        confidence: 0.85,
        status: 'accepted',
        category: 'Employment',
      },
    ];

    setCompletedMerges([...autoAccepted, ...mockMerges]);
  }, [documents]);

  // Get all source file IDs that are part of merges
  const mergedSourceFileIds = useMemo(() => {
    const ids = new Set<string>();
    completedMerges.forEach(merge => {
      if (merge.status === 'accepted') {
        merge.fileIds.forEach(id => ids.add(id));
      }
    });
    return ids;
  }, [completedMerges]);

  // Transform documents to VERIFIED reference files:
  // - Show merged results instead of discrete originals
  // - Hide source files that are part of merges
  // - Keep standalone files that aren't merged
  const referenceFiles = useMemo(() => {
    // Start with merged documents
    const mergedFiles = completedMerges
      .filter(merge => merge.status === 'accepted')
      .map(merge => ({
        id: merge.id, // Use merge ID as the file ID
        name: merge.suggestedName,
        category: merge.category || 'Documents',
        uploadedAt: new Date(), // Today - just merged
        type: 'application/pdf',
        sourceCount: merge.fileIds.length,
        isMerged: true,
      }));

    // Add standalone documents (not part of any merge)
    const standaloneFiles = documents
      .filter(doc => !mergedSourceFileIds.has(doc.id))
      .map(doc => ({
        id: doc.id,
        name: doc.fileName || doc.name || 'Unknown file',
        category: doc.documentTypeId === 'passport' ? 'Passport' : 'Documents',
        uploadedAt: new Date(doc.uploadedAt || Date.now() - 86400000),
        type: doc.fileType || 'application/pdf',
        sourceCount: 0,
        isMerged: false,
      }));

    return [...mergedFiles, ...standaloneFiles];
  }, [documents, completedMerges, mergedSourceFileIds]);

  // Demo: resolve an issue
  const handleDemoResolveIssue = useCallback((issueId: string) => {
    setDemoResolvedIssues(prev => {
      const newSet = new Set(prev);
      newSet.add(issueId);
      return newSet;
    });
  }, []);

  // Handle preview - can be a document ID or a merge ID
  const handlePreview = useCallback((id: string) => {
    setSelectedDocumentId(id);
    setIsDocumentModalOpen(true);
  }, []);

  const handleCloseDocumentModal = useCallback(() => {
    setIsDocumentModalOpen(false);
    setSelectedDocumentId(null);
  }, []);

  // Find the selected document (or create a virtual one for merges)
  const selectedDocument = useMemo(() => {
    if (!selectedDocumentId) return null;

    // Check if it's a merge ID
    const merge = completedMerges.find(m => m.id === selectedDocumentId);
    if (merge) {
      // Create a virtual document for the merged file
      return {
        id: merge.id,
        caseId,
        name: merge.suggestedName,
        fileName: merge.suggestedName,
        documentTypeId: merge.category?.toLowerCase() || 'document',
        fileType: 'application/pdf',
        fileSize: 1024 * 500, // Mock size
        pipelineStatus: 'ready' as const,
        uploadedAt: new Date().toISOString(),
      } as Document;
    }

    // Otherwise find the actual document
    return documents.find(d => d.id === selectedDocumentId) || null;
  }, [documents, selectedDocumentId, completedMerges, caseId]);

  // Find source files for the modal (if viewing a merged document)
  const sourceFilesForModal = useMemo(() => {
    if (!selectedDocumentId) return [];

    // Check if this is a merge ID
    const merge = completedMerges.find(m => m.id === selectedDocumentId);
    if (merge) {
      return merge.fileIds.map(id => {
        const doc = documents.find(d => d.id === id);
        return {
          id,
          name: doc?.fileName || doc?.name || `Original file ${id}`,
          uploadedAt: doc?.uploadedAt,
        };
      });
    }

    // Check if this document is part of a merge (viewing from somewhere else)
    const parentMerge = completedMerges.find(m =>
      m.fileIds.includes(selectedDocumentId)
    );

    if (parentMerge) {
      return parentMerge.fileIds.map(id => {
        const doc = documents.find(d => d.id === id);
        return {
          id,
          name: doc?.fileName || doc?.name || `Original file ${id}`,
          uploadedAt: doc?.uploadedAt,
        };
      });
    }

    return [];
  }, [selectedDocumentId, completedMerges, documents]);

  const handleViewOriginalFile = useCallback((fileId: string) => {
    console.log('View original file:', fileId);
    // Could open a separate viewer for the original file
  }, []);

  const handleLaunchFormPilot = () => {
    console.log('Launching Form Pilot...');
  };

  const handleToggleReferencePanel = useCallback(() => {
    setIsReferencePanelOpen(prev => !prev);
  }, []);

  const handleAddReference = useCallback(() => {
    setIsReferencePanelOpen(true);
  }, []);

  const handleStartAutoFill = useCallback(() => {
    console.log('Starting auto-fill...');
    handleLaunchFormPilot();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Status Header */}
      <CaseStatusHeader
        caseData={caseData}
        documents={documents}
        issues={issues}
        onDemoResolveIssue={handleDemoResolveIssue}
        onToggleReferencePanel={handleToggleReferencePanel}
        isReferencePanelOpen={isReferencePanelOpen}
      />

      {/* Main Layout - Content + Reference Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area - Issue Workspace */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          <IssueWorkspace
            issues={issues}
            documents={documents}
            onResolveIssue={handleDemoResolveIssue}
            onPreviewDocument={handlePreview}
          />

          {/* Action Bar */}
          <div className="bg-white border-t border-gray-100">
            <ActionBar
              onAddReference={handleAddReference}
              onStartAutoFill={handleStartAutoFill}
            />
          </div>
        </div>

        {/* Reference Panel (Push-style Sidebar) */}
        <ReferencePanel
          isOpen={isReferencePanelOpen}
          onClose={() => setIsReferencePanelOpen(false)}
          files={referenceFiles}
          caseEmail={`cosx+${caseData.referenceNumber.replace(/[^a-zA-Z0-9]/g, '')}@msg.xeni.legal`}
          completedMerges={completedMerges}
          onPreview={handlePreview}
        />
      </div>

      {/* Document Detail Modal */}
      <DocumentDetailModal
        isOpen={isDocumentModalOpen}
        onClose={handleCloseDocumentModal}
        document={selectedDocument}
        sourceFiles={sourceFilesForModal}
        onViewOriginal={handleViewOriginalFile}
      />
    </div>
  );
}
