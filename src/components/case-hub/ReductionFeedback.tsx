'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { CheckCircle2, Minus } from 'lucide-react';

interface ReductionFeedbackProps {
  /** Section labels that were removed */
  removedLabels: string[];
  /** Whether to show the feedback */
  isVisible: boolean;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
  /** Auto-hide duration in ms (default: 2500) */
  autoHideDuration?: number;
}

/**
 * ReductionFeedback - Toast showing sections removed from checklist
 *
 * Provides immediate visual feedback when a selection removes form sections.
 * Creates a sense of accomplishment and progress.
 *
 * Animation sequence:
 * 1. Toast slides up from bottom
 * 2. Checkmark icon pops in
 * 3. Section labels stagger in
 * 4. Auto-dismiss after delay
 */
export function ReductionFeedback({
  removedLabels,
  isVisible,
  onAnimationComplete,
  autoHideDuration = 2500,
}: ReductionFeedbackProps) {
  const [shouldShow, setShouldShow] = useState(false);

  // Handle visibility with auto-hide
  useEffect(() => {
    if (isVisible && removedLabels.length > 0) {
      setShouldShow(true);

      const timer = setTimeout(() => {
        setShouldShow(false);
        onAnimationComplete?.();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    } else {
      setShouldShow(false);
    }
  }, [isVisible, removedLabels, autoHideDuration, onAnimationComplete]);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className="fixed bottom-8 left-1/2 z-50"
          initial={{ opacity: 0, y: 30, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 10, x: '-50%' }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
          }}
        >
          <div className="bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-100 px-5 py-4 min-w-[280px] max-w-[400px]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 15,
                  delay: 0.1,
                }}
              >
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
              </motion.div>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {removedLabels.length} section{removedLabels.length > 1 ? 's' : ''} simplified
                </p>
                <p className="text-xs text-slate-400">
                  Removed from checklist
                </p>
              </div>
            </div>

            {/* Removed sections list */}
            <div className="space-y-1.5 pl-11">
              {removedLabels.map((label, index) => (
                <motion.div
                  key={label}
                  className="flex items-center gap-2 text-xs text-slate-500"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 24,
                    delay: 0.2 + index * 0.05,
                  }}
                >
                  <Minus className="w-3 h-3 text-slate-300" />
                  <span className="line-through decoration-slate-300">{label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
