# Data Model: Lab Result Analysis System

**Feature**: Lab Result Analysis System
**Date**: 2025-11-16
**Database**: MariaDB 11.x via Prisma ORM

## Entity-Relationship Diagram

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Patient   │────────<│   LabResult      │>────────│  TestType   │
└─────────────┘ 1     * └──────────────────┘ *     1 └─────────────┘
                               │ 1                            │
                               │                              │
                               │ *                            │
                        ┌──────▼──────┐                       │
                        │  TestValue  │───────────────────────┘
                        └─────────────┘           *          1

┌──────────────────┐
│  UploadedFile    │◄──── 1:1 ──── LabResult
└──────────────────┘
```

## Entities

### Patient

Represents an individual who received laboratory testing.

**Fields**:
- `id` (UUID, PK): Unique identifier
- `patient_number` (String, unique): External patient identifier (e.g., hospital MRN)
- `first_name` (String): Patient's first name
- `last_name` (String): Patient's last name
- `date_of_birth` (Date, nullable): Patient's birthdate
- `created_at` (DateTime): Record creation timestamp
- `created_by` (String, nullable): User who created record
- `updated_at` (DateTime): Last update timestamp
- `updated_by` (String, nullable): User who last updated record
- `deleted_at` (DateTime, nullable): Soft delete timestamp

**Relationships**:
- Has many `LabResult` (one patient can have multiple lab results over time)

**Indexes**:
- `patient_number` (unique, for fast lookup)
- `last_name, first_name` (composite, for search)
- `deleted_at` (for filtering soft-deleted records)

**Validation Rules**:
- `patient_number` must be unique and non-null
- `first_name` and `last_name` required
- `date_of_birth` must be in the past if provided

---

### LabResult

Represents a single laboratory test report (the scanned document).

**Fields**:
- `id` (UUID, PK): Unique identifier
- `patient_id` (UUID, FK → Patient): Associated patient
- `test_date` (DateTime): Date the lab test was performed
- `upload_date` (DateTime): When the document was uploaded to system
- `status` (Enum): Processing status - `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`
- `processing_error` (Text, nullable): Error message if extraction failed
- `confidence_score` (Float, nullable): LLM extraction confidence (0.0-1.0)
- `needs_review` (Boolean, default: false): Flag for manual review needed
- `reviewed_by` (String, nullable): User who reviewed uncertain extraction
- `reviewed_at` (DateTime, nullable): When review was completed
- `created_at` (DateTime): Record creation timestamp
- `created_by` (String, nullable): User who uploaded
- `updated_at` (DateTime): Last update timestamp
- `updated_by` (String, nullable): User who last updated
- `deleted_at` (DateTime, nullable): Soft delete timestamp

**Relationships**:
- Belongs to one `Patient`
- Has one `UploadedFile`
- Has many `TestValue` (one result can contain multiple test measurements)

**Indexes**:
- `patient_id` (foreign key, for patient result queries)
- `test_date` (for date range filtering)
- `status` (for filtering pending/completed results)
- `deleted_at` (for filtering soft-deleted records)

**Validation Rules**:
- `test_date` must be in the past or present
- `upload_date` auto-set to current timestamp
- `status` defaults to `PENDING` on creation
- `confidence_score` must be between 0.0 and 1.0 if set

**State Transitions**:
```
PENDING → PROCESSING → COMPLETED
                    ↘ FAILED
