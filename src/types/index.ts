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

/**
 * 文档管道状态 - 每个文档独立经过的处理流程
 *
 * Pipeline: Upload → Quality Check → Compliance Check → Ready
 */
export type DocumentPipelineStatus =
  | 'uploading'         // 上传中
  | 'processing'        // AI 处理中（分类、OCR等）
  | 'quality_check'     // 质量检查通过，等待合规检查
  | 'quality_issue'     // 质量问题待解决（分辨率低、信息不完整等）
  | 'compliance_check'  // 合规检查通过，等待最终确认
  | 'conflict'          // 发现数据冲突（与其他文档不一致）
  | 'ready';            // 就绪 - 已标准化、已验证、数据已提取

/**
 * 管道事件 - 记录文档在管道中的历史
 */
export interface PipelineEvent {
  status: DocumentPipelineStatus;
  timestamp: string;
  message?: string;
  triggeredBy?: 'system' | 'user';
}

/**
 * Document Repository - 文档仓库类型
 * - original: 原始证据 (客户上传的原始文件)
 * - verified: 已验证文档 (经过处理、格式检查后的文件)
 */
export type DocumentRepository = 'original' | 'verified';

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

  // Evidence Slot 相关字段
  documentTypeId?: string;           // 关联到 AcceptableDocumentType.typeId
  assignedToSlots?: string[];        // 被分配到哪些槽位（支持多槽位）
  isUnclassified?: boolean;          // 是否尚未分类

  // 文档管道字段
  pipelineStatus: DocumentPipelineStatus;  // 当前管道状态
  pipelineHistory?: PipelineEvent[];       // 管道历史记录
  standardizedPdfUrl?: string;             // 标准化后的 PDF URL

  // 文档仓库字段
  repository?: DocumentRepository;         // 文档仓库 (默认 'original')
}

// ============================================
// Evidence Hierarchy Types (4-Layer Model)
// CATEGORY → DOCUMENT TYPE → DOCUMENT INSTANCE → FILES
// ============================================

/**
 * Evidence Category - Home Office category level
 * 对应内政部的证据分类方式
 */
export type EvidenceCategoryId =
  | 'identity_personal'      // Identity & Personal Status
  | 'financial'              // Financial Requirement
  | 'employment'             // Employment & Income
  | 'english_language'       // English Language
  | 'knowledge_life_uk'      // Knowledge of Life in UK
  | 'residence'              // UK Residence / Accommodation
  | 'immigration_history'    // Immigration History
  | 'character_conduct'      // Character & Conduct (Suitability)
  | 'relationship'           // Relationship Evidence (for partner/family visas)
  | 'sponsor'                // Sponsor Eligibility
  | 'translations'           // Translations
  | 'other';                 // Other Supporting Evidence

/**
 * Evidence Category Configuration
 */
export interface EvidenceCategoryConfig {
  id: EvidenceCategoryId;
  name: string;
  description: string;
  icon?: string;
  order: number;
}

/**
 * 槽位状态
 * - hidden: 依赖未满足，不显示
 * - empty: 无文档
 * - partial: 有文档但未达到 minCount 或有待审核
 * - satisfied: 已满足 minCount 且全部通过审核
 * - issue: 有文档但存在质量问题
 */
export type SlotStatus = 'hidden' | 'empty' | 'partial' | 'satisfied' | 'issue';

/**
 * 槽位优先级
 */
export type SlotPriority = 'required' | 'optional' | 'conditional';

/**
 * 可接受的文档类型
 */
export interface AcceptableDocumentType {
  typeId: string;                     // "utility_bill"
  label: string;                      // "Utility Bill"
  description: string;                // "Gas, electricity, or water bill"
  requirements: string[];             // ["Dated within 3 months", "Shows full address"]
  isPreferred?: boolean;              // 标记首选项
  conditionalNote?: string;           // "Only if you own property"
  exampleFileName?: string;           // "utility_bill_example.pdf"
}

/**
 * 表单条件 - 用于渐进式槽位显示
 * 例如：只有回答"有子女"才显示"子女出生证明"槽位
 */
export interface FormCondition {
  questionId: string;        // "has_children", "has_overseas_assets"
  operator: 'equals' | 'not_equals' | 'exists';
  value: string | boolean;
}

/**
 * 案例表单答案 - 存储用户填表的回答
 */
export interface CaseFormResponses {
  caseId: string;
  responses: Record<string, string | boolean | number>;
  updatedAt: string;
}

/**
 * 证据槽模板（用于签证类型配置）
 * 对应 Spec 中的 DOCUMENT TYPE 层级
 */
export interface EvidenceSlotTemplate {
  id: string;                         // 槽位唯一标识
  name: string;                       // "Proof of Address"
  categoryId: EvidenceCategoryId;     // 所属证据类别 (Home Office level)
  category: DocumentCategory;         // Legacy: 保持向后兼容
  description: string;
  priority: SlotPriority;
  acceptableTypes: AcceptableDocumentType[];
  minCount?: number;                  // 最少需要几个文档，默认 1
  maxCount?: number;                  // 最多接受几个文档，默认 1
  dependsOn?: {
    slotId: string;                   // 依赖的槽位 ID
    condition: 'satisfied' | 'any';   // 触发条件
  };
  formCondition?: FormCondition;      // 表单驱动的显隐条件
}

/**
 * 证据槽运行时实例（包含状态）
 */
export interface EvidenceSlot extends EvidenceSlotTemplate {
  // 运行时状态（由系统计算）
  status: SlotStatus;
  satisfiedByDocIds: string[];        // 满足此槽位的文档 ID 列表
  progress: {
    current: number;                  // 当前已有文档数
    required: number;                 // 需要的文档数 (minCount)
  };
}

/**
 * 签证类型的证据要求模板
 */
export interface VisaEvidenceTemplate {
  visaType: VisaType;
  slots: EvidenceSlotTemplate[];
}

/**
 * AI 文档分类结果
 */
export interface AIClassificationResult {
  documentId: string;
  fileName: string;
  suggestedSlotId: string;
  suggestedSlotName: string;
  suggestedTypeId: string;
  suggestedTypeLabel: string;
  confidence: number;         // 0-1
  alternatives: Array<{
    slotId: string;
    slotName: string;
    typeId: string;
    typeLabel: string;
    confidence: number;
  }>;
  status: 'classified' | 'low_confidence' | 'unrecognized';
}

/**
 * 批量上传结果
 */
export interface UploadBatchResult {
  batchId: string;
  uploadedAt: string;
  files: AIClassificationResult[];
  summary: {
    total: number;
    classified: number;
    lowConfidence: number;
    unrecognized: number;
  };
}

// ============================================
// Checklist Types (Legacy - 保留兼容)
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

/**
 * AI 建议的处理方式
 */
export interface AIRecommendation {
  action: 'request_reupload' | 'send_notification' | 'manual_review';
  message: string;
  channels?: ('email' | 'whatsapp' | 'sms')[];
  priority: 'high' | 'medium' | 'low';
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
  // AI 驱动的优化字段
  targetSlotId?: string;              // 用于快速跳转到对应槽位
  aiRecommendation?: AIRecommendation; // AI 建议的处理方式
  // 管道阶段 - 明确问题发生在哪个阶段
  pipelineStage?: 'quality_check' | 'compliance_check';
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
