'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PreScreeningQuestion, PreScreeningOption } from '@/data/prescreening-questions';

interface PreScreeningCardProps {
  question: PreScreeningQuestion;
  selectedValue?: string | boolean;
  onSelect: (value: string | boolean) => void;
  isAnimatingOut?: boolean;
}

/**
 * PreScreeningCard - Single question card with tile-based options
 *
 * Design principles (from PRD):
 * - Single card focus: one question at a time
 * - Large clickable tiles: min 160x120px
 * - Icon + label + sublabel
 * - Click triggers selection + auto-advance
 *
 * B2B professional aesthetic:
 * - Clean, refined typography
 * - Subtle animations
 * - Professional color palette
 */
export function PreScreeningCard({
  question,
  selectedValue,
  onSelect,
  isAnimatingOut = false,
}: PreScreeningCardProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 24,
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.98,
      transition: { duration: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate={isAnimatingOut ? 'exit' : 'visible'}
      exit="exit"
    >
      {/* Question header */}
      <motion.div className="text-center mb-10" variants={itemVariants}>
        <h2 className="text-3xl font-semibold text-slate-800 mb-3 tracking-tight">
          {question.question}
        </h2>
        {question.subtitle && (
          <p className="text-base text-slate-500 max-w-lg mx-auto">
            {question.subtitle}
          </p>
        )}
      </motion.div>

      {/* Option tiles */}
      <motion.div
        className={cn(
          'grid gap-4',
          question.options.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'
        )}
        variants={itemVariants}
      >
        {question.options.map((option) => (
          <OptionTile
            key={option.id}
            option={option}
            isSelected={selectedValue === option.value}
            onSelect={() => onSelect(option.value)}
            hasMultipleInRow={question.options.length <= 2}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

interface OptionTileProps {
  option: PreScreeningOption;
  isSelected: boolean;
  onSelect: () => void;
  hasMultipleInRow: boolean;
}

function OptionTile({ option, isSelected, onSelect, hasMultipleInRow }: OptionTileProps) {
  const Icon = option.icon;

  return (
    <motion.button
      onClick={onSelect}
      className={cn(
        'group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-colors duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        hasMultipleInRow ? 'min-h-[180px]' : 'min-h-[120px] sm:min-h-[160px]',
        isSelected
          ? 'border-primary-500 bg-primary-50/50'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
      )}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      {/* Selection indicator */}
      <motion.div
        className={cn(
          'absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
          isSelected
            ? 'border-primary-500 bg-primary-500'
            : 'border-slate-200 bg-white group-hover:border-slate-300'
        )}
        animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.2 }}
      >
        {isSelected && (
          <motion.svg
            className="w-3 h-3 text-white"
            viewBox="0 0 12 12"
            fill="none"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <path
              d="M2 6L5 9L10 3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </motion.div>

      {/* Icon */}
      <div
        className={cn(
          'w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors',
          isSelected
            ? 'bg-primary-100'
            : 'bg-slate-100 group-hover:bg-slate-200/70'
        )}
      >
        <Icon
          className={cn(
            'w-7 h-7 transition-colors',
            isSelected ? 'text-primary-600' : 'text-slate-500 group-hover:text-slate-600'
          )}
        />
      </div>

      {/* Label */}
      <span
        className={cn(
          'text-base font-medium transition-colors text-center',
          isSelected ? 'text-primary-700' : 'text-slate-700'
        )}
      >
        {option.label}
      </span>

      {/* Sublabel */}
      {option.sublabel && (
        <span className="text-sm text-slate-400 mt-1.5 text-center max-w-[180px]">
          {option.sublabel}
        </span>
      )}
    </motion.button>
  );
}