```

---

### UploadedFile

Stores metadata about uploaded document files.

**Fields**:
- `id` (UUID, PK): Unique identifier
- `lab_result_id` (UUID, FK → LabResult, unique): Associated lab result
- `file_name` (String): Original uploaded filename
- `file_path` (String): Relative path to file on disk (e.g., `uploads/2025/11/16/{uuid}.pdf`)
- `file_size` (Int): File size in bytes
- `mime_type` (String): MIME type (e.g., `application/pdf`, `image/jpeg`)
- `file_hash` (String, nullable): SHA-256 hash for duplicate detection
- `created_at` (DateTime): Upload timestamp
- `created_by` (String, nullable): User who uploaded

**Relationships**:
- Belongs to one `LabResult` (1:1 relationship)

**Indexes**:
- `lab_result_id` (unique foreign key)
- `file_hash` (for duplicate detection)

**Validation Rules**:
- `file_size` must be <= 10MB (10,485,760 bytes)
- `mime_type` must be one of: `application/pdf`, `image/jpeg`, `image/png`
- `file_path` must be unique

---

### TestType

Defines standard laboratory test types with reference ranges.

**Fields**:
- `id` (UUID, PK): Unique identifier
- `code` (String, unique): Standard test code (e.g., `CBC_HGB`, `LIPID_CHOL`)
- `name` (String): Human-readable test name (e.g., `Hemoglobin`, `Total Cholesterol`)
- `category` (String): Test category (e.g., `Hematology`, `Chemistry`)
- `unit` (String): Standard unit of measurement (e.g., `g/dL`, `mg/dL`)
- `reference_min` (Float, nullable): Normal range minimum value
- `reference_max` (Float, nullable): Normal range maximum value
- `reference_text` (String, nullable): Textual reference (e.g., `Negative`, `Positive`)
- `created_at` (DateTime): Record creation timestamp
- `updated_at` (DateTime): Last update timestamp

**Relationships**:
- Has many `TestValue` (one test type used across many results)

**Indexes**:
- `code` (unique, for fast lookup)
- `category` (for filtering by test category)

**Validation Rules**:
- `code` must be unique and non-null
- `name` required
- If `reference_min` provided, `reference_max` must also be provided
- `reference_min` < `reference_max`

**Seed Data Examples**:
```
| code      | name              | category    | unit  | ref_min | ref_max |
|-----------|-------------------|-------------|-------|---------|---------|
| CBC_HGB   | Hemoglobin        | Hematology  | g/dL  | 12.0    | 16.0    |
| CBC_WBC   | White Blood Cells | Hematology  | K/uL  | 4.5     | 11.0    |
| LIPID_TC  | Total Cholesterol | Chemistry   | mg/dL | 0       | 200     |
| LIPID_HDL | HDL Cholesterol   | Chemistry   | mg/dL | 40      | 999     |
```

---

### TestValue

Individual measurement from a lab test (e.g., Hemoglobin = 14.5 g/dL).

**Fields**:
- `id` (UUID, PK): Unique identifier
- `lab_result_id` (UUID, FK → LabResult): Associated lab result
- `test_type_id` (UUID, FK → TestType): Type of test performed
- `value_numeric` (Float, nullable): Numeric value if applicable
- `value_text` (String, nullable): Text value for qualitative results (e.g., `Negative`)
- `unit` (String, nullable): Unit of measurement (may differ from standard if extraction varies)
- `is_abnormal` (Boolean, default: false): Flag for values outside reference range
- `created_at` (DateTime): Record creation timestamp
- `updated_at` (DateTime): Last update timestamp

**Relationships**:
- Belongs to one `LabResult`
- Belongs to one `TestType`

**Indexes**:
- `lab_result_id` (foreign key, for fetching all values for a result)
- `test_type_id` (foreign key, for filtering by test type)
- `lab_result_id, test_type_id` (composite, for unique constraint per result)

**Validation Rules**:
- Either `value_numeric` OR `value_text` must be provided (not both null)
- If `value_numeric` provided, check against `TestType.reference_min/max` and set `is_abnormal`

**Derived Calculations**:
- `is_abnormal` computed based on:
  - If `value_numeric < reference_min` OR `value_numeric > reference_max` → `true`
  - Else → `false`

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Patient {
  id             String      @id @default(uuid())
  patientNumber  String      @unique @map("patient_number")
  firstName      String      @map("first_name")
  lastName       String      @map("last_name")
  dateOfBirth    DateTime?   @map("date_of_birth") @db.Date

  labResults     LabResult[]

  createdAt      DateTime    @default(now()) @map("created_at")
  createdBy      String?     @map("created_by")
  updatedAt      DateTime    @updatedAt @map("updated_at")
  updatedBy      String?     @map("updated_by")
  deletedAt      DateTime?   @map("deleted_at")

  @@index([lastName, firstName])
  @@index([deletedAt])
  @@map("patients")
}

enum LabResultStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

model LabResult {
  id               String           @id @default(uuid())
  patientId        String           @map("patient_id")
  testDate         DateTime         @map("test_date")
  uploadDate       DateTime         @default(now()) @map("upload_date")
  status           LabResultStatus  @default(PENDING)
  processingError  String?          @map("processing_error") @db.Text
  confidenceScore  Float?           @map("confidence_score")
  needsReview      Boolean          @default(false) @map("needs_review")
  reviewedBy       String?          @map("reviewed_by")
  reviewedAt       DateTime?        @map("reviewed_at")

  patient          Patient          @relation(fields: [patientId], references: [id])
  uploadedFile     UploadedFile?
  testValues       TestValue[]

  createdAt        DateTime         @default(now()) @map("created_at")
  createdBy        String?          @map("created_by")
  updatedAt        DateTime         @updatedAt @map("updated_at")
  updatedBy        String?          @map("updated_by")
  deletedAt        DateTime?        @map("deleted_at")

  @@index([patientId])
  @@index([testDate])
  @@index([status])
  @@index([deletedAt])
  @@map("lab_results")
}

model UploadedFile {
  id           String     @id @default(uuid())
  labResultId  String     @unique @map("lab_result_id")
  fileName     String     @map("file_name")
  filePath     String     @unique @map("file_path")
  fileSize     Int        @map("file_size")
  mimeType     String     @map("mime_type")
  fileHash     String?    @map("file_hash")

  labResult    LabResult  @relation(fields: [labResultId], references: [id])

  createdAt    DateTime   @default(now()) @map("created_at")
  createdBy    String?    @map("created_by")

  @@index([fileHash])
  @@map("uploaded_files")
}

model TestType {
  id            String      @id @default(uuid())
  code          String      @unique
  name          String
  category      String
  unit          String
  referenceMin  Float?      @map("reference_min")
  referenceMax  Float?      @map("reference_max")
  referenceText String?     @map("reference_text")

  testValues    TestValue[]

  createdAt     DateTime    @default(now()) @map("created_at")
  updatedAt     DateTime    @updatedAt @map("updated_at")

  @@index([category])
  @@map("test_types")
}

model TestValue {
  id            String     @id @default(uuid())
  labResultId   String     @map("lab_result_id")
  testTypeId    String     @map("test_type_id")
  valueNumeric  Float?     @map("value_numeric")
  valueText     String?    @map("value_text")
  unit          String?
  isAbnormal    Boolean    @default(false) @map("is_abnormal")

  labResult     LabResult  @relation(fields: [labResultId], references: [id])
  testType      TestType   @relation(fields: [testTypeId], references: [id])

  createdAt     DateTime   @default(now()) @map("created_at")
  updatedAt     DateTime   @updatedAt @map("updated_at")

  @@index([labResultId])
  @@index([testTypeId])
  @@unique([labResultId, testTypeId])
  @@map("test_values")
}
```

