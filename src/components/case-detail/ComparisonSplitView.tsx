'use client';

import { useState } from 'react';
import {
  FileText,
  Link as LinkIcon,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PdfViewerMock } from './PdfViewer';
import type { Issue, ConflictDetails } from '@/types';

interface ExtractedDataField {
  key: string;
  label: string;
  value: string;
  source: string;
  sourceFile: string;
  sourcePage?: number;
  isConflict?: boolean;
  conflictValue?: string;
  conflictSource?: string;
}

interface ComparisonSplitViewProps {
  issue: Issue;
  extractedData: ExtractedDataField[];
  onFieldClick?: (field: ExtractedDataField) => void;
  className?: string;
}

export function ComparisonSplitView({
  issue,
  extractedData,
  onFieldClick,
  className,
}: ComparisonSplitViewProps) {
  const [activeFieldIndex, setActiveFieldIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'data' | 'pdf'>('split');

  // Find the conflict field in extracted data
  const conflictField = extractedData.find((f) => f.isConflict);

  // Generate PDF highlights based on active field
  const getPdfHighlights = () => {
    if (activeFieldIndex === null) return [];
    const field = extractedData[activeFieldIndex];
    return [
      { label: field.label, value: field.value },
    ];
  };

  return (
    <div className={cn('flex flex-col h-full bg-gray-50', className)}>
      {/* Header */}
      <div className="px-5 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{issue.title}</h3>
              <p className="text-sm text-gray-500">{issue.description}</p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('split')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                viewMode === 'split' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              )}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('data')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                viewMode === 'data' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              )}
            >
              Data Only
            </button>
            <button
              onClick={() => setViewMode('pdf')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                viewMode === 'pdf' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              )}
            >
              PDF Only
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Extracted Data */}
        {(viewMode === 'split' || viewMode === 'data') && (
          <div
            className={cn(
              'bg-white border-r border-gray-200 flex flex-col overflow-hidden',
              viewMode === 'split' ? 'w-1/2' : 'flex-1'
            )}
          >
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <h4 className="text-sm font-semibold text-gray-700">Extracted Data</h4>
              <p className="text-xs text-gray-500">Click on a field to view in document</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {extractedData.map((field, index) => (
                  <div
                    key={field.key}
                    onClick={() => {
                      setActiveFieldIndex(index);
                      onFieldClick?.(field);
                    }}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-all duration-200',
                      activeFieldIndex === index
                        ? 'border-[#0E4369] bg-[#0E4369]/5 ring-1 ring-[#0E4369]'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                      field.isConflict && 'border-rose-200 bg-rose-50/50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-500">{field.label}</span>
                          {field.isConflict && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-100 text-rose-600 rounded">
                              Conflict
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-sm text-gray-900">{field.value}</div>

                        {/* Conflict comparison */}
                        {field.isConflict && field.conflictValue && (
                          <div className="mt-2 pt-2 border-t border-rose-100">
                            <div className="flex items-center gap-2 text-xs text-rose-600 mb-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>Conflicts with {field.conflictSource}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm text-gray-500 line-through">
                                {field.conflictValue}
                              </span>
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                              <span className="font-mono text-sm text-rose-700 font-semibold">
                                {field.value}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Source Reference */}
                      <button
                        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-[#0E4369] hover:bg-[#0E4369]/5 rounded transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveFieldIndex(index);
                        }}
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>{field.source}</span>
                        {field.sourcePage && <span>p.{field.sourcePage}</span>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Right Panel: PDF Viewer */}
        {(viewMode === 'split' || viewMode === 'pdf') && (
          <div className={cn('flex-1 flex flex-col', viewMode === 'split' ? 'w-1/2' : '')}>
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-gray-700">Source Document</h4>
                <p className="text-xs text-gray-500">
                  {activeFieldIndex !== null
                    ? extractedData[activeFieldIndex].sourceFile
                    : 'Select a field to highlight in document'}
                </p>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#0E4369] transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
                Open Full View
              </button>
            </div>

            <div className="flex-1">
              <PdfViewerMock
                fileName={
                  activeFieldIndex !== null
                    ? extractedData[activeFieldIndex].sourceFile
                    : 'document.pdf'
                }
                highlightRegions={getPdfHighlights()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Sample data generator for demos
export function generateSampleExtractedData(conflictDetails?: ConflictDetails): ExtractedDataField[] {
  const baseData: ExtractedDataField[] = [
    {
      key: 'full_name',
      label: 'Full Name',
      value: 'John Smith',
      source: 'Passport',
      sourceFile: 'passport_scan.pdf',
      sourcePage: 1,
    },
    {
      key: 'date_of_birth',
      label: 'Date of Birth',
      value: '1985-03-15',
      source: 'Passport',
      sourceFile: 'passport_scan.pdf',
      sourcePage: 1,
    },
    {
      key: 'passport_number',
      label: 'Passport Number',
      value: 'GB1234567',
      source: 'Passport',
      sourceFile: 'passport_scan.pdf',
      sourcePage: 1,
    },
    {
      key: 'nationality',
      label: 'Nationality',
      value: 'British',
      source: 'Passport',
      sourceFile: 'passport_scan.pdf',
      sourcePage: 1,
    },
    {
      key: 'employer',
      label: 'Current Employer',
      value: 'Tech Corp Ltd',
      source: 'Employment Letter',
      sourceFile: 'employment_letter.pdf',
      sourcePage: 1,
    },
    {
      key: 'salary',
      label: 'Annual Salary',
      value: '£65,000',
      source: 'Employment Letter',
      sourceFile: 'employment_letter.pdf',
      sourcePage: 1,
    },
  ];

  // Add conflict if provided
  if (conflictDetails) {
    const conflictFieldIndex = baseData.findIndex(
      (f) => f.label.toLowerCase().includes(conflictDetails.field.toLowerCase())
    );

    if (conflictFieldIndex >= 0) {
      baseData[conflictFieldIndex] = {
        ...baseData[conflictFieldIndex],
        isConflict: true,
        value: conflictDetails.valueA,
        conflictValue: conflictDetails.valueB,
        conflictSource: conflictDetails.sourceB,
      };
    } else {
      // Add as new field if not found
      baseData.push({
        key: 'conflict_field',
        label: conflictDetails.field,
        value: conflictDetails.valueA,
        source: conflictDetails.sourceA,
        sourceFile: 'document.pdf',
        sourcePage: 1,
        isConflict: true,
        conflictValue: conflictDetails.valueB,
        conflictSource: conflictDetails.sourceB,
      });
    }
  }

  return baseData;
}
