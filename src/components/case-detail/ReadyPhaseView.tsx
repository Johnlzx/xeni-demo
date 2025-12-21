'use client';

import { useState } from 'react';
import { Rocket, CheckCircle, Clock, ExternalLink, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SchemaPreviewWall } from './SchemaPreviewWall';
import type { Case } from '@/types';

interface ReadyPhaseViewProps {
  caseData: Case;
  onLaunchFormPilot: () => void;
}

export function ReadyPhaseView({
  caseData,
  onLaunchFormPilot,
}: ReadyPhaseViewProps) {
  const [showLaunchConfirm, setShowLaunchConfirm] = useState(false);

  const isSubmitted = caseData.status === 'submitted';
  const isApproved = caseData.status === 'approved';
  const isRejected = caseData.status === 'rejected';
  const isReady = caseData.status === 'ready';

  return (
    <div className="flex h-full">
      {/* Main Content: Schema Preview */}
      <div className="flex-1 overflow-hidden">
        <SchemaPreviewWall caseData={caseData} isLocked={!isReady} />
      </div>

      {/* Right Sidebar: Actions & Status */}
      <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
        {/* Status Card */}
        <div className="p-5 border-b border-gray-100">
          <div
            className={cn(
              'p-4 rounded-xl',
              isReady && 'bg-emerald-50 border border-emerald-100',
              isSubmitted && 'bg-blue-50 border border-blue-100',
              isApproved && 'bg-emerald-50 border border-emerald-100',
              isRejected && 'bg-rose-50 border border-rose-100'
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              {isReady && (
                <>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-900">Ready to Submit</h3>
                    <p className="text-sm text-emerald-700">All checks passed</p>
                  </div>
                </>
              )}
              {isSubmitted && (
                <>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Submitted</h3>
                    <p className="text-sm text-blue-700">Awaiting decision</p>
                  </div>
                </>
              )}
              {isApproved && (
                <>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-900">Approved</h3>
                    <p className="text-sm text-emerald-700">Application successful</p>
                  </div>
                </>
              )}
              {isRejected && (
                <>
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-rose-900">Rejected</h3>
                    <p className="text-sm text-rose-700">Application unsuccessful</p>
                  </div>
                </>
              )}
            </div>

            {isReady && (
              <p className="text-sm text-emerald-700">
                All documents verified and compliance checks passed. You can now submit the application.
              </p>
            )}
            {isSubmitted && caseData.submittedAt && (
              <p className="text-sm text-blue-700">
                Submitted on {new Date(caseData.submittedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Launch Form Pilot */}
        {isReady && (
          <div className="p-5 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
            <button
              onClick={() => setShowLaunchConfirm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0E4369] text-white rounded-xl font-medium hover:bg-[#0B3654] transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              <Rocket className="w-5 h-5" />
              Launch Form Pilot
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Opens the browser extension to auto-fill forms
            </p>
          </div>
        )}

        {/* Checklist Summary */}
        <div className="p-5 flex-1">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Submission Checklist</h4>
          <div className="space-y-3">
            {[
              { label: 'All documents uploaded', completed: true },
              { label: 'Quality checks passed', completed: true },
              { label: 'Compliance review complete', completed: true },
              { label: 'Data schema verified', completed: true },
              { label: 'Ready for submission', completed: isReady },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center',
                    item.completed ? 'bg-emerald-100' : 'bg-gray-100'
                  )}
                >
                  {item.completed ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-sm',
                    item.completed ? 'text-gray-900' : 'text-gray-400'
                  )}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Documents Summary */}
        <div className="p-5 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Total Documents</span>
            <span className="font-semibold text-gray-900">{caseData.stats.documentsTotal}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-500">Verified</span>
            <span className="font-semibold text-emerald-600">
              {caseData.stats.documentsUploaded}
            </span>
          </div>
        </div>
      </div>

      {/* Launch Confirmation Modal */}
      {showLaunchConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6">
              <div className="w-14 h-14 rounded-full bg-[#0E4369]/10 flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-7 h-7 text-[#0E4369]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Launch Form Pilot
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                This will open the Form Pilot browser extension to automatically fill the
                application form using the verified data.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Before you continue:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Ensure Form Pilot extension is installed
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Have the official application portal open
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Review all data before final submission
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowLaunchConfirm(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLaunchConfirm(false);
                    onLaunchFormPilot();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#0E4369] hover:bg-[#0B3654] rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Launch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
