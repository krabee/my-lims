/**
 * Upload status API endpoint
 * GET /api/upload/status/[id] - Get status of uploaded lab result
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const labResult = await prisma.labResult.findUnique({
      where: { id },
      include: {
        patient: true,
        testType: true,
        file: true,
        testValues: {
          include: {
            testType: true,
          },
        },
      },
    });

    if (!labResult) {
      return NextResponse.json(
        { error: 'Lab result not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: labResult.id,
      status: labResult.status,
      patient: {
        id: labResult.patient.id,
        name: `${labResult.patient.firstName} ${labResult.patient.lastName}`,
        patientNumber: labResult.patient.patientNumber,
      },
      testDate: labResult.testDate,
      testType: labResult.testType.name,
      testValues: labResult.testValues.map((tv) => ({
        id: tv.id,
        testCode: tv.testType.code,
        testName: tv.testType.name,
        value: tv.value,
        unit: tv.testType.unit,
        isAbnormal: tv.isAbnormal,
        referenceRange:
          tv.testType.minValue !== null && tv.testType.maxValue !== null
            ? `${tv.testType.minValue} - ${tv.testType.maxValue}`
            : null,
      })),
      fileName: labResult.file?.fileName,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
