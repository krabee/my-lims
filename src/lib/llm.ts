/**
 * LLM extraction service
 * Uses OpenAI GPT-4 Vision to extract lab result data from images and PDFs
 */

import OpenAI from 'openai';
import { extractedLabResultSchema } from './validation';
import type { z } from 'zod';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export type ExtractedLabResult = z.infer<typeof extractedLabResultSchema>;

const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

/**
 * Extract lab result data from an image or PDF buffer using GPT-4 Vision
 * @param buffer - File content as Buffer
 * @param mimeType - MIME type of the file
 * @returns Extracted lab result data
 */
export async function extractLabResultFromImage(
  buffer: Buffer,
  mimeType: string
): Promise<ExtractedLabResult> {
  // Validate file type
  if (!SUPPORTED_MIME_TYPES.includes(mimeType)) {
    throw new Error(
      `Unsupported file type: ${mimeType}. Supported types: ${SUPPORTED_MIME_TYPES.join(', ')}`
    );
  }

  // Convert buffer to base64
  const base64Image = buffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64Image}`;

  // Prepare the extraction prompt
  const prompt = `You are a medical data extraction assistant. Analyze this lab result document and extract the following information in JSON format:

{
  "patient": {
    "patientNumber": "Patient ID or medical record number",
    "firstName": "Patient's first name",
    "lastName": "Patient's last name",
    "dateOfBirth": "YYYY-MM-DD format (optional)"
  },
  "testDate": "Date the test was performed (YYYY-MM-DD)",
  "testType": "Type of lab test (e.g., Complete Blood Count, Lipid Panel)",
  "testValues": [
    {
      "testCode": "Standard lab test code (e.g., WBC, RBC, GLU)",
      "value": numeric value,
      "isAbnormal": true/false based on reference ranges if shown
    }
  ]
}

Extract all visible test values. If reference ranges are shown, mark values outside the normal range as abnormal.
Return ONLY valid JSON, no additional text.`;

  try {
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error('No response from OpenAI API');
    }

    // Parse and validate the response
    const parsedData = JSON.parse(content);
    const validatedData = extractedLabResultSchema.parse(parsedData);

    return validatedData;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`LLM extraction failed: ${error.message}`);
    }
    throw error;
  }
}