## Migration Strategy

1. **Initial Migration**: Create all tables with schema above
2. **Seed Data**: Populate `test_types` table with common lab tests
3. **Indexes**: Ensure all indexes are created for performance
4. **Constraints**: Foreign keys and unique constraints enforced by MariaDB

## Query Patterns

### Common Queries

1. **Fetch all results for a patient**:
```typescript
const results = await prisma.labResult.findMany({
  where: {
    patientId: "...",
    deletedAt: null
  },
  include: {
    uploadedFile: true,
    testValues: {
      include: { testType: true }
    }
  },
  orderBy: { testDate: 'desc' }
});
```

2. **Search results by date range**:
```typescript
const results = await prisma.labResult.findMany({
  where: {
    testDate: {
      gte: new Date('2025-01-01'),
      lte: new Date('2025-12-31')
    },
    deletedAt: null
  }
});
```

3. **Get trend data for graphing**:
```typescript
const trendData = await prisma.testValue.findMany({
  where: {
    testTypeId: "...",
    labResult: {
      patientId: "...",
      deletedAt: null
    }
  },
  include: {
    labResult: { select: { testDate: true } },
    testType: { select: { referenceMin: true, referenceMax: true } }
  },
  orderBy: { labResult: { testDate: 'asc' } }
});
```

4. **Find results needing review**:
```typescript
const needsReview = await prisma.labResult.findMany({
  where: {
    needsReview: true,
    reviewedAt: null,
    deletedAt: null
  },
  include: { patient: true }
});
```

## Performance Considerations

- All foreign keys are indexed automatically by Prisma
- Composite index on `lastName, firstName` speeds up patient search
- `testDate` index enables fast date range queries
- `status` index supports filtering pending/completed results
- Soft delete queries always filter `deletedAt: null` to avoid fetching deleted records
- Connection pooling configured in Prisma client (pool size: 10 connections)

## Data Integrity Rules

1. **Soft Deletes**: Never hard delete `Patient` or `LabResult` records (set `deletedAt` instead)
2. **Audit Trails**: Always populate `created_by`, `updated_by` fields when user context available
3. **Referential Integrity**: ON DELETE CASCADE not used; rely on soft deletes and business logic
4. **Transactions**: Use Prisma transactions for multi-table inserts (LabResult + UploadedFile + TestValues)
5. **Validation**: Zod schemas validate all inputs before database operations
