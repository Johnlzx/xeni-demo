'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, ExternalLink, Edit3, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExtractedField, SourceRegion } from '../hooks/useWorkspaceState';

interface StructuredDataTabProps {
  fields: ExtractedField[];
  onFieldClick: (field: ExtractedField) => void;
  onFieldEdit?: (fieldId: string, newValue: string) => void;
}

export function StructuredDataTab({
  fields,
  onFieldClick,
  onFieldEdit,
}: StructuredDataTabProps) {
  if (fields.length === 0) {
    return <EmptyDataState />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Extracted Information</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {fields.length} field{fields.length !== 1 ? 's' : ''} extracted from documents
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            High confidence
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Low
          </span>
        </div>
      </div>

      {/* Fields List */}
      <div className="space-y-3">
        {fields.map((field, index) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ExtractedDataRow
              field={field}
              onClick={() => onFieldClick(field)}
              onEdit={onFieldEdit ? (value) => onFieldEdit(field.id, value) : undefined}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Single Extracted Data Row
interface ExtractedDataRowProps {
  field: ExtractedField;
  onClick: () => void;
  onEdit?: (value: string) => void;
}

function ExtractedDataRow({ field, onClick, onEdit }: ExtractedDataRowProps) {
  const confidenceLevel = field.confidence >= 0.9 ? 'high' : field.confidence >= 0.7 ? 'medium' : 'low';

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 rounded-xl border transition-all group',
        'hover:shadow-md hover:border-slate-300',
        field.hasConflict
          ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
          : 'bg-white border-slate-200'
      )}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
    >
      <div className="flex items-start gap-4">
        {/* Label and Value */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {field.label}
            </span>
            {field.hasConflict && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">
                <AlertTriangle className="w-3 h-3" />
                Conflict
              </span>
            )}
            {field.isEdited && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
                <Edit3 className="w-3 h-3" />
                Edited
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-slate-900 tracking-tight">
              {field.value}
            </span>
            {field.originalValue && field.originalValue !== field.value && (
              <span className="text-sm text-slate-400 line-through">
                {field.originalValue}
              </span>
            )}
          </div>

          {/* Conflict source */}
          {field.conflictSource && (
            <p className="mt-1.5 text-xs text-amber-600">
              {field.conflictSource}
            </p>
          )}

          {/* Click hint */}
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="w-3 h-3" />
            Click to view source in document
          </div>
        </div>

        {/* Confidence Indicator */}
        <div className="flex flex-col items-end gap-1">
          <ConfidenceBar confidence={field.confidence} level={confidenceLevel} />
          <span className="text-xs font-medium text-slate-500">
            {Math.round(field.confidence * 100)}%
          </span>
        </div>
      </div>
    </motion.button>
  );
}

// Confidence Bar Component
interface ConfidenceBarProps {
  confidence: number;
  level: 'high' | 'medium' | 'low';
}

function ConfidenceBar({ confidence, level }: ConfidenceBarProps) {
  const colorClasses = {
    high: 'bg-emerald-500',
    medium: 'bg-amber-500',
    low: 'bg-rose-500',
  };

  return (
    <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        className={cn('h-full rounded-full', colorClasses[level])}
        initial={{ width: 0 }}
        animate={{ width: `${confidence * 100}%` }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
    </div>
  );
}

// Empty State
function EmptyDataState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-12">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-1">No data extracted yet</h3>
      <p className="text-sm text-slate-500 max-w-sm">
        Upload documents in the Evidence tab to automatically extract structured data
      </p>
    </div>
  );
}
