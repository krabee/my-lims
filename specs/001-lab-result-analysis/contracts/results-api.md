# API Contract: Results Retrieval

**Feature**: Lab Result Analysis System
**Date**: 2025-11-16

## GET /api/results

Fetch a paginated list of lab results with optional filtering.

### Request

**Method**: `GET`
**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `patientId` | UUID | No | Filter by specific patient |
| `patientNumber` | String | No | Filter by patient number (alternative to patientId) |
| `startDate` | String | No | Start of date range (ISO 8601: `YYYY-MM-DD`) |
| `endDate` | String | No | End of date range (ISO 8601: `YYYY-MM-DD`) |
| `status` | Enum | No | Filter by status: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` |
| `needsReview` | Boolean | No | Filter results flagged for manual review |
| `search` | String | No | Search by patient name or test type |
| `page` | Number | No | Page number (default: 1) |
| `limit` | Number | No | Results per page (default: 20, max: 100) |
| `sortBy` | String | No | Sort field: `testDate`, `uploadDate` (default: `testDate`) |
| `sortOrder` | String | No | Sort order: `asc`, `desc` (default: `desc`) |

**Example Requests**:
```
GET /api/results?patientId=123e4567-e89b-12d3-a456-426614174000
GET /api/results?startDate=2025-01-01&endDate=2025-12-31
GET /api/results?status=COMPLETED&needsReview=true
GET /api/results?search=hemoglobin&page=2&limit=50
```

### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "patient": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "patientNumber": "PAT-12345",
          "firstName": "John",
          "lastName": "Doe"
        },
        "testDate": "2025-11-15",
        "uploadDate": "2025-11-16T10:30:00.000Z",
        "status": "COMPLETED",
        "confidenceScore": 0.95,
        "needsReview": false,
        "testCount": 5,
        "file": {
          "fileName": "lab-result-2025-11-15.pdf",
          "fileSize": 2048576,
          "mimeType": "application/pdf"
        }
      },
      {
        "id": "660f9511-f39c-52e5-b827-557766551111",
        "patient": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "patientNumber": "PAT-12345",
          "firstName": "John",
          "lastName": "Doe"
        },
        "testDate": "2025-10-20",
        "uploadDate": "2025-10-21T09:15:00.000Z",
        "status": "COMPLETED",
        "confidenceScore": 0.88,
        "needsReview": false,
        "testCount": 8,
        "file": {
          "fileName": "lab-result-2025-10-20.pdf",
          "fileSize": 1536000,
          "mimeType": "application/pdf"
        }
      }
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "limit": 20,
      "pages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Success (200 OK)** - No results:
```json
{
  "success": true,
  "data": {
    "results": [],
    "pagination": {
      "total": 0,
      "page": 1,
      "limit": 20,
      "pages": 0,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

**Error (400 Bad Request)** - Invalid date range:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_DATE_RANGE",
    "message": "Start date must be before end date.",
    "details": {
      "startDate": "2025-12-31",
      "endDate": "2025-01-01"
    }
  }
}
```

---

## GET /api/results/:labResultId

Fetch detailed information for a specific lab result, including all extracted test values.

### Request

**Method**: `GET`
**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `labResultId` | UUID | ID of lab result to retrieve |

**Example Request**:
```
GET /api/results/550e8400-e29b-41d4-a716-446655440000
```

### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "patient": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "patientNumber": "PAT-12345",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1985-03-15"
    },
    "testDate": "2025-11-15",
    "uploadDate": "2025-11-16T10:30:00.000Z",
    "status": "COMPLETED",
    "confidenceScore": 0.95,
    "needsReview": false,
    "reviewedBy": null,
    "reviewedAt": null,
    "file": {
      "id": "770g0622-g40d-63f6-c938-668877662222",
      "fileName": "lab-result-2025-11-15.pdf",
      "fileSize": 2048576,
      "mimeType": "application/pdf",
      "filePath": "/api/files/770g0622-g40d-63f6-c938-668877662222"
    },
    "testValues": [
      {
        "id": "880h1733-h51e-74g7-d049-779988773333",
        "testType": {
          "code": "CBC_HGB",
          "name": "Hemoglobin",
          "category": "Hematology",
          "unit": "g/dL",
          "referenceMin": 12.0,
          "referenceMax": 16.0
        },
        "valueNumeric": 14.5,
        "valueText": null,
        "unit": "g/dL",
        "isAbnormal": false
      },
      {
        "id": "991i2844-i62f-85h8-e150-880099884444",
        "testType": {
          "code": "CBC_WBC",
          "name": "White Blood Cells",
          "category": "Hematology",
          "unit": "K/uL",
          "referenceMin": 4.5,
          "referenceMax": 11.0
        },
        "valueNumeric": 7.2,
        "valueText": null,
        "unit": "K/uL",
        "isAbnormal": false
      },
      {
        "id": "002j3955-j73g-96i9-f261-991100995555",
        "testType": {
          "code": "LIPID_TC",
          "name": "Total Cholesterol",
          "category": "Chemistry",
          "unit": "mg/dL",
          "referenceMin": 0,
          "referenceMax": 200
        },
        "valueNumeric": 245,
        "valueText": null,
        "unit": "mg/dL",
        "isAbnormal": true
      }
    ],
    "createdAt": "2025-11-16T10:30:00.000Z",
    "createdBy": "user@example.com",
    "updatedAt": "2025-11-16T10:30:38.000Z"
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

## GET /api/files/:fileId

Download or view the original uploaded file.

### Request

**Method**: `GET`
**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `fileId` | UUID | ID of uploaded file to retrieve |

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `download` | Boolean | No | Force download (default: false, displays inline) |

**Example Requests**:
```
GET /api/files/770g0622-g40d-63f6-c938-668877662222
GET /api/files/770g0622-g40d-63f6-c938-668877662222?download=true
```

### Response

**Success (200 OK)**:
- **Headers**:
  - `Content-Type`: Original MIME type (`application/pdf`, `image/jpeg`, etc.)
  - `Content-Length`: File size in bytes
  - `Content-Disposition`: `inline` (default) or `attachment; filename="filename.pdf"` (if download=true)
- **Body**: Binary file content

**Error (404 Not Found)**:
```json
{
  "success": false,
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "File with ID '770g0622-g40d-63f6-c938-668877662222' not found."
  }
}
```

**Error (403 Forbidden)** - Future auth implementation:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You do not have permission to access this file."
  }
}
```

