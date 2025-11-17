/**
 * Patient entity types
 */

export interface Patient {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface PatientWithLabResults extends Patient {
  labResults: Array<{
    id: string;
    testDate: Date;
    status: string;
  }>;
}
