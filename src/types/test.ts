/**
 * Test and Test Type entity types
 */

export interface TestType {
  id: string;
  code: string;
  name: string;
  unit?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestValue {
  id: string;
  labResultId: string;
  testTypeId: string;
  value: number;
  isAbnormal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestValueWithType extends TestValue {
  testType: TestType;
}

export interface TrendDataPoint {
  date: string;
  value: number;
  isAbnormal: boolean;
  testCode: string;
}
