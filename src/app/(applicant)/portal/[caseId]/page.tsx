'use client';

import { useMemo, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Calendar,
  Globe,
  MessageCircle,
  LogOut,
  Mail,
  Copy,
  CheckCircle2,
  FileText,
  ListTodo
} from 'lucide-react';
import { getCaseById } from '@/data/cases';
import { getDocumentsByCaseId } from '@/data/documents';
import { getOpenIssuesByCaseId } from '@/data/issues';
import { generateChecklistForCase } from '@/data/checklists';
import { generateProgressSteps } from '@/data/progress';
import { VISA_TYPES } from '@/data/constants';
import { formatDate, cn } from '@/lib/utils';
import Link from 'next/link';
import { ProgressJourney, TaskCenter, DocumentVault } from '@/components/portal';

type TabType = 'tasks' | 'documents';

export default function ApplicantCasePage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const caseData = getCaseById(caseId);
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [copiedRef, setCopiedRef] = useState(false);

  if (!caseData) {
    notFound();
  }

  const documents = getDocumentsByCaseId(caseId);
  const issues = getOpenIssuesByCaseId(caseId);
  const progressSteps = generateProgressSteps(caseData.status);
  const checklistItems = useMemo(
    () => generateChecklistForCase(caseData.visaType, caseId),
    [caseData.visaType, caseId]
  );

  // Get pending documents for TaskCenter
  const pendingDocuments = checklistItems.filter((item) => {
    const doc = documents.find(
      (d) => d.name.toLowerCase() === item.documentName.toLowerCase()
    );
    return item.status === 'required' && (!doc || doc.status === 'pending');
  });

  // Get uploaded documents for DocumentVault
  const uploadedDocuments = documents.filter(d => d.status !== 'pending');

  const visaConfig = VISA_TYPES[caseData.visaType];

  const handleUpload = (itemId: string, file: File) => {
    console.log('Uploading file for item:', itemId, file.name);
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(caseData.referenceNumber);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const openIssuesCount = issues.filter(i => i.status === 'open').length;
  const totalTasks = openIssuesCount + pendingDocuments.length;

  return (
    <div className="space-y-8">
      {/* Compact Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-[#144368]">
              Welcome, {caseData.applicant.passport.givenNames}
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <button
              onClick={handleCopyRef}
              className="inline-flex items-center gap-1 text-[#144368]/60 hover:text-[#144368] transition-colors font-mono"
            >
              {caseData.referenceNumber}
              {copiedRef ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            <span className="text-[#144368]/20">|</span>
            <span className="inline-flex items-center gap-1.5 text-[#144368]/60">
              <Globe className="w-3.5 h-3.5" />
              {visaConfig.label}
            </span>
            <span className="text-[#144368]/20">|</span>
            <span className="inline-flex items-center gap-1.5 text-[#144368]/60">
              <User className="w-3.5 h-3.5" />
              {caseData.advisor.name}
            </span>
            <span className="text-[#144368]/20 hidden sm:inline">|</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[#144368]/60">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(caseData.createdAt, 'short')}
            </span>
          </div>
        </div>

        <Link href="/portal">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#144368]/10 hover:border-[#ef4444]/30 hover:bg-[#fef2f2] text-sm font-medium text-[#144368]/50 hover:text-[#ef4444] transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </motion.button>
        </Link>
      </motion.div>

      {/* Progress Journey */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ProgressJourney steps={progressSteps} estimatedWaitTime="3-5 weeks" />
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-2 p-1.5 bg-white rounded-xl border-2 border-[#144368]/10"
      >
        <button
          onClick={() => setActiveTab('tasks')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all',
            activeTab === 'tasks'
              ? 'bg-[#144368] text-white shadow-lg shadow-[#144368]/20'
              : 'text-[#144368]/60 hover:bg-[#144368]/5'
          )}
        >
          <ListTodo className="w-4 h-4" />
          Tasks
          {totalTasks > 0 && (
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-bold',
              activeTab === 'tasks'
                ? 'bg-white/20 text-white'
                : 'bg-[#f59e0b] text-white'
            )}>
              {totalTasks}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all',
            activeTab === 'documents'
              ? 'bg-[#144368] text-white shadow-lg shadow-[#144368]/20'
              : 'text-[#144368]/60 hover:bg-[#144368]/5'
          )}
        >
          <FileText className="w-4 h-4" />
          Documents
          <span className={cn(
            'px-2 py-0.5 rounded-full text-xs font-bold',
            activeTab === 'documents'
              ? 'bg-white/20 text-white'
              : 'bg-[#144368]/10 text-[#144368]/60'
          )}>
            {uploadedDocuments.length}
          </span>
        </button>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'tasks' ? (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <TaskCenter
              issues={issues}
              pendingDocuments={pendingDocuments}
              documents={documents}
              onUpload={handleUpload}
            />
          </motion.div>
        ) : (
          <motion.div
            key="documents"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <DocumentVault documents={uploadedDocuments} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Advisor Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#144368]/5 via-[#144368]/10 to-[#144368]/5 p-6 sm:p-8 border-2 border-[#144368]/10"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#144368]/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Advisor avatar */}
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-[#144368] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#144368]/30">
                {caseData.advisor.name.charAt(0)}
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#22c55e] border-2 border-white rounded-full" />
            </div>
            <div>
              <p className="text-sm text-[#144368]/60 font-medium mb-0.5">Questions? Contact your advisor</p>
              <h3 className="text-xl font-bold text-[#144368]">{caseData.advisor.name}</h3>
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#144368] font-semibold shadow-lg shadow-[#144368]/10 hover:shadow-xl transition-shadow border border-[#144368]/10"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Email</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#144368] text-white font-semibold shadow-lg shadow-[#144368]/30 hover:bg-[#0d3050] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Message</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
