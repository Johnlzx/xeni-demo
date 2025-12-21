'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Upload,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { DOCUMENT_CATEGORIES } from '@/data/constants';
import type { ChecklistItem, Document } from '@/types';

interface DocumentChecklistProps {
  items: ChecklistItem[];
  documents: Document[];
  onSelectItem: (item: ChecklistItem) => void;
  selectedItemId?: string;
}

export function DocumentChecklist({
  items,
  documents,
  onSelectItem,
  selectedItemId,
}: DocumentChecklistProps) {
  const getDocumentForItem = (item: ChecklistItem): Document | undefined => {
    return documents.find(
      (doc) => doc.name.toLowerCase() === item.documentName.toLowerCase()
    );
  };

  const getItemStatus = (item: ChecklistItem) => {
    const doc = getDocumentForItem(item);
    if (!doc) return 'pending';
    if (doc.status === 'approved') return 'approved';
    if (doc.status === 'rejected') return 'rejected';
    if (doc.qualityCheck && !doc.qualityCheck.passed) return 'issue';
    return 'uploaded';
  };

  const requiredItems = items.filter((i) => i.status === 'required');
  const optionalItems = items.filter((i) => i.status !== 'required');
  const completedRequired = requiredItems.filter(
    (i) => getItemStatus(i) === 'approved' || getItemStatus(i) === 'uploaded'
  ).length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-1">Document Checklist</h3>
        <p className="text-sm text-gray-500">
          {completedRequired} of {requiredItems.length} required documents
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto">
        {/* Required Section */}
        <div className="p-2">
          <p className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
            Required ({requiredItems.length})
          </p>
          {requiredItems.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              status={getItemStatus(item)}
              isSelected={selectedItemId === item.id}
              onClick={() => onSelectItem(item)}
            />
          ))}
        </div>

        {/* Optional Section */}
        {optionalItems.length > 0 && (
          <div className="p-2 border-t border-gray-100">
            <p className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Optional ({optionalItems.length})
            </p>
            {optionalItems.map((item) => (
              <ChecklistItemRow
                key={item.id}
                item={item}
                status={getItemStatus(item)}
                isSelected={selectedItemId === item.id}
                onClick={() => onSelectItem(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ChecklistItemRowProps {
  item: ChecklistItem;
  status: 'pending' | 'uploaded' | 'approved' | 'rejected' | 'issue';
  isSelected: boolean;
  onClick: () => void;
}

function ChecklistItemRow({ item, status, isSelected, onClick }: ChecklistItemRowProps) {
  const statusConfig = {
    pending: {
      icon: <Circle className="w-5 h-5 text-gray-300" />,
      badge: null,
    },
    uploaded: {
      icon: <FileText className="w-5 h-5 text-primary-500" />,
      badge: <Badge variant="primary" size="sm">Uploaded</Badge>,
    },
    approved: {
      icon: <CheckCircle2 className="w-5 h-5 text-success-500" />,
      badge: <Badge variant="success" size="sm">Approved</Badge>,
    },
    rejected: {
      icon: <AlertCircle className="w-5 h-5 text-error-500" />,
      badge: <Badge variant="error" size="sm">Rejected</Badge>,
    },
    issue: {
      icon: <AlertCircle className="w-5 h-5 text-warning-500" />,
      badge: <Badge variant="warning" size="sm">Issue</Badge>,
    },
  };

  const config = statusConfig[status];

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left',
        isSelected
          ? 'bg-primary-50 border border-primary-200'
          : 'hover:bg-gray-50'
      )}
    >
      {config.icon}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium truncate',
          isSelected ? 'text-primary-900' : 'text-gray-900'
        )}>
          {item.documentName}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {DOCUMENT_CATEGORIES[item.category].label}
        </p>
      </div>
      {config.badge}
      <ChevronRight className={cn(
        'w-4 h-4',
        isSelected ? 'text-primary-500' : 'text-gray-300'
      )} />
    </button>
  );
}
