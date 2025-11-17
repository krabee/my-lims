# API Contract: Graph Visualization

**Feature**: Lab Result Analysis System
**Date**: 2025-11-16

## GET /api/graphs/trend

Generate time-series trend data for plotting graphs.

### Request

**Method**: `GET`
**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `patientId` | UUID | Yes | Patient whose data to visualize |
| `testTypeCode` | String | Yes | Test type code (e.g., `CBC_HGB`, `LIPID_TC`) |
| `startDate` | String | No | Start of date range (ISO 8601: `YYYY-MM-DD`) |
| `endDate` | String | No | End of date range (ISO 8601: `YYYY-MM-DD`) |
| `limit` | Number | No | Max data points (default: 50, max: 100) |

**Example Requests**:
```
GET /api/graphs/trend?patientId=123e4567-e89b-12d3-a456-426614174000&testTypeCode=CBC_HGB
GET /api/graphs/trend?patientId=123e4567-e89b-12d3-a456-426614174000&testTypeCode=LIPID_TC&startDate=2024-01-01&endDate=2025-12-31
```

### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "patientNumber": "PAT-12345",
      "firstName": "John",
      "lastName": "Doe"
    },
    "testType": {
      "code": "CBC_HGB",
      "name": "Hemoglobin",
      "category": "Hematology",
      "unit": "g/dL",
      "referenceMin": 12.0,
      "referenceMax": 16.0,
      "referenceText": null
    },
    "dataPoints": [
      {
        "date": "2025-01-15",
        "value": 13.8,
        "unit": "g/dL",
        "isAbnormal": false,
        "labResultId": "550e8400-e29b-41d4-a716-446655440000"
      },
      {
        "date": "2025-03-20",
        "value": 14.2,
        "unit": "g/dL",
        "isAbnormal": false,
        "labResultId": "660f9511-f39c-52e5-b827-557766551111"
      },
      {
        "date": "2025-06-10",
        "value": 15.1,
        "unit": "g/dL",
        "isAbnormal": false,
        "labResultId": "770g0622-g40d-63f6-c938-668877662222"
      },
      {
        "date": "2025-09-05",
        "value": 11.5,
        "unit": "g/dL",
        "isAbnormal": true,
        "labResultId": "880h1733-h51e-74g7-d049-779988773333"
      },
      {
        "date": "2025-11-15",
        "value": 14.5,
        "unit": "g/dL",
        "isAbnormal": false,
        "labResultId": "991i2844-i62f-85h8-e150-880099884444"
      }
    ],
    "statistics": {
      "count": 5,
      "min": 11.5,
      "max": 15.1,
      "mean": 13.82,
      "median": 14.2,
      "abnormalCount": 1,
      "abnormalPercentage": 20.0
    }
  }
}
```

**Success (200 OK)** - No data:
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "patientNumber": "PAT-12345",
      "firstName": "John",
      "lastName": "Doe"
    },
    "testType": {
      "code": "CBC_HGB",
      "name": "Hemoglobin",
      "category": "Hematology",
      "unit": "g/dL",
      "referenceMin": 12.0,
      "referenceMax": 16.0,
      "referenceText": null
    },
    "dataPoints": [],
    "statistics": {
      "count": 0,
      "min": null,
      "max": null,
      "mean": null,
      "median": null,
      "abnormalCount": 0,
      "abnormalPercentage": 0
    }
  }
}
```

**Error (400 Bad Request)** - Missing required parameter:
```json
{
  "success": false,
  "error": {
    "code": "MISSING_PARAMETER",
    "message": "Required parameter 'testTypeCode' is missing.",
    "details": {
      "required": ["patientId", "testTypeCode"]
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
    "message": "Patient with ID '123e4567-e89b-12d3-a456-426614174000' not found."
  }
}
```

**Error (404 Not Found)** - Test type not found:
```json
{
  "success": false,
  "error": {
    "code": "TEST_TYPE_NOT_FOUND",
    "message": "Test type with code 'INVALID_CODE' not found.",
    "details": {
      "providedCode": "INVALID_CODE"
    }
  }
}
```

---

## GET /api/graphs/compare

Compare multiple test types on the same timeline for a patient.

### Request

**Method**: `GET`
**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `patientId` | UUID | Yes | Patient whose data to visualize |
| `testTypeCodes` | String | Yes | Comma-separated test type codes (max 5) |
| `startDate` | String | No | Start of date range (ISO 8601: `YYYY-MM-DD`) |
| `endDate` | String | No | End of date range (ISO 8601: `YYYY-MM-DD`) |

**Example Requests**:
```
GET /api/graphs/compare?patientId=123e4567-e89b-12d3-a456-426614174000&testTypeCodes=CBC_HGB,CBC_WBC
GET /api/graphs/compare?patientId=123e4567-e89b-12d3-a456-426614174000&testTypeCodes=LIPID_TC,LIPID_HDL,LIPID_LDL&startDate=2024-01-01
```

### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "patientNumber": "PAT-12345",
      "firstName": "John",
      "lastName": "Doe"
    },
    "testTypes": [
      {
        "code": "CBC_HGB",
        "name": "Hemoglobin",
        "unit": "g/dL",
        "referenceMin": 12.0,
        "referenceMax": 16.0
      },
      {
        "code": "CBC_WBC",
        "name": "White Blood Cells",
        "unit": "K/uL",
        "referenceMin": 4.5,
        "referenceMax": 11.0
      }
    ],
    "series": [
      {
        "testTypeCode": "CBC_HGB",
        "dataPoints": [
          { "date": "2025-01-15", "value": 13.8, "isAbnormal": false },
          { "date": "2025-06-10", "value": 15.1, "isAbnormal": false },
          { "date": "2025-11-15", "value": 14.5, "isAbnormal": false }
        ]
      },
      {
        "testTypeCode": "CBC_WBC",
        "dataPoints": [
          { "date": "2025-01-15", "value": 6.8, "isAbnormal": false },
          { "date": "2025-06-10", "value": 7.2, "isAbnormal": false },
          { "date": "2025-11-15", "value": 8.1, "isAbnormal": false }
        ]
      }
    ]
  }
}
```

**Error (400 Bad Request)** - Too many test types:
```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_TEST_TYPES",
    "message": "Maximum 5 test types can be compared at once.",
    "details": {
      "provided": 7,
      "maximum": 5
    }
  }
}
```

---

## GET /api/graphs/test-types

Get a list of available test types for a patient (only test types with existing data).

### Request

**Method**: `GET`
**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `patientId` | UUID | Yes | Patient ID to filter test types |

**Example Request**:
```
GET /api/graphs/test-types?patientId=123e4567-e89b-12d3-a456-426614174000
```

### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "testTypes": [
      {
        "code": "CBC_HGB",
        "name": "Hemoglobin",
        "category": "Hematology",
        "unit": "g/dL",
        "dataPointCount": 5,
        "firstTestDate": "2025-01-15",
        "lastTestDate": "2025-11-15"
      },
      {
        "code": "CBC_WBC",
        "name": "White Blood Cells",
        "category": "Hematology",
        "unit": "K/uL",
        "dataPointCount": 5,
        "firstTestDate": "2025-01-15",
        "lastTestDate": "2025-11-15"
      },
      {
        "code": "LIPID_TC",
        "name": "Total Cholesterol",
        "category": "Chemistry",
        "unit": "mg/dL",
        "dataPointCount": 3,
        "firstTestDate": "2025-03-20",
        "lastTestDate": "2025-09-05"
      }
    ]
  }
}
```

**Success (200 OK)** - No data:
```json
{
  "success": true,
  "data": {
    "testTypes": []
  }
}
```

---

## POST /api/graphs/export

Export graph data as CSV or JSON for external analysis.

### Request

**Method**: `POST`
**Content-Type**: `application/json`

**Body Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `patientId` | UUID | Yes | Patient whose data to export |
| `testTypeCodes` | String[] | Yes | Array of test type codes to include |
| `startDate` | String | No | Start of date range |
| `endDate` | String | No | End of date range |
| `format` | Enum | No | Export format: `json` (default) or `csv` |

**Example Request**:
```json
{
  "patientId": "123e4567-e89b-12d3-a456-426614174000",
  "testTypeCodes": ["CBC_HGB", "CBC_WBC", "LIPID_TC"],
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "format": "csv"
}
```

### Response

**Success (200 OK)** - JSON format:
```json
{
  "success": true,
  "data": {
    "patient": {
      "patientNumber": "PAT-12345",
      "firstName": "John",
      "lastName": "Doe"
    },
    "exportDate": "2025-11-16T14:00:00.000Z",
    "data": [
      {
        "date": "2025-01-15",
        "CBC_HGB": 13.8,
        "CBC_WBC": 6.8,
        "LIPID_TC": null
      },
      {
        "date": "2025-03-20",
        "CBC_HGB": null,
        "CBC_WBC": null,
        "LIPID_TC": 185
      },
      {
        "date": "2025-11-15",
        "CBC_HGB": 14.5,
        "CBC_WBC": 8.1,
        "LIPID_TC": 245
      }
    ]
  }
}
```

**Success (200 OK)** - CSV format:
```
HTTP/1.1 200 OK
Content-Type: text/csv
Content-Disposition: attachment; filename="patient-PAT-12345-trends-2025-11-16.csv"

Date,CBC_HGB (g/dL),CBC_WBC (K/uL),LIPID_TC (mg/dL)
2025-01-15,13.8,6.8,
2025-03-20,,,185
2025-11-15,14.5,8.1,245
```

---

## Frontend Integration Notes

### Recharts Example

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea } from 'recharts';

function TrendGraph({ patientId, testTypeCode }: Props) {
  const { data, loading, error } = useFetch(`/api/graphs/trend?patientId=${patientId}&testTypeCode=${testTypeCode}`);

  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  const { dataPoints, testType } = data.data;

  return (
    <LineChart width={800} height={400} data={dataPoints}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis label={{ value: testType.unit, angle: -90, position: 'insideLeft' }} />
      <Tooltip content={<CustomTooltip />} />
      <Legend />

      {/* Reference range shading */}
      <ReferenceArea
        y1={testType.referenceMin}
        y2={testType.referenceMax}
        fill="#e0f7e0"
        fillOpacity={0.3}
        label="Normal Range"
      />

      {/* Data line */}
      <Line
        type="monotone"
        dataKey="value"
        stroke="#8884d8"
        strokeWidth={2}
        dot={(props) => {
          const { cx, cy, payload } = props;
          return (
            <circle
              cx={cx}
              cy={cy}
              r={5}
              fill={payload.isAbnormal ? '#ff4444' : '#8884d8'}
            />
          );
        }}
      />
    </LineChart>
  );
}
```

### Performance Optimization

- Lazy load chart library (`dynamic(() => import('./TrendGraph'))`)
- Limit data points to 50 by default (pagination for historical data)
- Cache API responses for 5 minutes
- Debounce filter/search inputs (300ms)
