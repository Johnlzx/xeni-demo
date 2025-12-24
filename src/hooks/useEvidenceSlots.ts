import { useMemo, useCallback } from 'react';
import type {
  EvidenceSlot,
  EvidenceSlotTemplate,
  Document,
  SlotStatus,
  VisaType,
  CaseFormResponses,
} from '@/types';
import { generateEvidenceSlotsForCase, evaluateFormCondition, getFormResponsesForCase } from '@/data/evidence-templates';

interface UseEvidenceSlotsOptions {
  visaType: VisaType;
  caseId: string;
  documents: Document[];
  formResponses?: CaseFormResponses;
}

interface UseEvidenceSlotsResult {
  slots: EvidenceSlot[];
  unclassifiedDocs: Document[];
  progress: {
    total: number;
    satisfied: number;
    required: number;
    requiredSatisfied: number;
  };
  getDocsForSlot: (slotId: string) => Document[];
  getSlotById: (slotId: string) => EvidenceSlot | undefined;
  canAssignToSlot: (docTypeId: string, slotId: string) => boolean;
}

/**
 * 计算单个槽位的状态
 */
function computeSlotStatus(
  slot: EvidenceSlotTemplate,
  assignedDocs: Document[],
  allSlots: EvidenceSlotTemplate[],
  allSlotsWithStatus: Map<string, SlotStatus>
): SlotStatus {
  // 检查依赖条件
  if (slot.dependsOn) {
    const dependencyStatus = allSlotsWithStatus.get(slot.dependsOn.slotId);
    if (slot.dependsOn.condition === 'satisfied' && dependencyStatus !== 'satisfied') {
      return 'hidden';
    }
    if (slot.dependsOn.condition === 'any' && dependencyStatus === 'hidden') {
      return 'hidden';
    }
  }

  // 无文档
  if (assignedDocs.length === 0) {
    return 'empty';
  }

  // 检查是否有问题
  const hasIssues = assignedDocs.some(
    (doc) => doc.qualityCheck && !doc.qualityCheck.passed
  );
  if (hasIssues) {
    return 'issue';
  }

  // 检查是否全部通过
  const approvedCount = assignedDocs.filter(
    (doc) => doc.status === 'approved'
  ).length;
  const minCount = slot.minCount ?? 1;

  if (approvedCount >= minCount) {
    return 'satisfied';
  }

  // 有文档但未完全满足
  return 'partial';
}

/**
 * Hook: 管理证据槽状态
 */
