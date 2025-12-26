/**
 * AI-powered merge detection service
 * Analyzes uploaded files to detect potential page sequences that should be merged
 */

export interface MergeSuggestion {
  id: string;
  fileIds: string[];
  suggestedName: string;
  reason: string;
  confidence: number; // 0-1
  status: 'pending' | 'accepted' | 'dismissed';
  category: string;
}

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt?: Date | string;
  category?: string;
}

export interface DetectionResult {
  suggestions: MergeSuggestion[];
}

// Common document type patterns
const DOCUMENT_PATTERNS = {
  bankStatement: {
    keywords: ['bank', 'statement', 'account', 'transaction'],
    pattern: /bank.*(statement|account)|statement.*bank/i,
    category: 'Financial',
  },
  payslip: {
    keywords: ['payslip', 'pay', 'salary', 'wage', 'earnings'],
    pattern: /payslip|pay.*slip|salary|wage/i,
    category: 'Employment',
  },
  taxDocument: {
    keywords: ['tax', 'p60', 'p45', 'hmrc', 'return'],
    pattern: /tax|p60|p45|hmrc|return/i,
    category: 'Financial',
  },
  employmentLetter: {
    keywords: ['employment', 'letter', 'employer', 'contract', 'offer'],
    pattern: /employment|employer|contract|offer.*letter/i,
    category: 'Employment',
  },
  utilityBill: {
    keywords: ['utility', 'bill', 'electric', 'gas', 'water', 'council'],
    pattern: /utility|bill|electric|gas|water|council/i,
    category: 'Address',
  },
  passport: {
    keywords: ['passport', 'identity', 'id'],
    pattern: /passport|identity|^id$/i,
    category: 'Identity',
  },
};

// Page number patterns
const PAGE_PATTERNS = [
  /_?p(?:age)?[_\s-]?(\d+)/i,           // page_1, p1, page-1, p 1
  /[_\s-](\d+)(?:\s*of\s*\d+)?$/i,      // _1, -1, 1 of 3
  /\((\d+)\)$/,                          // (1)
  /[_\s-]part[_\s-]?(\d+)/i,            // part_1, part-1
  /[_\s-]scan[_\s-]?(\d+)/i,            // scan_1, scan-1
];

// Date patterns in filenames
const DATE_PATTERNS = [
  /(\d{4})[_\s-]?(\d{2})[_\s-]?(\d{2})/,  // 2024-01-15, 2024_01_15
  /(\d{2})[_\s-]?(\d{2})[_\s-]?(\d{4})/,  // 15-01-2024
  /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[_\s-]?(\d{4})/i, // jan_2024
  /(\d{4})[_\s-]?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i, // 2024_jan
];

function extractBaseName(filename: string): string {
  // Remove extension
  let name = filename.replace(/\.[^/.]+$/, '');

  // Remove page numbers
  for (const pattern of PAGE_PATTERNS) {
    name = name.replace(pattern, '');
  }

  // Remove trailing separators
  name = name.replace(/[_\s-]+$/, '');

  return name.toLowerCase().trim();
}

function extractPageNumber(filename: string): number | null {
  for (const pattern of PAGE_PATTERNS) {
    const match = filename.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return null;
}

function detectDocumentType(filename: string): { type: string; category: string } | null {
  const lowerName = filename.toLowerCase();

  for (const [type, config] of Object.entries(DOCUMENT_PATTERNS)) {
    if (config.pattern.test(lowerName)) {
      return { type, category: config.category };
    }
    // Also check keywords
    for (const keyword of config.keywords) {
      if (lowerName.includes(keyword)) {
        return { type, category: config.category };
      }
    }
  }

  return null;
}

function generateSuggestedName(files: FileInfo[], documentType: string | null): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (documentType) {
    const typeLabels: Record<string, string> = {
      bankStatement: 'bank_statement',
      payslip: 'payslip',
      taxDocument: 'tax_document',
      employmentLetter: 'employment_letter',
      utilityBill: 'utility_bill',
      passport: 'passport',
    };
    return `${typeLabels[documentType] || documentType}_merged_${dateStr}.pdf`;
  }

  // Use first file's base name as hint
  if (files.length > 0) {
    const baseName = extractBaseName(files[0].name);
    if (baseName.length > 3) {
      return `${baseName}_merged_${files.length}_pages.pdf`;
    }
  }

  return `merged_${files.length}_documents_${dateStr}.pdf`;
}

