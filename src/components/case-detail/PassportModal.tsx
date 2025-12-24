'use client';

import { useEffect } from 'react';
import { X, FileCheck, Calendar, MapPin, User, Hash, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PassportInfo, Document } from '@/types';

interface PassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  passport: PassportInfo;
  passportDocument?: Document;
}

export function PassportModal({
  isOpen,
  onClose,
  passport,
  passportDocument,
}: PassportModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const fullName = `${passport.givenNames} ${passport.surname}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          'relative w-full max-w-lg mx-4',
          'bg-gradient-to-b from-slate-50 to-white',
          'rounded-2xl shadow-2xl',
          'overflow-hidden',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}
      >
        {/* Header - Document Style */}
        <div className="relative bg-gradient-to-r from-rose-800 via-rose-900 to-rose-800 px-6 py-5">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 left-4 w-20 h-20 border border-white/30 rounded-full" />
            <div className="absolute bottom-0 right-0 w-32 h-32 border border-white/20 rounded-full translate-x-1/2 translate-y-1/2" />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 text-rose-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header content */}
          <div className="relative flex items-center gap-4">
            {/* Passport icon */}
            <div className="w-14 h-18 rounded bg-gradient-to-br from-rose-700 to-rose-950 flex items-center justify-center shadow-lg border border-rose-600/30">
              <div className="w-10 h-10 rounded-full border-2 border-amber-400/60 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-amber-400/50" />
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-widest text-rose-200 font-medium mb-1">
                Passport Details
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {fullName}
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-rose-100 text-xs font-medium">
                  <Globe className="w-3 h-3" />
                  {passport.nationality}
                </span>
                {passportDocument?.pipelineStatus === 'ready' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-medium">
                    <FileCheck className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Personal Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <InfoField
              icon={User}
              label="Given Names"
              value={passport.givenNames}
            />
            <InfoField
              icon={User}
              label="Surname"
              value={passport.surname}
            />
            <InfoField
              icon={Calendar}
              label="Date of Birth"
              value={formatDate(passport.dateOfBirth)}
            />
            <InfoField
              icon={User}
              label="Sex"
              value={passport.sex === 'M' ? 'Male' : 'Female'}
            />
            <InfoField
              icon={MapPin}
              label="Country of Birth"
              value={passport.countryOfBirth}
            />
            <InfoField
              icon={Globe}
              label="Nationality"
              value={passport.nationality}
            />
          </div>

          {/* Divider */}
          <div className="my-5 border-t border-slate-200" />

          {/* Passport Details */}
          <h3 className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-3">
            Document Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <InfoField
              icon={Hash}
              label="Passport Number"
              value={passport.passportNumber}
              mono
            />
            <InfoField
              icon={Calendar}
              label="Date of Issue"
              value={formatDate(passport.dateOfIssue)}
            />
            <InfoField
              icon={Calendar}
              label="Date of Expiry"
              value={formatDate(passport.dateOfExpiry)}
              highlight={isExpiringSoon(passport.dateOfExpiry)}
            />
          </div>

          {/* MRZ Section */}
          {(passport.mrzLine1 || passport.mrzLine2) && (
            <>
              <div className="my-5 border-t border-slate-200" />
              <h3 className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-3">
                Machine Readable Zone
              </h3>
              <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-300 space-y-1 overflow-x-auto">
                <div className="tracking-[0.15em]">{passport.mrzLine1}</div>
                <div className="tracking-[0.15em]">{passport.mrzLine2}</div>
              </div>
            </>
          )}

          {/* Data Source Indicator */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Data extracted from uploaded passport document</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface InfoFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}

function InfoField({ icon: Icon, label, value, mono, highlight }: InfoFieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Icon className="w-3.5 h-3.5" />
        <span className="uppercase tracking-wider font-medium">{label}</span>
      </div>
      <div
        className={cn(
          'text-sm font-semibold text-slate-800',
          mono && 'font-mono tracking-wide',
          highlight && 'text-amber-600'
        )}
      >
        {value}
      </div>
    </div>
  );
}

function isExpiringSoon(expiryDate: string): boolean {
  try {
    const expiry = new Date(expiryDate);
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    return expiry <= sixMonthsFromNow;
  } catch {
    return false;
  }
}
