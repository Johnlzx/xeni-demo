'use client';

import { motion, type Variants } from 'framer-motion';
import { useMemo } from 'react';
import {
  FileText,
  Briefcase,
  Building2,
  CreditCard,
  Heart,
  GraduationCap,
  Languages,
  Home,
  Shield,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEvidenceTemplateForVisaType } from '@/data/evidence-templates';
import { VISA_TYPES } from '@/data/constants';
import type { VisaType, PassportInfo } from '@/types';

interface NewCaseChecklistProps {
  visaType: VisaType;
  passport: PassportInfo;
  referenceNumber: string;
  isVisible: boolean;
  onStartIntake: () => void;
  /** Sections removed by pre-screening (slot IDs to filter out) */
  removedSections?: string[];
}

// Icon mapping for different evidence categories
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'identity': FileText,
  'passport': FileText,
  'employment': Briefcase,
  'financial': CreditCard,
  'accommodation': Home,
  'relationship': Heart,
  'education': GraduationCap,
  'language': Languages,
  'sponsor': Building2,
  'character': Shield,
};

function getCategoryIcon(slotId: string): React.ComponentType<{ className?: string }> {
  const lowerSlotId = slotId.toLowerCase();
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (lowerSlotId.includes(key)) {
      return icon;
    }
  }
  return FileText;
}

/**
 * NewCaseChecklist - Hero checklist for newly created cases
 *
 * Displays a beautiful, staggered-reveal checklist of required documents
 * for the selected visa type. Appears after the passport reveal animation.
 */
