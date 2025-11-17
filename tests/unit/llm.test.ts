/**
 * Unit tests for LLM extraction service
 * TDD: These tests should FAIL before implementation
 */

// Mock OpenAI before importing
let mockCreate: jest.Mock;
jest.mock('openai', () => {
  mockCreate = jest.fn();
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    })),
  };
});

import { extractLabResultFromImage } from '@/src/lib/llm';

describe('LLM Extraction Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractLabResultFromImage', () => {
    it('should extract lab result data from image buffer', async () => {
      const mockBuffer = Buffer.from('fake-image-data');
      const mockMimeType = 'image/jpeg';

      // Mock successful API response
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                patient: {
                  patientNumber: 'P12345',
                  firstName: 'John',
                  lastName: 'Doe',
                },
                testDate: '2024-11-16',
                testType: 'Complete Blood Count',
                testValues: [
                  { testCode: 'WBC', value: 7.5, isAbnormal: false },
                ],
              }),
            },
          },
        ],
      });

      const result = await extractLabResultFromImage(mockBuffer, mockMimeType);

      expect(result).toEqual(
        expect.objectContaining({
          patient: expect.objectContaining({
            patientNumber: expect.any(String),
            firstName: expect.any(String),
            lastName: expect.any(String),
          }),
          testDate: expect.any(String),
          testType: expect.any(String),
          testValues: expect.arrayContaining([
            expect.objectContaining({
              testCode: expect.any(String),
              value: expect.any(Number),
              isAbnormal: expect.any(Boolean),
            }),
          ]),
        })
      );
    });

    it('should handle PDF files', async () => {
      const mockBuffer = Buffer.from('fake-pdf-data');
      const mockMimeType = 'application/pdf';

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                patient: {
                  patientNumber: 'P12345',
                  firstName: 'John',
                  lastName: 'Doe',
                },
                testDate: '2024-11-16',
                testType: 'CBC',
                testValues: [],
              }),
            },
          },
        ],
      });

      await expect(
        extractLabResultFromImage(mockBuffer, mockMimeType)
      ).resolves.toBeDefined();
    });

    it('should throw error for unsupported file types', async () => {
      const mockBuffer = Buffer.from('fake-data');
      const mockMimeType = 'application/msword';

      await expect(
        extractLabResultFromImage(mockBuffer, mockMimeType)
      ).rejects.toThrow('Unsupported file type');
    });

    it('should throw error when OpenAI API key is missing', async () => {
      const originalKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const mockBuffer = Buffer.from('fake-image-data');
      const mockMimeType = 'image/jpeg';

      await expect(
        extractLabResultFromImage(mockBuffer, mockMimeType)
      ).rejects.toThrow('OPENAI_API_KEY');

      process.env.OPENAI_API_KEY = originalKey;
    });

    it('should handle API errors gracefully', async () => {
      const mockBuffer = Buffer.from('fake-image-data');
      const mockMimeType = 'image/jpeg';

      // Mock API failure
      mockCreate.mockRejectedValue(new Error('API Error'));

      await expect(
        extractLabResultFromImage(mockBuffer, mockMimeType)
      ).rejects.toThrow();
    });

    it('should validate extracted data against schema', async () => {
      const mockBuffer = Buffer.from('fake-image-data');
      const mockMimeType = 'image/jpeg';

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                patient: {
                  patientNumber: 'P12345',
                  firstName: 'John',
                  lastName: 'Doe',
                },
                testDate: '2024-11-16',
                testType: 'CBC',
                testValues: [],
              }),
            },
          },
        ],
      });

      const result = await extractLabResultFromImage(
        mockBuffer,
        mockMimeType
      );

      expect(result).toHaveProperty('patient');
      expect(result).toHaveProperty('testDate');
      expect(result).toHaveProperty('testType');
      expect(result).toHaveProperty('testValues');
      expect(Array.isArray(result.testValues)).toBe(true);
    });
  });
});
