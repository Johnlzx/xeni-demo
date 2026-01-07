'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Database,
  AlertCircle,
  ClipboardList,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkspaceTab, TabConfig } from './hooks/useWorkspaceState';

interface WorkspaceTabsProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  tabConfig: TabConfig[];
}

// Icon mapping for tabs
const TAB_ICONS: Record<WorkspaceTab, React.ComponentType<{ className?: string }>> = {
  questionnaire: ClipboardList,
  documents: FileText,
  data: Database,
  audit: AlertCircle,
};

// Badge type for styling
const TAB_BADGE_TYPE: Record<WorkspaceTab, 'warning' | 'error' | 'info'> = {
  questionnaire: 'info',
  documents: 'warning',
  data: 'info',
  audit: 'error',
};

export function WorkspaceTabs({
  activeTab,
  onTabChange,
  tabConfig,
}: WorkspaceTabsProps) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="px-6">
        <nav className="flex gap-1 py-2" aria-label="Workspace tabs">
          <AnimatePresence mode="popLayout">
            {tabConfig.map((tab, index) => {
              const isActive = activeTab === tab.id;
              const Icon = TAB_ICONS[tab.id];
              const badgeType = TAB_BADGE_TYPE[tab.id];
              const isDisabled = !tab.enabled;
              const hasBadge = tab.badge && tab.badge > 0;

              return (
                <motion.button
                  key={tab.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => !isDisabled && onTabChange(tab.id)}
                  disabled={isDisabled}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2 rounded-lg',
                    'text-sm font-medium transition-all duration-200',
                    isDisabled
                      ? 'text-slate-300 cursor-not-allowed'
                      : isActive
                      ? 'text-primary-700 border border-primary-500 bg-white'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  )}
                  whileTap={isDisabled ? {} : { scale: 0.98 }}
                >
                  {/* Icon */}
                  <span className="flex items-center justify-center">
                    {isDisabled ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Icon className={cn('w-4 h-4', isActive && 'text-primary-600')} />
                    )}
                  </span>

                  {/* Label */}
                  <span>{tab.label}</span>

                  {/* Badge */}
                  <AnimatePresence>
                    {hasBadge && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className={cn(
                          'relative flex items-center justify-center min-w-[18px] h-[18px] px-1',
                          'text-[10px] font-bold rounded-full',
                          badgeType === 'error'
                            ? 'bg-rose-500 text-white'
                            : badgeType === 'warning'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-400 text-white'
                        )}
                      >
                        {tab.badge}
                        {/* Pulse animation for errors */}
                        {badgeType === 'error' && (
                          <motion.span
                            className="absolute inset-0 rounded-full bg-rose-500"
                            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Completed indicator for questionnaire */}
                  {tab.id === 'questionnaire' && !hasBadge && !isDisabled && !isActive && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </nav>
      </div>
    </div>
  );
}
