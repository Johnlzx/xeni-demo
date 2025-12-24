'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  FileText,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Info,
  Zap,
  Clock,
  Shield,
  Eye,
  Database,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Document, Issue } from '@/types';
import { getIssueByDocumentId } from '@/data/issues';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  highlightField?: string;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  document: doc,
  highlightField,
}: DocumentPreviewModalProps) {
  const [scale, setScale] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'data' | 'issues'>('preview');

  // Get related issues for this document
  const relatedIssues = useMemo(() => {
    if (!doc) return [];
    const issue = getIssueByDocumentId(doc.id);
    return issue ? [issue] : [];
  }, [doc]);

  // Reset state when document changes
  useEffect(() => {
    if (doc) {
      setScale(100);
      setCurrentPage(1);
      setActiveTab(relatedIssues.length > 0 ? 'issues' : 'preview');
    }
  }, [doc?.id, relatedIssues.length]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, isFullscreen, onClose]);

  if (!isOpen || !doc) return null;

  const totalPages = 3;

  const zoomIn = () => setScale((prev) => Math.min(prev + 25, 200));
  const zoomOut = () => setScale((prev) => Math.max(prev - 25, 50));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const getPipelineStatusInfo = (status?: string) => {
    switch (status) {
      case 'ready':
        return { label: 'Verified', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2 };
      case 'quality_issue':
        return { label: 'Quality Issue', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle };
      case 'conflict':
        return { label: 'Data Conflict', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', icon: AlertTriangle };
      case 'processing':
        return { label: 'Processing', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: Clock };
      case 'compliance_check':
        return { label: 'Compliance Check', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', icon: Shield };
      default:
        return { label: 'Processing', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: Clock };
    }
  };

  const statusInfo = getPipelineStatusInfo(doc.pipelineStatus);
  const StatusIcon = statusInfo.icon;
  const hasIssues = relatedIssues.length > 0 || doc.pipelineStatus === 'quality_issue' || doc.pipelineStatus === 'conflict';
  const issueCount = relatedIssues.length + (doc.qualityCheck?.issues?.length || 0);

  const tabs = [
    { id: 'preview' as const, label: 'Preview', icon: Eye },
    { id: 'data' as const, label: 'Extracted Data', icon: Database },
    { id: 'issues' as const, label: 'Issues', icon: AlertCircle, count: issueCount },
  ];

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-slate-900/60 backdrop-blur-sm'
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          'bg-white flex flex-col overflow-hidden transition-all duration-300',
          'shadow-2xl shadow-slate-900/20',
          isFullscreen
            ? 'fixed inset-0 rounded-none'
            : 'rounded-2xl w-[95vw] h-[92vh] max-w-7xl'
        )}
        style={{
          animation: 'modalSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-4">
            {/* Document Icon */}
            <div className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center',
              hasIssues
                ? 'bg-gradient-to-br from-amber-50 to-amber-100 ring-1 ring-amber-200'
                : 'bg-gradient-to-br from-[#0E4369]/5 to-[#0E4369]/10 ring-1 ring-[#0E4369]/20'
            )}>
              <FileText className={cn('w-5 h-5', hasIssues ? 'text-amber-600' : 'text-[#0E4369]')} />
            </div>

            {/* Document Info */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                {doc.fileName || doc.name}
              </h3>
              <div className="flex items-center gap-2.5 mt-0.5">
                {doc.fileSize && (
                  <span className="text-xs text-slate-500">{formatFileSize(doc.fileSize)}</span>
                )}
                {doc.uploadedAt && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-xs text-slate-500">
                      {new Date(doc.uploadedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Pipeline Status Badge */}
            <div className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
              statusInfo.bg, statusInfo.color, statusInfo.border
            )}>
              <StatusIcon className="w-3.5 h-3.5" />
              {statusInfo.label}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Tab Switcher */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 mr-3">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                      activeTab === tab.id
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    )}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className={cn(
                        'ml-1 px-1.5 py-0.5 rounded text-[10px] font-semibold',
                        activeTab === tab.id
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-200 text-slate-600'
                      )}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* View Controls */}
            {activeTab === 'preview' && (
              <>
                {/* Page Navigation */}
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg px-2 py-1">
                  <button
                    onClick={prevPage}
                    disabled={currentPage <= 1}
                    className="p-1 text-slate-500 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-600 min-w-[60px] text-center font-medium">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={nextPage}
                    disabled={currentPage >= totalPages}
                    className="p-1 text-slate-500 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg px-2 py-1">
                  <button
                    onClick={zoomOut}
                    disabled={scale <= 50}
                    className="p-1 text-slate-500 hover:text-slate-700 disabled:opacity-40 transition-colors"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-600 min-w-[40px] text-center font-medium">{scale}%</span>
                  <button
                    onClick={zoomIn}
                    disabled={scale >= 200}
                    className="p-1 text-slate-500 hover:text-slate-700 disabled:opacity-40 transition-colors"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Actions */}
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <RotateCw className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          <div className={cn(
            'flex-1 overflow-auto',
            activeTab === 'preview'
              ? 'bg-gradient-to-b from-slate-100 to-slate-200 flex items-start justify-center p-8'
              : 'bg-slate-50'
          )}>
            {/* Preview Tab */}
            {activeTab === 'preview' && (
              <div
                className="bg-white shadow-xl shadow-slate-300/50 transition-transform duration-200 origin-top rounded-sm"
                style={{ transform: `scale(${scale / 100})` }}
              >
                {/* Mock PDF Page */}
                <div className="w-[612px] min-h-[792px] p-12 relative">
                  {/* Document Header */}
                  <div className="border-b-2 border-slate-800 pb-6 mb-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-slate-900 tracking-tight">
                          {doc.name?.toUpperCase() || 'OFFICIAL DOCUMENT'}
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                          Reference: {doc.id.toUpperCase().slice(0, 12)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center border border-slate-200">
                          <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Extracted Data Table */}
                  {doc.extractedData && Object.keys(doc.extractedData).length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                        Extracted Information
                      </h3>
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        {Object.entries(doc.extractedData).map(([key, value], index) => {
                          const isHighlighted = highlightField === key;
                          const hasConflict = relatedIssues.some(
                            issue => issue.conflictDetails?.field === key
                          );

                          return (
                            <div
                              key={key}
                              className={cn(
                                'flex items-center px-4 py-3 transition-all',
                                index % 2 === 0 ? 'bg-slate-50' : 'bg-white',
                                isHighlighted && 'ring-2 ring-[#0E4369] ring-inset bg-[#0E4369]/5',
                                hasConflict && 'ring-2 ring-amber-400 ring-inset bg-amber-50'
                              )}
                            >
                              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider w-40 flex-shrink-0">
                                {key.replace(/_/g, ' ')}
                              </span>
                              <span className={cn(
                                'text-sm font-medium flex-1',
                                hasConflict ? 'text-amber-700' : 'text-slate-900'
                              )}>
                                {String(value)}
                              </span>
                              {hasConflict && (
                                <AlertTriangle className="w-4 h-4 text-amber-500 ml-2" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Mock paragraphs */}
                  <div className="space-y-3">
                    <div className="h-3 w-full bg-slate-100 rounded" />
                    <div className="h-3 w-11/12 bg-slate-100 rounded" />
                    <div className="h-3 w-4/5 bg-slate-100 rounded" />
                    <div className="h-3 w-full bg-slate-100 rounded" />
                    <div className="h-3 w-3/4 bg-slate-100 rounded" />
                  </div>

                  {/* Page Number */}
                  <div className="absolute bottom-8 left-0 right-0 text-center">
                    <span className="text-xs text-slate-400 font-medium">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Extracted Data Tab */}
            {activeTab === 'data' && (
              <div className="p-6 max-w-4xl mx-auto">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Extracted Data</h3>
                  <p className="text-sm text-slate-500 mt-1">Information automatically extracted from this document</p>
                </div>

                {doc.extractedData && Object.keys(doc.extractedData).length > 0 ? (
                  <div className="grid gap-3">
                    {Object.entries(doc.extractedData).map(([key, value]) => {
                      const hasConflict = relatedIssues.some(
                        issue => issue.conflictDetails?.field === key
                      );

                      return (
                        <div
                          key={key}
                          className={cn(
                            'p-4 rounded-xl border transition-all bg-white',
                            hasConflict
                              ? 'border-amber-200 bg-amber-50/50'
                              : 'border-slate-200 hover:border-slate-300'
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                                {key.replace(/_/g, ' ')}
                              </p>
                              <p className={cn(
                                'text-base font-semibold',
                                hasConflict ? 'text-amber-700' : 'text-slate-900'
                              )}>
                                {String(value)}
                              </p>
                            </div>
                            {hasConflict && (
                              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-100 text-amber-700 text-xs font-medium">
                                <AlertTriangle className="w-3 h-3" />
                                Conflict
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <Database className="w-7 h-7 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-medium">No data extracted yet</p>
                    <p className="text-sm text-slate-400 mt-1">Data will appear here once the document is processed</p>
                  </div>
                )}
              </div>
            )}

            {/* Issues Tab */}
            {activeTab === 'issues' && (
              <div className="p-6 max-w-4xl mx-auto">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Document Issues</h3>
                  <p className="text-sm text-slate-500 mt-1">Quality and compliance issues detected for this document</p>
                </div>

                {/* Quality Issues */}
                {doc.qualityCheck?.issues && doc.qualityCheck.issues.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Quality Issues
                    </h4>
                    <div className="space-y-3">
                      {doc.qualityCheck.issues.map((issue, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl bg-white border border-amber-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                              <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-slate-800 font-medium">{issue}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Logic/Compliance Issues */}
                {relatedIssues.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Compliance Issues
                    </h4>
                    <div className="space-y-4">
                      {relatedIssues.map((issue) => (
                        <div
                          key={issue.id}
                          className={cn(
                            'p-4 rounded-xl bg-white border',
                            issue.severity === 'error'
                              ? 'border-rose-200'
                              : issue.severity === 'warning'
                              ? 'border-amber-200'
                              : 'border-blue-200'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                              issue.severity === 'error' ? 'bg-rose-100' :
                              issue.severity === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
                            )}>
                              <AlertTriangle className={cn(
                                'w-4.5 h-4.5',
                                issue.severity === 'error' ? 'text-rose-600' :
                                issue.severity === 'warning' ? 'text-amber-600' : 'text-blue-600'
                              )} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className={cn(
                                  'text-[10px] font-bold uppercase px-1.5 py-0.5 rounded',
                                  issue.type === 'quality' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                )}>
                                  {issue.type}
                                </span>
                                <span className={cn(
                                  'text-[10px] font-medium px-1.5 py-0.5 rounded',
                                  issue.severity === 'error' ? 'bg-rose-50 text-rose-600' :
                                  issue.severity === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                                )}>
                                  {issue.severity}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-slate-900 mb-1">{issue.title}</p>
                              <p className="text-xs text-slate-500 mb-3 leading-relaxed">{issue.description}</p>

                              {/* Conflict Details */}
                              {issue.conflictDetails && (
                                <div className="p-3 bg-slate-50 rounded-lg mb-3 border border-slate-100">
                                  <p className="text-xs font-medium text-slate-600 mb-2">
                                    Field: <span className="text-slate-900">{issue.conflictDetails.field}</span>
                                  </p>
                                  <div className="flex items-center gap-3 text-xs">
                                    <div className="flex-1 p-2.5 bg-white rounded-lg border border-slate-200">
                                      <p className="text-slate-400 mb-0.5 text-[10px] uppercase tracking-wider">{issue.conflictDetails.sourceA}</p>
                                      <p className="text-slate-900 font-semibold">{issue.conflictDetails.valueA}</p>
                                    </div>
                                    <span className="text-slate-300 font-bold text-lg">≠</span>
                                    <div className="flex-1 p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                                      <p className="text-amber-600 mb-0.5 text-[10px] uppercase tracking-wider">{issue.conflictDetails.sourceB}</p>
                                      <p className="text-amber-700 font-semibold">{issue.conflictDetails.valueB}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* AI Suggestion */}
                              {issue.suggestion && (
                                <div className="flex items-start gap-2 text-xs text-[#0E4369] bg-[#0E4369]/5 rounded-lg p-2.5">
                                  <Zap className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                  <span className="leading-relaxed">{issue.suggestion}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Issues State */}
                {(!doc.qualityCheck?.issues || doc.qualityCheck.issues.length === 0) &&
                 relatedIssues.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                    </div>
                    <p className="text-slate-600 font-medium">No issues detected</p>
                    <p className="text-sm text-slate-400 mt-1">This document passed all quality and compliance checks</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
