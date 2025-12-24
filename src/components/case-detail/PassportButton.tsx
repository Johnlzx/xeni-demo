'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PassportInfo, Document } from '@/types';
import { PassportModal } from './PassportModal';

interface PassportButtonProps {
  passport: PassportInfo;
  passportDocument?: Document;
  className?: string;
}

export function PassportButton({
  passport,
  passportDocument,
  className,
}: PassportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fullName = `${passport.givenNames} ${passport.surname}`;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={cn(
          'group inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg',
          'bg-slate-50 hover:bg-slate-100',
          'border border-slate-200 hover:border-slate-300',
          'transition-all duration-150 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1',
          className
        )}
      >
        {/* Passport Icon - Compact */}
        <div className="w-5 h-6 rounded-[3px] bg-gradient-to-br from-rose-600 to-rose-700 flex items-center justify-center flex-shrink-0">
          <div className="w-3 h-3 rounded-full border border-amber-300/70" />
        </div>

        {/* Name */}
        <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">
          {fullName}
        </span>

        {/* Arrow */}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-150 flex-shrink-0" />
      </button>

      <PassportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        passport={passport}
        passportDocument={passportDocument}
      />
    </>
  );
}
