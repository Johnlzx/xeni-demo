'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Hash, Mail, ArrowRight, Shield, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { MOCK_CASES } from '@/data/cases';
import { cn } from '@/lib/utils';

export default function PortalLoginPage() {
  const router = useRouter();
  const [referenceNumber, setReferenceNumber] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Find matching case
    const matchingCase = MOCK_CASES.find(
      (c) =>
        c.referenceNumber.toLowerCase() === referenceNumber.toLowerCase() &&
        c.applicant.email?.toLowerCase() === email.toLowerCase()
    );

    if (matchingCase) {
      router.push(`/portal/${matchingCase.id}`);
    } else {
      setError('No case found with this reference number and email combination.');
    }

    setIsLoading(false);
  };

  const features = [
    { icon: CheckCircle2, text: 'Track progress in real-time' },
    { icon: Shield, text: 'Secure document upload' },
    { icon: Sparkles, text: 'Instant notifications' },
  ];

  return (
    <div className="max-w-lg mx-auto">
      {/* Welcome Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <Image
            src="/assets/Property 1=XENI DARK 1000.png"
            alt="Xeni"
            width={124}
            height={31}
            className="h-8 w-auto"
            priority
          />
        </motion.div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#144368] mb-3">
          Welcome to Your Portal
        </h1>
        <p className="text-[#144368]/60 max-w-sm mx-auto">
          Track your immigration application progress, upload documents, and stay connected with your advisor.
        </p>
      </motion.div>

      {/* Features list */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3 justify-center mb-8"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="flex items-center gap-2 px-3 py-2 bg-[#144368]/5 rounded-lg border border-[#144368]/10"
          >
            <feature.icon className="w-4 h-4 text-[#144368]" />
            <span className="text-xs font-medium text-[#144368]">{feature.text}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Login Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden rounded-2xl bg-white border-2 border-[#144368]/10 shadow-xl shadow-[#144368]/5"
      >
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#144368] via-[#1a5a8a] to-[#144368]" />

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {/* Reference Number Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#144368]">
              Case Reference Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Hash className="w-5 h-5 text-[#144368]/30" />
              </div>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g., XN-2024-001234"
                className={cn(
                  'w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-200',
                  'text-[#144368] placeholder:text-[#144368]/30',
                  'border-[#144368]/10 focus:border-[#144368] focus:ring-4 focus:ring-[#144368]/10',
                  'outline-none'
                )}
                required
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#144368]">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-[#144368]/30" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={cn(
                  'w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-200',
                  'text-[#144368] placeholder:text-[#144368]/30',
                  'border-[#144368]/10 focus:border-[#144368] focus:ring-4 focus:ring-[#144368]/10',
                  'outline-none'
                )}
                required
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-[#fef2f2] border-2 border-[#fecaca]"
            >
              <p className="text-sm text-[#dc2626] font-medium">{error}</p>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl',
              'bg-gradient-to-r from-[#144368] to-[#1a5580] text-white font-semibold',
              'shadow-lg shadow-[#144368]/25 hover:shadow-xl hover:shadow-[#144368]/30',
              'transition-all duration-200',
              isLoading && 'opacity-70 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Checking...
              </>
            ) : (
              <>
                View Application
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>

        {/* Demo Hint */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8">
          <div className="p-4 rounded-xl bg-[#144368]/5 border-2 border-[#144368]/10">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#144368] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#144368] uppercase tracking-wide mb-1">Demo Access</p>
                <p className="text-sm text-[#144368]/70">
                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#144368]/10">XN-2024-001234</span>
                  {' + '}
                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#144368]/10">bob.brown@email.com</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Security note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-[#144368]/40 mt-6 flex items-center justify-center gap-2"
      >
        <Lock className="w-3.5 h-3.5" />
        Your information is encrypted and secure
      </motion.p>
    </div>
  );
}