export function NewCaseChecklist({
  visaType,
  passport,
  referenceNumber,
  isVisible,
  onStartIntake,
  removedSections = [],
}: NewCaseChecklistProps) {
  const visaConfig = VISA_TYPES[visaType];
  const allEvidenceSlots = useMemo(() => getEvidenceTemplateForVisaType(visaType), [visaType]);

  // Filter out removed sections from pre-screening
  const evidenceSlots = useMemo(() => {
    if (removedSections.length === 0) return allEvidenceSlots;
    return allEvidenceSlots.filter(slot => !removedSections.includes(slot.id));
  }, [allEvidenceSlots, removedSections]);

  // Split into required and optional
  const requiredSlots = evidenceSlots.filter(s => s.priority === 'required');
  const optionalSlots = evidenceSlots.filter(s => s.priority === 'optional');

  // Calculate simplification stats
  const sectionsRemoved = allEvidenceSlots.length - evidenceSlots.length;
  const hasSimplification = sectionsRemoved > 0;

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.3,
      },
    },
  };

  // Item animation variants
  const itemVariants = {
    hidden: {
      opacity: 0,
      x: -20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 24,
      },
    },
  };

  // Header animation
  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 20,
      },
    },
  };

  // Button animation
  const buttonVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 20,
        delay: 0.8,
      },
    },
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(14, 67, 105, 0.5) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(14, 67, 105, 0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Gradient orbs */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-emerald-100/20 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div variants={headerVariants} className="text-center mb-12">
          {/* Status badges */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-700">Application Created</span>
            </motion.div>

            {/* Simplification badge */}
            {hasSimplification && (
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100"
                initial={{ opacity: 0, scale: 0.8, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.4, type: 'spring' }}
              >
                <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                <span className="text-xs font-medium text-primary-700">
                  {sectionsRemoved} section{sectionsRemoved > 1 ? 's' : ''} simplified
                </span>
              </motion.div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-semibold text-slate-900 mb-3 tracking-tight">
            {passport.givenNames} {passport.surname}
          </h1>

          {/* Subtitle */}
          <p className="text-slate-500 mb-2">
            {visaConfig.label} &middot; Ref. {referenceNumber}
          </p>

          {/* Description */}
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {hasSimplification
              ? 'Your customized evidence checklist is ready'
              : 'Complete the evidence checklist to prepare for submission'}
          </p>
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          className="flex items-center justify-center gap-6 mb-10"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
              <span className="text-xs font-semibold text-slate-400">0</span>
            </div>
            <span className="text-sm text-slate-500">of {requiredSlots.length} required</span>
          </div>

          {/* Progress bar */}
          <div className="flex-1 max-w-xs h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '0%' }}
            />
          </div>
        </motion.div>

        {/* Required Documents Section */}
        <motion.div className="mb-8" variants={containerVariants}>
          <motion.div
            className="flex items-center gap-2 mb-4"
            variants={itemVariants}
          >
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Required Documents
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-semibold">
              {requiredSlots.length} items
            </span>
          </motion.div>

          <div className="space-y-2">
            {requiredSlots.map((slot, index) => (
              <ChecklistItem
                key={slot.id}
                slot={slot}
                index={index}
                variants={itemVariants}
              />
            ))}
          </div>
        </motion.div>

        {/* Optional Documents Section */}
        {optionalSlots.length > 0 && (
          <motion.div className="mb-12" variants={containerVariants}>
            <motion.div
              className="flex items-center gap-2 mb-4"
              variants={itemVariants}
            >
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Optional Documents
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold">
                {optionalSlots.length} items
              </span>
            </motion.div>

            <div className="space-y-2">
              {optionalSlots.map((slot, index) => (
                <ChecklistItem
                  key={slot.id}
                  slot={slot}
                  index={index + requiredSlots.length}
                  variants={itemVariants}
                  isOptional
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA Button */}
        <motion.div
          className="flex justify-center"
          variants={buttonVariants}
        >
          <motion.button
            onClick={onStartIntake}
            className="group relative px-8 py-4 bg-gradient-to-b from-[#0E4369] to-[#0B3654] text-white rounded-xl font-medium shadow-lg shadow-primary-900/20 overflow-hidden"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
              animate={{ translateX: ['−100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />

            <span className="relative flex items-center gap-2">
              Start Intake Process
              <motion.svg
                className="w-4 h-4"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                initial={{ x: 0 }}
                whileHover={{ x: 3 }}
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </motion.svg>
            </span>
          </motion.button>
        </motion.div>

        {/* Footer tip */}
        <motion.p
          className="text-center text-xs text-slate-400 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          Pro tip: You can drag and drop documents directly onto checklist items
        </motion.p>
      </div>
    </motion.div>
  );
}

interface ChecklistItemProps {
  slot: {
    id: string;
    name: string;
    description?: string;
    priority: 'required' | 'optional' | 'conditional';
    minCount?: number;
  };
  index: number;
  variants: Variants;
  isOptional?: boolean;
}

function ChecklistItem({ slot, index, variants, isOptional }: ChecklistItemProps) {
  const Icon = getCategoryIcon(slot.id);

  return (
    <motion.div
      variants={variants}
      className={cn(
        'group relative flex items-center gap-4 p-4 bg-white rounded-xl border transition-all duration-200 cursor-pointer',
        'hover:border-slate-200 hover:shadow-md hover:shadow-slate-100/50',
        isOptional
          ? 'border-slate-100 opacity-70 hover:opacity-100'
          : 'border-slate-150'
      )}
      whileHover={{ x: 4 }}
    >
      {/* Checkbox circle */}
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
          isOptional
            ? 'bg-slate-50 group-hover:bg-slate-100'
            : 'bg-primary-50 group-hover:bg-primary-100'
        )}
      >
        <Icon
          className={cn(
            'w-5 h-5 transition-colors',
            isOptional
              ? 'text-slate-400 group-hover:text-slate-500'
              : 'text-primary-600'
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-slate-800 group-hover:text-slate-900">
            {slot.name}
          </h3>
          {slot.minCount && slot.minCount > 1 && (
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-500">
              {slot.minCount}+ docs
            </span>
          )}
        </div>
        {slot.description && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {slot.description}
          </p>
        )}
      </div>

      {/* Status indicator */}
      <div className="flex-shrink-0">
        <div className="w-6 h-6 rounded-full border-2 border-dashed border-slate-200 group-hover:border-slate-300 transition-colors" />
      </div>

      {/* Hover arrow */}
      <motion.div
        className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity"
        initial={{ x: -5 }}
        whileHover={{ x: 0 }}
      >
        <svg
          className="w-4 h-4 text-slate-400"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        >
          <path d="M6 4l4 4-4 4" />
        </svg>
      </motion.div>
    </motion.div>
  );
}
