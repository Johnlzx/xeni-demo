'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Document, Issue, EvidenceSlotTemplate } from '@/types';

// Workspace status follows traffic light system
export type WorkspaceStatus = 'pending' | 'processing' | 'action_required' | 'verified';

export type WorkspaceTab = 'questionnaire' | 'documents' | 'data' | 'audit';

// Tab configuration for conditional display
export interface TabConfig {
  id: WorkspaceTab;
  label: string;
  enabled: boolean;
  badge?: number;
}

export interface SourceRegion {
  documentId: string;
  page: number;
  bbox: {
    x: number;      // 0-1 normalized
    y: number;
    width: number;
    height: number;
  };
}

export interface ExtractedField {
  id: string;
  key: string;
  label: string;
  value: string;
  confidence: number;  // 0-1
  sourceRegion: SourceRegion;
  isEdited: boolean;
  originalValue?: string;
  hasConflict?: boolean;
  conflictSource?: string;
}

export interface WorkspaceIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  affectedFieldId?: string;
  sourceRegion?: SourceRegion;
  suggestedFix?: string;
  autoFixAvailable: boolean;
  status: 'open' | 'fixed' | 'overridden';
}

export interface HighlightState {
  region: SourceRegion;
  animationPhase: 'entering' | 'stable' | 'exiting';
}

interface UseWorkspaceStateProps {
  section: EvidenceSlotTemplate | null;
  documents: Document[];
  issues: Issue[];
}

