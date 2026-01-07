'use client';

import { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Document, Issue, EvidenceSlotTemplate } from '@/types';
import { WorkspaceHeader } from './WorkspaceHeader';
import { WorkspaceTabs } from './WorkspaceTabs';
import { QuestionnaireTab } from './tabs/QuestionnaireTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { StructuredDataTab } from './tabs/StructuredDataTab';
import { AuditIssuesTab } from './tabs/AuditIssuesTab';
import { useWorkspaceState, type WorkspaceTab } from './hooks/useWorkspaceState';

interface EvidenceWorkspaceProps {
  section: EvidenceSlotTemplate | null;
  documents: Document[];
  issues: Issue[];
  onPreviewDocument?: (docId: string) => void;
  onResolveIssue?: (issueId: string) => void;
  className?: string;
}

export function EvidenceWorkspace({
  section,
  documents,
  issues,
  onPreviewDocument,
  onResolveIssue,
  className,
}: EvidenceWorkspaceProps) {
  const {
    // Tab state
    activeTab,
    setActiveTab,
    tabConfig,
    hasQuestionnaire,
    // Questionnaire state
    handleQuestionnaireChange,
    // Document viewer state
    documentViewMode,
    setDocumentViewMode,
    selectedDocumentId,
    setSelectedDocumentId,
    currentPage,
    setCurrentPage,
    zoomLevel,
    setZoomLevel,
    // Highlight
    highlight,
    highlightRegion,
    // Data
    extractedFields,
    workspaceIssues,
    // Status
    status,
    issueCounts,
    // Fix flow
    activeFixIssueId,
    enterFixFlow,
    exitFixFlow,
    // Actions
    jumpToIssues,
  } = useWorkspaceState({ section, documents, issues });

  // Set default tab based on section type
  useEffect(() => {
    if (hasQuestionnaire) {
      setActiveTab('questionnaire');
    } else {
      setActiveTab('documents');
    }
  }, [section?.id, hasQuestionnaire, setActiveTab]);

  // Handle field click in structured data tab
  const handleFieldClick = useCallback((field: { sourceRegion: { documentId: string; page: number; bbox: { x: number; y: number; width: number; height: number } } }) => {
    highlightRegion(field.sourceRegion);
  }, [highlightRegion]);

  // Handle view in document from issues
  const handleViewInDocument = useCallback((issueId: string) => {
    const issue = workspaceIssues.find(i => i.id === issueId);
    if (issue?.sourceRegion) {
      highlightRegion(issue.sourceRegion);
    }
  }, [workspaceIssues, highlightRegion]);

  // Handle apply fix
  const handleApplyFix = useCallback((issueId: string) => {
    onResolveIssue?.(issueId);
    exitFixFlow();
  }, [onResolveIssue, exitFixFlow]);

  // Handle override
  const handleOverride = useCallback((issueId: string, _value: string) => {
    onResolveIssue?.(issueId);
    exitFixFlow();
  }, [onResolveIssue, exitFixFlow]);

  // Tab content variants for animation
  const tabContentVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  };

  // Get tab direction for animation
  const getTabDirection = (newTab: WorkspaceTab): number => {
    const tabOrder: WorkspaceTab[] = ['questionnaire', 'documents', 'data', 'audit'];
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(newTab);
    return newIndex > currentIndex ? 1 : -1;
  };

  if (!section) {
    return (
      <div className={cn('flex items-center justify-center h-full', className)}>
        <div className="text-center text-slate-500">
          <p className="text-lg font-medium">Select a section</p>
          <p className="text-sm mt-1">Choose a checklist item from the sidebar to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Sticky Header */}
      <WorkspaceHeader
        section={section}
        status={status}
        issueCounts={issueCounts}
        onIssueCounterClick={jumpToIssues}
      />

      {/* Tab Navigation */}
      <WorkspaceTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabConfig={tabConfig}
      />

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait" custom={getTabDirection(activeTab)}>
          <motion.div
            key={activeTab}
            custom={getTabDirection(activeTab)}
            variants={tabContentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="h-full"
          >
            {activeTab === 'questionnaire' && (
              <QuestionnaireTab
                sectionId={section.id}
                sectionName={section.name}
                onFormChange={handleQuestionnaireChange}
              />
            )}

            {activeTab === 'documents' && (
              <DocumentsTab
                section={section}
                documents={documents}
                selectedDocumentId={selectedDocumentId}
                onSelectDocument={setSelectedDocumentId}
                onPreviewDocument={onPreviewDocument}
              />
            )}

            {activeTab === 'data' && (
              <StructuredDataTab
                fields={extractedFields}
                onFieldClick={handleFieldClick}
              />
            )}

            {activeTab === 'audit' && (
              <AuditIssuesTab
                issues={workspaceIssues}
                activeFixIssueId={activeFixIssueId}
                onEnterFixFlow={enterFixFlow}
                onExitFixFlow={exitFixFlow}
                onApplyFix={handleApplyFix}
                onOverride={handleOverride}
                onViewInDocument={handleViewInDocument}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
