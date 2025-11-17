# Implementation Plan: Lab Result Analysis System

**Branch**: `001-lab-result-analysis` | **Date**: 2025-11-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-lab-result-analysis/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a web application that enables laboratory staff to upload scanned lab result documents (PDF, JPEG, PNG), automatically extract structured data using LLM technology, persist the data to a database, and provide visualization capabilities through interactive graphs. The system will use Next.js for the full-stack web application, Tailwind CSS for styling, MariaDB for relational data storage, and Docker for containerized deployment.

**Primary Value**: Eliminate manual data entry errors, reduce transcription time by 80%, and enable trend analysis through historical data visualization.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 14.x (App Router)
**Primary Dependencies**:
- Next.js 14 (React framework with API routes)
- Tailwind CSS 3.x (utility-first CSS framework)
- Prisma 5.x (type-safe ORM for MariaDB)
- Chart.js or Recharts (data visualization library)
- OpenAI API or similar LLM service (document extraction)
- Multer or Next.js file upload handling
- Docker & Docker Compose (containerization)

**Storage**: MariaDB 11.x (relational database) + filesystem or S3-compatible storage for uploaded files
**Testing**: Jest (unit tests), React Testing Library (component tests), Playwright (E2E tests), Vitest (optional, faster alternative)
**Target Platform**: Web application (browser-based), containerized deployment via Docker
**Project Type**: Web application (frontend + backend in monorepo via Next.js)
**Performance Goals**:
- Page load: <2s initial load, <1s subsequent navigations (Next.js SSR/ISR)
- API response: <500ms p95 for read operations, <30s for LLM extraction
- File upload: <5s for files up to 10MB
- Graph rendering: <3s for datasets up to 50 points

**Constraints**:
- Must support 50 concurrent users
- 80% test coverage minimum
- WCAG 2.1 Level AA accessibility compliance
- Docker deployment must be single-command (`docker-compose up`)

**Scale/Scope**:
- Expected users: 10-100 concurrent users
- Data volume: 1000s of lab results over time
- File storage: 10-100GB initial capacity
- Database size: ~10-50MB for metadata (100K+ test values)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Testing Standards & Quality Assurance

**Status**: ✅ PASS (with requirements)

- Unit tests required for all business logic (data extraction, validation, calculations)
- Integration tests for API routes and database interactions
- Contract tests for LLM API integration and data persistence
- E2E tests for critical user flows (upload → extract → view → plot)
- TDD approach: Tests written before implementation
- Target: 80% minimum coverage

**Action Items**:
- Set up Jest + React Testing Library in Next.js project
- Configure Playwright for E2E tests
- Establish test data fixtures for lab result samples
- Mock LLM API in tests to avoid external dependencies

### Principle II: Code Quality & Maintainability

**Status**: ✅ PASS

- TypeScript for type safety
- ESLint + Prettier for code formatting and linting
- Complexity limit: <10 cyclomatic complexity per function
- SOLID principles for service layer (extraction, storage, visualization)
- DRY: Reusable components for file upload, result cards, graphs

**Action Items**:
- Configure ESLint with TypeScript rules and Next.js best practices
- Set up Prettier with project code style
- Enable strict TypeScript mode
- Configure SonarQube or similar for complexity monitoring

### Principle III: User Experience Consistency

**Status**: ✅ PASS

- Tailwind CSS for consistent design system
- Shadcn/UI or similar component library for accessible UI patterns
- File upload: Progress bars, drag-and-drop, clear error messages
- Search/filter: Inline results, debounced input
- Graphs: Interactive tooltips, zoom/pan, responsive
- Accessibility: Keyboard navigation, ARIA labels, semantic HTML

**Action Items**:
- Establish Tailwind configuration with LIMS color palette
- Create reusable components: FileUpload, ResultCard, DateRangePicker, Graph
- Implement loading states and error boundaries
- Run axe-core accessibility audits on all pages

### Principle IV: Performance Requirements

**Status**: ✅ PASS (with monitoring)

- Next.js App Router with React Server Components for fast initial loads
- Database indexing on frequently queried fields (patient_id, test_date, test_type)
- Pagination for result lists (100 results per page max)
- Lazy loading for graph components
- Image optimization via Next.js Image component (for uploaded scans)
- Connection pooling for MariaDB via Prisma

**Action Items**:
- Configure Next.js production build optimization
- Add database indexes in Prisma schema
- Implement request caching for repeated queries
- Set up performance monitoring (Vercel Analytics or similar)
- Load test with k6 or Artillery (50 concurrent users)

### Principle V: Comprehensive Documentation

**Status**: ✅ PASS

- All documentation artifacts will be generated in this planning phase:
  - data-model.md (entity relationships, schema)
  - contracts/ (API endpoint specifications)
  - quickstart.md (setup and development guide)
- Inline code comments for LLM extraction logic
- README for Docker deployment instructions

**Action Items**:
- Generate complete data model with field definitions
- Document all API routes with request/response examples
- Create quickstart guide for local development and Docker deployment

### Data Integrity & Compliance

**Status**: ✅ PASS (LIMS-specific requirements addressed)

- Audit trails: created_at, created_by, updated_at, updated_by columns on all tables
- Soft deletes: No hard deletion of lab results or patient data
- Input validation: Zod schemas for all API inputs
- File validation: MIME type checking, file size limits
- Referential integrity: Foreign keys enforced in MariaDB schema
- Encryption: HTTPS in production, consider at-rest encryption for PHI