export function useWorkspaceState({ section, documents, issues }: UseWorkspaceStateProps) {
  // Tab state - default to questionnaire if section has one
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('questionnaire');

  // Questionnaire state - tracks if documents are required based on answers
  const [questionnaireResponses, setQuestionnaireResponses] = useState<Record<string, any>>({});
  const [documentsRequired, setDocumentsRequired] = useState(false);

  // Check if section has a questionnaire (mock logic - certain section types have questionnaires)
  const hasQuestionnaire = useMemo(() => {
    if (!section) return false;
    // Sections that require questionnaires
    const questionnaireCategories = ['character_conduct', 'immigration_history', 'relationship'];
    return questionnaireCategories.includes(section.categoryId);
  }, [section]);

  // Count missing document issues
  const missingDocumentCount = useMemo(() => {
    return issues.filter(i => i.isMissingDocument && i.status === 'open').length;
  }, [issues]);

  // Build tab configuration
  const tabConfig = useMemo<TabConfig[]>(() => {
    const tabs: TabConfig[] = [];

    // Questionnaire tab - show for sections that have one
    if (hasQuestionnaire) {
      tabs.push({
        id: 'questionnaire',
        label: 'Questionnaire',
        enabled: true,
      });
    }

    // Documents tab - show if no questionnaire OR if questionnaire indicates docs needed
    const showDocuments = !hasQuestionnaire || documentsRequired;
    tabs.push({
      id: 'documents',
      label: 'Documents',
      enabled: showDocuments,
      badge: missingDocumentCount > 0 ? missingDocumentCount : undefined,
    });

    // Data tab - always available when there are documents
    tabs.push({
      id: 'data',
      label: 'Extracted Data',
      enabled: documents.length > 0,
    });

    // Audit tab - always available
    const openIssueCount = issues.filter(i => i.status === 'open').length;
    tabs.push({
      id: 'audit',
      label: 'Issues',
      enabled: true,
      badge: openIssueCount > 0 ? openIssueCount : undefined,
    });

    return tabs;
  }, [hasQuestionnaire, documentsRequired, documents.length, issues, missingDocumentCount]);

  // Handle questionnaire form changes
  const handleQuestionnaireChange = useCallback((responses: Record<string, any>, requiresDocs: boolean) => {
    setQuestionnaireResponses(responses);
    setDocumentsRequired(requiresDocs);
  }, []);

  // Document viewer state
  const [documentViewMode, setDocumentViewMode] = useState<'original' | 'optimized'>('original');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Highlight state for cross-tab linking
  const [highlight, setHighlight] = useState<HighlightState | null>(null);

  // Issue fix flow state
  const [activeFixIssueId, setActiveFixIssueId] = useState<string | null>(null);

  // Generate mock extracted fields from section
  const extractedFields = useMemo<ExtractedField[]>(() => {
    if (!section) return [];

    // Generate mock extracted data based on section type
    const mockFields: Record<string, ExtractedField[]> = {
      passport: [
        {
          id: 'field_fullname',
          key: 'fullName',
          label: 'Full Name',
          value: 'JOHN WILLIAM SMITH',
          confidence: 0.98,
          sourceRegion: { documentId: 'doc_1', page: 1, bbox: { x: 0.1, y: 0.2, width: 0.3, height: 0.05 } },
          isEdited: false,
        },
        {
          id: 'field_dob',
          key: 'dateOfBirth',
          label: 'Date of Birth',
          value: '15 March 1988',
          confidence: 0.75,
          sourceRegion: { documentId: 'doc_1', page: 1, bbox: { x: 0.1, y: 0.35, width: 0.2, height: 0.05 } },
          isEdited: false,
          hasConflict: true,
          conflictSource: 'Bank statement shows 1988-03-15',
        },
        {
          id: 'field_passport_num',
          key: 'passportNumber',
          label: 'Passport Number',
          value: 'GB1234567890',
          confidence: 0.99,
          sourceRegion: { documentId: 'doc_1', page: 1, bbox: { x: 0.6, y: 0.2, width: 0.25, height: 0.05 } },
          isEdited: false,
        },
        {
          id: 'field_nationality',
          key: 'nationality',
          label: 'Nationality',
          value: 'BRITISH CITIZEN',
          confidence: 0.97,
          sourceRegion: { documentId: 'doc_1', page: 1, bbox: { x: 0.6, y: 0.35, width: 0.2, height: 0.05 } },
          isEdited: false,
        },
        {
          id: 'field_expiry',
          key: 'expiryDate',
          label: 'Expiry Date',
          value: '15 September 2030',
          confidence: 0.96,
          sourceRegion: { documentId: 'doc_1', page: 1, bbox: { x: 0.6, y: 0.5, width: 0.2, height: 0.05 } },
          isEdited: false,
        },
      ],
      bank_statements: [
        {
          id: 'field_account_holder',
          key: 'accountHolder',
          label: 'Account Holder',
          value: 'JOHN W SMITH',
          confidence: 0.95,
          sourceRegion: { documentId: 'doc_2', page: 1, bbox: { x: 0.1, y: 0.15, width: 0.3, height: 0.04 } },
          isEdited: false,
        },
        {
          id: 'field_balance',
          key: 'closingBalance',
          label: 'Closing Balance',
          value: '£45,230.00',
          confidence: 0.99,
          sourceRegion: { documentId: 'doc_2', page: 1, bbox: { x: 0.7, y: 0.8, width: 0.15, height: 0.04 } },
          isEdited: false,
        },
        {
          id: 'field_statement_date',
          key: 'statementDate',
          label: 'Statement Date',
          value: 'December 2024',
          confidence: 0.98,
          sourceRegion: { documentId: 'doc_2', page: 1, bbox: { x: 0.7, y: 0.1, width: 0.15, height: 0.04 } },
          isEdited: false,
        },
      ],
    };

    // Return fields based on section ID or default
    return mockFields[section.id] || mockFields.passport || [];
  }, [section]);

  // Convert issues to workspace format
  const workspaceIssues = useMemo<WorkspaceIssue[]>(() => {
    return issues.map((issue) => ({
      id: issue.id,
      severity: issue.severity === 'error' ? 'critical' : issue.severity === 'warning' ? 'warning' : 'info',
      title: issue.title || issue.description,
      description: issue.description,
      affectedFieldId: undefined,
      // Mock source region for demo - in production this would come from OCR
      sourceRegion: issue.documentIds[0] ? {
        documentId: issue.documentIds[0],
        page: 1,
        bbox: { x: 0.1, y: 0.3, width: 0.3, height: 0.05 },
      } : undefined,
      suggestedFix: issue.aiRecommendation?.message || issue.suggestion,
      autoFixAvailable: !!issue.aiRecommendation || !!issue.suggestion,
      status: 'open' as const,
    }));
  }, [issues]);

  // Calculate workspace status
  const status = useMemo<WorkspaceStatus>(() => {
    if (documents.length === 0) return 'pending';

    const hasCritical = workspaceIssues.some(i => i.severity === 'critical' && i.status === 'open');
    const hasWarning = workspaceIssues.some(i => i.severity === 'warning' && i.status === 'open');
    const hasProcessing = documents.some(d => d.pipelineStatus === 'processing' || d.pipelineStatus === 'uploading');

    if (hasProcessing) return 'processing';
    if (hasCritical || hasWarning) return 'action_required';

    return 'verified';
  }, [documents, workspaceIssues]);

  // Issue counts
  const issueCounts = useMemo(() => {
    const open = workspaceIssues.filter(i => i.status === 'open');
    return {
      critical: open.filter(i => i.severity === 'critical').length,
      warning: open.filter(i => i.severity === 'warning').length,
      info: open.filter(i => i.severity === 'info').length,
      total: open.length,
    };
  }, [workspaceIssues]);

  // Highlight a region in the document (for cross-tab linking)
  const highlightRegion = useCallback((region: SourceRegion) => {
    // Set selected document
    setSelectedDocumentId(region.documentId);
    setCurrentPage(region.page);

    // Switch to documents tab
    setActiveTab('documents');

    // Start highlight animation
    setHighlight({ region, animationPhase: 'entering' });

    // Transition to stable
    setTimeout(() => {
      setHighlight(prev => prev ? { ...prev, animationPhase: 'stable' } : null);
    }, 300);

    // Clear highlight after delay
    setTimeout(() => {
      setHighlight(prev => prev ? { ...prev, animationPhase: 'exiting' } : null);
      setTimeout(() => setHighlight(null), 300);
    }, 2500);
  }, []);

  // Jump to issues tab (from header counter)
  const jumpToIssues = useCallback(() => {
    setActiveTab('audit');
    setActiveFixIssueId(null);
  }, []);

  // Enter fix flow for an issue
  const enterFixFlow = useCallback((issueId: string) => {
    setActiveFixIssueId(issueId);
    const issue = workspaceIssues.find(i => i.id === issueId);
    if (issue?.sourceRegion) {
      setSelectedDocumentId(issue.sourceRegion.documentId);
      setCurrentPage(issue.sourceRegion.page);
    }
  }, [workspaceIssues]);

  // Exit fix flow
  const exitFixFlow = useCallback(() => {
    setActiveFixIssueId(null);
  }, []);

  return {
    // Tab state
    activeTab,
    setActiveTab,
    tabConfig,
    hasQuestionnaire,

    // Questionnaire state
    questionnaireResponses,
    documentsRequired,
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
  };
}