export function useEvidenceSlots({
  visaType,
  caseId,
  documents,
  formResponses,
}: UseEvidenceSlotsOptions): UseEvidenceSlotsResult {
  // 生成槽位模板
  const slotTemplates = useMemo(
    () => generateEvidenceSlotsForCase(visaType, caseId),
    [visaType, caseId]
  );

  // Get form responses for this case (from prop or mock data)
  const responses = useMemo(() => {
    if (formResponses) {
      return formResponses.responses;
    }
    // Fall back to mock data for demo
    const mockResponse = getFormResponsesForCase(caseId);
    return mockResponse?.responses || {};
  }, [formResponses, caseId]);

  // 按槽位分组文档
  const docsBySlot = useMemo(() => {
    const map = new Map<string, Document[]>();

    // 初始化所有槽位
    slotTemplates.forEach((slot) => {
      map.set(slot.id, []);
    });

    // 分配文档到槽位
    // Note: Document.assignedToSlots uses template IDs (e.g., 'identity')
    // while slot.id uses prefixed IDs (e.g., 'case-001-identity')
    documents.forEach((doc) => {
      if (doc.assignedToSlots && doc.assignedToSlots.length > 0) {
        doc.assignedToSlots.forEach((templateSlotId) => {
          // Construct the full slot ID with case prefix to match the slot template
          const fullSlotId = `${caseId}-${templateSlotId}`;
          const existing = map.get(fullSlotId) || [];
          // 避免重复添加
          if (!existing.find((d) => d.id === doc.id)) {
            map.set(fullSlotId, [...existing, doc]);
          }
        });
      }
    });

    return map;
  }, [documents, slotTemplates, caseId]);

  // 获取未分类文档
  const unclassifiedDocs = useMemo(
    () => documents.filter((doc) => doc.isUnclassified === true),
    [documents]
  );

  // 计算槽位状态（需要处理依赖关系和表单条件）
  const slots = useMemo(() => {
    // 首先按依赖顺序排序槽位
    const sortedTemplates = [...slotTemplates].sort((a, b) => {
      // 无依赖的在前
      if (!a.dependsOn && b.dependsOn) return -1;
      if (a.dependsOn && !b.dependsOn) return 1;
      // 依赖其他槽位的在后
      if (a.dependsOn?.slotId === b.id) return 1;
      if (b.dependsOn?.slotId === a.id) return -1;
      return 0;
    });

    // 逐步计算状态
    const statusMap = new Map<string, SlotStatus>();

    sortedTemplates.forEach((template) => {
      // Check form condition first - if condition not met, hide the slot
      if (template.formCondition) {
        const conditionMet = evaluateFormCondition(template.formCondition, responses);
        if (!conditionMet) {
          statusMap.set(template.id, 'hidden');
          return;
        }
      }

      const assignedDocs = docsBySlot.get(template.id) || [];
      const status = computeSlotStatus(
        template,
        assignedDocs,
        slotTemplates,
        statusMap
      );
      statusMap.set(template.id, status);
    });

    // 返回完整的槽位数据
    return slotTemplates.map((template): EvidenceSlot => {
      const assignedDocs = docsBySlot.get(template.id) || [];
      const status = statusMap.get(template.id) || 'empty';
      const minCount = template.minCount ?? 1;

      return {
        ...template,
        status,
        satisfiedByDocIds: assignedDocs.map((d) => d.id),
        progress: {
          current: assignedDocs.length,
          required: minCount,
        },
      };
    });
  }, [slotTemplates, docsBySlot, responses]);

  // 计算整体进度
  const progress = useMemo(() => {
    const visibleSlots = slots.filter((s) => s.status !== 'hidden');
    const requiredSlots = visibleSlots.filter((s) => s.priority === 'required');

    return {
      total: visibleSlots.length,
      satisfied: visibleSlots.filter((s) => s.status === 'satisfied').length,
      required: requiredSlots.length,
      requiredSatisfied: requiredSlots.filter((s) => s.status === 'satisfied').length,
    };
  }, [slots]);

  // 获取某个槽位的文档
  const getDocsForSlot = useCallback(
    (slotId: string): Document[] => {
      return docsBySlot.get(slotId) || [];
    },
    [docsBySlot]
  );

  // 通过 ID 获取槽位
  const getSlotById = useCallback(
    (slotId: string): EvidenceSlot | undefined => {
      return slots.find((s) => s.id === slotId);
    },
    [slots]
  );

  // 检查文档类型是否可以分配到槽位
  const canAssignToSlot = useCallback(
    (docTypeId: string, slotId: string): boolean => {
      const slot = slots.find((s) => s.id === slotId);
      if (!slot) return false;

      // 检查槽位是否接受此文档类型
      const acceptsType = slot.acceptableTypes.some(
        (t) => t.typeId === docTypeId
      );
      if (!acceptsType) return false;

      // 检查槽位是否已满
      const currentCount = slot.progress.current;
      const maxCount = slot.maxCount ?? 1;
      if (currentCount >= maxCount) return false;

      return true;
    },
    [slots]
  );

  return {
    slots,
    unclassifiedDocs,
    progress,
    getDocsForSlot,
    getSlotById,
    canAssignToSlot,
  };
}

/**
 * 辅助函数：获取下一个需要关注的槽位
 * 优先级：issue > empty required > partial required
 */
export function getNextFocusSlot(slots: EvidenceSlot[]): EvidenceSlot | null {
  const visibleSlots = slots.filter((s) => s.status !== 'hidden');

  // 1. 优先：有问题的 required 槽位
  const issueSlot = visibleSlots.find(
    (s) => s.status === 'issue' && s.priority === 'required'
  );
  if (issueSlot) return issueSlot;

  // 2. 其次：空的 required 槽位
  const emptyRequired = visibleSlots.find(
    (s) => s.status === 'empty' && s.priority === 'required'
  );
  if (emptyRequired) return emptyRequired;

  // 3. 再次：进行中的 required 槽位
  const partialRequired = visibleSlots.find(
    (s) => s.status === 'partial' && s.priority === 'required'
  );
  if (partialRequired) return partialRequired;

  // 4. 检查 optional 槽位中有问题的
  const optionalIssue = visibleSlots.find(
    (s) => s.status === 'issue' && s.priority !== 'required'
  );
  if (optionalIssue) return optionalIssue;

  return null; // 全部完成
}

/**
 * 辅助函数：判断文档可以分配到哪些槽位
 */
export function findCompatibleSlots(
  docTypeId: string,
  slots: EvidenceSlot[]
): EvidenceSlot[] {
  return slots.filter((slot) => {
    // 隐藏的槽位不可分配
    if (slot.status === 'hidden') return false;

    // 检查是否接受此文档类型
    const acceptsType = slot.acceptableTypes.some(
      (t) => t.typeId === docTypeId
    );
    if (!acceptsType) return false;

    // 检查是否已满
    const currentCount = slot.progress.current;
    const maxCount = slot.maxCount ?? 1;
    if (currentCount >= maxCount) return false;

    return true;
  });
}

/**
 * 辅助函数：获取槽位的颜色配置
 */
export function getSlotStatusColor(status: SlotStatus): {
  bg: string;
  text: string;
  border: string;
  icon: string;
} {
  switch (status) {
    case 'satisfied':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: 'text-emerald-500',
      };
    case 'partial':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: 'text-blue-500',
      };
    case 'issue':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: 'text-amber-500',
      };
    case 'empty':
    case 'hidden':
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        border: 'border-gray-200',
        icon: 'text-gray-400',
      };
  }
}
