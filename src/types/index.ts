// ============================================
// User Types
// ============================================
export type UserRole = 'lawyer' | 'assistant' | 'applicant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// ============================================
// Case Types
// ============================================
export type CaseStatus =
  | 'draft'
  | 'intake'
  | 'review'
  | 'compliance'
  | 'ready'
  | 'submitted'
  | 'approved'
  | 'rejected';

export type VisaType =
  | 'naturalisation'
  | 'skilled_worker'
  | 'visitor'
  | 'partner';

export interface PassportInfo {
  givenNames: string;
  surname: string;
  nationality: string;
  countryOfBirth: string;
  dateOfBirth: string;
  sex: 'M' | 'F';
  dateOfIssue: string;
  dateOfExpiry: string;
  passportNumber: string;
  mrzLine1: string;
  mrzLine2: string;
}

export interface CaseStats {
  documentsTotal: number;
  documentsUploaded: number;
  qualityIssues: number;
  logicIssues: number;
}

export interface Case {
  id: string;
  referenceNumber: string;
  visaType: VisaType;
  status: CaseStatus;
  applicant: {
    id: string;
    email?: string;
    passport: PassportInfo;
  };
  advisor: User;
  assistant?: User;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  stats: CaseStats;
}

// ============================================
// Document Types
// ============================================
export type DocumentCategory =
  | 'identity'
  | 'financial'
  | 'employment'
  | 'education'
  | 'relationship'
  | 'other';

export type DocumentStatus =
  | 'pending'
  | 'uploaded'
  | 'processing'
  | 'approved'
  | 'rejected';

export interface Document {
  id: string;
  caseId: string;
  name: string;
  category: DocumentCategory;
  status: DocumentStatus;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  qualityCheck?: {
    passed: boolean;
    issues: string[];
  };
  extractedData?: Record<string, unknown>;
  notes?: string;
}

// ============================================
// Checklist Types
// ============================================
export type ChecklistItemStatus = 'required' | 'optional' | 'conditional';

export interface ChecklistItem {
  id: string;
  documentName: string;
  category: DocumentCategory;
  status: ChecklistItemStatus;
  description: string;
  requirements: string[];
  documentId?: string;
  completed: boolean;
}

export interface Checklist {
  id: string;
  caseId: string;
  visaType: VisaType;
  items: ChecklistItem[];
  totalRequired: number;
  completedRequired: number;
  totalOptional: number;
  completedOptional: number;
}

// ============================================
// Issue Types
// ============================================
export type IssueSeverity = 'error' | 'warning' | 'info';
export type IssueType = 'quality' | 'logic';
export type IssueStatus = 'open' | 'resolved' | 'ignored';

export interface ConflictDetails {
  field: string;
  valueA: string;
  valueB: string;
  sourceA: string;
  sourceB: string;
}

export interface Issue {
  id: string;
  caseId: string;
  type: IssueType;
  severity: IssueSeverity;
  status: IssueStatus;
  title: string;
  description: string;
  suggestion?: string;
  documentIds: string[];
  conflictDetails?: ConflictDetails;
  detectedAt: string;
  resolvedAt?: string;
}

// ============================================
// Compliance Types
// ============================================
export type RuleCategory =
  | 'identity_verification'
  | 'financial_requirement'
  | 'document_validity'
  | 'timeline_consistency'
  | 'cross_reference';

export type RuleResult = 'pass' | 'fail' | 'warning' | 'pending';

export interface ComplianceRule {
  id: string;
  name: string;
  category: RuleCategory;
  description: string;
  result: RuleResult;
  details?: string;
  relatedDocuments: string[];
}

export interface ComplianceReport {
  id: string;
  caseId: string;
  generatedAt: string;
  rules: ComplianceRule[];
  summary: {
    passed: number;
    failed: number;
    warnings: number;
    pending: number;
  };
  overallStatus: 'approved' | 'needs_review' | 'rejected';
}

// ============================================
// Portal Progress Types
// ============================================
export type ProgressStepStatus = 'completed' | 'current' | 'upcoming';

export interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: ProgressStepStatus;
  completedAt?: string;
  estimatedDate?: string;
}

// ============================================
// UI State Types
// ============================================
export interface FilterState {
  status?: CaseStatus[];
  visaType?: VisaType[];
  advisorId?: string;
  searchQuery?: string;
}

// ============================================
// Config Types
// ============================================
export interface VisaTypeConfig {
  label: string;
  description: string;
  color: string;
}

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
}
