'use client';

import { motion } from 'framer-motion';
import { Upload, Send, Check, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EvidenceSlotTemplate } from '@/types';

type EmptyStateType = 'no_content' | 'no_documents' | 'complete';

interface SectionEmptyStateProps {
  type: EmptyStateType;
  section?: EvidenceSlotTemplate;
  onUploadClick?: () => void;
  onRequestClient?: () => void;
  className?: string;
}

/**
 * Floating document illustration with subtle animation
 */
function FloatingDocumentIllustration() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-8">
      {/* Background glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white rounded-3xl"
      />

      {/* Dotted border ring */}
      <motion.div
        initial={{ opacity: 0, rotate: -10 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="absolute inset-2 rounded-2xl border-2 border-dashed border-slate-200"
      />

      {/* Main document icon */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative">
          {/* Document shadow */}
          <div className="absolute inset-0 translate-y-2 translate-x-1 bg-slate-200/50 rounded-lg blur-sm"
               style={{ width: 48, height: 56 }} />

          {/* Document */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative bg-white rounded-lg shadow-lg border border-slate-100 flex flex-col items-center justify-center"
            style={{ width: 48, height: 56 }}
          >
            <div className="w-6 h-0.5 bg-slate-200 rounded mb-1.5" />
            <div className="w-8 h-0.5 bg-slate-200 rounded mb-1.5" />
            <div className="w-5 h-0.5 bg-slate-200 rounded" />
          </motion.div>

          {/* Sparkle accent */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
          </motion.div>
        </div>
      </motion.div>

      {/* Decorative corner dots */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
          className="absolute w-1.5 h-1.5 rounded-full bg-slate-300"
          style={{
            top: i < 2 ? 8 : 'auto',
            bottom: i >= 2 ? 8 : 'auto',
            left: i % 2 === 0 ? 8 : 'auto',
            right: i % 2 === 1 ? 8 : 'auto',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Accepted document type chip with hover effect
 */
function DocumentTypeChip({
  label,
  isPreferred,
  index
}: {
  label: string;
  isPreferred?: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
      whileHover={{ scale: 1.02, y: -1 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors',
        isPreferred
          ? 'bg-[#0E4369]/5 text-[#0E4369] border border-[#0E4369]/10'
          : 'bg-slate-100 text-slate-600 border border-transparent hover:border-slate-200'
      )}
    >
      <FileText className="w-3 h-3" />
      {label}
      {isPreferred && (
        <span className="px-1.5 py-0.5 bg-[#0E4369]/10 text-[#0E4369] text-[9px] font-semibold rounded">
          Preferred
        </span>
      )}
    </motion.div>
  );
}

/**
 * Action button with refined styling
 */
function ActionButton({
  variant,
  icon: Icon,
  label,
  onClick,
  delay,
}: {
  variant: 'primary' | 'secondary';
  icon: typeof Upload;
  label: string;
  onClick?: () => void;
  delay: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'group relative inline-flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
        variant === 'primary' && [
          'bg-[#0E4369] text-white',
          'shadow-lg shadow-[#0E4369]/20',
          'hover:bg-[#0c3a5a] hover:shadow-xl hover:shadow-[#0E4369]/25',
        ],
        variant === 'secondary' && [
          'bg-white text-slate-700 border border-slate-200',
          'shadow-sm',
          'hover:bg-slate-50 hover:border-slate-300',
        ]
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
      <motion.span
        initial={{ x: 0, opacity: 0 }}
        whileHover={{ x: 3, opacity: 1 }}
        className="absolute right-3"
      >
        <ArrowRight className={cn(
          'w-4 h-4 transition-colors',
          variant === 'primary' ? 'text-white/70' : 'text-slate-400'
        )} />
      </motion.span>
    </motion.button>
  );
}

/**
 * Empty state: Case just created, no content at all
 */
function NoContentState({ onUploadClick }: { onUploadClick?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <FloatingDocumentIllustration />

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="text-xl font-semibold text-slate-900 mb-2 tracking-tight"
      >
        Upload Documents
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="text-sm text-slate-500 text-center max-w-sm mb-8 leading-relaxed"
      >
        Start by uploading your client&apos;s documents. Our AI will automatically
        categorize and verify them.
      </motion.p>

      <ActionButton
        variant="primary"
        icon={Upload}
        label="Upload Files"
        onClick={onUploadClick}
        delay={0.4}
      />
    </div>
  );
}

/**
 * Empty state: Section has no documents - Premium landing page design
 */
function NoDocumentsState({
  section,
  onUploadClick,
  onRequestClient,
}: {
  section: EvidenceSlotTemplate;
  onUploadClick?: () => void;
  onRequestClient?: () => void;
}) {
  const acceptableTypes = section.acceptableTypes || [];
  const preferredTypes = acceptableTypes.filter(t => t.isPreferred);
  const otherTypes = acceptableTypes.filter(t => !t.isPreferred);
  const displayTypes = [...preferredTypes, ...otherTypes].slice(0, 4);

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-8 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="pending-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pending-grid)" />
        </svg>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-lg w-full">
        {/* Illustration */}
        <FloatingDocumentIllustration />

        {/* Section badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="flex justify-center mb-4"
        >
          <span className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide',
            section.priority === 'required'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-slate-100 text-slate-500'
          )}>
            <span className={cn(
              'w-1.5 h-1.5 rounded-full',
              section.priority === 'required' ? 'bg-amber-500' : 'bg-slate-400'
            )} />
            {section.priority === 'required' ? 'Required' : section.priority}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-2xl font-semibold text-slate-900 text-center mb-2 tracking-tight"
        >
          {section.name}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="text-sm text-slate-500 text-center mb-6 leading-relaxed"
        >
          {section.description}
        </motion.p>

        {/* Acceptable document types */}
        {displayTypes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mb-8"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 text-center mb-3">
              Accepted Documents
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {displayTypes.map((type, index) => (
                <DocumentTypeChip
                  key={type.typeId}
                  label={type.label}
                  isPreferred={type.isPreferred}
                  index={index}
                />
              ))}
              {acceptableTypes.length > 4 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-[11px] text-slate-400 self-center"
                >
                  +{acceptableTypes.length - 4} more
                </motion.span>
              )}
            </div>
          </motion.div>
        )}

        {/* Divider with "or" */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-slate-200" />
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
            Choose an action
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-200 to-slate-200" />
        </motion.div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <ActionButton
            variant="primary"
            icon={Send}
            label="Request from Client"
            onClick={onRequestClient}
            delay={0.55}
          />
          <ActionButton
            variant="secondary"
            icon={Upload}
            label="Upload Yourself"
            onClick={onUploadClick}
            delay={0.6}
          />
        </div>

        {/* Helper text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="text-[11px] text-slate-400 text-center mt-6"
        >
          We&apos;ll notify the client via their preferred channel
        </motion.p>
      </div>
    </div>
  );
}

/**
 * Empty state: Section is complete
 */
function CompleteState({ section }: { section: EvidenceSlotTemplate }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-8">
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative w-20 h-20 mb-6"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute inset-0 bg-emerald-100 rounded-full"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="absolute inset-2 bg-emerald-500 rounded-full flex items-center justify-center"
        >
          <Check className="w-8 h-8 text-white" strokeWidth={3} />
        </motion.div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="text-lg font-semibold text-slate-900 mb-1"
      >
        All Documents Verified
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-slate-500 text-center max-w-xs"
      >
        {section.name} section is complete with no open issues.
      </motion.p>
    </div>
  );
}

/**
 * SectionEmptyState - Contextual empty state for different scenarios
 */
export function SectionEmptyState({
  type,
  section,
  onUploadClick,
  onRequestClient,
  className,
}: SectionEmptyStateProps) {
  return (
    <div className={cn('bg-white', className)}>
      {type === 'no_content' && (
        <NoContentState onUploadClick={onUploadClick} />
      )}
      {type === 'no_documents' && section && (
        <NoDocumentsState
          section={section}
          onUploadClick={onUploadClick}
          onRequestClient={onRequestClient}
        />
      )}
      {type === 'complete' && section && (
        <CompleteState section={section} />
      )}
    </div>
  );
}
