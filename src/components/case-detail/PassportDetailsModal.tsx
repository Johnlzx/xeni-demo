'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Globe,
  FileCheck,
  User,
  Calendar,
  MapPin,
  Hash,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPassportColorScheme, getPassportBookColors } from '@/lib/passport-colors';
import type { PassportInfo } from '@/types';

interface PassportDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  passport: PassportInfo;
  isVerified?: boolean;
}

// Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Check if date is expiring within 6 months
function isExpiringSoon(dateString: string): boolean {
  const expiryDate = new Date(dateString);
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  return expiryDate <= sixMonthsFromNow;
}

// Passport Book Icon Component - nationality-aware
function PassportBookIcon({
  nationality,
  className,
}: {
  nationality: string;
  className?: string;
}) {
  const colors = getPassportBookColors(nationality);

  return (
    <div className={cn('relative', className)}>
      {/* Book base */}
      <div className={cn(
        'w-14 h-[72px] rounded-lg shadow-lg relative overflow-hidden bg-gradient-to-b',
        colors.gradient
      )}>
        {/* Spine shadow */}
        <div className={cn(
          'absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r to-transparent',
          colors.spine
        )} />
        {/* Cover emboss */}
        <div className={cn('absolute inset-3 border rounded', colors.border)} />
        {/* Emblem */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            'w-8 h-8 rounded-full border-2 flex items-center justify-center',
            colors.emblem
          )}>
            <div className={cn('w-5 h-5 rounded-full', colors.emblemInner)} />
          </div>
        </div>
        {/* Page edges */}
        <div className={cn(
          'absolute right-0 top-2 bottom-2 w-1 rounded-r',
          colors.pages
        )} />
      </div>
    </div>
  );
}

// Info Field Component
function InfoField({
  icon: Icon,
  label,
  value,
  highlight,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className={cn(
        'text-sm font-semibold',
        highlight ? 'text-amber-600' : 'text-slate-900'
      )}>
        {value}
      </p>
    </div>
  );
}

export function PassportDetailsModal({
  isOpen,
  onClose,
  passport,
  isVerified = true,
}: PassportDetailsModalProps) {
  const fullName = `${passport.givenNames} ${passport.surname}`;
  const expiryWarning = isExpiringSoon(passport.dateOfExpiry);
  const colorScheme = getPassportColorScheme(passport.nationality);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header with gradient - nationality-based color */}
              <div className={cn(
                'relative px-6 py-5 bg-gradient-to-br',
                colorScheme.from,
                colorScheme.via,
                colorScheme.to
              )}>
                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <pattern id="passport-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="0.5" fill="currentColor" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#passport-pattern)" />
                  </svg>
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header content */}
                <div className="relative flex items-start gap-4">
                  <PassportBookIcon nationality={passport.nationality} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-[10px] font-semibold uppercase tracking-wider mb-1',
                      colorScheme.textMuted
                    )}>
                      Passport Details
                    </p>
                    <h2 className={cn('text-xl font-bold truncate', colorScheme.text)}>
                      {fullName}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 text-white/90 text-xs font-medium">
                        <Globe className="w-3 h-3" />
                        {passport.nationality}
                      </span>
                      {isVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 text-white/90 text-xs font-medium">
                          <FileCheck className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
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
                <div className="border-t border-slate-100" />

                {/* Document Information */}
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    Document Information
                  </p>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <InfoField
                      icon={Hash}
                      label="Passport Number"
                      value={passport.passportNumber}
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
                      highlight={expiryWarning}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100" />

                {/* Machine Readable Zone */}
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Machine Readable Zone
                  </p>
                  <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-300 tracking-wider overflow-x-auto">
                    <div className="whitespace-nowrap">{passport.mrzLine1}</div>
                    <div className="whitespace-nowrap">{passport.mrzLine2}</div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100" />

                {/* Footer */}
                <div className="flex items-center gap-2 text-slate-400">
                  <FileText className="w-4 h-4" />
                  <p className="text-xs">
                    Data extracted from uploaded passport document
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
