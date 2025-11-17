/**
 * Unit tests for file validation logic
 * TDD: These tests should FAIL before implementation
 */

import {
  fileUploadSchema,
  patientSchema,
  labResultFilterSchema,
  extractedLabResultSchema,
} from '@/src/lib/validation';

describe('File Upload Validation', () => {
  describe('fileUploadSchema', () => {
    it('should reject files larger than 10MB', () => {
      const largeFile = new File([''], 'test.pdf', {
        type: 'application/pdf',
      });
      Object.defineProperty(largeFile, 'size', {
        value: 11 * 1024 * 1024, // 11MB
      });

      const result = fileUploadSchema.safeParse({ file: largeFile });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('10MB');
      }
    });

    it('should accept PDF files under 10MB', () => {
      const validFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });
      Object.defineProperty(validFile, 'size', {
        value: 5 * 1024 * 1024, // 5MB
      });

      const result = fileUploadSchema.safeParse({ file: validFile });
      expect(result.success).toBe(true);
    });

    it('should accept JPEG images', () => {
      const jpegFile = new File(['test'], 'test.jpg', {
        type: 'image/jpeg',
      });
      Object.defineProperty(jpegFile, 'size', { value: 2 * 1024 * 1024 });

      const result = fileUploadSchema.safeParse({ file: jpegFile });
      expect(result.success).toBe(true);
    });

    it('should accept PNG images', () => {
      const pngFile = new File(['test'], 'test.png', {
        type: 'image/png',
      });
      Object.defineProperty(pngFile, 'size', { value: 2 * 1024 * 1024 });

      const result = fileUploadSchema.safeParse({ file: pngFile });
      expect(result.success).toBe(true);
    });

    it('should reject unsupported file types', () => {
      const invalidFile = new File(['test'], 'test.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      Object.defineProperty(invalidFile, 'size', { value: 1024 });

      const result = fileUploadSchema.safeParse({ file: invalidFile });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('PDF, JPEG, and PNG');
      }
    });

    it('should accept optional patientId as UUID', () => {
      const file = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });
      Object.defineProperty(file, 'size', { value: 1024 });

      const result = fileUploadSchema.safeParse({
        file,
        patientId: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('patientSchema', () => {
    it('should accept valid patient data', () => {
      const validPatient = {
        patientNumber: 'P12345',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
      };

      const result = patientSchema.safeParse(validPatient);
      expect(result.success).toBe(true);
    });

    it('should reject empty patient number', () => {
      const invalidPatient = {
        patientNumber: '',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = patientSchema.safeParse(invalidPatient);
      expect(result.success).toBe(false);
    });

    it('should reject empty first name', () => {
      const invalidPatient = {
        patientNumber: 'P12345',
        firstName: '',
        lastName: 'Doe',
      };

      const result = patientSchema.safeParse(invalidPatient);
      expect(result.success).toBe(false);
    });

    it('should accept patient without date of birth', () => {
      const validPatient = {
        patientNumber: 'P12345',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = patientSchema.safeParse(validPatient);
      expect(result.success).toBe(true);
    });
  });

  describe('labResultFilterSchema', () => {
    it('should accept valid filter parameters', () => {
      const validFilter = {
        patientId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        page: '1',
        limit: '20',
      };

      const result = labResultFilterSchema.safeParse(validFilter);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should use default page and limit', () => {
      const filter = {};

      const result = labResultFilterSchema.safeParse(filter);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should enforce maximum limit of 100', () => {
      const filter = { limit: '150' };

      const result = labResultFilterSchema.safeParse(filter);
      expect(result.success).toBe(false);
    });
  });

  describe('extractedLabResultSchema', () => {
    it('should accept valid extracted lab result data', () => {
      const validData = {
        patient: {
          patientNumber: 'P12345',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
        },
        testDate: '2024-11-16',
        testType: 'Complete Blood Count',
        testValues: [
          { testCode: 'WBC', value: 7.5, isAbnormal: false },
          { testCode: 'RBC', value: 5.2, isAbnormal: false },
        ],
      };

      const result = extractedLabResultSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should set default isAbnormal to false', () => {
      const data = {
        patient: {
          patientNumber: 'P12345',
          firstName: 'John',
          lastName: 'Doe',
        },
        testDate: '2024-11-16',
        testType: 'CBC',
        testValues: [{ testCode: 'WBC', value: 7.5 }],
      };

      const result = extractedLabResultSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.testValues[0].isAbnormal).toBe(false);
      }
    });

    it('should reject invalid test value numbers', () => {
      const invalidData = {
        patient: {
          patientNumber: 'P12345',
          firstName: 'John',
          lastName: 'Doe',
        },
        testDate: '2024-11-16',
        testType: 'CBC',
        testValues: [{ testCode: 'WBC', value: 'invalid' }],
      };

      const result = extractedLabResultSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
