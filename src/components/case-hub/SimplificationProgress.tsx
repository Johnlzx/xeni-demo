'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface SimplificationProgressProps {
  /** Current simplification percentage (0-100) */
  percentage: number;
  /** Current card number (1-indexed) */
  currentCard: number;
  /** Total number of cards */
  totalCards: number;
}

/**
 * SimplificationProgress - Top progress bar showing form reduction
 *
 * Displays:
 * - Card progress indicator (1/4, 2/4, etc.)
 * - Reverse progress bar showing simplification percentage
 * - Animated number counter for percentage
 *
 * The "reverse" concept: instead of showing completion,
 * we show how much complexity has been removed.
 */
export function SimplificationProgress({
  percentage,
  currentCard,
  totalCards,
}: SimplificationProgressProps) {
  // Animated percentage counter with spring physics
  const springPercentage = useSpring(0, {
    stiffness: 100,
    damping: 30,
    mass: 1,
  });

  const displayPercentage = useTransform(springPercentage, (value) =>
    Math.round(value)
  );

  // Update spring when percentage changes
  useEffect(() => {
    springPercentage.set(percentage);
  }, [percentage, springPercentage]);

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-3">
        {/* Card progress */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Question
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalCards }).map((_, i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  i < currentCard
                    ? 'bg-primary-500'
                    : i === currentCard
                    ? 'bg-primary-400'
                    : 'bg-slate-200'
                }`}
                initial={false}
                animate={{
                  scale: i === currentCard ? 1.2 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500 ml-1">
            {currentCard + 1} of {totalCards}
          </span>
        </div>

        {/* Simplification indicator */}
        {percentage > 0 && (
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-600">
              <motion.span>{displayPercentage}</motion.span>% simplified
            </span>
          </motion.div>
        )}
      </div>

      {/* Progress bar track */}
      <div className="relative h-1 bg-slate-100 rounded-full overflow-hidden">
        {/* Card progress (subtle) */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-slate-200 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentCard + 1) / totalCards) * 100}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />

        {/* Simplification progress (emphasized) */}
        {percentage > 0 && (
          <motion.div
            className="absolute inset-y-0 right-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
            style={{ originX: 1 }}
          />
        )}
      </div>
    </motion.div>
  );
}
