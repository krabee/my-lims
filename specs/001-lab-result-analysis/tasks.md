# Tasks: Lab Result Analysis System

**Input**: Design documents from `/specs/001-lab-result-analysis/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED per constitution Principle I (Testing Standards & Quality Assurance). TDD approach mandatory: tests written before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app (Next.js monorepo)**: `src/app/`, `src/components/`, `src/lib/`, `tests/`
- All paths relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize Next.js 14 project with TypeScript and App Router in repository root
- [ ] T002 [P] Install core dependencies: prisma, @prisma/client, zod, recharts in package.json
- [ ] T003 [P] Configure TypeScript with strict mode in tsconfig.json
- [ ] T004 [P] Set up Tailwind CSS configuration in tailwind.config.ts
- [ ] T005 [P] Configure ESLint with Next.js and TypeScript rules in .eslintrc.json
- [ ] T006 [P] Set up Prettier configuration in .prettierrc
- [ ] T007 [P] Create Docker Compose configuration in docker-compose.yml
- [ ] T008 [P] Create Dockerfile for Next.js application
- [ ] T009 [P] Create .env.example file with required environment variables
- [ ] T010 [P] Set up Jest configuration for unit tests in jest.config.js
- [ ] T011 [P] Configure React Testing Library in tests/setup.ts
- [ ] T012 [P] Set up Playwright for E2E tests in playwright.config.ts
- [ ] T013 Create Prisma schema file in prisma/schema.prisma with database connection
- [ ] T014 Create directory structure (src/app/, src/components/, src/lib/, tests/)
- [ ] T015 [P] Create .gitignore with Next.js, Node, and env file patterns

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T016 Define Patient model in prisma/schema.prisma with audit fields
- [ ] T017 [P] Define TestType model in prisma/schema.prisma with reference ranges
- [ ] T018 [P] Define LabResult model in prisma/schema.prisma with status enum
- [ ] T019 [P] Define UploadedFile model in prisma/schema.prisma
- [ ] T020 [P] Define TestValue model in prisma/schema.prisma with relationships
- [ ] T021 Run Prisma migration to create database tables (npx prisma migrate dev)
- [ ] T022 Create Prisma client singleton in src/lib/db.ts
- [ ] T023 [P] Create base Zod validation schemas in src/lib/validation.ts
- [ ] T024 [P] Create TypeScript types for entities in src/types/lab-result.ts
- [ ] T025 [P] Create TypeScript types for Patient in src/types/patient.ts
- [ ] T026 [P] Create TypeScript types for Test in src/types/test.ts
- [ ] T027 Create database seed script in prisma/seed.ts for TestType data
- [ ] T028 Run seed script to populate test types (npm run db:seed)
- [ ] T029 Create root layout component in src/app/layout.tsx with Tailwind
- [ ] T030 [P] Create global styles in src/app/globals.css
- [ ] T031 [P] Create home page placeholder in src/app/page.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Upload and Extract Lab Results (Priority: P1) 🎯 MVP

**Goal**: Enable users to upload lab result documents and automatically extract test data using LLM

**Independent Test**: Upload PDF/image files and verify extracted data is correctly saved to database

### Tests for User Story 1 (TDD - Write First)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T032 [P] [US1] Unit test for file validation logic in tests/unit/validation.test.ts
- [ ] T033 [P] [US1] Unit test for LLM extraction service in tests/unit/llm.test.ts
- [ ] T034 [P] [US1] Unit test for file storage service in tests/unit/storage.test.ts
- [ ] T035 [P] [US1] Contract test for OpenAI API integration in tests/contract/llm-api.test.ts
- [ ] T036 [P] [US1] Integration test for file upload API in tests/integration/upload.test.ts
- [ ] T037 [P] [US1] Integration test for extraction API in tests/integration/extract.test.ts
- [ ] T038 [P] [US1] E2E test for upload workflow in tests/e2e/upload-flow.spec.ts

### Implementation for User Story 1

- [ ] T039 [P] [US1] Create file storage service in src/lib/storage.ts
- [ ] T040 [P] [US1] Create LLM extraction service in src/lib/llm.ts
- [ ] T041 [P] [US1] Create file upload validation schema in src/lib/validation.ts
- [ ] T042 [P] [US1] Install and configure Shadcn UI base components in src/components/ui/
- [ ] T043 [US1] Create FileUpload component in src/components/FileUpload.tsx
- [ ] T044 [US1] Create file upload page UI in src/app/upload/page.tsx
- [ ] T045 [US1] Create POST /api/upload route handler in src/app/api/upload/route.ts
- [ ] T046 [US1] Create POST /api/extract route handler in src/app/api/extract/route.ts
- [ ] T047 [US1] Create GET /api/upload/status/[id] route in src/app/api/upload/status/[id]/route.ts
- [ ] T048 [P] [US1] Add error handling and validation to upload API
- [ ] T049 [P] [US1] Add error handling to extraction API
- [ ] T050 [US1] Implement file upload progress tracking in FileUpload component
- [ ] T051 [US1] Implement extraction status polling in upload page
- [ ] T052 [P] [US1] Add logging for upload and extraction operations
- [ ] T053 [US1] Create error boundary component in src/components/ErrorBoundary.tsx
- [ ] T054 [US1] Add error boundary to upload page

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Browse and Select Historical Results (Priority: P2)

**Goal**: Enable users to view, search, filter, and select from historical lab results

**Independent Test**: Create test data, verify search/filter functionality, and result detail display

### Tests for User Story 2 (TDD - Write First)

- [ ] T055 [P] [US2] Integration test for results list API in tests/integration/results.test.ts
- [ ] T056 [P] [US2] Integration test for result detail API in tests/integration/result-detail.test.ts
- [ ] T057 [P] [US2] Integration test for file download API in tests/integration/file-download.test.ts
- [ ] T058 [P] [US2] E2E test for results browsing workflow in tests/e2e/browse-results.spec.ts
- [ ] T059 [P] [US2] Unit test for date range filtering logic in tests/unit/filters.test.ts

### Implementation for User Story 2

- [ ] T060 [P] [US2] Create ResultCard component in src/components/ResultCard.tsx
- [ ] T061 [P] [US2] Create ResultFilters component in src/components/ResultFilters.tsx
- [ ] T062 [P] [US2] Create DateRangePicker component in src/components/DateRangePicker.tsx
- [ ] T063 [US2] Create GET /api/results route handler in src/app/api/results/route.ts
- [ ] T064 [US2] Create GET /api/results/[id] route handler in src/app/api/results/[id]/route.ts
- [ ] T065 [US2] Create GET /api/files/[id] route handler in src/app/api/files/[id]/route.ts
- [ ] T066 [US2] Create results list page in src/app/results/page.tsx
- [ ] T067 [US2] Create result detail page in src/app/results/[id]/page.tsx
- [ ] T068 [US2] Implement pagination in results list API (100 results/page max)
- [ ] T069 [P] [US2] Implement date range filtering in results API
- [ ] T070 [P] [US2] Implement search by patient name in results API
- [ ] T071 [P] [US2] Implement search by test type in results API
- [ ] T072 [US2] Add loading states to results list page (Suspense boundaries)
- [ ] T073 [US2] Add "no results found" empty state to results list
- [ ] T074 [P] [US2] Implement result detail data fetching with test values
- [ ] T075 [US2] Display original file link in result detail page
- [ ] T076 [P] [US2] Add database indexes for patient_id, test_date, status in Prisma schema

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Visualize Test Trends with Graphs (Priority: P3)

**Goal**: Enable users to plot lab test values over time with interactive graphs

**Independent Test**: Select multiple results, generate graphs, verify reference ranges and abnormal value highlighting

### Tests for User Story 3 (TDD - Write First)

- [ ] T077 [P] [US3] Integration test for trend data API in tests/integration/graphs.test.ts
- [ ] T078 [P] [US3] Integration test for graph comparison API in tests/integration/compare-graphs.test.ts
- [ ] T079 [P] [US3] Unit test for graph data transformation in tests/unit/graph-utils.test.ts
- [ ] T080 [P] [US3] E2E test for visualization workflow in tests/e2e/visualization.spec.ts

### Implementation for User Story 3

- [ ] T081 [P] [US3] Create graph utilities for data transformation in src/lib/graph-utils.ts
- [ ] T082 [US3] Create TrendGraph component with Recharts in src/components/TrendGraph.tsx
- [ ] T083 [P] [US3] Create GraphLegend component in src/components/GraphLegend.tsx
- [ ] T084 [US3] Create GET /api/graphs/trend route handler in src/app/api/graphs/trend/route.ts
- [ ] T085 [US3] Create GET /api/graphs/compare route handler in src/app/api/graphs/compare/route.ts
- [ ] T086 [US3] Create GET /api/graphs/test-types route handler in src/app/api/graphs/test-types/route.ts
- [ ] T087 [US3] Create graph visualization page in src/app/graphs/page.tsx
- [ ] T088 [US3] Implement test type selection dropdown in graphs page
- [ ] T089 [US3] Implement patient selection in graphs page (if multiple patients)
- [ ] T090 [US3] Add reference range display to TrendGraph component (ReferenceArea)
- [ ] T091 [US3] Implement abnormal value highlighting in TrendGraph (red/yellow markers)
- [ ] T092 [US3] Add interactive tooltips to graph data points (Recharts Tooltip)
- [ ] T093 [P] [US3] Implement zoom and pan capabilities in TrendGraph
- [ ] T094 [P] [US3] Lazy load Recharts library using Next.js dynamic imports
- [ ] T095 [US3] Add loading state for graph data fetching
- [ ] T096 [US3] Add "insufficient data" message for <2 data points
- [ ] T097 [P] [US3] Optimize graph rendering for 50+ data points

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T098 [P] Create comprehensive README.md with Docker deployment instructions
- [ ] T099 [P] Add JSDoc comments to all service layer functions (lib/)
- [ ] T100 [P] Run accessibility audit with axe-core on all pages
- [ ] T101 [P] Fix any accessibility violations found (WCAG 2.1 Level AA)
- [ ] T102 [P] Optimize Tailwind CSS by removing unused styles
- [ ] T103 [P] Configure Next.js production build optimizations
- [ ] T104 [P] Add request caching for frequently accessed results
- [ ] T105 [P] Implement rate limiting for file uploads (future enhancement)
- [ ] T106 [P] Add API response compression (gzip)
- [ ] T107 [P] Create database backup script
- [ ] T108 Run full E2E test suite (all user stories end-to-end)
- [ ] T109 Generate test coverage report and verify 80% minimum
- [ ] T110 [P] Load test with k6 (50 concurrent users) and fix any performance issues
- [ ] T111 [P] Set up Docker health checks for app and database containers
- [ ] T112 Validate quickstart.md instructions by running fresh deployment
- [ ] T113 [P] Add monitoring and logging configuration (optional: Sentry, LogRocket)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (can run parallel to US1)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories (can run parallel to US1/US2)

### Within Each User Story

- Tests (TDD) MUST be written and FAIL before implementation
- Service layer (lib/) before API routes
- API routes before UI pages
- Core components before page integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Service layer tasks marked [P] can run in parallel
- Component tasks marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Write all tests for User Story 1 together (TDD - tests first):
Task: "Unit test for file validation logic in tests/unit/validation.test.ts"
Task: "Unit test for LLM extraction service in tests/unit/llm.test.ts"
Task: "Unit test for file storage service in tests/unit/storage.test.ts"
Task: "Contract test for OpenAI API integration in tests/contract/llm-api.test.ts"
Task: "Integration test for file upload API in tests/integration/upload.test.ts"
Task: "Integration test for extraction API in tests/integration/extract.test.ts"
Task: "E2E test for upload workflow in tests/e2e/upload-flow.spec.ts"

# Then implement service layer in parallel:
Task: "Create file storage service in src/lib/storage.ts"
Task: "Create LLM extraction service in src/lib/llm.ts"
Task: "Create file upload validation schema in src/lib/validation.ts"

# Then implement UI components in parallel:
Task: "Install and configure Shadcn UI base components in src/components/ui/"
Task: "Create error boundary component in src/components/ErrorBoundary.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Upload and Extract)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy MVP and gather feedback

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Upload & Extract)
   - Developer B: User Story 2 (Browse & Search)
   - Developer C: User Story 3 (Visualization)
3. Stories complete and integrate independently

---

## Notes

- **[P]** tasks = different files, no dependencies
- **[Story]** label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **TDD REQUIRED**: Verify tests fail before implementing (Constitution Principle I)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **80% test coverage minimum** per Constitution requirement

---

## Task Count Summary

- **Total Tasks**: 113
- **Setup (Phase 1)**: 15 tasks
- **Foundational (Phase 2)**: 16 tasks
- **User Story 1**: 23 tasks (7 tests + 16 implementation)
- **User Story 2**: 22 tasks (5 tests + 17 implementation)
- **User Story 3**: 21 tasks (4 tests + 17 implementation)
- **Polish (Phase 6)**: 16 tasks

**Parallel Opportunities**: 67 tasks marked [P] can run in parallel within their phase

**Test Tasks**: 16 total test task groups (covering unit, integration, contract, E2E)
