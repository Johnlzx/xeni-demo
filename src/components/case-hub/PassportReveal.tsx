'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { PassportInfo, VisaType } from '@/types';
import { VISA_TYPES } from '@/data/constants';

interface PassportRevealProps {
  isVisible: boolean;
  passport: PassportInfo;
  visaType: VisaType;
  onComplete: () => void;
}

/**
 * PassportReveal - A skeuomorphic passport opening animation
 *
 * The animation sequence:
 * 1. Passport cover appears (scaled down, centered)
 * 2. Cover opens with 3D perspective (rotateY)
 * 3. Inner pages reveal with passport data
 * 4. Pages expand to fill screen, transitioning to checklist
 */
export function PassportReveal({
  isVisible,
  passport,
  visaType,
  onComplete,
}: PassportRevealProps) {
  const [phase, setPhase] = useState<'cover' | 'opening' | 'pages' | 'expand' | 'done'>('cover');

  useEffect(() => {
    if (!isVisible) {
      setPhase('cover');
      return;
    }

    // Phase timing
    const timers: NodeJS.Timeout[] = [];

    timers.push(setTimeout(() => setPhase('opening'), 400));
    timers.push(setTimeout(() => setPhase('pages'), 1000));
    timers.push(setTimeout(() => setPhase('expand'), 1800));
    timers.push(setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 2600));

    return () => timers.forEach(clearTimeout);
  }, [isVisible, onComplete]);

  const visaConfig = VISA_TYPES[visaType];

  return (
    <AnimatePresence>
      {isVisible && phase !== 'done' && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background - subtle gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200"
            animate={{
              opacity: phase === 'expand' ? 0 : 1,
            }}
            transition={{ duration: 0.5 }}
          />

          {/* Perspective container */}
          <div
            className="relative"
            style={{ perspective: '1200px', perspectiveOrigin: 'center center' }}
          >
            {/* Passport Book */}
            <motion.div
              className="relative"
              style={{ transformStyle: 'preserve-3d' }}
              initial={{ scale: 0.8, opacity: 0, rotateX: 15 }}
              animate={{
                scale: phase === 'expand' ? 1.5 : 1,
                opacity: phase === 'expand' ? 0 : 1,
                rotateX: 0,
                y: phase === 'expand' ? -100 : 0,
              }}
              transition={{
                duration: 0.6,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              {/* Back Cover (visible behind front when opening) */}
              <motion.div
                className="absolute inset-0 rounded-lg overflow-hidden"
                style={{
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  width: '320px',
                  height: '440px',
                }}
              >
                {/* Back cover design */}
                <div className="absolute inset-0 bg-[#0B3654] rounded-lg shadow-2xl">
                  {/* Subtle texture */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                  />
                </div>

                {/* Inner Pages */}
                <motion.div
                  className="absolute inset-2 bg-[#FDFCF7] rounded overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: phase !== 'cover' ? 1 : 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* Page lines pattern */}
                  <div className="absolute inset-0 opacity-[0.03]">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-px bg-slate-900"
                        style={{ marginTop: `${(i + 1) * 20}px` }}
                      />
                    ))}
                  </div>

                  {/* Page content - Personal data page */}
                  <motion.div
                    className="relative h-full p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: phase === 'pages' || phase === 'expand' ? 1 : 0,
                      y: phase === 'pages' || phase === 'expand' ? 0 : 20,
                    }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    {/* Header strip */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0E4369] to-[#0B3654] flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">UK</span>
                        </div>
                        <div>
                          <p className="text-[8px] text-slate-400 uppercase tracking-wider">Application</p>
                          <p className="text-[10px] font-semibold text-[#0E4369]">{visaConfig.label}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-slate-400 uppercase tracking-wider">Status</p>
                        <p className="text-[10px] font-semibold text-emerald-600">Processing</p>
                      </div>
                    </div>

                    {/* Photo placeholder */}
                    <div className="flex gap-5 mb-6">
                      <div className="w-24 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded border border-slate-200 flex items-center justify-center overflow-hidden">
                        <div className="w-16 h-20 rounded-sm bg-slate-300/50 flex items-center justify-center">
                          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>

                      {/* Personal details */}
                      <div className="flex-1 space-y-3">
                        <DataField label="Surname" value={passport.surname} />
                        <DataField label="Given Names" value={passport.givenNames} />
                        <DataField label="Nationality" value={passport.nationality} />
                        <DataField label="Date of Birth" value={formatDate(passport.dateOfBirth)} />
                      </div>
                    </div>

                    {/* Additional fields */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <DataField label="Passport No." value={passport.passportNumber} />
                      <DataField label="Sex" value={passport.sex === 'M' ? 'Male' : 'Female'} />
                      <DataField label="Date of Issue" value={formatDate(passport.dateOfIssue)} />
                      <DataField label="Date of Expiry" value={formatDate(passport.dateOfExpiry)} />
                    </div>

                    {/* MRZ zone */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-slate-50 border border-slate-200 rounded p-2 font-mono text-[7px] text-slate-500 tracking-wider leading-relaxed">
                        <div className="truncate">{passport.mrzLine1}</div>
                        <div className="truncate">{passport.mrzLine2}</div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Front Cover (opens like a book) */}
              <motion.div
                className="relative rounded-lg overflow-hidden shadow-2xl"
                style={{
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  transformOrigin: 'left center',
                  width: '320px',
                  height: '440px',
                }}
                animate={{
                  rotateY: phase === 'cover' ? 0 : -160,
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                {/* Cover background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0E4369] via-[#0B3654] to-[#082940]">
                  {/* Leather texture effect */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                  />
                </div>

                {/* Gold border accent */}
                <div className="absolute inset-3 border border-[#C9A962]/30 rounded-sm pointer-events-none" />
                <div className="absolute inset-4 border border-[#C9A962]/20 rounded-sm pointer-events-none" />

                {/* Emblem */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* Crown/emblem */}
                  <motion.div
                    className="mb-6"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="w-20 h-20 relative">
                      {/* Outer ring */}
                      <div className="absolute inset-0 rounded-full border-2 border-[#C9A962]/40" />
                      <div className="absolute inset-1 rounded-full border border-[#C9A962]/30" />

                      {/* Inner emblem */}
                      <div className="absolute inset-3 rounded-full bg-gradient-to-b from-[#C9A962]/20 to-transparent flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-[#C9A962]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2L13.09 8.26L19 7L14.74 11.74L21 14L14.74 14.74L17 21L12 16.18L7 21L9.26 14.74L3 14L9.26 11.74L5 7L10.91 8.26L12 2Z" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>

                  {/* Title text */}
                  <motion.div
                    className="text-center"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-[#C9A962]/80 text-[10px] tracking-[0.3em] uppercase mb-2">
                      United Kingdom
                    </p>
                    <h2 className="text-[#C9A962] text-lg font-serif tracking-wider">
                      VISA APPLICATION
                    </h2>
                    <p className="text-[#C9A962]/60 text-[11px] tracking-[0.2em] uppercase mt-2">
                      {visaConfig.label}
                    </p>
                  </motion.div>

                  {/* Xeni branding */}
                  <motion.div
                    className="absolute bottom-8 left-0 right-0 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="text-[#C9A962]/40 text-[9px] tracking-[0.4em] uppercase">
                      Prepared by Xeni
                    </p>
                  </motion.div>
                </div>

                {/* Spine shadow */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/30 to-transparent" />
              </motion.div>
            </motion.div>
          </div>

          {/* Transition overlay - fades to page */}
          <motion.div
            className="absolute inset-0 bg-gray-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{
              opacity: phase === 'expand' ? 1 : 0,
            }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DataField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[7px] text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-[11px] font-medium text-slate-800">{value}</p>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
