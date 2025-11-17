import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed database with common lab test types
 */
async function main() {
  console.log('Seeding test types...');

  const testTypes = [
    // Complete Blood Count (CBC)
    { code: 'WBC', name: 'White Blood Cell Count', unit: '10^9/L', minValue: 4.0, maxValue: 11.0 },
    { code: 'RBC', name: 'Red Blood Cell Count', unit: '10^12/L', minValue: 4.5, maxValue: 5.9 },
    { code: 'HGB', name: 'Hemoglobin', unit: 'g/dL', minValue: 13.5, maxValue: 17.5 },
    { code: 'HCT', name: 'Hematocrit', unit: '%', minValue: 40.0, maxValue: 52.0 },
    { code: 'PLT', name: 'Platelet Count', unit: '10^9/L', minValue: 150.0, maxValue: 400.0 },

    // Basic Metabolic Panel (BMP)
    { code: 'GLU', name: 'Glucose', unit: 'mg/dL', minValue: 70.0, maxValue: 100.0 },
    { code: 'BUN', name: 'Blood Urea Nitrogen', unit: 'mg/dL', minValue: 7.0, maxValue: 20.0 },
    { code: 'CR', name: 'Creatinine', unit: 'mg/dL', minValue: 0.7, maxValue: 1.3 },
    { code: 'NA', name: 'Sodium', unit: 'mmol/L', minValue: 136.0, maxValue: 145.0 },
    { code: 'K', name: 'Potassium', unit: 'mmol/L', minValue: 3.5, maxValue: 5.0 },
    { code: 'CL', name: 'Chloride', unit: 'mmol/L', minValue: 96.0, maxValue: 106.0 },
    { code: 'CO2', name: 'Carbon Dioxide', unit: 'mmol/L', minValue: 23.0, maxValue: 29.0 },

    // Lipid Panel
    { code: 'CHOL', name: 'Total Cholesterol', unit: 'mg/dL', minValue: 0.0, maxValue: 200.0 },
    { code: 'HDL', name: 'HDL Cholesterol', unit: 'mg/dL', minValue: 40.0, maxValue: 999.0 },
    { code: 'LDL', name: 'LDL Cholesterol', unit: 'mg/dL', minValue: 0.0, maxValue: 100.0 },
    { code: 'TRIG', name: 'Triglycerides', unit: 'mg/dL', minValue: 0.0, maxValue: 150.0 },

    // Liver Function Tests
    { code: 'ALT', name: 'Alanine Aminotransferase', unit: 'U/L', minValue: 7.0, maxValue: 56.0 },
    { code: 'AST', name: 'Aspartate Aminotransferase', unit: 'U/L', minValue: 10.0, maxValue: 40.0 },
    { code: 'ALP', name: 'Alkaline Phosphatase', unit: 'U/L', minValue: 44.0, maxValue: 147.0 },
    { code: 'TBIL', name: 'Total Bilirubin', unit: 'mg/dL', minValue: 0.1, maxValue: 1.2 },
    { code: 'ALB', name: 'Albumin', unit: 'g/dL', minValue: 3.5, maxValue: 5.5 },

    // Thyroid Function
    { code: 'TSH', name: 'Thyroid Stimulating Hormone', unit: 'mIU/L', minValue: 0.4, maxValue: 4.0 },
    { code: 'T4', name: 'Thyroxine', unit: 'μg/dL', minValue: 5.0, maxValue: 12.0 },

    // Other Common Tests
    { code: 'HBA1C', name: 'Hemoglobin A1c', unit: '%', minValue: 0.0, maxValue: 5.7 },
    { code: 'CA', name: 'Calcium', unit: 'mg/dL', minValue: 8.5, maxValue: 10.5 },
    { code: 'PHOS', name: 'Phosphorus', unit: 'mg/dL', minValue: 2.5, maxValue: 4.5 },
  ];

  for (const testType of testTypes) {
    await prisma.testType.upsert({
      where: { code: testType.code },
      update: testType,
      create: testType,
    });
  }

  console.log(`✓ Seeded ${testTypes.length} test types`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