**Action Items**:
- Add audit columns to Prisma models
- Implement soft delete pattern
- Configure Zod validation schemas
- Set up file upload restrictions (10MB max, PDF/JPEG/PNG only)

### Summary (Pre-Phase 0)

**Overall Status**: ✅ READY FOR PHASE 0 RESEARCH

All constitution principles can be satisfied with the chosen technology stack. No violations requiring justification. The Next.js + MariaDB + Docker architecture supports testing, code quality, UX consistency, performance requirements, and comprehensive documentation.

---

### Post-Phase 1 Re-Evaluation

**Date**: 2025-11-16
**Status**: ✅ ALL PRINCIPLES CONFIRMED

After completing Phase 0 (Research) and Phase 1 (Design & Contracts), all constitution principles remain satisfied:

**Principle I (Testing)**: ✅ CONFIRMED
- Test structure defined in project layout (unit/, integration/, contract/, e2e/)
- Testing tools selected: Jest, React Testing Library, Playwright
- Test data fixtures planned in research.md
- All API contracts include testable specifications

**Principle II (Code Quality)**: ✅ CONFIRMED
- TypeScript strict mode configured
- Prisma schema enforces type safety at database layer
- Service layer architecture documented (lib/llm.ts, lib/storage.ts, lib/validation.ts)
- Clear separation of concerns in project structure

**Principle III (UX Consistency)**: ✅ CONFIRMED
- Tailwind CSS configuration planned
- Reusable component library structure defined (components/ui/)
- Accessibility requirements documented in API contracts (WCAG 2.1 Level AA)
- Loading states, error handling, and validation patterns specified

**Principle IV (Performance)**: ✅ CONFIRMED
- Database indexes defined in Prisma schema (data-model.md)
- Pagination strategy documented (100 results/page max)
- Lazy loading planned for graph components
- Performance benchmarks specified in contracts (API response times, graph rendering)

**Principle V (Documentation)**: ✅ CONFIRMED
- All Phase 1 artifacts generated:
  - ✅ data-model.md (complete Prisma schema with ER diagram)
  - ✅ contracts/upload-api.md (file upload & extraction endpoints)
  - ✅ contracts/results-api.md (results retrieval & file access)
  - ✅ contracts/graphs-api.md (trend visualization endpoints)
  - ✅ quickstart.md (development & deployment guide)
- API contracts include request/response examples and error handling
- Inline code documentation planned for LLM extraction logic

**Data Integrity & Compliance**: ✅ CONFIRMED
- Audit columns included in all Prisma models (created_at, created_by, updated_at, updated_by)
- Soft delete pattern implemented (deleted_at column)
- Input validation via Zod schemas planned
- Referential integrity enforced via Prisma foreign keys
- File validation rules specified (MIME type, size limits)

**No Constitution Violations**: No complexity tracking required. Design adheres to all principles.

## Project Structure

### Documentation (this feature)

```text
specs/001-lab-result-analysis/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── upload-api.md
│   ├── results-api.md
│   └── graphs-api.md
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```text
/
├── docker-compose.yml           # Docker orchestration
├── Dockerfile                   # Next.js app container
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── prisma/
│   └── schema.prisma           # Database schema
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── upload/
│   │   │   └── page.tsx        # File upload page
│   │   ├── results/
│   │   │   ├── page.tsx        # Results list
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Result detail
│   │   ├── graphs/
│   │   │   └── page.tsx        # Graph visualization
│   │   └── api/                # API routes
│   │       ├── upload/
│   │       │   └── route.ts    # POST /api/upload
│   │       ├── extract/
│   │       │   └── route.ts    # POST /api/extract
│   │       ├── results/
│   │       │   └── route.ts    # GET /api/results
│   │       └── graphs/
│   │           └── route.ts    # GET /api/graphs
│   ├── components/             # React components
│   │   ├── ui/                 # Shadcn UI components
│   │   ├── FileUpload.tsx
│   │   ├── ResultCard.tsx
│   │   ├── ResultFilters.tsx
│   │   └── TrendGraph.tsx
│   ├── lib/                    # Utility functions
│   │   ├── db.ts               # Prisma client
│   │   ├── llm.ts              # LLM extraction service
│   │   ├── storage.ts          # File storage service
│   │   └── validation.ts       # Zod schemas
│   └── types/                  # TypeScript types
│       ├── lab-result.ts
│       ├── patient.ts
│       └── test.ts
├── tests/
│   ├── unit/                   # Jest unit tests
│   │   ├── llm.test.ts
│   │   └── validation.test.ts
│   ├── integration/            # API integration tests
│   │   ├── upload.test.ts
│   │   └── results.test.ts
│   ├── contract/               # Contract tests
│   │   └── llm-api.test.ts
│   └── e2e/                    # Playwright E2E tests
│       ├── upload-flow.spec.ts
│       └── visualization.spec.ts
└── public/
    └── uploads/                # Temporary upload directory (Docker volume)
```

**Structure Decision**: Web application structure using Next.js App Router. This is a monorepo where frontend and backend coexist in the same Next.js application. API routes handle backend logic, while React Server Components and Client Components handle UI. This simplifies deployment and eliminates CORS issues. Docker Compose will orchestrate the Next.js app container and MariaDB container.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations to track. All constitution principles satisfied by the proposed architecture.
