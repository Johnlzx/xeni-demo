'use client';

import { useState } from 'react';
import { ConflictResolutionCenter } from './ConflictResolutionCenter';
import { ComparisonSplitView, generateSampleExtractedData } from './ComparisonSplitView';
import type { Issue } from '@/types';

interface CompliancePhaseViewProps {
  issues: Issue[];
  onResolveIssue: (issueId: string, action: 'override' | 'request_clarification') => void;
}

export function CompliancePhaseView({
  issues,
  onResolveIssue,
}: CompliancePhaseViewProps) {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Generate extracted data for the selected issue
  const extractedData = selectedIssue
    ? generateSampleExtractedData(selectedIssue.conflictDetails)
    : [];

  return (
    <div className="flex h-full">
      {/* Left Panel: Conflict Resolution Center */}
      <div className="w-[420px] border-r border-gray-200 flex-shrink-0">
        <ConflictResolutionCenter
          issues={issues}
          onResolve={onResolveIssue}
          onSelectConflict={(issue) => setSelectedIssue(issue)}
          selectedIssueId={selectedIssue?.id}
        />
      </div>

      {/* Right Panel: Comparison Split View */}
      <div className="flex-1">
        {selectedIssue ? (
          <ComparisonSplitView
            issue={selectedIssue}
            extractedData={extractedData}
            onFieldClick={(field) => {
              console.log('Field clicked:', field);
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Select a Conflict to Review
              </h3>
              <p className="text-sm text-gray-500">
                Click on a conflict from the list to view the detailed comparison between
                extracted data and source documents.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
