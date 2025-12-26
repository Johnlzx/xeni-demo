'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  ChevronDown,
  Folder,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import type { Document, DocumentCategory } from '@/types';

interface DocumentVaultProps {
  documents: Document[];
}

const categoryLabels: Record<DocumentCategory, string> = {
  identity: 'Identity Documents',
  financial: 'Financial Records',
  employment: 'Employment',
  education: 'Education',
  relationship: 'Relationship',
  other: 'Other Documents'
};

const categoryIcons: Record<DocumentCategory, React.ElementType> = {
  identity: Shield,
  financial: FileText,
  employment: Folder,
  education: FileText,
  relationship: FileText,
  other: Folder
};

interface DocumentItemProps {
  document: Document;
}

function DocumentItem({ document }: DocumentItemProps) {
  const isApproved = document.status === 'approved';
  const hasIssue = document.qualityCheck && !document.qualityCheck.passed;
  const isPending = document.status === 'pending' || document.status === 'processing';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'group flex items-center gap-3 p-3 sm:p-4 rounded-xl transition-all',
        'hover:bg-[#144368]/5',
        isApproved && 'bg-[#144368]/5',
        hasIssue && 'bg-[#fef9f0]'
      )}
    >
      {/* File icon */}
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
        isApproved && 'bg-[#144368]/10',
        hasIssue && 'bg-[#f59e0b]/20',
        isPending && 'bg-[#e5e7eb]',
        !isApproved && !hasIssue && !isPending && 'bg-[#144368]/10'
      )}>
        <FileText className={cn(
          'w-5 h-5',
          isApproved && 'text-[#144368]',
          hasIssue && 'text-[#d97706]',
          isPending && 'text-[#6b7280]',
          !isApproved && !hasIssue && !isPending && 'text-[#144368]'
        )} />
      </div>

      {/* Document info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-[#144368] truncate text-sm sm:text-base">
            {document.name}
          </p>
          {isApproved && (
            <CheckCircle2 className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
          )}
          {hasIssue && (
            <AlertTriangle className="w-4 h-4 text-[#f59e0b] flex-shrink-0" />
          )}
          {isPending && (
            <Clock className="w-4 h-4 text-[#9ca3af] flex-shrink-0" />
          )}
        </div>
        {document.uploadedAt && (
          <p className="text-xs text-[#144368]/50 mt-0.5">
            Uploaded {formatDate(document.uploadedAt, 'short')}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="w-8 h-8 rounded-lg bg-[#144368]/5 hover:bg-[#144368]/10 flex items-center justify-center transition-colors">
          <Eye className="w-4 h-4 text-[#144368]/60" />
        </button>
        <button className="w-8 h-8 rounded-lg bg-[#144368]/5 hover:bg-[#144368]/10 flex items-center justify-center transition-colors">
          <Download className="w-4 h-4 text-[#144368]/60" />
        </button>
      </div>
    </motion.div>
  );
}

interface CategorySectionProps {
  category: DocumentCategory;
  documents: Document[];
  defaultOpen?: boolean;
}

function CategorySection({ category, documents, defaultOpen = true }: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const Icon = categoryIcons[category];
  const approvedCount = documents.filter(d => d.status === 'approved').length;

  return (
    <div className="rounded-xl border-2 border-[#144368]/10 bg-white overflow-hidden">
      {/* Category header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#144368]/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#144368]/5 flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#144368]" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-[#144368]">{categoryLabels[category]}</p>
            <p className="text-xs text-[#144368]/50">
              {approvedCount}/{documents.length} verified
            </p>
          </div>
        </div>
        <ChevronDown className={cn(
          'w-5 h-5 text-[#144368]/30 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      {/* Documents list */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#144368]/10 divide-y divide-[#144368]/5">
              {documents.map((doc) => (
                <DocumentItem key={doc.id} document={doc} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DocumentVault({ documents }: DocumentVaultProps) {
  // Group documents by category
  const groupedDocs = documents.reduce((acc, doc) => {
    const category = doc.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(doc);
    return acc;
  }, {} as Record<DocumentCategory, Document[]>);

  const categories = Object.keys(groupedDocs) as DocumentCategory[];
  const totalApproved = documents.filter(d => d.status === 'approved').length;
  const totalDocs = documents.length;

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 px-6 rounded-2xl bg-[#144368]/5 border-2 border-dashed border-[#144368]/20">
        <Folder className="w-12 h-12 text-[#144368]/30 mx-auto mb-3" />
        <h3 className="font-semibold text-[#144368]/60 mb-1">No documents yet</h3>
        <p className="text-sm text-[#144368]/40">Your uploaded documents will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#144368]/5 flex items-center justify-center">
            <Folder className="w-5 h-5 text-[#144368]" />
          </div>
          <div>
            <h3 className="font-bold text-[#144368]">Your Documents</h3>
            <p className="text-sm text-[#144368]/60">
              {totalApproved} of {totalDocs} verified
            </p>
          </div>
        </div>

        {/* Download all button */}
        <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[#144368]/10 hover:border-[#144368]/30 hover:bg-[#144368]/5 text-sm font-medium text-[#144368]/70 hover:text-[#144368] transition-all">
          <Download className="w-4 h-4" />
          Download All
        </button>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-[#144368]/10 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#144368] to-[#1a5a8a] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(totalApproved / totalDocs) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {categories.map((category, index) => (
          <CategorySection
            key={category}
            category={category}
            documents={groupedDocs[category]}
            defaultOpen={index === 0}
          />
        ))}
      </div>
    </div>
  );
}
