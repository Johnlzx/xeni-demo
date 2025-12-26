'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ApplicantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/portal';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fb] via-[#f4f6f9] to-[#eef1f5] relative overflow-hidden">
      {/* Ambient background shapes - refined navy theme */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#144368]/5 to-[#1a5a8a]/3 blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-[#e8f4fc]/60 to-[#d4e9f7]/30 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-[#144368]/3 to-[#1a5a8a]/2 blur-3xl" />

        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle, #144368 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-[#144368]/10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/portal" className="flex items-center gap-3 group">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Image
                src="/assets/Property 1=XENI DARK 1000.png"
                alt="Xeni"
                width={124}
                height={31}
                className="h-6 sm:h-7 w-auto"
                priority
              />
            </motion.div>
            <div className="h-6 w-px bg-[#144368]/20 hidden sm:block" />
            <span className="text-xs sm:text-sm text-[#144368]/60 font-medium tracking-wide hidden sm:block">
              Applicant Portal
            </span>
          </Link>

          {/* Status indicator for logged-in users */}
          {!isLoginPage && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#144368]/5 rounded-full border border-[#144368]/10"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]"></span>
              </span>
              <span className="text-xs font-medium text-[#144368]">Active</span>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto py-6 sm:py-8 border-t border-[#144368]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#144368]/50">
            <p className="font-medium">Need help? We&apos;re here for you.</p>
            <div className="flex items-center gap-6">
              <Link href="#" className="hover:text-[#144368] transition-colors">Support</Link>
              <Link href="#" className="hover:text-[#144368] transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-[#144368] transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
