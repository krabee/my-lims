# API Contract: File Upload & Extraction

**Feature**: Lab Result Analysis System
**Date**: 2025-11-16

## POST /api/upload

Uploads a scanned lab result document and initiates LLM extraction process.

### Request

**Method**: `POST`
**Content-Type**: `multipart/form-data`

**Body Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Scanned lab result (PDF, JPEG, PNG) |
| `patientNumber` | String | Yes | Patient identifier (MRN or ID) |
| `testDate` | String | Yes | Date of lab test (ISO 8601 format: `YYYY-MM-DD`) |

**Example Request** (using `fetch`):
```typescript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('patientNumber', 'PAT-12345');
formData.append('testDate', '2025-11-15');

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

**Validation Rules**:
- File size must be <= 10MB
- File MIME type must be one of: `application/pdf`, `image/jpeg`, `image/png`
- `patientNumber` must be non-empty string
- `testDate` must be valid ISO 8601 date, not in the future

### Response

**Success (201 Created)**:
```json
{
  "success": true,
  "data": {
    "labResultId": "550e8400-e29b-41d4-a716-446655440000",
    "patientId": "123e4567-e89b-12d3-a456-426614174000",
    "status": "PENDING",
    "uploadDate": "2025-11-16T10:30:00.000Z",
    "testDate": "2025-11-15",
    "file": {
      "fileName": "lab-result-2025-11-15.pdf",
      "fileSize": 2048576,
      "mimeType": "application/pdf"
    }
  }
}
```

**Error (400 Bad Request)** - Invalid file type:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "File type not supported. Please upload PDF, JPEG, or PNG files.",
    "details": {
      "received": "application/msword",
      "allowed": ["application/pdf", "image/jpeg", "image/png"]
    }
  }
}
```

**Error (400 Bad Request)** - File too large:
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds maximum limit of 10MB.",
    "details": {
      "fileSize": 15728640,
      "maxSize": 10485760
    }
  }
}
```

**Error (404 Not Found)** - Patient not found:
```json
{
  "success": false,
  "error": {
    "code": "PATIENT_NOT_FOUND",
    "message": "Patient with number 'PAT-99999' not found. Please create patient first.",
    "details": {
      "patientNumber": "PAT-99999"
    }
  }
}
```

**Error (500 Internal Server Error)** - Upload failed:
```json
{
  "success": false,
  "error": {
    "code": "UPLOAD_FAILED",
    "message": "Failed to save uploaded file. Please try again.",
    "details": null
  }
}
```

### State Changes

1. Creates `LabResult` record with `status: PENDING`
2. Creates `UploadedFile` record with file metadata
3. Saves file to disk at `public/uploads/{YYYY}/{MM}/{DD}/{uuid}.{ext}`
4. Triggers background extraction job (or immediate extraction)

---

## POST /api/extract

Processes an uploaded lab result using LLM extraction. Called automatically after upload or manually for retry.

### Request

**Method**: `POST`
**Content-Type**: `application/json`

**Body Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `labResultId` | UUID | Yes | ID of lab result to extract |

**Example Request**:
```json
{
  "labResultId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Response

**Success (200 OK)** - Extraction completed:
```json
{
  "success": true,
  "data": {
    "labResultId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "COMPLETED",
    "confidenceScore": 0.95,
    "needsReview": false,
    "extractedValues": [
      {
        "testTypeCode": "CBC_HGB",
        "testTypeName": "Hemoglobin",
        "valueNumeric": 14.5,
        "unit": "g/dL",
        "isAbnormal": false,
        "referenceRange": "12.0-16.0 g/dL"
      },
      {
        "testTypeCode": "CBC_WBC",
        "testTypeName": "White Blood Cells",
        "valueNumeric": 7.2,
        "unit": "K/uL",
        "isAbnormal": false,
        "referenceRange": "4.5-11.0 K/uL"
      }
    ],
    "processingTime": 8.5
  }
}
```

**Success (200 OK)** - Extraction with low confidence:
```json
{
  "success": true,
  "data": {
    "labResultId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "COMPLETED",
    "confidenceScore": 0.62,
    "needsReview": true,
    "extractedValues": [
      {
        "testTypeCode": "UNKNOWN",
        "testTypeName": "Unrecognized Test",
        "valueText": "Could not parse",
        "unit": null,
        "isAbnormal": null,
        "referenceRange": null
      }
    ],
    "processingTime": 12.3
  }
}
```

**Error (400 Bad Request)** - Already processing:
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_PROCESSING",
    "message": "Extraction is already in progress for this result.",
    "details": {
      "currentStatus": "PROCESSING"
    }
  }
}
```

**Error (500 Internal Server Error)** - Extraction failed:
```json
{
  "success": false,
  "error": {
    "code": "EXTRACTION_FAILED",
    "message": "LLM extraction failed. Unable to process document.",
    "details": {
      "reason": "LLM API timeout after 30 seconds"
    }
  }
}
```

### State Changes

1. Updates `LabResult.status` from `PENDING` → `PROCESSING`
2. Calls LLM API with file content
3. Parses LLM response and creates `TestValue` records
4. Updates `LabResult.status` to `COMPLETED` or `FAILED`
5. Sets `confidenceScore` and `needsReview` flag based on LLM output
6. Stores any error in `processingError` field

---

## GET /api/upload/status/:labResultId

Check the status of an extraction job (for polling or progress updates).

### Request

**Method**: `GET`
**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `labResultId` | UUID | ID of lab result to check |

**Example Request**:
```
GET /api/upload/status/550e8400-e29b-41d4-a716-446655440000
```

### Response

**Success (200 OK)** - Still processing:
```json
{
  "success": true,
  "data": {
    "labResultId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "PROCESSING",
    "progress": 65,
    "message": "Extracting test values from document..."
  }
}
```

**Success (200 OK)** - Completed:
```json
{
  "success": true,
  "data": {
    "labResultId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "COMPLETED",
    "progress": 100,
    "message": "Extraction complete. 5 test values extracted."
  }
}
```

**Error (404 Not Found)**:
```json
{
  "success": false,
  "error": {
    "code": "LAB_RESULT_NOT_FOUND",
    "message": "Lab result with ID '550e8400-e29b-41d4-a716-446655440000' not found."
  }
}
```

---

## DELETE /api/upload/:labResultId

Soft-delete a lab result and its associated file (marks as deleted, doesn't remove from disk).

### Request

**Method**: `DELETE`
**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `labResultId` | UUID | ID of lab result to delete |

### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "labResultId": "550e8400-e29b-41d4-a716-446655440000",
    "deletedAt": "2025-11-16T11:00:00.000Z"
  }
}
```

**Error (404 Not Found)**:
```json
{
  "success": false,
  "error": {
    "code": "LAB_RESULT_NOT_FOUND",
    "message": "Lab result not found or already deleted."
  }
}
```

### State Changes

1. Sets `LabResult.deletedAt` to current timestamp
2. Soft-deletes related `TestValue` records (sets `deletedAt`)
3. Does NOT delete `UploadedFile` record or physical file (for audit trail)
