# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Xeni is an immigration case management demo application for UK visa processing. It automates document handling from intake to form submission, with quality control and compliance checking.

**Key domains:**
- **Intake Manager**: Document upload, quality checks, smart checklists by visa type
- **Compliance Engine**: Cross-document validation, conflict detection, business rule verification
- **Applicant Portal**: Client-facing progress tracking and document submission

## Commands

```bash
npm run dev      # Start development server (Next.js)
npm run build    # Production build
npm run lint     # ESLint
npm run start    # Start production server
```

## Architecture

### Route Groups (Next.js App Router)
- `src/app/(lawyer)/` - Lawyer dashboard routes (cases list, case detail with intake/compliance phases)
- `src/app/(applicant)/` - Applicant portal routes (progress tracking, document upload)

### Component Organization
```
src/components/
├── case-detail/    # Case page components (dashboard, issue workspace, document preview)
├── case-hub/       # Cases list and filtering
├── compliance/     # Rule checking, conflict detection
├── evidence/       # Evidence slot system, document pipeline
├── intake/         # Checklist, upload zones, quality issues
├── portal/         # Applicant-facing components
├── layout/         # Header, Sidebar, PageHeader
├── ui/             # Primitive components (Button, Card, Modal, etc.)
└── upload/         # File merge, multi-file uploader
```

### Data Layer
All data is mock data in `src/data/`:
- `cases.ts` - Case records with passport info and stats
- `documents.ts` - Documents with pipeline status
- `evidence-templates.ts` - Visa-specific evidence slot templates
- `issues.ts` - Quality and compliance issues
- `checklists.ts` - Document checklist generation

### Type System (`src/types/index.ts`)
Core domain types:
- **Case flow**: `CaseStatus` (draft → intake → review → compliance → ready → submitted)
- **Document pipeline**: `DocumentPipelineStatus` (uploading → processing → quality_check → compliance_check → ready)
- **Evidence hierarchy**: Category → EvidenceSlotTemplate → Document (4-layer model matching Home Office requirements)
- **Issues**: `IssueType` (quality | logic), `IssueSeverity` (error | warning | info)

### Hooks
- `useCasePhase.ts` - Case phase state management
- `useEvidenceSlots.ts` - Evidence slot state calculation
- `useFormConditionSlots.ts` - Conditional slot visibility

## Key Patterns

### Path Alias
Use `@/*` for imports from `src/` (configured in tsconfig.json).

### Styling
- Tailwind CSS with custom color tokens (`primary`, `success`, `warning`, `error`)
- Framer Motion for animations
- Component-specific animations defined in `tailwind.config.ts`

### Component Exports
Each component folder has an `index.ts` barrel file for clean imports:
```typescript
import { DocumentChecklist, QualityIssuePanel } from '@/components/intake';
```

## Skills

When building frontend components, pages, or UI features, invoke the `frontend-design:frontend-design` skill to generate production-grade interfaces with high design quality.
