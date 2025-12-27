'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import {
  CaseStatusHeader,
  ReferencePanel,
  ActionBar,
  DocumentDetailModal,
  ChecklistNavigation,
  SectionContentArea,
  ClientNoteModal,
  IssueDetailView,
  RequestActivitySidebar,
} from '@/components/case-detail';
import type { ClientRequest } from '@/components/case-detail/RequestActivitySidebar';
import { getEvidenceTemplateForVisaType } from '@/data/evidence-templates';
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
  const [isReferencePanelOpen, setIsReferencePanelOpen] = useState(false);

  // Demo mode: track resolved issues
  const [demoResolvedIssues, setDemoResolvedIssues] = useState<Set<string>>(new Set());

  // Completed merges (auto-accepted by AI)
  const [completedMerges, setCompletedMerges] = useState<MergeSuggestion[]>([]);

  // Document detail modal state
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

  // Checklist navigation state
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  // Issue detail view state
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Client note modal state
  const [isClientNoteModalOpen, setIsClientNoteModalOpen] = useState(false);
  const [clientNoteIssueIds, setClientNoteIssueIds] = useState<string[]>([]);

  // Request tracking state - Map of issueId to ClientRequest
  const [issueRequests, setIssueRequests] = useState<Map<string, ClientRequest>>(new Map());

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

  // Get evidence slot templates for this visa type
  const evidenceSlots = useMemo(() => {
    return getEvidenceTemplateForVisaType(caseData.visaType);
  }, [caseData.visaType]);

  // Default section selection: first section with open issues, or first required section
  useEffect(() => {
    if (!selectedSectionId && evidenceSlots.length > 0) {
      const firstWithIssue = evidenceSlots.find(slot =>
        issues.some(i => i.targetSlotId === slot.id && i.status === 'open')
      );
      const firstRequired = evidenceSlots.find(s => s.priority === 'required');
      setSelectedSectionId(firstWithIssue?.id || firstRequired?.id || evidenceSlots[0].id);
    }
  }, [evidenceSlots, issues, selectedSectionId]);

  // Filter documents by selected section
  const sectionDocuments = useMemo(() => {
    if (!selectedSectionId) return documents;
    return documents.filter(d => d.assignedToSlots?.includes(selectedSectionId));
  }, [documents, selectedSectionId]);

  // Filter issues by selected section
  const sectionIssues = useMemo(() => {
    if (!selectedSectionId) return issues;
    return issues.filter(i => i.targetSlotId === selectedSectionId);
  }, [issues, selectedSectionId]);

  // Get the currently selected section
  const selectedSection = useMemo(() => {
    return evidenceSlots.find(s => s.id === selectedSectionId) || null;
  }, [evidenceSlots, selectedSectionId]);

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

  // Handle opening client note modal with selected issues
  const handleRequestClient = useCallback((issueIds: string[]) => {
    setClientNoteIssueIds(issueIds);
    setIsClientNoteModalOpen(true);
  }, []);

  const handleCloseClientNoteModal = useCallback(() => {
    setIsClientNoteModalOpen(false);
    setClientNoteIssueIds([]);
  }, []);

  const handleSendClientNote = useCallback(
    (channel: 'whatsapp' | 'email', message: string) => {
      console.log(`Sending via ${channel}:`, message);

      // Create request records for each issue
      const now = new Date();
      const newRequests = new Map(issueRequests);

      clientNoteIssueIds.forEach(issueId => {
        const request: ClientRequest = {
          id: `req-${issueId}-${Date.now()}`,
          issueId,
          channel,
          message,
          status: 'sent',
          createdAt: now,
          events: [
            {
              id: `evt-${Date.now()}-1`,
              type: 'sent',
              timestamp: now,
              channel,
            },
          ],
        };
        newRequests.set(issueId, request);
      });

      setIssueRequests(newRequests);

      // Simulate delivery after 2 seconds (demo)
      setTimeout(() => {
        setIssueRequests(prev => {
          const updated = new Map(prev);
          clientNoteIssueIds.forEach(issueId => {
            const existing = updated.get(issueId);
            if (existing && existing.status === 'sent') {
              updated.set(issueId, {
                ...existing,
                status: 'delivered',
                events: [
                  ...existing.events,
                  {
                    id: `evt-${Date.now()}-del`,
                    type: 'delivered',
                    timestamp: new Date(),
                  },
                ],
              });
            }
          });
          return updated;
        });
      }, 2000);

      // Simulate client viewing after 5 seconds (demo)
      setTimeout(() => {
        setIssueRequests(prev => {
          const updated = new Map(prev);
          clientNoteIssueIds.forEach(issueId => {
            const existing = updated.get(issueId);
            if (existing && existing.status === 'delivered') {
              updated.set(issueId, {
                ...existing,
                status: 'viewed',
                events: [
                  ...existing.events,
                  {
                    id: `evt-${Date.now()}-view`,
                    type: 'viewed',
                    timestamp: new Date(),
                  },
                ],
              });
            }
          });
          return updated;
        });
      }, 5000);

      setIsClientNoteModalOpen(false);
      setClientNoteIssueIds([]);
    },
    [clientNoteIssueIds, issueRequests]
  );

  // Handle resend request
  const handleResendRequest = useCallback(() => {
    if (selectedIssueId) {
      // Re-open the modal to send a new request
      setClientNoteIssueIds([selectedIssueId]);
      setIsClientNoteModalOpen(true);
    }
  }, [selectedIssueId]);

  // Handle send reminder
  const handleSendReminder = useCallback(() => {
    if (selectedIssueId) {
      const existing = issueRequests.get(selectedIssueId);
      if (existing) {
        const updated: ClientRequest = {
          ...existing,
          events: [
            ...existing.events,
            {
              id: `evt-${Date.now()}-rem`,
              type: 'reminder_sent',
              timestamp: new Date(),
              message: 'Reminder sent to client',
            },
          ],
        };
        setIssueRequests(prev => {
          const newMap = new Map(prev);
          newMap.set(selectedIssueId, updated);
          return newMap;
        });
      }
    }
  }, [selectedIssueId, issueRequests]);

  // Get active request for selected issue
  const activeRequestForIssue = useMemo(() => {
    if (!selectedIssueId) return null;
    return issueRequests.get(selectedIssueId) || null;
  }, [selectedIssueId, issueRequests]);

  // Get issues for the client note modal
  const clientNoteIssues = useMemo(() => {
    return issues.filter(i => clientNoteIssueIds.includes(i.id));
  }, [issues, clientNoteIssueIds]);

  // Get the selected issue for detail view
  const selectedIssue = useMemo(() => {
    if (!selectedIssueId) return null;
    return issues.find(i => i.id === selectedIssueId) || null;
  }, [issues, selectedIssueId]);

  // Handle selecting an issue to view details
  const handleSelectIssue = useCallback((issueId: string) => {
    setSelectedIssueId(issueId);
  }, []);

  // Handle going back from issue detail
  const handleBackFromIssue = useCallback(() => {
    setSelectedIssueId(null);
  }, []);

  // Handle resolve issue from detail view
  const handleResolveIssueFromDetail = useCallback((issueId: string) => {
    handleDemoResolveIssue(issueId);
    // Optionally go back after resolving
    setSelectedIssueId(null);
  }, [handleDemoResolveIssue]);

  // Clear selected issue when section changes
  useEffect(() => {
    setSelectedIssueId(null);
  }, [selectedSectionId]);

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

      {/* Main Layout - Checklist Nav + Content + Reference Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Checklist Navigation - Left Sidebar */}
        <ChecklistNavigation
          visaType={caseData.visaType}
          documents={documents}
          issues={issues}
          selectedSectionId={selectedSectionId}
          onSelectSection={setSelectedSectionId}
        />

        {/* Section Content Area or Issue Detail View */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          {selectedIssue ? (
            <IssueDetailView
              issue={selectedIssue}
              documents={documents}
              onBack={handleBackFromIssue}
              onRequestClient={handleRequestClient}
              onPreviewDocument={handlePreview}
              activeRequest={activeRequestForIssue}
              onResendRequest={handleResendRequest}
              onSendReminder={handleSendReminder}
            />
          ) : (
            <>
              <SectionContentArea
                section={selectedSection}
                documents={sectionDocuments}
                issues={sectionIssues}
                onPreviewDocument={handlePreview}
                onResolveIssue={handleDemoResolveIssue}
                onRequestClient={handleRequestClient}
                onSelectIssue={handleSelectIssue}
              />

              {/* Action Bar */}
              <div className="bg-white border-t border-gray-100">
                <ActionBar
                  onAddReference={handleAddReference}
                  onStartAutoFill={handleStartAutoFill}
                />
              </div>
            </>
          )}
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
        issues={issues}
      />

      {/* Client Note Modal */}
      <ClientNoteModal
        isOpen={isClientNoteModalOpen}
        onClose={handleCloseClientNoteModal}
        issues={clientNoteIssues}
        onSend={handleSendClientNote}
      />
    </div>
  );
}
