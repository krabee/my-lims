# Research: Lab Result Analysis System

**Feature**: Lab Result Analysis System
**Date**: 2025-11-16
**Status**: Complete

## Overview

This document captures research findings and architectural decisions for implementing a lab result analysis system using Next.js, Tailwind CSS, MariaDB, and Docker.

## Technology Decisions

### 1. Next.js App Router vs Pages Router

**Decision**: Use Next.js 14 App Router

**Rationale**:
- React Server Components reduce JavaScript bundle size, improving page load performance
- Built-in server actions simplify file upload handling without separate API routes
- Better support for streaming and suspense boundaries for LLM extraction progress
- Improved developer experience with collocated loading/error states
- Future-proof: App Router is the recommended approach going forward

**Alternatives Considered**:
- **Pages Router**: More mature, but lacks RSC benefits and server actions
- **Separate Backend (Express/Fastify)**: Adds deployment complexity, CORS issues, requires maintaining two codebases

### 2. LLM Service for Document Extraction

**Decision**: Use OpenAI GPT-4 Vision API (or compatible alternative)

**Rationale**:
- Proven performance on document understanding tasks
- Can process both text (PDF) and images (JPEG/PNG)
- Structured output mode ensures consistent JSON responses
- Falls back to text extraction for PDFs via libraries like pdf-parse
- Multimodal approach: OCR + LLM for better accuracy

**Alternatives Considered**:
- **Tesseract OCR only**: Lower accuracy, requires custom parsing logic
- **AWS Textract**: Good OCR but expensive, requires AWS infrastructure
- **Azure Form Recognizer**: Specialized for forms but less flexible for varied lab reports
- **Claude (Anthropic)**: Similar capabilities, viable alternative if OpenAI unavailable

**Best Practices**:
- Use vision API for scanned images (handles rotated/skewed documents)
- Extract text from PDFs first, then send to LLM with context
- Implement prompt engineering with few-shot examples for consistent extraction
- Cache extraction results to avoid re-processing same document
- Flag low-confidence extractions for manual review (confidence scores)

### 3. File Storage Strategy

**Decision**: Filesystem storage with Docker volume mounting (with future S3 migration path)

**Rationale**:
- Simplest for MVP: Files stored on disk, path saved in database
- Docker volumes ensure persistence across container restarts
- Easy to migrate to S3/MinIO later without schema changes (just update storage service)
- No additional cloud dependencies for self-hosted deployments
- Performance: Local disk I/O faster than network calls to object storage

**Alternatives Considered**:
- **Database BLOBs**: Poor performance for large files, complicates backups
- **S3/MinIO from start**: Adds complexity, costs, and network latency
- **Cloud storage only**: Limits self-hosted deployment options

**Best Practices**:
- Store files in `YYYY/MM/DD/{uuid}.{ext}` structure for organization
- Implement file size limits (10MB max) and MIME type validation
- Use Next.js built-in file API for uploads (`formData.get()`)
- Serve files via Next.js route handler with authentication check
- Plan for future S3 adapter pattern (abstraction layer in storage service)

### 4. Database Schema Design with Prisma

**Decision**: Prisma ORM with MariaDB

**Rationale**:
- Type-safe database access with TypeScript integration
- Excellent migration tooling (`prisma migrate`)
- Introspection and schema visualization
- Connection pooling built-in
- Good performance with relational data modeling

**Best Practices**:
- Use UUIDs for primary keys (easier sharding, no sequence conflicts)
- Index foreign keys and frequently queried fields (patient_id, test_date, test_type)
- Implement soft deletes with `deleted_at` timestamp (preserve audit trails)
- Add audit columns: created_at, created_by, updated_at, updated_by
- Use transactions for multi-table operations (upload + extraction insert)
- Normalize test types and reference ranges (separate tables, not embedded JSON)

**Schema Patterns**:
- One-to-many: Patient → Lab Results
- One-to-many: Lab Result → Test Values
- Many-to-one: Test Values → Test Types
- One-to-one: Lab Result → Uploaded File metadata

### 5. Graph Visualization Library

**Decision**: Recharts for React

**Rationale**:
- Native React components, no jQuery dependencies
- Composable API matches React patterns
- Built-in responsive design
- Good TypeScript support
- Handles time-series data well with built-in date formatting
- Smaller bundle size than Chart.js (~50KB vs 180KB)

**Alternatives Considered**:
- **Chart.js**: More features, larger bundle, less React-idiomatic
- **Victory**: Good for mobile, but heavier bundle
- **Plotly.js**: Powerful but overkill for basic trend lines, very large bundle (>1MB)

**Best Practices**:
- Use `LineChart` component for time-series trends
- Implement custom tooltips for test value details
- Add `ReferenceArea` for normal range shading
- Color-code points outside reference ranges
- Lazy load chart component (Next.js dynamic import) to reduce initial bundle

### 6. Authentication & Authorization

**Decision**: NextAuth.js (Auth.js) v5

**Rationale**:
- First-party Next.js integration
- Supports multiple providers (credentials, OAuth, etc.)
- Session management built-in
- CSRF protection included
- Easy to add later without major refactoring

**Best Practices** (for future implementation):
- Start with credentials provider (username/password)
- Store hashed passwords with bcrypt (rounds=12)
- Implement role-based access control (RBAC): Admin, Lab Staff, Patient
- Patients see only their own results; Lab Staff see all
- Secure file download routes with authentication middleware

