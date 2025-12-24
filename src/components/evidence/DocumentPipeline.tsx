'use client';

import { Upload, Search, Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DocumentPipelineStatus } from '@/types';

interface DocumentPipelineProps {
  status: DocumentPipelineStatus;
  /** Compact mode for inline display */
  compact?: boolean;
  className?: string;
}

const PIPELINE_STAGES = [
  { key: 'upload', label: 'Upload', icon: Upload },
  { key: 'quality', label: 'Quality', icon: Search },
  { key: 'compliance', label: 'Compliance', icon: Shield },
  { key: 'ready', label: 'Ready', icon: CheckCircle2 },
] as const;

// Map pipeline status to stage index (0-3)
function getStageIndex(status: DocumentPipelineStatus): number {
  switch (status) {
    case 'uploading':
      return 0;
    case 'processing':
    case 'quality_check':
    case 'quality_issue':
      return 1;
    case 'compliance_check':
    case 'conflict':
      return 2;
    case 'ready':
      return 3;
    default:
      return 0;
  }
}

// Check if current stage has an issue
function hasIssue(status: DocumentPipelineStatus): boolean {
  return status === 'quality_issue' || status === 'conflict';
}

// Check if current stage is processing
function isProcessing(status: DocumentPipelineStatus): boolean {
  return status === 'uploading' || status === 'processing' ||
         status === 'quality_check' || status === 'compliance_check';
}

export function DocumentPipeline({ status, compact = false, className }: DocumentPipelineProps) {
  const currentStageIndex = getStageIndex(status);
  const hasCurrentIssue = hasIssue(status);
  const isCurrentlyProcessing = isProcessing(status);

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {PIPELINE_STAGES.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const isUpcoming = index > currentStageIndex;
          const Icon = stage.icon;

          return (
            <div key={stage.key} className="flex items-center">
              <div
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center transition-all',
                  isCompleted && 'bg-emerald-500 text-white',
                  isCurrent && !hasCurrentIssue && !isCurrentlyProcessing && 'bg-blue-500 text-white',
                  isCurrent && isCurrentlyProcessing && 'bg-blue-100 text-blue-600',
                  isCurrent && hasCurrentIssue && 'bg-amber-500 text-white',
                  isUpcoming && 'bg-gray-100 text-gray-400'
                )}
              >
                {isCurrent && isCurrentlyProcessing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : isCurrent && hasCurrentIssue ? (
                  <AlertCircle className="w-3 h-3" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <Icon className="w-3 h-3" />
                )}
              </div>
              {index < PIPELINE_STAGES.length - 1 && (
                <div
                  className={cn(
                    'w-3 h-0.5 mx-0.5',
                    index < currentStageIndex ? 'bg-emerald-500' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Full version
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {PIPELINE_STAGES.map((stage, index) => {
        const isCompleted = index < currentStageIndex;
        const isCurrent = index === currentStageIndex;
        const isUpcoming = index > currentStageIndex;
        const Icon = stage.icon;

        return (
          <div key={stage.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                  isCompleted && 'bg-emerald-100 text-emerald-600',
                  isCurrent && !hasCurrentIssue && !isCurrentlyProcessing && 'bg-blue-100 text-blue-600 ring-2 ring-blue-200',
                  isCurrent && isCurrentlyProcessing && 'bg-blue-50 text-blue-500',
                  isCurrent && hasCurrentIssue && 'bg-amber-100 text-amber-600 ring-2 ring-amber-200',
                  isUpcoming && 'bg-gray-100 text-gray-400'
                )}
              >
                {isCurrent && isCurrentlyProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isCurrent && hasCurrentIssue ? (
                  <AlertCircle className="w-5 h-5" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium',
                  isCompleted && 'text-emerald-600',
                  isCurrent && !hasCurrentIssue && 'text-blue-600',
                  isCurrent && hasCurrentIssue && 'text-amber-600',
                  isUpcoming && 'text-gray-400'
                )}
              >
                {stage.label}
              </span>
            </div>
            {index < PIPELINE_STAGES.length - 1 && (
              <div className="flex-1 h-0.5 mx-3 mt-[-20px]">
                <div
                  className={cn(
                    'h-full transition-all duration-500',
                    index < currentStageIndex ? 'bg-emerald-400' : 'bg-gray-200'
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Status badge for quick display
interface PipelineStatusBadgeProps {
  status: DocumentPipelineStatus;
  className?: string;
}

export function PipelineStatusBadge({ status, className }: PipelineStatusBadgeProps) {
  const config = getPipelineStatusConfig(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <config.icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// Helper function to get status config
export function getPipelineStatusConfig(status: DocumentPipelineStatus) {
  switch (status) {
    case 'uploading':
      return {
        label: 'Uploading',
        icon: Loader2,
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
        dotColor: 'bg-gray-400',
      };
    case 'processing':
      return {
        label: 'Processing',
        icon: Loader2,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        dotColor: 'bg-blue-400',
      };
    case 'quality_check':
      return {
        label: 'Quality Check',
        icon: Search,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        dotColor: 'bg-blue-400',
      };
    case 'quality_issue':
      return {
        label: 'Quality Issue',
        icon: AlertCircle,
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        dotColor: 'bg-amber-400',
      };
    case 'compliance_check':
      return {
        label: 'Compliance Check',
        icon: Shield,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        dotColor: 'bg-blue-400',
      };
    case 'conflict':
      return {
        label: 'Conflict',
        icon: AlertCircle,
        bgColor: 'bg-rose-50',
        textColor: 'text-rose-700',
        dotColor: 'bg-rose-400',
      };
    case 'ready':
      return {
        label: 'Ready',
        icon: CheckCircle2,
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        dotColor: 'bg-emerald-400',
      };
    default:
      return {
        label: 'Unknown',
        icon: AlertCircle,
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
        dotColor: 'bg-gray-400',
      };
  }
}
