'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  Briefcase,
  Building2,
  CreditCard,
  Heart,
  GraduationCap,
  Languages,
  Home,
  Shield,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEvidenceTemplateForVisaType } from '@/data/evidence-templates';
import { VISA_TYPES } from '@/data/constants';
import type { VisaType, PassportInfo } from '@/types';

interface ChecklistHeroProps {
  visaType: VisaType;
  passport: PassportInfo;
  referenceNumber: string;
  onUpload: (files: File[]) => void;
}

// Icon mapping for different evidence categories
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  identity: FileText,
  passport: FileText,
  employment: Briefcase,
  financial: CreditCard,
  accommodation: Home,
  relationship: Heart,
  education: GraduationCap,
  language: Languages,
  sponsor: Building2,
  character: Shield,
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
 * ChecklistHero - Full-width hero view for empty cases
 *
 * Shows a unified upload zone and read-only checklist grid.
 * When files are uploaded, AI auto-categorizes them.
 */
export function ChecklistHero({
  visaType,
  passport,
  referenceNumber,
  onUpload,
}: ChecklistHeroProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const visaConfig = VISA_TYPES[visaType];
  const evidenceSlots = useMemo(() => getEvidenceTemplateForVisaType(visaType), [visaType]);

  // Split into required and optional
  const requiredSlots = evidenceSlots.filter(s => s.priority === 'required');
  const optionalSlots = evidenceSlots.filter(s => s.priority === 'optional');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setIsUploading(true);
      // Simulate processing delay
      setTimeout(() => {
        onUpload(files);
        setIsUploading(false);
      }, 1500);
    }
  }, [onUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setIsUploading(true);
      setTimeout(() => {
        onUpload(files);
        setIsUploading(false);
      }, 1500);
    }
  }, [onUpload]);

  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  // Item animation
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-auto relative">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(14, 67, 105, 0.5) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-emerald-100/15 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <motion.div
        className="relative max-w-4xl mx-auto w-full px-8 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Progress Header */}
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">
            Welcome! Let's Build Your Case
          </h1>
          <p className="text-slate-500 mb-6">
            Upload the required documents for {passport.givenNames}'s {visaConfig.label} application. We'll guide you through each step.
          </p>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex gap-1">
              {Array.from({ length: requiredSlots.length }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'h-2 flex-1 rounded-sm transition-colors',
                    index === 0 ? 'bg-[#0E4369]' : 'bg-slate-200'
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-900">0%</span> Complete · {requiredSlots.length} required items
            </p>
          </div>
        </motion.div>

        {/* Case Info Badge */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 mb-8">
          <span className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm text-slate-600">
            {passport.givenNames} {passport.surname}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm text-slate-600">
            Ref. {referenceNumber}
          </span>
        </motion.div>

        {/* Upload Zone */}
        <motion.div variants={itemVariants} className="mb-12">
          <div
            className={cn(
              'relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden',
              isDragging
                ? 'border-primary-400 bg-primary-50/50'
                : 'border-slate-200 hover:border-slate-300 bg-white',
              isUploading && 'pointer-events-none'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileSelect}
              disabled={isUploading}
            />

            <div className="px-8 py-12 text-center">
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-4">
                    <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    Processing documents...
                  </p>
                  <p className="text-xs text-slate-400">
                    AI is categorizing your files
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-200 transition-colors">
                    <Upload className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    Drop files here or click to browse
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                    <Sparkles className="w-3.5 h-3.5 text-primary-500" />
                    <span>AI will automatically categorize your documents</span>
                  </div>
                </>
              )}
            </div>

            {/* Drag overlay */}
            {isDragging && (
              <motion.div
                className="absolute inset-0 bg-primary-500/5 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-sm font-medium text-primary-600">
                  Release to upload
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Checklist Grid */}
        <motion.div variants={itemVariants}>
          {/* Required Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Required Evidence
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold">
                {requiredSlots.length} items
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {requiredSlots.map((slot, index) => (
                <ChecklistCard
                  key={slot.id}
                  slot={slot}
                  index={index}
                  variants={itemVariants}
                />
              ))}
            </div>
          </div>

          {/* Optional Section */}
          {optionalSlots.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Optional Evidence
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold">
                  {optionalSlots.length} items
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {optionalSlots.map((slot, index) => (
                  <ChecklistCard
                    key={slot.id}
                    slot={slot}
                    index={index + requiredSlots.length}
                    variants={itemVariants}
                    isOptional
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer tip */}
        <motion.p
          variants={itemVariants}
          className="text-center text-xs text-slate-400 mt-10"
        >
          Upload any document type and we'll match it to the right category
        </motion.p>
      </motion.div>
    </div>
  );
}

interface ChecklistCardProps {
  slot: {
    id: string;
    name: string;
    description?: string;
    priority: 'required' | 'optional' | 'conditional';
    minCount?: number;
  };
  index: number;
  variants: Record<string, unknown>;
  isOptional?: boolean;
}

function ChecklistCard({ slot, isOptional }: ChecklistCardProps) {
  const Icon = getCategoryIcon(slot.id);

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 bg-white rounded-xl border transition-colors',
        isOptional
          ? 'border-slate-100 opacity-60'
          : 'border-slate-150'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
          isOptional ? 'bg-slate-50' : 'bg-primary-50'
        )}
      >
        <Icon
          className={cn(
            'w-4 h-4',
            isOptional ? 'text-slate-400' : 'text-primary-600'
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate">
          {slot.name}
        </p>
        {slot.minCount && slot.minCount > 1 && (
          <p className="text-[10px] text-slate-400">
            {slot.minCount}+ documents
          </p>
        )}
      </div>

      {/* Empty indicator */}
      <div className="w-5 h-5 rounded-full border-2 border-dashed border-slate-200 flex-shrink-0" />
    </div>
  );
}