function calculateConfidence(files: FileInfo[], hasPageNumbers: boolean, hasSimilarSizes: boolean): number {
  let confidence = 0.5; // Base confidence

  // Boost for page numbers detected
  if (hasPageNumbers) {
    confidence += 0.25;
  }

  // Boost for similar file sizes (suggests similar page content)
  if (hasSimilarSizes) {
    confidence += 0.15;
  }

  // Boost for more files (more confident pattern)
  if (files.length >= 3) {
    confidence += 0.1;
  }

  return Math.min(confidence, 0.95);
}

function areSizesSimilar(files: FileInfo[]): boolean {
  if (files.length < 2) return false;

  const sizes = files.map(f => f.size);
  const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;

  // Check if all sizes are within 50% of average
  return sizes.every(size => {
    const ratio = size / avgSize;
    return ratio >= 0.5 && ratio <= 1.5;
  });
}

function wereUploadedTogether(files: FileInfo[]): boolean {
  if (files.length < 2) return false;

  const timestamps = files
    .map(f => f.uploadedAt ? new Date(f.uploadedAt).getTime() : null)
    .filter((t): t is number => t !== null);

  if (timestamps.length < 2) return true; // Assume yes if no timestamps

  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);

  // Within 5 minutes = likely same batch
  return (maxTime - minTime) < 5 * 60 * 1000;
}

/**
 * Main detection function - analyzes files and returns merge suggestions
 */
