'use client';

import {
  Globe,
  FileCheck,
  User,
  Calendar,
  MapPin,
  Hash,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { getPassportColorScheme, getPassportBookColors } from '@/lib/passport-colors';
import type { PassportInfo } from '@/types';

interface PassportInfoCardProps {
  passport: PassportInfo;
  isVerified?: boolean;
  className?: string;
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
        'w-12 h-[60px] rounded-lg shadow-lg relative overflow-hidden bg-gradient-to-b',
        colors.gradient
      )}>
        {/* Spine shadow */}
        <div className={cn(
          'absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-r to-transparent',
          colors.spine
        )} />
        {/* Cover emboss */}
        <div className={cn('absolute inset-2 border rounded', colors.border)} />
        {/* Emblem */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            'w-6 h-6 rounded-full border-2 flex items-center justify-center',
            colors.emblem
          )}>
            <div className={cn('w-4 h-4 rounded-full', colors.emblemInner)} />
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

// Compact Info Field
function InfoField({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1">
        <Icon className="w-3 h-3 text-slate-400" />
        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className={cn(
        'text-xs font-semibold',
        highlight ? 'text-amber-600' : 'text-slate-900'
      )}>
        {value}
      </p>
    </div>
  );
}

// Check if date is expiring within 6 months
function isExpiringSoon(dateString: string): boolean {
  const expiryDate = new Date(dateString);
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  return expiryDate <= sixMonthsFromNow;
}

export function PassportInfoCard({
  passport,
  isVerified = true,
  className,
}: PassportInfoCardProps) {
  const colorScheme = getPassportColorScheme(passport.nationality);
  const fullName = `${passport.givenNames} ${passport.surname}`;
  const expiryWarning = isExpiringSoon(passport.dateOfExpiry);

  return (
    <div className={cn('rounded-xl overflow-hidden border border-slate-200', className)}>
      {/* Header with gradient */}
      <div className={cn(
        'relative px-4 py-3 bg-gradient-to-br',
        colorScheme.from,
        colorScheme.via,
        colorScheme.to
      )}>
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="passport-card-pattern" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.5" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#passport-card-pattern)" />
          </svg>
        </div>

        {/* Header content */}
        <div className="relative flex items-center gap-3">
          <PassportBookIcon nationality={passport.nationality} />
          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-[9px] font-semibold uppercase tracking-wider mb-0.5',
              colorScheme.textMuted
            )}>
              Passport Details
            </p>
            <h3 className={cn('text-base font-bold truncate', colorScheme.text)}>
              {fullName}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/15 text-white/90 text-[10px] font-medium">
                <Globe className="w-2.5 h-2.5" />
                {passport.nationality}
              </span>
              {isVerified && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/15 text-white/90 text-[10px] font-medium">
                  <FileCheck className="w-2.5 h-2.5" />
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 bg-white space-y-4">
        {/* Personal Information - 2x3 grid */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-3">
          <InfoField icon={User} label="Given Names" value={passport.givenNames} />
          <InfoField icon={User} label="Surname" value={passport.surname} />
          <InfoField icon={Calendar} label="Date of Birth" value={formatDate(passport.dateOfBirth)} />
          <InfoField icon={User} label="Sex" value={passport.sex === 'M' ? 'Male' : 'Female'} />
          <InfoField icon={MapPin} label="Country of Birth" value={passport.countryOfBirth} />
          <InfoField icon={Globe} label="Nationality" value={passport.nationality} />
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Document Information - single row */}
        <div className="grid grid-cols-3 gap-x-4">
          <InfoField icon={Hash} label="Passport Number" value={passport.passportNumber} />
          <InfoField icon={Calendar} label="Date of Issue" value={formatDate(passport.dateOfIssue)} />
          <InfoField
            icon={Calendar}
            label="Date of Expiry"
            value={formatDate(passport.dateOfExpiry)}
            highlight={expiryWarning}
          />
        </div>

        {/* MRZ */}
        <div className="bg-slate-900 rounded-lg p-3 font-mono text-[10px] text-slate-400 tracking-wider overflow-x-auto">
          <div className="whitespace-nowrap">{passport.mrzLine1}</div>
          <div className="whitespace-nowrap">{passport.mrzLine2}</div>
        </div>
      </div>
    </div>
  );
}