### 7. Testing Strategy

**Decision**: Multi-layered testing with Jest + React Testing Library + Playwright

**Rationale**:
- **Unit Tests (Jest)**: Business logic in `lib/` services
- **Component Tests (RTL)**: React components in isolation
- **Integration Tests (Jest)**: API routes with in-memory database
- **E2E Tests (Playwright)**: Full user flows across browsers

**Best Practices**:
- Mock LLM API calls in tests (use fixtures with sample extraction results)
- Use MSW (Mock Service Worker) for API mocking in component tests
- Test file uploads with `FormData` mocking
- Snapshot tests for graph components (visual regression)
- Run E2E tests in CI with Docker Compose (full stack integration)

### 8. Docker Deployment Strategy

**Decision**: Multi-stage Dockerfile + Docker Compose

**Rationale**:
- **Multi-stage build**: Smaller production image (no dev dependencies)
- **Docker Compose**: Orchestrates Next.js app + MariaDB + optional volumes
- **Single command**: `docker-compose up` for complete deployment
- **Environment variables**: Externalize config (database URL, LLM API key)

**Best Practices**:
- Use `.env` file for local development (gitignored)
- Use `.env.production` for Docker builds
- Health checks for database readiness before app starts
- Named volumes for database persistence and file uploads
- nginx reverse proxy (optional) for production HTTPS termination

**Docker Compose Structure**:
```yaml
services:
  db:
    image: mariadb:11
    volumes:
      - db_data:/var/lib/mysql
  app:
    build: .
    depends_on:
      - db
    volumes:
      - uploads:/app/public/uploads
    environment:
      DATABASE_URL: mysql://user:pass@db:3306/lims
      OPENAI_API_KEY: ${OPENAI_API_KEY}
```

### 9. Error Handling & Validation

**Decision**: Zod for schema validation

**Rationale**:
- Runtime type checking (TypeScript alone doesn't protect API boundaries)
- Excellent error messages for debugging
- Can generate TypeScript types from schemas (single source of truth)
- Integrates well with form libraries (React Hook Form + Zod resolver)

**Best Practices**:
- Define Zod schemas for all API inputs
- Validate file uploads (MIME type, size, extension)
- Return structured error responses (consistent format)
- Use Zod to parse LLM extraction results (ensure expected structure)
- Custom error messages for user-friendly feedback

### 10. Performance Optimization

**Decision**: Implement caching, pagination, and lazy loading

**Rationale**:
- **Caching**: Next.js built-in fetch caching for API routes
- **Pagination**: Limit database queries to 100 results per page (cursor-based)
- **Lazy Loading**: Code-split graph components and heavy libraries
- **Database Indexes**: Speed up queries on patient_id, test_date, test_type

**Best Practices**:
- Use `next/image` for uploaded scans (automatic optimization)
- Implement request deduplication for duplicate API calls
- Add database indexes in Prisma schema (`@@index([field])`)
- Use React `Suspense` for async components
- Monitor performance with Next.js analytics or Sentry

## Architecture Summary

### Data Flow

1. **Upload Flow**:
   - User uploads file via `<FileUpload>` component
   - POST /api/upload saves file to disk, creates DB record with status="pending"
   - Background job (or immediate call) triggers POST /api/extract
   - LLM API extracts data, updates DB with status="completed", inserts test values
   - User sees extraction results in real-time (polling or SSE for status updates)

2. **Retrieval Flow**:
   - User navigates to /results page
   - GET /api/results queries database with filters (date range, patient, test type)
   - Server renders results list with pagination
   - User clicks result → detail page fetches full record + original file link

3. **Visualization Flow**:
   - User selects multiple results of same test type
   - GET /api/graphs queries test_values table, groups by date
   - Returns JSON with {date, value, reference_range} for each point
   - `<TrendGraph>` component renders Recharts LineChart
   - Interactive tooltips show details on hover

### Security Considerations

- Input validation on all API routes (Zod schemas)
- File type whitelist (PDF, JPEG, PNG only)
- File size limits (10MB max)
- SQL injection prevention via Prisma parameterized queries
- XSS prevention via React's auto-escaping
- CSRF protection via NextAuth.js (future)
- Rate limiting for file uploads (future: consider rate-limiter-flexible)

### Scalability Considerations

- Connection pooling via Prisma (handles concurrent requests)
- Stateless application (can scale horizontally with load balancer)
- File storage can migrate to S3 for multi-server deployments
- Database read replicas for heavy read traffic (future)
- Async LLM processing via queue (BullMQ + Redis) for high volume (future)

## Open Questions Resolved

1. **Which LLM service?** → OpenAI GPT-4 Vision (fallback: Claude)
2. **Where to store files?** → Filesystem with Docker volumes (migrate to S3 later)
3. **How to handle PDF vs images?** → Extract text from PDFs, use vision API for images
4. **Authentication now or later?** → Later (post-MVP), but design schema with user_id fields
5. **Real-time extraction updates?** → Polling initially (simpler), SSE/WebSockets later
6. **Graph library?** → Recharts (smaller bundle, React-native)
7. **Testing approach?** → Jest + RTL + Playwright (multi-layer coverage)

## Next Steps

All research complete. Ready for Phase 1: Design & Contracts.

- Generate `data-model.md` with Prisma schema design
- Generate API contracts in `contracts/` directory
- Generate `quickstart.md` with setup instructions
- Update agent context with technology stack