export function detectMergeCandidates(files: FileInfo[]): DetectionResult {
  const suggestions: MergeSuggestion[] = [];
  const usedFileIds = new Set<string>();

  // Only consider PDFs
  const pdfFiles = files.filter(f =>
    f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
  );

  if (pdfFiles.length < 2) {
    return { suggestions };
  }

  // Group by base name
  const baseNameGroups = new Map<string, FileInfo[]>();

  for (const file of pdfFiles) {
    const baseName = extractBaseName(file.name);
    if (!baseNameGroups.has(baseName)) {
      baseNameGroups.set(baseName, []);
    }
    baseNameGroups.get(baseName)!.push(file);
  }

  // Process each group
  for (const [baseName, groupFiles] of Array.from(baseNameGroups.entries())) {
    if (groupFiles.length < 2) continue;

    // Sort by page number if available, otherwise by name
    const sortedFiles = [...groupFiles].sort((a, b) => {
      const pageA = extractPageNumber(a.name);
      const pageB = extractPageNumber(b.name);

      if (pageA !== null && pageB !== null) {
        return pageA - pageB;
      }
      return a.name.localeCompare(b.name);
    });

    // Skip if any file already used
    if (sortedFiles.some(f => usedFileIds.has(f.id))) continue;

    // Detect document type
    const docType = detectDocumentType(sortedFiles[0].name);

    // Check for page numbers
    const hasPageNumbers = sortedFiles.some(f => extractPageNumber(f.name) !== null);

    // Check size similarity
    const hasSimilarSizes = areSizesSimilar(sortedFiles);

    // Check if uploaded together
    const uploadedTogether = wereUploadedTogether(sortedFiles);

    // Only suggest if we have good signals
    if (!hasPageNumbers && !uploadedTogether && !hasSimilarSizes) continue;

    const confidence = calculateConfidence(sortedFiles, hasPageNumbers, hasSimilarSizes);

    // Generate reason
    let reason = 'Detected as pages of the same document';
    if (docType) {
      const typeLabels: Record<string, string> = {
        bankStatement: 'bank statement',
        payslip: 'payslip',
        taxDocument: 'tax document',
        employmentLetter: 'employment letter',
        utilityBill: 'utility bill',
        passport: 'passport',
      };
      reason = `Detected as pages of the same ${typeLabels[docType.type] || docType.type}`;
    }
    if (hasPageNumbers) {
      reason += ' (page numbers detected)';
    }

    // Mark files as used
    sortedFiles.forEach(f => usedFileIds.add(f.id));

    suggestions.push({
      id: `merge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fileIds: sortedFiles.map(f => f.id),
      suggestedName: generateSuggestedName(sortedFiles, docType?.type || null),
      reason,
      confidence,
      status: 'pending',
      category: docType?.category || 'Documents',
    });
  }

  // Also detect files uploaded in same batch with similar names
  // (even if base names don't exactly match)
  const remainingFiles = pdfFiles.filter(f => !usedFileIds.has(f.id));

  if (remainingFiles.length >= 2) {
    // Group by upload time batch
    const timeBatches = new Map<string, FileInfo[]>();

    for (const file of remainingFiles) {
      const timestamp = file.uploadedAt
        ? Math.floor(new Date(file.uploadedAt).getTime() / (60 * 1000)) // Group by minute
        : 0;
      const batchKey = `batch-${timestamp}`;

      if (!timeBatches.has(batchKey)) {
        timeBatches.set(batchKey, []);
      }
      timeBatches.get(batchKey)!.push(file);
    }

    for (const [, batchFiles] of Array.from(timeBatches.entries())) {
      if (batchFiles.length < 2) continue;
      if (batchFiles.some((f: FileInfo) => usedFileIds.has(f.id))) continue;

      // Check if they look like they belong together
      const docTypes = batchFiles.map((f: FileInfo) => detectDocumentType(f.name));
      const sameType = docTypes.every((d: { type: string; category: string } | null) => d?.type === docTypes[0]?.type);
      const hasSimilarSizes = areSizesSimilar(batchFiles);

      if (sameType && docTypes[0] && hasSimilarSizes) {
        batchFiles.forEach((f: FileInfo) => usedFileIds.add(f.id));

        suggestions.push({
          id: `merge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fileIds: batchFiles.map((f: FileInfo) => f.id),
          suggestedName: generateSuggestedName(batchFiles, docTypes[0]?.type || null),
          reason: `Uploaded together, same document type detected`,
          confidence: 0.7,
          status: 'pending',
          category: docTypes[0]?.category || 'Documents',
        });
      }
    }
  }

  // Sort suggestions by confidence (highest first)
  suggestions.sort((a, b) => b.confidence - a.confidence);

  return { suggestions };
}

/**
 * Generate naming suggestions for a set of files (used in FileMergeSelector)
 */
export function generateNamingSuggestions(files: FileInfo[]): string[] {
  const suggestions: string[] = [];
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const monthYear = `${now.toLocaleString('en', { month: 'short' }).toLowerCase()}_${now.getFullYear()}`;

  // Detect document type from first file
  const docType = files.length > 0 ? detectDocumentType(files[0].name) : null;

  if (docType) {
    const typeLabels: Record<string, string> = {
      bankStatement: 'bank_statements',
      payslip: 'payslips',
      taxDocument: 'tax_documents',
      employmentLetter: 'employment_documents',
      utilityBill: 'utility_bills',
      passport: 'identity_documents',
    };
    const label = typeLabels[docType.type] || docType.type;
    suggestions.push(`${label}_${monthYear}.pdf`);
    suggestions.push(`${label}_${dateStr}.pdf`);
  }

  // Generic suggestions
  suggestions.push(`combined_documents_${dateStr}.pdf`);
  suggestions.push(`merged_${files.length}_files_${dateStr}.pdf`);

  // First file based
  if (files.length > 0) {
    const baseName = extractBaseName(files[0].name);
    if (baseName.length > 3) {
      suggestions.push(`${baseName}_combined.pdf`);
    }
  }

  // Remove duplicates and limit
  return Array.from(new Set(suggestions)).slice(0, 4);
}
