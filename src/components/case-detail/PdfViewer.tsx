'use client';

import { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PdfViewerProps {
  url: string;
  highlightRegions?: HighlightRegion[];
  onPageChange?: (page: number) => void;
  className?: string;
}

interface HighlightRegion {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  label?: string;
}

export function PdfViewer({
  url,
  highlightRegions = [],
  onPageChange,
  className,
}: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load PDF.js dynamically
  useEffect(() => {
    const loadPdfJs = async () => {
      try {
        // @ts-ignore
        const pdfjsLib = await import('pdfjs-dist');
        // @ts-ignore
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF document');
        setLoading(false);
      }
    };

    loadPdfJs();
  }, [url]);

  // Render current page
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;

      try {
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        // Draw highlight regions
        const pageHighlights = highlightRegions.filter((r) => r.page === currentPage);
        pageHighlights.forEach((region) => {
          context.fillStyle = region.color || 'rgba(255, 235, 59, 0.4)';
          context.fillRect(
            region.x * scale,
            region.y * scale,
            region.width * scale,
            region.height * scale
          );
          context.strokeStyle = region.color?.replace('0.4', '1') || 'rgba(255, 193, 7, 1)';
          context.lineWidth = 2;
          context.strokeRect(
            region.x * scale,
            region.y * scale,
            region.width * scale,
            region.height * scale
          );
        });
      } catch (err) {
        console.error('Error rendering page:', err);
      }
    };

    renderPage();
  }, [pdfDoc, currentPage, scale, highlightRegions]);

  // Notify page change
  useEffect(() => {
    onPageChange?.(currentPage);
  }, [currentPage, onPageChange]);

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center h-full bg-gray-100', className)}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#0E4369] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex items-center justify-center h-full bg-gray-100', className)}>
        <div className="text-center">
          <p className="text-sm text-rose-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full bg-gray-900', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className="p-1.5 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-300">
            Page <span className="font-semibold text-white">{currentPage}</span> of{' '}
            <span className="font-semibold text-white">{totalPages}</span>
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            className="p-1.5 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-300 min-w-[4rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-gray-400 hover:text-white transition-colors">
            <Download className="w-5 h-5" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-white transition-colors">
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex items-start justify-center p-4"
      >
        <canvas
          ref={canvasRef}
          className="shadow-2xl"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
    </div>
  );
}

// Lightweight PDF placeholder for demo/mock purposes
export function PdfViewerMock({
  fileName,
  highlightRegions = [],
  className,
}: {
  fileName: string;
  highlightRegions?: { label: string; value: string }[];
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col h-full bg-gray-900', className)}>
      {/* Mock Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm text-gray-300">{fileName}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Page 1 of 3</span>
        </div>
      </div>

      {/* Mock PDF Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto bg-white rounded shadow-2xl p-8">
          {/* Mock Document Header */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-48 bg-gray-100 rounded" />
          </div>

          {/* Mock Document Content with Highlights */}
          <div className="space-y-4">
            {highlightRegions.map((region, index) => (
              <div key={index} className="relative">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded bg-amber-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-amber-700">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">{region.label}</div>
                    <div className="p-2 bg-amber-50 border-l-4 border-amber-400 rounded-r">
                      <span className="font-mono text-sm text-gray-900">{region.value}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Mock text blocks */}
            <div className="h-3 w-full bg-gray-100 rounded" />
            <div className="h-3 w-5/6 bg-gray-100 rounded" />
            <div className="h-3 w-4/5 bg-gray-100 rounded" />
            <div className="h-3 w-full bg-gray-100 rounded" />
            <div className="h-3 w-3/4 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