---

## PATCH /api/results/:labResultId/review

Mark a lab result as reviewed (for results flagged with needsReview=true).

### Request

**Method**: `PATCH`
**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `labResultId` | UUID | ID of lab result to mark as reviewed |

**Body Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reviewedBy` | String | Yes | Email or ID of reviewer |
| `notes` | String | No | Review notes or corrections made |

**Example Request**:
```json
{
  "reviewedBy": "reviewer@example.com",
  "notes": "Corrected test type code from UNKNOWN to CBC_PLT"
}
```

### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "labResultId": "550e8400-e29b-41d4-a716-446655440000",
    "needsReview": false,
    "reviewedBy": "reviewer@example.com",
    "reviewedAt": "2025-11-16T12:00:00.000Z"
  }
}
```

**Error (404 Not Found)**:
```json
{
  "success": false,
  "error": {
    "code": "LAB_RESULT_NOT_FOUND",
    "message": "Lab result not found."
  }
}
```

---

## Performance Considerations

- `/api/results` list endpoint returns only summary data (not full test values) for performance
- Pagination default: 20 results per page, max: 100
- Database queries use indexes on `patientId`, `testDate`, `status` for fast filtering
- File downloads stream from disk (no buffering in memory)
- Caching strategy: Cache patient lookup results for 5 minutes
