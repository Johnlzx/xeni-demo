'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  Upload,
  ChevronRight,
  FileWarning,
  HelpCircle,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Issue, ChecklistItem, Document } from '@/types';

interface TaskCenterProps {
  issues: Issue[];
  pendingDocuments: ChecklistItem[];
  documents: Document[];
  onUpload: (itemId: string, file: File) => void;
}

interface TaskCardProps {
  type: 'issue' | 'document';
  title: string;
  description: string;
  explanation?: string;
  requirements?: string[];
  hasIssue?: boolean;
  issueDetails?: string[];
  onUpload?: (file: File) => void;
}

function TaskCard({
  title,
  description,
  explanation,
  requirements,
  hasIssue,
  issueDetails,
  onUpload
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onUpload) {
      setIsUploading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onUpload(files[0]);
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative overflow-hidden rounded-xl border-2 transition-all duration-300',
        hasIssue
          ? 'bg-gradient-to-br from-[#fef9f0] to-[#fef3e2] border-[#f59e0b]/30'
          : 'bg-white border-[#144368]/10 hover:border-[#144368]/30'
      )}
    >
      {/* Accent stripe */}
      <div className={cn(
        'absolute left-0 top-0 bottom-0 w-1',
        hasIssue ? 'bg-[#f59e0b]' : 'bg-[#144368]'
      )} />

      {/* Header - clickable to expand */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 sm:p-5 pl-5 sm:pl-6 flex items-center gap-4 text-left"
      >
        {/* Icon */}
        <div className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
          hasIssue
            ? 'bg-[#f59e0b]/15'
            : 'bg-[#144368]/5'
        )}>
          {hasIssue ? (
            <FileWarning className="w-5 h-5 text-[#d97706]" />
          ) : (
            <Upload className="w-5 h-5 text-[#144368]" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-semibold text-[#144368] truncate">{title}</h4>
            {hasIssue && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#f59e0b] text-white">
                Needs Fix
              </span>
            )}
          </div>
          <p className="text-sm text-[#144368]/60 line-clamp-1">{description}</p>
        </div>

        {/* Expand indicator */}
        <ChevronRight
          className={cn(
            'w-5 h-5 text-[#144368]/30 transition-transform flex-shrink-0',
            isExpanded && 'rotate-90'
          )}
        />
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t border-[#144368]/10">
              {/* Issue alert if has issues */}
              {hasIssue && issueDetails && (
                <div className="mt-4 p-4 rounded-lg bg-[#fef3e2] border border-[#f59e0b]/30">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-[#d97706] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-[#92400e] mb-2">Issues to fix:</p>
                      <ul className="space-y-1">
                        {issueDetails.map((issue, idx) => (
                          <li key={idx} className="text-sm text-[#b45309] flex items-start gap-2">
                            <span className="text-[#f59e0b] mt-1">-</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Why this is needed - educational section */}
              {explanation && (
                <div className="mt-4 p-4 rounded-lg bg-[#144368]/5 border border-[#144368]/10">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-[#144368] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-[#144368] mb-1">Why is this needed?</p>
                      <p className="text-sm text-[#144368]/70">{explanation}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Requirements list */}
              {requirements && requirements.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-[#144368]/50 uppercase tracking-wider mb-2">
                    Requirements
                  </p>
                  <ul className="space-y-2">
                    {requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-[#144368]/80">
                        <CheckCircle2 className="w-4 h-4 text-[#22c55e] mt-0.5 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Upload button */}
              {onUpload && (
                <label className="mt-5 block cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                  />
                  <span
                    className={cn(
                      'w-full inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all px-5 py-3 text-sm',
                      hasIssue
                        ? 'bg-[#f59e0b] text-white hover:bg-[#d97706] shadow-lg shadow-[#f59e0b]/20'
                        : 'bg-[#144368] text-white hover:bg-[#0d3050] shadow-lg shadow-[#144368]/20',
                      isUploading && 'opacity-70 cursor-not-allowed'
                    )}
                  >
                    {isUploading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        {hasIssue ? 'Upload New Version' : 'Upload Document'}
                      </>
                    )}
                  </span>
                </label>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function TaskCenter({ issues, pendingDocuments, documents, onUpload }: TaskCenterProps) {
  const tasksWithIssues = issues.filter(i => i.status === 'open');
  const totalTasks = tasksWithIssues.length + pendingDocuments.length;

  if (totalTasks === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 px-6 rounded-2xl bg-gradient-to-br from-[#144368]/5 to-[#144368]/10 border-2 border-[#144368]/20"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#144368] flex items-center justify-center"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        <h3 className="text-xl font-bold text-[#144368] mb-2">All caught up!</h3>
        <p className="text-[#144368]/60">You have no pending tasks. We&apos;ll notify you when action is needed.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <div>
            <h3 className="font-bold text-[#144368]">Action Required</h3>
            <p className="text-sm text-[#144368]/60">{totalTasks} task{totalTasks !== 1 ? 's' : ''} need your attention</p>
          </div>
        </div>
      </div>

      {/* Issues that need fixing */}
      {tasksWithIssues.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-[#d97706] uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" />
            Needs Correction ({tasksWithIssues.length})
          </p>
          {tasksWithIssues.map((issue) => {
            const relatedDoc = documents.find(d => issue.documentIds.includes(d.id));
            return (
              <TaskCard
                key={issue.id}
                type="issue"
                title={issue.title}
                description={issue.description}
                explanation={issue.suggestion}
                hasIssue={true}
                issueDetails={relatedDoc?.qualityCheck?.issues}
                onUpload={relatedDoc ? (file) => onUpload(relatedDoc.id, file) : undefined}
              />
            );
          })}
        </div>
      )}

      {/* Pending documents */}
      {pendingDocuments.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-[#144368] uppercase tracking-wider flex items-center gap-2">
            <Upload className="w-3.5 h-3.5" />
            Documents Needed ({pendingDocuments.length})
          </p>
          {pendingDocuments.map((item) => (
            <TaskCard
              key={item.id}
              type="document"
              title={item.documentName}
              description={item.description}
              explanation="Immigration authorities require this document to verify your application. Providing accurate and clear documents helps speed up the process."
              requirements={item.requirements}
              onUpload={(file) => onUpload(item.id, file)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
