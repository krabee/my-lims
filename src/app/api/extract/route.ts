/**
 * Lab result extraction API endpoint
 * POST /api/extract - Extract data from uploaded lab result
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
import { extractLabResultFromImage } from '@/src/lib/llm';
import { readFile } from '@/src/lib/storage';
import { z } from 'zod';

const extractRequestSchema = z.object({
  labResultId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const validation = extractRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request: labResultId is required' },
        { status: 400 }
      );
    }

    const { labResultId } = validation.data;

    // Find the lab result
    const labResult = await prisma.labResult.findUnique({
      where: { id: labResultId },
      include: { file: true },
    });

    if (!labResult || !labResult.file) {
      return NextResponse.json(
        { error: 'Lab result not found' },
        { status: 404 }
      );
    }

    // Update status to PROCESSING
    await prisma.labResult.update({
      where: { id: labResultId },
      data: { status: 'PROCESSING' },
    });

    try {
      // Read the uploaded file
      const fileBuffer = await readFile(labResult.file.fileName);

      // Extract data using LLM
      const extractedData = await extractLabResultFromImage(
        fileBuffer,
        labResult.file.mimeType
      );

      // Create or find patient
      const patient = await prisma.patient.upsert({
        where: { patientNumber: extractedData.patient.patientNumber },
        update: {
          firstName: extractedData.patient.firstName,
          lastName: extractedData.patient.lastName,
          dateOfBirth: extractedData.patient.dateOfBirth
            ? new Date(extractedData.patient.dateOfBirth)
            : null,
        },
        create: {
          patientNumber: extractedData.patient.patientNumber,
          firstName: extractedData.patient.firstName,
          lastName: extractedData.patient.lastName,
          dateOfBirth: extractedData.patient.dateOfBirth
            ? new Date(extractedData.patient.dateOfBirth)
            : null,
        },
      });

      // Find or create test type
      const testType = await prisma.testType.findFirst({
        where: {
          name: {
            contains: extractedData.testType,
            mode: 'insensitive',
          },
        },
      });

      if (!testType) {
        // If test type not found, use a generic one or create it
        const genericTestType = await prisma.testType.findFirst();
        if (!genericTestType) {
          throw new Error('No test types configured');
        }
      }

      // Update lab result with extracted data
      await prisma.labResult.update({
        where: { id: labResultId },
        data: {
          patientId: patient.id,
          testDate: new Date(extractedData.testDate),
          testTypeId: testType?.id || (await prisma.testType.findFirst())!.id,
          status: 'COMPLETED',
        },
      });

      // Create test values
      for (const testValue of extractedData.testValues) {
        // Find test type by code
        const testTypeRecord = await prisma.testType.findFirst({
          where: { code: testValue.testCode },
        });

        if (testTypeRecord) {
          // Check if value is abnormal based on reference ranges
          let isAbnormal = testValue.isAbnormal;
          if (
            testTypeRecord.minValue !== null &&
            testTypeRecord.maxValue !== null
          ) {
            isAbnormal =
              testValue.value < testTypeRecord.minValue ||
              testValue.value > testTypeRecord.maxValue;
          }

          await prisma.testValue.create({
            data: {
              labResultId: labResultId,
              testTypeId: testTypeRecord.id,
              value: testValue.value,
              isAbnormal: isAbnormal,
            },
          });
        }
      }

      return NextResponse.json({
        status: 'COMPLETED',
        message: 'Extraction completed successfully',
        patientId: patient.id,
        testValuesCount: extractedData.testValues.length,
      });
    } catch (extractionError) {
      // Update status to FAILED on error
      await prisma.labResult.update({
        where: { id: labResultId },
        data: { status: 'FAILED' },
      });

      throw extractionError;
    }
  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      {
        error: 'Extraction failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
