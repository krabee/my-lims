/**
 * File upload API endpoint
 * POST /api/upload - Upload lab result file
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
import { saveFile } from '@/src/lib/storage';
import { fileUploadSchema } from '@/src/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided or invalid file' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = fileUploadSchema.safeParse({ file });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save file to storage
    const savedFile = await saveFile(buffer, file.name);

    // Create lab result record with PENDING status
    // We'll create a temporary test type for now
    const tempTestType = await prisma.testType.findFirst();

    if (!tempTestType) {
      return NextResponse.json(
        { error: 'No test types configured. Please run database seed.' },
        { status: 500 }
      );
    }

    // Create placeholder patient for now (will be updated during extraction)
    const tempPatient = await prisma.patient.upsert({
      where: { patientNumber: 'PENDING' },
      update: {},
      create: {
        patientNumber: 'PENDING',
        firstName: 'Pending',
        lastName: 'Extraction',
      },
    });

    const labResult = await prisma.labResult.create({
      data: {
        patientId: tempPatient.id,
        testDate: new Date(),
        testTypeId: tempTestType.id,
        status: 'PENDING',
        file: {
          create: {
            fileName: savedFile.fileName,
            filePath: savedFile.filePath,
            fileSize: savedFile.fileSize,
            mimeType: file.type,
          },
        },
      },
      include: {
        file: true,
      },
    });

    return NextResponse.json({
      id: labResult.id,
      fileName: savedFile.fileName,
      status: labResult.status,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
