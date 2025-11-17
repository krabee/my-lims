/**
 * Lab Result entity types
 */

export enum ResultStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface LabResult {
  id: string;
  patientId: string;
  testDate: Date;
  testTypeId: string;
  status: ResultStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface LabResultWithRelations extends LabResult {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    patientNumber: string;
  };
  testType: {
    id: string;
    code: string;
    name: string;
    unit?: string | null;
  };
  file?: {
    id: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
  } | null;
  testValues: Array<{
    id: string;
    testTypeId: string;
    value: number;
    isAbnormal: boolean;
  }>;
}

export interface UploadedFile {
  id: string;
  labResultId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
  updatedAt: Date;
}
