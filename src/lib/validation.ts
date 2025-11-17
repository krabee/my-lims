import { z } from 'zod';

/**
 * File upload validation schema
 */
export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: 'File size must not exceed 10MB',
    })
    .refine(
      (file) => ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type),
      {
        message: 'Only PDF, JPEG, and PNG files are allowed',
      }
    ),
  patientId: z.string().uuid().optional(),
});

/**
 * Patient validation schema
 */
export const patientSchema = z.object({
  patientNumber: z.string().min(1, 'Patient number is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().optional(),
});

/**
 * Lab result filter schema
 */
export const labResultFilterSchema = z.object({
  patientId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  testType: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

/**
 * Graph trend request schema
 */
export const graphTrendSchema = z.object({
  patientId: z.string().uuid(),
  testTypeId: z.string().uuid(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * Extracted lab result data schema from LLM
 */
export const extractedLabResultSchema = z.object({
  patient: patientSchema,
  testDate: z.string(),
  testType: z.string(),
  testValues: z.array(
    z.object({
      testCode: z.string(),
      value: z.number(),
      isAbnormal: z.boolean().default(false),
    })
  ),
});
